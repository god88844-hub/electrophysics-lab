//! OpenQASM 2.0/3.0 subset parser → QHAL program (WP-5.5).
//!
//! Supported statements (fail-closed on everything else — a precise
//! line-numbered error is returned, never a partial run):
//!
//! - `OPENQASM 2.0;` / `OPENQASM 3;` / `OPENQASM 3.0;` (version header)
//! - `qreg q[N];` (2.0) / `qubit[N] q;` + `qubit q;` (3.0) — exactly one quantum register
//! - `creg c[N];` (2.0) / `bit[N] c;` + `bit c;` (3.0) — at most one classical register
//! - Optional standard include `qelib1.inc` (2.0) or `stdgates.inc` (3.0)
//! - `h q[i];` `x y z s t` — single-qubit gates
//! - `rx(θ) q[i];` `ry(θ) q[i];` `rz(θ) q[i];` — parameterized rotations (radians, including pi multiples)
//! - `cx q[i],q[j];` `cz q[i],q[j];` — two-qubit gates
//! - `measure q[i] -> c[j];` (2.0) / `c[j] = measure q[i];` (3.0), or equal-width registers
//! - `barrier q[i], q[j], …;`
//! - DRAG pulse block (QHAL extension): `pulse { drag q[i], amp_mhz, sigma_ns, beta, duration_ns; }`
//!   — compiled into a sampled pulse schedule executed through the kernel
//!   DRAG envelope ([`crate::devices::drag_pulse`]).
//!
//! Interactive compilation and execution both gate the qubit count through the **ep-core** fail-closed
//! controller (`n > 6` refused with the honest reason, 02 §2.3).
//!
//! Execution maps the QHAL program onto the WP-5.1 Lindblad density-matrix
//! kernel: every gate compiles to its exact textbook unitary
//! ([`Gate1Kind::op2`]; global phases are irrelevant for density matrices),
//! CX/CZ are exact applications over the published
//! [`lindblad::DensityMatrix`] fields, and DRAG pulses are sampled
//! through [`crate::devices::drag_pulse`] into per-step drives. Measurement
//! uses a seeded single-qubit projective readout.

use crate::devices::{drag_pulse, DragParams};
use crate::hybrid::calibration;
use crate::lindblad::{
    DensityMatrix, Drive, InitialState, LindbladSim, Mulberry32, NoiseModel, Op2,
};
use ep_core::admission::{AdmissionController, AdmissionRequest};
use serde::Serialize;

/// A parse error with its precise 1-based source line.
#[derive(Debug, Clone, PartialEq)]
pub struct QasmError {
    pub line: usize,
    pub message: String,
}

impl std::fmt::Display for QasmError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "QASM parse error at line {}: {}",
            self.line, self.message
        )
    }
}

impl std::error::Error for QasmError {}

/// Single-qubit gate kinds (subset).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Gate1Kind {
    H,
    X,
    Y,
    Z,
    S,
    T,
    Rx,
    Ry,
    Rz,
}

impl Gate1Kind {
    /// Exact textbook unitary for this gate (single source of truth for the
    /// QASM compiler and the hybrid scheduler).
    ///
    /// Deliberately NOT `lindblad::rotation` (which is byte-pinned to the
    /// ESM `rotation()` export and is only unitary at θ ∈ {0, π}) and NOT
    /// `ops::H` (whose entries `[√½;4]` do not match the ESM `OPS.H`
    /// `[√½,√½,√½,−√½]`). These are the standard definitions:
    /// H = ½√2·[[1,1],[1,−1]], X/Y/Z/S/T = the Pauli/phase table,
    /// Rx(θ) = e^{−iθσx/2}, Ry(θ) = e^{−iθσy/2}, Rz(θ) = e^{−iθσz/2}.
    #[must_use]
    pub fn op2(self, theta: f64) -> Op2 {
        let f = std::f64::consts::FRAC_1_SQRT_2;
        let c = (theta / 2.0).cos();
        let s = (theta / 2.0).sin();
        match self {
            // H = (1/√2)[[1,1],[1,−1]] — the true Hadamard (ESM `OPS.H`).
            Self::H => Op2::new([f, f, f, -f], [0.0; 4]),
            Self::X => crate::lindblad::ops::X,
            Self::Y => crate::lindblad::ops::Y,
            Self::Z => crate::lindblad::ops::Z,
            Self::S => crate::lindblad::ops::S,
            Self::T => crate::lindblad::ops::T,
            Self::Rx => Op2::new([c, 0.0, 0.0, c], [0.0, -s, -s, 0.0]),
            Self::Ry => Op2::new([c, -s, s, c], [0.0; 4]),
            Self::Rz => Op2::new([c, 0.0, 0.0, c], [-s, 0.0, 0.0, s]),
        }
    }
}

/// Two-qubit gate kinds (subset).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Gate2Kind {
    Cx,
    Cz,
}

/// One compiled QHAL statement (line retained for honest diagnostics).
#[derive(Debug, Clone, PartialEq)]
pub enum QhalStatement {
    Gate1 {
        line: usize,
        gate: Gate1Kind,
        theta: f64,
        q: usize,
    },
    Gate2 {
        line: usize,
        kind: Gate2Kind,
        control: usize,
        target: usize,
    },
    Measure {
        line: usize,
        q: usize,
        c: usize,
    },
    Barrier {
        line: usize,
        qubits: Vec<usize>,
    },
    DragPulse {
        line: usize,
        q: usize,
        amplitude_mhz: f64,
        sigma_ns: f64,
        beta: f64,
        duration_ns: f64,
    },
}

/// Compiled QHAL program.
#[derive(Debug, Clone, PartialEq)]
pub struct QhalProgram {
    pub version: u32,
    pub qreg_name: String,
    pub n_qubits: usize,
    pub creg_name: String,
    pub n_classical: usize,
    pub statements: Vec<QhalStatement>,
}

impl QhalProgram {
    /// Interactive admission through the **ep-core** fail-closed controller:
    /// `n > 6` is refused with the honest reason (02 §2.3) before any execution.
    ///
    /// # Errors
    /// The admission refusal reason as a string (rendered verbatim in the IDE).
    pub fn admit_interactive(&self, controller: &AdmissionController) -> Result<(), String> {
        admit_interactive(self.n_qubits, controller)
    }
}

pub(crate) fn admit_interactive(
    n_qubits: usize,
    controller: &AdmissionController,
) -> Result<(), String> {
    let request = AdmissionRequest::QuantumInteractive { n_qubits };
    for decision in [
        AdmissionController::new().admit(&request),
        controller.admit(&request),
    ] {
        if !decision.admitted {
            return Err(decision.reason);
        }
    }
    Ok(())
}

/// Scan statements and preserve their start lines across whitespace and comments.
fn split_statements(src: &str) -> Result<Vec<(usize, String)>, QasmError> {
    let mut out = Vec::new();
    let mut current = String::new();
    let mut chars = src.chars().peekable();
    let (mut line, mut start) = (1, 1);
    let (mut quoted, mut block, mut optional_semicolon) = (false, false, false);
    while let Some(ch) = chars.next() {
        if !quoted && ch == '/' && chars.peek() == Some(&'/') {
            for next in chars.by_ref() {
                if next == '\n' {
                    line += 1;
                    break;
                }
            }
            if !current.is_empty() {
                current.push(' ');
            }
            continue;
        }
        if !quoted && ch == '/' && chars.peek() == Some(&'*') {
            chars.next();
            let comment_line = line;
            loop {
                match chars.next() {
                    Some('*') if chars.peek() == Some(&'/') => {
                        chars.next();
                        break;
                    }
                    Some('\n') => line += 1,
                    Some(_) => {}
                    None => return Err(err_at(comment_line, "unterminated block comment")),
                }
            }
            if !current.is_empty() {
                current.push(' ');
            }
            continue;
        }
        if ch == '\n' {
            line += 1;
        }
        if current.is_empty() {
            if ch.is_whitespace() {
                continue;
            }
            start = line;
        }
        if !quoted {
            match ch {
                '{' if block => return Err(err_at(line, "nested blocks are unsupported")),
                '{' => block = true,
                '}' if !block => return Err(err_at(line, "unmatched closing brace")),
                '}' => {
                    current.push(ch);
                    out.push((start, std::mem::take(&mut current)));
                    block = false;
                    optional_semicolon = true;
                    continue;
                }
                ';' if !block => {
                    if !current.is_empty() {
                        out.push((start, std::mem::take(&mut current)));
                    } else if !optional_semicolon {
                        return Err(err_at(line, "empty statement"));
                    }
                    optional_semicolon = false;
                    continue;
                }
                _ => {}
            }
        }
        if ch == '"' {
            quoted = !quoted;
        }
        optional_semicolon = false;
        current.push(ch);
    }
    if quoted || block || !current.is_empty() {
        return Err(err_at(
            start,
            "unterminated statement (expected a closing quote, brace or semicolon)",
        ));
    }
    Ok(out)
}

const MAX_SOURCE_BYTES: usize = 256 * 1024;
const MAX_CLASSICAL_BITS: usize = 1024;

fn err_at(line: usize, msg: impl Into<String>) -> QasmError {
    QasmError {
        line,
        message: msg.into(),
    }
}

/// Parse a full OpenQASM 2.0/3.0 subset program.
///
/// # Errors
/// [`QasmError`] with the precise source line for any unsupported
/// construct, out-of-range qubit/bit index, duplicate register, or
/// missing/unknown version header.
pub fn parse_qasm(src: &str) -> Result<QhalProgram, QasmError> {
    if src.len() > MAX_SOURCE_BYTES {
        return Err(err_at(1, "interactive QASM source exceeds 256 KiB"));
    }
    let mut raw = split_statements(src)?.into_iter();
    let (header_line, header) = raw
        .next()
        .ok_or_else(|| err_at(1, "missing OPENQASM header"))?;
    let version = match header.split_whitespace().collect::<Vec<_>>().as_slice() {
        ["OPENQASM", "2.0"] => 2,
        ["OPENQASM", "3" | "3.0"] => 3,
        _ => {
            return Err(err_at(
                header_line,
                "expected OPENQASM 2.0 or OPENQASM 3.0 header",
            ))
        }
    };
    let mut qreg: Option<(String, usize)> = None;
    let mut creg: Option<(String, usize)> = None;
    let mut statements = Vec::new();
    let admission = AdmissionController::new();
    let mut included = false;

    for (stmt_line, stmt) in raw {
        let stmt = stmt.trim();
        let (keyword, tail) = split_keyword(stmt);
        if keyword == "include" {
            let standard = if version == 2 {
                "\"qelib1.inc\""
            } else {
                "\"stdgates.inc\""
            };
            if included || tail != standard || qreg.is_some() || creg.is_some() {
                return Err(err_at(
                    stmt_line,
                    format!("expected at most one leading include {standard}"),
                ));
            }
            included = true;
            continue;
        }

        // Pulse block (QHAL extension).
        if keyword == "pulse" {
            let inner = tail
                .strip_prefix('{')
                .and_then(|s| s.trim_end().strip_suffix('}'))
                .and_then(|s| s.trim().strip_suffix(';'))
                .map(str::trim)
                .ok_or_else(|| err_at(stmt_line, "pulse block must be `pulse { drag q[i], amp_mhz, sigma_ns, beta, duration_ns; }`"))?;
            let (shape, args) = split_keyword(inner);
            if shape != "drag" {
                return Err(err_at(
                    stmt_line,
                    format!("pulse block supports only `drag` pulses, got \"{inner}\""),
                ));
            }
            let mut parts = args.split(',');
            let q_target = parts
                .next()
                .ok_or_else(|| err_at(stmt_line, "drag pulse missing qubit operand"))?
                .trim()
                .to_string();
            let nums: Vec<f64> = parts
                .map(|p| {
                    p.trim().parse::<f64>().map_err(|_| {
                        err_at(
                            stmt_line,
                            format!("drag pulse parameter \"{p}\" is not a number"),
                        )
                    })
                })
                .collect::<Result<_, _>>()?;
            if nums.len() != 4 {
                return Err(err_at(
                    stmt_line,
                    format!("drag pulse takes 4 numeric parameters (amp_mhz, sigma_ns, beta, duration_ns), got {}", nums.len()),
                ));
            }
            validate_drag(nums[0], nums[1], nums[2], nums[3], stmt_line)?;
            let q = resolve_qubit(&q_target, qreg.as_ref(), stmt_line)?;
            statements.push(QhalStatement::DragPulse {
                line: stmt_line,
                q,
                amplitude_mhz: nums[0],
                sigma_ns: nums[1],
                beta: nums[2],
                duration_ns: nums[3],
            });
            continue;
        }

        match keyword {
            "qreg" | "qubit" | "creg" | "bit" => {
                if !statements.is_empty() || (version == 2 && matches!(keyword, "qubit" | "bit")) {
                    return Err(err_at(
                        stmt_line,
                        "invalid register declaration for this program",
                    ));
                }
                let (name, size) = parse_decl(keyword, tail, stmt_line)?;
                let quantum = matches!(keyword, "qreg" | "qubit");
                if quantum {
                    let decision =
                        admission.admit(&AdmissionRequest::QuantumInteractive { n_qubits: size });
                    if !decision.admitted {
                        return Err(err_at(stmt_line, decision.reason));
                    }
                } else if size > MAX_CLASSICAL_BITS {
                    return Err(err_at(stmt_line, "classical register exceeds 1024 bits"));
                }
                let (register, other) = if quantum {
                    (&mut qreg, &creg)
                } else {
                    (&mut creg, &qreg)
                };
                if register.is_some()
                    || other
                        .as_ref()
                        .is_some_and(|(other_name, _)| other_name == &name)
                {
                    return Err(err_at(
                        stmt_line,
                        "duplicate register declaration or identifier",
                    ));
                }
                *register = Some((name, size));
                continue;
            }
            _ => {}
        }

        // measure q[i] -> c[j];   (2.0)
        if keyword == "measure" {
            let (q_target, c_target) = tail.split_once("->").ok_or_else(|| {
                err_at(
                    stmt_line,
                    "measure must be `measure q[i] -> c[j];` (2.0 form)",
                )
            })?;
            compile_measure(
                q_target.trim(),
                c_target.trim(),
                qreg.as_ref(),
                creg.as_ref(),
                stmt_line,
                &mut statements,
            )?;
            continue;
        }

        // barrier
        if keyword == "barrier" {
            if tail.is_empty() {
                return Err(err_at(
                    stmt_line,
                    "barrier needs at least one qubit operand",
                ));
            }
            let mut qubits = Vec::new();
            for tok in tail.split(',') {
                qubits.extend(operand_range(
                    tok.trim(),
                    qreg.as_ref(),
                    stmt_line,
                    "qubit",
                )?);
            }
            statements.push(QhalStatement::Barrier {
                line: stmt_line,
                qubits,
            });
            continue;
        }

        // `c[j] = measure q[i];` (3.0) — must precede general gate parsing.
        if let Some((lhs, rhs)) = stmt.split_once('=') {
            let (operation, operand) = split_keyword(rhs.trim());
            if version != 3 || operation != "measure" {
                return Err(err_at(
                    stmt_line,
                    "only OPENQASM 3 measurement assignment is supported",
                ));
            }
            compile_measure(
                operand,
                lhs.trim(),
                qreg.as_ref(),
                creg.as_ref(),
                stmt_line,
                &mut statements,
            )?;
            continue;
        }

        if matches!(keyword, "cx" | "cz") {
            let kind = if keyword == "cx" {
                Gate2Kind::Cx
            } else {
                Gate2Kind::Cz
            };
            let mut parts = tail.split(',');
            let control = resolve_qubit(
                parts
                    .next()
                    .ok_or_else(|| err_at(stmt_line, "missing control operand"))?
                    .trim(),
                qreg.as_ref(),
                stmt_line,
            )?;
            let target = resolve_qubit(
                parts
                    .next()
                    .ok_or_else(|| err_at(stmt_line, "missing target operand"))?
                    .trim(),
                qreg.as_ref(),
                stmt_line,
            )?;
            if parts.next().is_some() {
                return Err(err_at(
                    stmt_line,
                    format!("{kind:?} gate takes exactly 2 operands"),
                ));
            }
            if control == target {
                return Err(err_at(
                    stmt_line,
                    format!("{kind:?} control and target qubits must differ"),
                ));
            }
            statements.push(QhalStatement::Gate2 {
                line: stmt_line,
                kind,
                control,
                target,
            });
            continue;
        }

        // Single-qubit gates: `h q[i];` / `rx(1.57) q[0];`
        let (gate_name, theta, operand) = if let Some(rotation) = tail.strip_prefix('(') {
            let (angle, operand) = rotation
                .split_once(')')
                .ok_or_else(|| err_at(stmt_line, "rotation missing closing ')'"))?;
            let v = parse_angle(angle).ok_or_else(|| {
                err_at(
                    stmt_line,
                    "expected a finite angle in radians or a multiple of pi",
                )
            })?;
            let gname = keyword;
            let kind1 = match gname {
                "rx" => Gate1Kind::Rx,
                "ry" => Gate1Kind::Ry,
                "rz" => Gate1Kind::Rz,
                other => {
                    return Err(err_at(
                        stmt_line,
                        format!("unknown gate \"{other}(…)\" — rotations are rx/ry/rz"),
                    ))
                }
            };
            (kind1, v, operand.trim())
        } else {
            let kind1 = match keyword {
                "h" => Gate1Kind::H,
                "x" => Gate1Kind::X,
                "y" => Gate1Kind::Y,
                "z" => Gate1Kind::Z,
                "s" => Gate1Kind::S,
                "t" => Gate1Kind::T,
                other => {
                    return Err(err_at(
                        stmt_line,
                        format!(
                            "unsupported statement \"{other}\" (supported: h x y z s t rx ry rz cx cz measure barrier pulse)"
                        ),
                    ))
                }
            };
            (kind1, 0.0, tail)
        };
        let qubits = operand_range(operand, qreg.as_ref(), stmt_line, "qubit")?;
        statements.extend(qubits.map(|q| QhalStatement::Gate1 {
            line: stmt_line,
            gate: gate_name,
            theta,
            q,
        }));
    }

    let qreg = qreg.ok_or_else(|| err_at(header_line, "missing qreg/qubit declaration"))?;
    let creg = creg.unwrap_or_default();
    Ok(QhalProgram {
        version,
        qreg_name: qreg.0,
        n_qubits: qreg.1,
        creg_name: creg.0,
        n_classical: creg.1,
        statements,
    })
}

fn split_keyword(stmt: &str) -> (&str, &str) {
    let end = stmt
        .find(|c: char| !(c.is_ascii_alphanumeric() || c == '_'))
        .unwrap_or(stmt.len());
    (&stmt[..end], stmt[end..].trim_start())
}

fn identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|ch| ch.is_ascii_alphabetic() || ch == '_')
        && chars.all(|ch| ch.is_ascii_alphanumeric() || ch == '_')
        && !matches!(
            name,
            "qreg"
                | "qubit"
                | "creg"
                | "bit"
                | "measure"
                | "barrier"
                | "pulse"
                | "include"
                | "pi"
                | "OPENQASM"
        )
}

fn bracketed_size(tail: &str, line: usize) -> Result<(usize, &str), QasmError> {
    let (count, rest) = tail
        .strip_prefix('[')
        .and_then(|s| s.split_once(']'))
        .ok_or_else(|| err_at(line, "expected register width in brackets"))?;
    let count = count
        .trim()
        .parse()
        .map_err(|_| err_at(line, "invalid register width"))?;
    Ok((count, rest.trim()))
}

fn parse_decl(keyword: &str, tail: &str, line: usize) -> Result<(String, usize), QasmError> {
    let (name, size) = if matches!(keyword, "qreg" | "creg") {
        let (name, width) = split_keyword(tail);
        let (size, trailing) = bracketed_size(width, line)?;
        if !trailing.is_empty() {
            return Err(err_at(line, "unexpected tokens after register declaration"));
        }
        (name, size)
    } else if tail.starts_with('[') {
        let (size, name) = bracketed_size(tail, line)?;
        (name, size)
    } else {
        (tail, 1)
    };
    if size == 0 || !identifier(name) {
        return Err(err_at(
            line,
            "expected a valid register identifier and positive width",
        ));
    }
    Ok((name.to_owned(), size))
}

fn parse_angle(angle: &str) -> Option<f64> {
    let angle = angle.trim();
    let value = if let Some((factor, divisor)) = angle.split_once('/') {
        let divisor = divisor.trim().parse::<f64>().ok()?;
        if !divisor.is_finite() || divisor == 0.0 {
            return None;
        }
        angle_factor(factor.trim())? / divisor
    } else {
        angle_factor(angle)?
    };
    value.is_finite().then_some(value)
}

fn angle_factor(text: &str) -> Option<f64> {
    use std::f64::consts::PI;
    match text {
        "pi" | "+pi" => Some(PI),
        "-pi" => Some(-PI),
        _ => {
            if let Some((coefficient, "pi")) =
                text.split_once('*').map(|(a, b)| (a.trim(), b.trim()))
            {
                Some(coefficient.parse::<f64>().ok()? * PI)
            } else {
                text.parse().ok()
            }
        }
    }
}

fn validate_drag(
    amplitude_mhz: f64,
    sigma_ns: f64,
    beta: f64,
    duration_ns: f64,
    line: usize,
) -> Result<(), QasmError> {
    // These are numerical work limits for the fixed 60-sample integrator.
    if !(-1e6..=1e6).contains(&amplitude_mhz)
        || !(1e-3..=1e6).contains(&sigma_ns)
        || !(-1e3..=1e3).contains(&beta)
        || !(1e-3..=1e6).contains(&duration_ns)
    {
        return Err(err_at(
            line,
            "DRAG parameters outside integration limits (MHz, ns, beta, ns)",
        ));
    }
    Ok(())
}

fn compile_measure(
    source: &str,
    destination: &str,
    qreg: Option<&(String, usize)>,
    creg: Option<&(String, usize)>,
    line: usize,
    statements: &mut Vec<QhalStatement>,
) -> Result<(), QasmError> {
    let qubits = operand_range(source, qreg, line, "qubit")?;
    let bits = operand_range(destination, creg, line, "bit")?;
    if qubits.len() != bits.len() {
        return Err(err_at(
            line,
            "measurement source and destination widths must match",
        ));
    }
    statements.extend(
        qubits
            .zip(bits)
            .map(|(q, c)| QhalStatement::Measure { line, q, c }),
    );
    Ok(())
}

fn operand_range(
    target: &str,
    reg: Option<&(String, usize)>,
    line: usize,
    kind: &str,
) -> Result<std::ops::Range<usize>, QasmError> {
    if let Some((_, size)) = reg.filter(|(name, _)| name == target) {
        return Ok(0..*size);
    }
    let index = resolve_index(target, reg, line, kind)?;
    Ok(index..index + 1)
}

fn resolve_qubit(
    target: &str,
    qreg: Option<&(String, usize)>,
    line: usize,
) -> Result<usize, QasmError> {
    resolve_index(target, qreg, line, "qubit")
}

fn resolve_index(
    target: &str,
    reg: Option<&(String, usize)>,
    line: usize,
    kind: &str,
) -> Result<usize, QasmError> {
    let reg = reg.ok_or_else(|| {
        err_at(
            line,
            format!("{kind} reference before any register declaration"),
        )
    })?;
    let (name, size) = reg;
    // OPENQASM 3.0 (and the 2.0 single-register case): a bare register name
    // is a whole-register reference — valid only for size-1 registers.
    if !target.contains('[') {
        if target == name && *size == 1 {
            return Ok(0);
        }
        return Err(err_at(
            line,
            format!("{kind} reference \"{target}\" must be {name}[i] (or a size-1 bare {name})"),
        ));
    }
    let (base, index) = split_keyword(target);
    if base != name {
        return Err(err_at(
            line,
            format!("unknown {kind} register {base:?}, expected {name}"),
        ));
    }
    let (idx, trailing) = bracketed_size(index, line)?;
    if !trailing.is_empty() {
        return Err(err_at(
            line,
            format!("unexpected tokens after {kind} index"),
        ));
    }
    if idx >= *size {
        return Err(err_at(
            line,
            format!("{kind} index {idx} out of range ({name}[{size}])"),
        ));
    }
    Ok(idx)
}

// ---------------------------------------------------------------------------
// Execution — QHAL program → Lindblad kernel (the "run" side of the IDE).
// ---------------------------------------------------------------------------

/// Execution result of one QHAL program run on the kernel.
#[derive(Debug, Clone, Serialize)]
pub struct QasmRunResult {
    /// Classical bits at program end (register order c[0]..c[n−1]).
    pub classical_bits: Vec<u8>,
    /// Number of mid-circuit measurements taken.
    pub measurements: usize,
    /// Number of DRAG integration substeps.
    pub cycles: usize,
    pub pulse_fidelities: Vec<PulseFidelity>,
    /// Final per-qubit Bloch vectors `⟨σx⟩,⟨σy⟩,⟨σz⟩` (Lindblad state).
    #[serde(rename = "blochVectors")]
    pub bloch_vectors: Vec<[f64; 3]>,
    /// Final density-matrix purity (DRAG-pulse runs decay below 1).
    pub purity: f64,
    /// Honesty badge: `SIMULATED_NOISY_QUANTUM`.
    pub badge: &'static str,
}

/// Apply the CX basis permutation to both axes of the density matrix.
pub(crate) fn apply_cx(rho: &mut DensityMatrix, control: usize, target: usize) {
    let d = rho.d;
    let cbit = 1usize << control;
    let tbit = 1usize << target;
    let mut n_re = vec![0.0_f64; d * d];
    let mut n_im = vec![0.0_f64; d * d];
    for i in 0..d {
        for j in 0..d {
            // CX|i⟩⟨j| = Σ_{ij} |i ⊕ (control&target bits of i)⟩⟨…|
            let flip_i = if (i & cbit) != 0 { i ^ tbit } else { i };
            let flip_j = if (j & cbit) != 0 { j ^ tbit } else { j };
            let src = flip_i * d + flip_j;
            n_re[i * d + j] = rho.re[src];
            n_im[i * d + j] = rho.im[src];
        }
    }
    rho.re = n_re;
    rho.im = n_im;
}

/// Exact CZ application on the published density matrix (diag(1,1,1,−1)
/// over the (control, target) pair).
fn apply_cz(rho: &mut DensityMatrix, control: usize, target: usize) {
    let mask = (1usize << control) | (1usize << target);
    for i in 0..rho.d {
        for j in 0..rho.d {
            if ((i & mask) == mask) != ((j & mask) == mask) {
                rho.re[i * rho.d + j] *= -1.0;
                rho.im[i * rho.d + j] *= -1.0;
            }
        }
    }
}

/// Sample and project one qubit. Readout error affects the classical bit
/// independently of the projection, and other qubits are not measured.
pub(crate) fn measure_qubit(
    rho: &mut DensityMatrix,
    q: usize,
    rng: &mut Mulberry32,
    fidelity: f64,
) -> (u8, u8) {
    let mask = 1usize << q;
    let mut probabilities = [0.0; 2];
    for i in 0..rho.d {
        probabilities[usize::from(i & mask != 0)] += rho.re[i * rho.d + i].max(0.0);
    }
    let draw = rng.next_f64() * (probabilities[0] + probabilities[1]);
    let outcome = usize::from(probabilities[1] > 0.0 && draw >= probabilities[0]);
    let norm = probabilities[outcome];
    for i in 0..rho.d {
        for j in 0..rho.d {
            let offset = i * rho.d + j;
            if usize::from(i & mask != 0) == outcome && usize::from(j & mask != 0) == outcome {
                rho.re[offset] /= norm;
                rho.im[offset] /= norm;
            } else {
                rho.re[offset] = 0.0;
                rho.im[offset] = 0.0;
            }
        }
    }
    let sampled = outcome as u8;
    (sampled, sampled ^ u8::from(rng.next_f64() >= fidelity))
}

/// Exact relaxation and pure-dephasing probabilities over an undriven
/// interval for the sealed uniform T1/T2 model.
pub(crate) fn idle(rho: &mut DensityMatrix, n: usize, seconds: f64, t1_s: f64, t2_s: f64) {
    let relaxation = -(-seconds / t1_s).exp_m1();
    let pure_rate = (1.0 / t2_s - 0.5 / t1_s).max(0.0);
    let dephasing = -0.5 * (-seconds * pure_rate).exp_m1();
    for q in 0..n {
        rho.amplitude_damping(q, relaxation);
        rho.pure_dephasing(q, dephasing);
    }
}

pub(crate) const DRAG_STEPS: usize = 60;

pub(crate) fn run_drag(sim: &mut LindbladSim, q: usize, params: &DragParams) {
    let dt_s = params.duration_ns * 1e-9 / DRAG_STEPS as f64;
    for index in 0..DRAG_STEPS {
        let sample = drag_pulse(
            index as f64 * params.duration_ns / DRAG_STEPS as f64,
            params,
        );
        let i = std::f64::consts::PI * sample.amp_i * 1e6;
        let q_amp = std::f64::consts::PI * sample.amp_q * 1e6;
        let hx = Op2::new([0.0, i, i, 0.0], [0.0; 4]);
        let hy = Op2::new([0.0; 4], [0.0, -q_amp, q_amp, 0.0]);
        sim.step(dt_s, &[Drive::new(q, hx), Drive::new(q, hy)]);
    }
}

/// Drive amplitude for a pi rotation about X with the same discrete Gaussian
/// area that the integrator actually samples (beta = 0).
pub(crate) fn drag_x_amplitude(params: &DragParams) -> f64 {
    let unit = DragParams {
        amplitude_mhz: 1.0,
        ..*params
    };
    let area: f64 = (0..DRAG_STEPS)
        .map(|index| drag_pulse(index as f64 * params.duration_ns / DRAG_STEPS as f64, &unit).amp_i)
        .sum::<f64>()
        * params.duration_ns
        / DRAG_STEPS as f64;
    500.0 / area
}

#[derive(Debug, Clone, Serialize)]
pub struct PulseFidelity {
    pub line: usize,
    pub qubit: usize,
    /// Mean pure-state overlap with ideal X over the six Pauli eigenstates.
    pub average_fidelity_vs_x: f64,
}

fn pulse_fidelity_vs_x(
    params: &DragParams,
    t1_s: f64,
    t2_s: f64,
    controller: &AdmissionController,
) -> Result<f64, String> {
    let mut sim = LindbladSim::new_interactive(1, NoiseModel::uniform(1, t1_s, t2_s), controller)
        .map_err(|d| d.reason)?;
    let mut total = 0.0;
    for (axis, preparation) in [(0, Some(Gate1Kind::H)), (1, Some(Gate1Kind::Rx)), (2, None)] {
        for sign in [1.0, -1.0] {
            sim.reset(InitialState::Zeros).map_err(|d| d.reason)?;
            if sign < 0.0 {
                sim.rho.apply_op1(0, Gate1Kind::X.op2(0.0));
            }
            if let Some(preparation) = preparation {
                sim.rho
                    .apply_op1(0, preparation.op2(-std::f64::consts::FRAC_PI_2));
            }
            run_drag(&mut sim, 0, params);
            let (x, y, z) = sim.rho.bloch_vector(0);
            total += (1.0 + sign * [x, -y, -z][axis]) / 2.0;
        }
    }
    Ok((total / 6.0).clamp(0.0, 1.0))
}

/// Execute a parsed QHAL program on the interactive Lindblad kernel with a
/// seeded readout. Deterministic: the same program + seed + fidelity always
/// produce identical classical bits (mulberry32 consumption order is fixed).
///
/// # Errors
/// Interactive admission refusal (`n > 6`) via ep-core, a failed density
/// matrix reset, or a failed sealed-04-JSON calibration load.
pub fn run_qasm(
    program: &QhalProgram,
    controller: &AdmissionController,
    seed: u32,
    readout_fidelity: f64,
) -> Result<QasmRunResult, String> {
    program.admit_interactive(controller)?;
    if program.n_classical > MAX_CLASSICAL_BITS || !(0.0..=1.0).contains(&readout_fidelity) {
        return Err(
            "QASM execution requires a bounded classical register and readout fidelity in [0, 1]"
                .into(),
        );
    }
    let n = program.n_qubits;
    for stmt in &program.statements {
        let (line, valid) = match stmt {
            QhalStatement::Gate1 { line, theta, q, .. } => (*line, *q < n && theta.is_finite()),
            QhalStatement::Gate2 {
                line,
                control,
                target,
                ..
            } => (*line, *control < n && *target < n && control != target),
            QhalStatement::Measure { line, q, c } => (*line, *q < n && *c < program.n_classical),
            QhalStatement::Barrier { line, qubits } => {
                (*line, !qubits.is_empty() && qubits.iter().all(|q| *q < n))
            }
            QhalStatement::DragPulse {
                line,
                q,
                amplitude_mhz,
                sigma_ns,
                beta,
                duration_ns,
            } => {
                validate_drag(*amplitude_mhz, *sigma_ns, *beta, *duration_ns, *line)
                    .map_err(|error| error.to_string())?;
                (*line, *q < n)
            }
        };
        if !valid {
            return Err(format!("invalid QHAL statement on line {line}"));
        }
    }
    let cal = calibration().map_err(|error| error.to_string())?;
    let noise = NoiseModel::uniform(n, cal.t1_s, cal.t2_s);
    let mut sim =
        LindbladSim::new_interactive(program.n_qubits, noise, controller).map_err(|d| d.reason)?;
    sim.reset(InitialState::Zeros).map_err(|d| d.reason)?;
    let mut rng = Mulberry32::new(seed);
    let mut bits = vec![0_u8; program.n_classical];
    let mut measurements = 0usize;
    let mut cycles = 0usize;
    let mut pulse_fidelities = Vec::new();

    for stmt in &program.statements {
        match stmt {
            QhalStatement::Gate1 { gate, theta, q, .. } => {
                sim.rho.apply_op1(*q, gate.op2(*theta));
                if matches!(
                    gate,
                    Gate1Kind::H | Gate1Kind::X | Gate1Kind::Y | Gate1Kind::Rx | Gate1Kind::Ry
                ) {
                    idle(
                        &mut sim.rho,
                        n,
                        cal.gate_1q_duration_ns * 1e-9,
                        cal.t1_s,
                        cal.t2_s,
                    );
                }
            }
            QhalStatement::Gate2 {
                kind,
                control,
                target,
                ..
            } => {
                match kind {
                    Gate2Kind::Cx => apply_cx(&mut sim.rho, *control, *target),
                    Gate2Kind::Cz => apply_cz(&mut sim.rho, *control, *target),
                }
                idle(
                    &mut sim.rho,
                    n,
                    cal.gate_2q_duration_ns * 1e-9,
                    cal.t1_s,
                    cal.t2_s,
                );
            }
            QhalStatement::Measure { q, c, .. } => {
                let (_, bit) = measure_qubit(&mut sim.rho, *q, &mut rng, readout_fidelity);
                bits[*c] = bit;
                measurements += 1;
            }
            QhalStatement::Barrier { .. } => {}
            QhalStatement::DragPulse {
                line,
                q,
                amplitude_mhz,
                sigma_ns,
                beta,
                duration_ns,
            } => {
                let params = DragParams {
                    amplitude_mhz: *amplitude_mhz,
                    sigma_ns: *sigma_ns,
                    duration_ns: *duration_ns,
                    beta: *beta,
                    detune_mhz: 0.0,
                };
                run_drag(&mut sim, *q, &params);
                cycles += DRAG_STEPS;
                pulse_fidelities.push(PulseFidelity {
                    line: *line,
                    qubit: *q,
                    average_fidelity_vs_x: pulse_fidelity_vs_x(
                        &params, cal.t1_s, cal.t2_s, controller,
                    )?,
                });
            }
        }
    }

    let bloch_vectors: Vec<[f64; 3]> = (0..program.n_qubits)
        .map(|k| {
            let (x, y, z) = sim.rho.bloch_vector(k);
            [x, y, z]
        })
        .collect();
    Ok(QasmRunResult {
        classical_bits: bits,
        measurements,
        cycles,
        pulse_fidelities,
        purity: sim.rho.purity(),
        bloch_vectors,
        badge: "SIMULATED_NOISY_QUANTUM",
    })
}
