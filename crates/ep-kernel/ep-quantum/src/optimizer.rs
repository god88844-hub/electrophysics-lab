//! Fixed-seed AI Co-Inventor numerical optimizer (WP-6.2).
//!
//! SPSA → Nelder–Mead minimization over a generic multi-domain
//! [`ObjectiveFn`] trait (parameter bounds + admission budgets) with a
//! built-in noisy quantum DRAG gate objective evaluated on the real
//! Lindblad/Kraus solver (real T1/T2 + ZZ crosstalk, every constant from the
//! SHA-256-verified `data/reference-library/04_quantum_hardware_modalities.json`).
//! Deterministic end-to-end through the crate's bit-exact [`Mulberry32`]
//! stream: **identical seeds reproduce identical optimization traces** and
//! byte-identical experiment bundles (03 §4 CI oracle: parity against
//! `packages/quantum-engine/src/optimizer.mjs`, asserted in
//! `tests/optimizer_oracle.rs` against captured ESM outputs — same arithmetic
//! agreement precedent as WP-5.1's Lindblad parity, tolerance ≤ 1e-9 where
//! transcendentals are involved, exact where only +−×÷ run).
//!
//! Bundles are emitted per `docs/master-plan/schemas/experiment-bundle.schema.json`
//! (required `format/kind/badge/seed/initialFidelity/optimizedFidelity/
//! reproducibility.codeVersion/citation`, optional `optimizedParams/
//! iterations/noise/trace/sha256`), with a canonical-JSON SHA-256 content
//! seal (`ep-core sha256_hex` over the sorted-key serialization of the
//! bundle without the seal field — the same seal convention as `.eplab`).
//! Badges are honest per Law 5: `SIMULATED_PHYSICS_MODEL` for the
//! Lindblad-evaluated DRAG domains, `SIMULATED_NOISY_MODEL` as the generic
//! objective default.
//!
//! Fail-closed (Law 4): bounds must be finite with `lo ≤ hi` and match the
//! parameter dimension; non-finite x0 / non-finite objective values refuse
//! with an exact reason; the objective's evaluation budget is an admission
//! budget — exceeding it is a refusal, never a silent clamp.
//!
//! No unsafe; no I/O; wasm32-compatible.

use serde_json::{json, Map, Value};

use crate::devices::{self, ModalityParams, Pulse, TransmonConfig, TransmonDevice};
use crate::lindblad::{InitialState, Mulberry32};
use ep_core::admission::AdmissionController;
use ep_core::sha256_hex;

/// experiment-bundle.schema.json `format` constant.
pub const BUNDLE_FORMAT: &str = "invention-lab/breakthrough-bundle/1";
/// Generic-objective default badge (Law 5 — domains override when they know
/// their provenance class).
pub const DEFAULT_OBJECTIVE_BADGE: &str = "SIMULATED_NOISY_MODEL";
/// DRAG-domain badge: the objective is evaluated on the real Lindblad/Kraus
/// physics solver (deterministic per seed).
pub const DRAG_OBJECTIVE_BADGE: &str = "SIMULATED_PHYSICS_MODEL";

/// One bounded optimization parameter (fail-closed: finite, `lo ≤ hi`).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ParamBound {
    pub lo: f64,
    pub hi: f64,
}

impl ParamBound {
    pub const fn new(lo: f64, hi: f64) -> Self {
        Self { lo, hi }
    }

    /// Clamp a finite value into the bound (ESM `Math.max(lo, Math.min(hi, v))`).
    fn clamp(&self, v: f64) -> f64 {
        v.min(self.hi).max(self.lo)
    }

    /// Fail-closed validation (bounds arrays are validated as a set — see
    /// `validate_bounds`).
    fn validate(&self) -> Result<(), String> {
        if !self.lo.is_finite() || !self.hi.is_finite() {
            return Err(format!(
                "optimizer: parameter bounds must be finite (got [{}, {}])",
                self.lo, self.hi
            ));
        }
        if self.lo > self.hi {
            return Err(format!(
                "optimizer: invalid parameter bounds lo > hi (got [{}, {}])",
                self.lo, self.hi
            ));
        }
        Ok(())
    }
}

/// Validate a bounds vector against the parameter dimension (fail-closed).
pub fn validate_bounds(bounds: &[ParamBound], dim: usize) -> Result<(), String> {
    if bounds.len() != dim {
        return Err(format!(
            "optimizer: bounds length {} must match the parameter dimension {}",
            bounds.len(),
            dim
        ));
    }
    for (i, b) in bounds.iter().enumerate() {
        b.validate().map_err(|e| format!("bounds[{i}]: {e}"))?;
    }
    Ok(())
}

/// Multi-domain objective surface (WP-6.2 "generic multi-domain objective
/// trait"): any domain plugs in by implementing evaluation over bounded
/// parameters with an admission budget. The built-in quantum domain is
/// [`DragGateObjective`]; silicon (trace width/rail) and SoC (tile workload
/// placement) domains implement this trait over their kernel solvers.
pub trait ObjectiveFn {
    /// Schema `kind` — the experiment family identifier.
    fn kind(&self) -> &str;
    /// Parameter dimension.
    fn dim(&self) -> usize;
    /// Parameter bounds (fail-closed, one per parameter).
    fn bounds(&self) -> Vec<ParamBound>;
    /// Admission budget: the maximum number of objective evaluations for a
    /// single optimization run (Law 4 — exceeding it refuses, never clamps).
    fn budget(&self) -> usize;
    /// Evaluate the objective (minimize). Non-finite results refuse.
    fn evaluate(&mut self, params: &[f64]) -> Result<f64, String>;
    /// Parameter names for the bundle's `optimizedParams` object.
    fn param_names(&self) -> Vec<String> {
        (0..self.dim()).map(|i| format!("param_{i}")).collect()
    }
    /// Fidelity mapping objective → `[0, 1]` (the bundle's
    /// `initialFidelity`/`optimizedFidelity`). Default: normalized score
    /// `1/(1+objective)` for unbounded objectives; domains with a natural
    /// gate fidelity override (e.g. `1 − gate error`).
    fn fidelity_of(&self, objective: f64) -> f64 {
        1.0 / (1.0 + objective)
    }
    /// Provenance badge (Law 5).
    fn badge(&self) -> &'static str {
        DEFAULT_OBJECTIVE_BADGE
    }
    /// The data/reference-library citation backing the noise/objective model.
    fn citation(&self) -> String;
    /// The domain's noise parameters verbatim from the sealed reference
    /// library (the bundle's `noise` object; `null` for domains without a
    /// quantum-noise model).
    fn noise(&self) -> Value {
        Value::Null
    }
}

/// SPSA options — defaults mirror the ESM `optimizer.mjs` (`{iterations: 40,
/// a: 0.12, c: 0.06, seed: 42}`).
#[derive(Debug, Clone, Copy)]
pub struct SpsaOpts {
    pub iterations: usize,
    pub a: f64,
    pub c: f64,
    pub seed: u32,
}

impl Default for SpsaOpts {
    fn default() -> Self {
        Self {
            iterations: 40,
            a: 0.12,
            c: 0.06,
            seed: 42,
        }
    }
}

/// SPSA outcome — `x`/`history`/`calls` are field-for-field the ESM result.
#[derive(Debug, Clone)]
pub struct SpsaOutcome {
    pub x: Vec<f64>,
    /// `(k, best)` per iteration, `k = 0` the initial evaluation — the ESM
    /// `history` array verbatim.
    pub history: Vec<(usize, f64)>,
    pub calls: usize,
}

/// Nelder–Mead options — default iterations mirror the ESM (`{iterations: 120}`).
#[derive(Debug, Clone, Copy)]
pub struct NmOpts {
    pub iterations: usize,
}

impl Default for NmOpts {
    fn default() -> Self {
        Self { iterations: 120 }
    }
}

/// Nelder–Mead outcome — `x`/`value`/`calls` are field-for-field the ESM
/// result; `best_trace` is kernel-side enrichment (per-iteration incumbent
/// best, deterministic) for the bundle's objective trace.
#[derive(Debug, Clone)]
pub struct NmOutcome {
    pub x: Vec<f64>,
    pub value: f64,
    pub calls: usize,
    pub best_trace: Vec<(usize, f64)>,
}

/// Validate `x0` (finite, dimension match) against the bounds (fail-closed).
fn validate_start(x0: &[f64], bounds: &[ParamBound]) -> Result<(), String> {
    if x0.len() != bounds.len() {
        return Err(format!(
            "optimizer: x0 length {} must match the bounds length {}",
            x0.len(),
            bounds.len()
        ));
    }
    for (i, v) in x0.iter().enumerate() {
        if !v.is_finite() {
            return Err(format!("optimizer: x0[{i}] must be finite (got {v})"));
        }
    }
    Ok(())
}

/// Central fail-closed evaluation: the trait may return `Ok` with a
/// non-finite value (e.g. a NaN from a diverged simulation) — the optimizer
/// refuses it with an exact reason (NaN objectives never propagate).
fn eval_checked(objective: &mut dyn ObjectiveFn, params: &[f64]) -> Result<f64, String> {
    let v = objective.evaluate(params)?;
    if !v.is_finite() {
        return Err(format!(
            "optimizer: objective value must be finite (got {v} at params {params:?})"
        ));
    }
    Ok(v)
}

/// Fixed-seed SPSA minimize — bit-exact port of the ESM `spsa`
/// (`packages/quantum-engine/src/optimizer.mjs`): same Spall gain schedule
/// (`ak = a/(k+8)^0.602`, `ck = c/k^0.101`), same per-iteration ±1 Bernoulli
/// perturbations drawn from the bit-exact `Mulberry32` stream in the same
/// order, same bounded gradient step, same `history`/`calls` semantics.
pub fn spsa(
    objective: &mut dyn ObjectiveFn,
    x0: &[f64],
    opts: SpsaOpts,
) -> Result<SpsaOutcome, String> {
    let bounds = objective.bounds();
    validate_bounds(&bounds, objective.dim())?;
    validate_start(x0, &bounds)?;
    let n = x0.len();
    let mut rng = Mulberry32::new(opts.seed);
    let mut x = x0.to_vec();
    for (i, v) in x.iter_mut().enumerate() {
        *v = bounds[i].clamp(*v);
    }
    let mut calls = 0usize;
    let f0 = eval_checked(objective, &x)?;
    calls += 1;
    let mut history = Vec::with_capacity(opts.iterations + 1);
    history.push((0usize, f0));
    for k in 1..=opts.iterations {
        let ak = opts.a / (k as f64 + 8.0).powf(0.602);
        let ck = opts.c / (k as f64).powf(0.101);
        let delta: Vec<f64> = (0..n)
            .map(|_| if rng.next_f64() < 0.5 { -1.0 } else { 1.0 })
            .collect();
        let x_plus: Vec<f64> = (0..n)
            .map(|i| bounds[i].clamp(x[i] + ck * delta[i]))
            .collect();
        let x_minus: Vec<f64> = (0..n)
            .map(|i| bounds[i].clamp(x[i] - ck * delta[i]))
            .collect();
        let f_plus = eval_checked(objective, &x_plus)?;
        let f_minus = eval_checked(objective, &x_minus)?;
        calls += 2;
        for i in 0..n {
            let gh = (f_plus - f_minus) / (2.0 * ck * delta[i]);
            x[i] = bounds[i].clamp(x[i] - ak * gh);
        }
        history.push((k, f_plus.min(f_minus)));
    }
    Ok(SpsaOutcome { x, history, calls })
}

/// Fixed-seed Nelder–Mead minimize — bit-exact port of the ESM
/// `nelderMead` (bounded simplex: reflection / expansion / contraction /
/// shrink with the same 0.12 initial offsets, same centroid excluding the
/// worst vertex, same clamping, same `calls` accounting).
pub fn nelder_mead(
    objective: &mut dyn ObjectiveFn,
    x0: &[f64],
    opts: NmOpts,
) -> Result<NmOutcome, String> {
    let bounds = objective.bounds();
    validate_bounds(&bounds, objective.dim())?;
    validate_start(x0, &bounds)?;
    let n = x0.len();
    let mut simplex: Vec<Vec<f64>> = Vec::with_capacity(n + 1);
    simplex.push(x0.to_vec());
    for i in 0..n {
        let mut v = x0.to_vec();
        v[i] = bounds[i].clamp(v[i] + 0.12 * (v[i].abs() + 0.12));
        simplex.push(v);
    }
    let mut values: Vec<f64> = Vec::with_capacity(n + 1);
    for v in &simplex {
        values.push(eval_checked(objective, v)?);
    }
    let mut calls = simplex.len();
    let mut best_trace: Vec<(usize, f64)> = Vec::with_capacity(opts.iterations);
    for it in 0..opts.iterations {
        let mut order: Vec<usize> = (0..=n).collect();
        order.sort_by(|&i, &j| values[i].total_cmp(&values[j]));
        let best = order[0];
        let worst = order[n];
        let second_worst = order[n - 1];
        let centroid: Vec<f64> = (0..n)
            .map(|i| {
                let s: f64 = order[..n].iter().map(|&idx| simplex[idx][i]).sum();
                s / n as f64
            })
            .collect();
        // Reflection.
        let reflected: Vec<f64> = (0..n)
            .map(|i| bounds[i].clamp(centroid[i] + (centroid[i] - simplex[worst][i])))
            .collect();
        let f_reflected = eval_checked(objective, &reflected)?;
        calls += 1;
        if f_reflected < values[best] {
            // Expansion.
            let expanded: Vec<f64> = (0..n)
                .map(|i| bounds[i].clamp(centroid[i] + 2.0 * (centroid[i] - simplex[worst][i])))
                .collect();
            let f_expanded = eval_checked(objective, &expanded)?;
            calls += 1;
            let pick = if f_expanded < f_reflected {
                expanded
            } else {
                reflected
            };
            let f_pick = f_expanded.min(f_reflected);
            simplex[worst] = pick;
            values[worst] = f_pick;
        } else if f_reflected < values[second_worst] {
            simplex[worst] = reflected;
            values[worst] = f_reflected;
        } else {
            // Contraction.
            let contracted: Vec<f64> = (0..n)
                .map(|i| bounds[i].clamp(centroid[i] + 0.5 * (simplex[worst][i] - centroid[i])))
                .collect();
            let f_contracted = eval_checked(objective, &contracted)?;
            calls += 1;
            if f_contracted < values[worst] {
                simplex[worst] = contracted;
                values[worst] = f_contracted;
            } else {
                // Shrink toward the best vertex.
                for i in 0..=n {
                    if i == best {
                        continue;
                    }
                    simplex[i] = (0..n)
                        .map(|j| bounds[j].clamp((simplex[i][j] + simplex[best][j]) / 2.0))
                        .collect();
                    values[i] = eval_checked(objective, &simplex[i])?;
                    calls += 1;
                }
            }
        }
        best_trace.push((it + 1, values.iter().cloned().fold(f64::INFINITY, f64::min)));
    }
    let mut best_idx = 0usize;
    for i in 1..=n {
        if values[i] < values[best_idx] {
            best_idx = i;
        }
    }
    Ok(NmOutcome {
        x: simplex[best_idx].clone(),
        value: values[best_idx],
        calls,
        best_trace,
    })
}

/// Bundle identity metadata (schema `kind`/`badge`/`seed` +
/// `reproducibility.codeVersion`).
#[derive(Debug, Clone)]
pub struct BundleMeta {
    pub kind: String,
    pub badge: &'static str,
    pub seed: u32,
    pub code_version: String,
}

/// The full Co-Inventor pipeline result: SPSA global exploration → Nelder–Mead
/// polish, with initial vs optimized objective/fidelity.
#[derive(Debug, Clone)]
pub struct CoinventorRun {
    pub spsa: SpsaOutcome,
    pub nm: NmOutcome,
    pub initial_objective: f64,
    pub optimized_objective: f64,
    pub initial_fidelity: f64,
    pub optimized_fidelity: f64,
    pub total_evaluations: usize,
}

/// Run the fixed-seed SPSA → Nelder–Mead pipeline on any [`ObjectiveFn`]
/// (the ESM Co-Inventor scenario: `spsa(f, x0, opts)` then
/// `nelderMead(f, spsa.x, opts)`).
pub fn run_coinventor(
    objective: &mut dyn ObjectiveFn,
    x0: &[f64],
    spsa_opts: SpsaOpts,
    nm_opts: NmOpts,
) -> Result<CoinventorRun, String> {
    let initial_objective = objective.evaluate(x0)?;
    if !initial_objective.is_finite() {
        return Err(format!(
            "optimizer: objective at x0 must be finite (got {initial_objective})"
        ));
    }
    let spsa_out = spsa(objective, x0, spsa_opts)?;
    let nm_out = nelder_mead(objective, &spsa_out.x, nm_opts)?;
    let run = CoinventorRun {
        initial_fidelity: objective.fidelity_of(initial_objective),
        optimized_fidelity: objective.fidelity_of(nm_out.value),
        initial_objective,
        optimized_objective: nm_out.value,
        total_evaluations: 1 + spsa_out.calls + nm_out.calls,
        spsa: spsa_out,
        nm: nm_out,
    };
    if !(0.0..=1.0).contains(&run.initial_fidelity)
        || !(0.0..=1.0).contains(&run.optimized_fidelity)
    {
        return Err(format!(
            "optimizer: fidelity mapping must land in [0, 1] (got initial {}, optimized {})",
            run.initial_fidelity, run.optimized_fidelity
        ));
    }
    Ok(run)
}

/// Build the `experiment-bundle.schema.json` bundle for a finished run.
///
/// `noise` is the domain's noise parameters verbatim from the sealed
/// reference library; `citation` is the library citation string. The bundle
/// carries the deterministic objective trace (SPSA history + Nelder–Mead
/// incumbent-best trace), the fixed seed, initial vs optimized fidelity, and
/// a canonical-JSON SHA-256 seal computed over the bundle without the seal
/// field. No timestamps: identical seeds reproduce the bundle byte-for-byte.
pub fn build_experiment_bundle(
    meta: &BundleMeta,
    run: &CoinventorRun,
    param_names: &[String],
    noise: &Value,
    citation: &str,
) -> Result<Value, String> {
    let BundleMeta {
        kind,
        badge,
        seed,
        code_version,
    } = meta;
    if param_names.len() != run.nm.x.len() {
        return Err(format!(
            "optimizer: param_names length {} must match the optimized parameter count {}",
            param_names.len(),
            run.nm.x.len()
        ));
    }
    let mut optimized_params = Map::new();
    for (name, v) in param_names.iter().zip(run.nm.x.iter()) {
        if !v.is_finite() {
            return Err(format!(
                "optimizer: optimized parameter {name} must be finite (got {v})"
            ));
        }
        optimized_params.insert(name.clone(), json!(v));
    }
    let mut trace = Vec::new();
    for (k, best) in &run.spsa.history {
        trace.push(json!({"stage": "spsa", "k": k, "best": best}));
    }
    for (k, best) in &run.nm.best_trace {
        trace.push(json!({"stage": "nelder-mead", "k": k, "best": best}));
    }
    let bundle = json!({
        "format": BUNDLE_FORMAT,
        "kind": kind,
        "badge": badge,
        "seed": seed,
        "initialFidelity": run.initial_fidelity,
        "optimizedFidelity": run.optimized_fidelity,
        "optimizedParams": Value::Object(optimized_params),
        "iterations": run.spsa.history.len().saturating_sub(1) + run.nm.best_trace.len(),
        "noise": noise,
        "trace": trace,
        "reproducibility": { "codeVersion": code_version },
        "citation": citation,
    });
    // Canonical-JSON seal over the bundle content without the seal field
    // (sorted-key serialization — the .eplab seal convention).
    let seal = bundle_seal(&bundle);
    let mut sealed = bundle;
    if let Value::Object(map) = &mut sealed {
        map.insert("sha256".into(), json!(seal));
    }
    validate_experiment_bundle(&sealed)?;
    Ok(sealed)
}

/// The canonical-JSON SHA-256 content seal of a bundle (the bundle without
/// its `sha256` field). Exported for the seed-replay verification contract.
pub fn bundle_seal(bundle_without_sha: &Value) -> String {
    sha256_hex(
        serde_json::to_string(bundle_without_sha)
            .expect("bundle serializes")
            .as_bytes(),
    )
}

/// Schema conformance check for `experiment-bundle.schema.json` — every
/// `required` field, the `format` const, the `badge` enum, the fidelity
/// range, the `sha256` pattern and the `reproducibility.codeVersion`
/// requirement, field-by-field (no validator dependency; the exported
/// bundle is also validated inside `build_experiment_bundle`).
pub fn validate_experiment_bundle(bundle: &Value) -> Result<(), String> {
    let obj = bundle
        .as_object()
        .ok_or_else(|| "bundle: must be a JSON object".to_string())?;
    for field in [
        "format",
        "kind",
        "badge",
        "seed",
        "initialFidelity",
        "optimizedFidelity",
        "reproducibility",
        "citation",
    ] {
        if !obj.contains_key(field) {
            return Err(format!("bundle: missing required field '{field}'"));
        }
    }
    if obj["format"] != json!(BUNDLE_FORMAT) {
        return Err(format!(
            "bundle: format must be {:?} (got {})",
            BUNDLE_FORMAT, obj["format"]
        ));
    }
    let badge = obj["badge"]
        .as_str()
        .ok_or_else(|| "bundle: badge must be a string".to_string())?;
    if !matches!(
        badge,
        "SIMULATED_PHYSICS_MODEL"
            | "SIMULATED_ARCHITECTURAL_MODEL"
            | "SIMULATED_NOISY_QUANTUM"
            | "SIMULATED_NOISY_MODEL"
    ) {
        return Err(format!("bundle: badge {badge:?} is not in the schema enum"));
    }
    if obj["seed"].as_u64().is_none() {
        return Err("bundle: seed must be an integer".to_string());
    }
    for field in ["initialFidelity", "optimizedFidelity"] {
        let f = obj[field]
            .as_f64()
            .ok_or_else(|| format!("bundle: {field} must be a number"))?;
        if !(0.0..=1.0).contains(&f) {
            return Err(format!("bundle: {field} must be within [0, 1] (got {f})"));
        }
    }
    if let Some(params) = obj.get("optimizedParams") {
        let p = params
            .as_object()
            .ok_or_else(|| "bundle: optimizedParams must be an object".to_string())?;
        for (k, v) in p {
            if v.as_f64().is_none() {
                return Err(format!("bundle: optimizedParams.{k} must be a number"));
            }
        }
    }
    if let Some(it) = obj.get("iterations") {
        let n = it
            .as_u64()
            .ok_or_else(|| "bundle: iterations must be an integer".to_string())?;
        if n < 1 {
            return Err("bundle: iterations must be ≥ 1".to_string());
        }
    }
    let repro = obj["reproducibility"]
        .as_object()
        .ok_or_else(|| "bundle: reproducibility must be an object".to_string())?;
    if repro.get("codeVersion").and_then(|v| v.as_str()).is_none() {
        return Err("bundle: reproducibility.codeVersion is required".to_string());
    }
    if obj["citation"].as_str().is_none() {
        return Err("bundle: citation must be a string".to_string());
    }
    if let Some(seal) = obj.get("sha256") {
        let s = seal
            .as_str()
            .ok_or_else(|| "bundle: sha256 must be a string".to_string())?;
        let valid = s.len() == 64
            && s.bytes()
                .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase());
        if !valid {
            return Err(format!(
                "bundle: sha256 must match ^[a-f0-9]{{64}}$ (got {s:?})"
            ));
        }
    }
    Ok(())
}

/// Built-in quantum gate family for the DRAG Co-Inventor domain.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GateKind {
    /// X|0⟩ = |1⟩ on one transmon (T1/T2 noise) — objective `1 − ⟨1|ρ|1⟩`.
    X,
    /// CZ-family surrogate on a ZZ-coupled pair (real 50 kHz crosstalk):
    /// from |11⟩, pulse qubit 0 and measure the |01⟩ population-fidelity
    /// surrogate `P(q0 ground)·P(q1 excited)` via the qubit Bloch z
    /// components — objective `1 − ((1+⟨σz⟩₀)/2)·((1−⟨σz⟩₁)/2)`.
    CzFamily,
}

impl GateKind {
    fn kind_str(&self) -> &'static str {
        match self {
            GateKind::X => "x-gate-error-minimization-under-transmon-noise",
            GateKind::CzFamily => "cz-family-error-minimization-under-zz-crosstalk",
        }
    }
}

/// Built-in noisy quantum DRAG objective: one DRAG pulse on a transmon
/// evaluated on the real Lindblad/Kraus solver (60 exact-splitting sub-steps
/// with the effective leakage channel), with real T1/T2 (and ZZ crosstalk
/// for the CZ-family variant) from the SHA-256-verified 04 JSON.
///
/// Each evaluation builds a fresh admitted device (ep-core interactive
/// admission) — the objective is deterministic per parameter vector, so
/// identical seeds reproduce identical optimization traces.
pub struct DragGateObjective {
    kind: GateKind,
    params: ModalityParams,
    duration_ns: f64,
    bounds: Vec<ParamBound>,
    eval_count: usize,
    budget: usize,
    citation: String,
}

impl DragGateObjective {
    /// Built-in objective from the verified 04-JSON typicals (T1 100 µs,
    /// T2 150 µs, ZZ crosstalk 50 kHz, 1Q gate 25 ns, anharmonicity
    /// −280 MHz), the ESM Co-Inventor bounds
    /// `[amplitude ∈ [5,40] MHz, σ ∈ [3,12] ns, β ∈ [0,1.5]]` and the ESM
    /// calibration device seed 99.
    pub fn new_builtin(kind: GateKind, budget: usize) -> Result<Self, String> {
        let params = ModalityParams::from_verified_embedded()
            .map_err(|e| format!("optimizer: verified 04 JSON unavailable: {e}"))?;
        let citation = {
            let root: Value = serde_json::from_str(devices::embedded::MODALITIES_JSON)
                .map_err(|e| format!("optimizer: embedded 04 JSON unreadable: {e}"))?;
            root.get("source_citation")
                .and_then(|v| v.as_str())
                .ok_or_else(|| "optimizer: 04 JSON missing source_citation".to_string())?
                .to_string()
        };
        Ok(Self {
            kind,
            duration_ns: params.transmon.gate_1q_duration_ns_typical,
            params,
            bounds: vec![
                ParamBound::new(5.0, 40.0),
                ParamBound::new(3.0, 12.0),
                ParamBound::new(0.0, 1.5),
            ],
            eval_count: 0,
            budget,
            citation,
        })
    }

    fn device(&self) -> Result<TransmonDevice, String> {
        let n_qubits = match self.kind {
            GateKind::X => 1,
            GateKind::CzFamily => 2,
        };
        let zz_hz = match self.kind {
            GateKind::X => 0.0,
            GateKind::CzFamily => self.params.transmon.zz_crosstalk_khz_typical * 1000.0,
        };
        // ESM Co-Inventor device parity: `{nQubits, t1Us: 100, t2Us: 150,
        // seed: 99}` → readoutFidelity 1, anharmonicity −280 (ESM defaults).
        TransmonDevice::new_interactive(
            &TransmonConfig {
                n_qubits,
                t1: self.params.transmon.t1_us_typical,
                t2: self.params.transmon.t2_us_typical,
                zz_hz,
                readout_fidelity: 1.0,
                anharmonicity_mhz: self.params.transmon.anharmonicity_alpha_mhz_typical,
                seed: 99,
            },
            &AdmissionController::new(),
        )
        .map_err(|d| format!("optimizer: device admission refused — {}", d.reason))
    }

    fn noise(&self) -> Value {
        let t = &self.params.transmon;
        json!({
            "t1Us": t.t1_us_typical,
            "t2Us": t.t2_us_typical,
            "zzCrosstalkKhz": t.zz_crosstalk_khz_typical,
            "gate1qDurationNs": t.gate_1q_duration_ns_typical,
            "anharmonicityMhz": t.anharmonicity_alpha_mhz_typical,
            "readoutFidelity": t.readout_fidelity_typical,
            "deviceSeed": 99,
        })
    }
}

impl ObjectiveFn for DragGateObjective {
    fn kind(&self) -> &str {
        self.kind.kind_str()
    }
    fn dim(&self) -> usize {
        3
    }
    fn bounds(&self) -> Vec<ParamBound> {
        self.bounds.clone()
    }
    fn budget(&self) -> usize {
        self.budget
    }
    fn param_names(&self) -> Vec<String> {
        vec!["amplitudeMhz".into(), "sigmaNs".into(), "beta".into()]
    }
    fn fidelity_of(&self, objective: f64) -> f64 {
        1.0 - objective // gate fidelity = 1 − gate error
    }
    fn badge(&self) -> &'static str {
        DRAG_OBJECTIVE_BADGE
    }
    fn citation(&self) -> String {
        self.citation.clone()
    }
    fn evaluate(&mut self, params: &[f64]) -> Result<f64, String> {
        self.eval_count += 1;
        if self.eval_count > self.budget {
            return Err(format!(
                "optimizer: evaluation budget exhausted ({} evaluations > admission budget {})",
                self.eval_count, self.budget
            ));
        }
        if params.len() != 3 {
            return Err(format!(
                "optimizer: DRAG parameters must be [amplitudeMhz, sigmaNs, beta] (got {})",
                params.len()
            ));
        }
        for (i, v) in params.iter().enumerate() {
            if !v.is_finite() {
                return Err(format!(
                    "optimizer: DRAG parameter {i} must be finite (got {v})"
                ));
            }
        }
        let mut device = self.device()?;
        if matches!(self.kind, GateKind::CzFamily) {
            // |11⟩ — both qubits excited so the ZZ crosstalk acts during the pulse.
            device
                .sim
                .reset(InitialState::Computational(3))
                .map_err(|d| format!("optimizer: |11⟩ preparation refused — {}", d.reason))?;
        }
        let pulse = Pulse {
            qubit: 0,
            amplitude_mhz: params[0],
            sigma_ns: params[1],
            duration_ns: self.duration_ns,
            beta: params[2],
        };
        device.run_pulse(&pulse);
        let objective = match self.kind {
            GateKind::X => {
                let pop = device.sim.rho.population(0);
                1.0 - pop
            }
            GateKind::CzFamily => {
                let (_, _, z0) = device.sim.rho.bloch_vector(0);
                let (_, _, z1) = device.sim.rho.bloch_vector(1);
                1.0 - ((1.0 + z0) / 2.0) * ((1.0 - z1) / 2.0)
            }
        };
        if !objective.is_finite() {
            return Err(format!(
                "optimizer: DRAG objective must be finite (got {objective})"
            ));
        }
        Ok(objective)
    }
}

/// One-call built-in: run the fixed-seed SPSA → Nelder–Mead Co-Inventor
/// pipeline on the DRAG gate objective and emit the sealed
/// `experiment-bundle.schema.json` bundle. `x0` and the optimizer schedule
/// default to the ESM Co-Inventor scenario
/// (`x0 = [18, 7.5, 0]`, SPSA 30 iterations seed 2024, Nelder–Mead 80).
pub fn run_drag_coinventor(
    kind: GateKind,
    seed: u32,
    budget: usize,
    code_version: &str,
) -> Result<Value, String> {
    let mut objective = DragGateObjective::new_builtin(kind, budget)?;
    let x0 = [18.0, 7.5, 0.0];
    let run = run_coinventor(
        &mut objective,
        &x0,
        SpsaOpts {
            iterations: 30,
            a: 0.12,
            c: 0.06,
            seed,
        },
        NmOpts { iterations: 80 },
    )?;
    let noise = objective.noise();
    build_experiment_bundle(
        &BundleMeta {
            kind: objective.kind().to_string(),
            badge: objective.badge(),
            seed,
            code_version: code_version.to_string(),
        },
        &run,
        &objective.param_names(),
        &noise,
        &objective.citation(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Pure-arithmetic multi-dimensional objective (only +−×÷ — bit-exact
    /// across the ESM and Rust engines; used for the captured-trace parity).
    #[derive(Debug, Clone)]
    struct ParityObjective;
    impl ObjectiveFn for ParityObjective {
        fn kind(&self) -> &str {
            "parity-pure-arithmetic"
        }
        fn dim(&self) -> usize {
            3
        }
        fn bounds(&self) -> Vec<ParamBound> {
            vec![
                ParamBound::new(-10.0, 10.0),
                ParamBound::new(-5.0, 5.0),
                ParamBound::new(-8.0, 8.0),
            ]
        }
        fn budget(&self) -> usize {
            10_000
        }
        fn citation(&self) -> String {
            "test: pure arithmetic (no library constants)".into()
        }
        fn evaluate(&mut self, x: &[f64]) -> Result<f64, String> {
            Ok((x[0] - 3.0) * (x[0] - 3.0)
                + 7.0 * (x[1] + 1.0) * (x[1] + 1.0)
                + 0.5 * x[2] * x[2]
                + 0.25 * x[0] * x[1])
        }
    }

    /// Captured ESM values (`packages/quantum-engine/src/optimizer.mjs`,
    /// seed 20241119, x0 [2, −2, 4], 25 SPSA iterations + 60 NM iterations,
    /// bounds [[−10,10],[−5,5],[−8,8]]).
    mod esm {
        pub const SPSA_X: [f64; 3] = [2.5086914747511178, -0.9569643092968151, 2.6880406367626883];
        pub const SPSA_CALLS: usize = 51;
        pub const SPSA_HISTORY_LAST3: [(usize, f64); 3] = [
            (23, 3.3134278930930026),
            (24, 3.2680692466777757),
            (25, 3.270186484542781),
        ];
        pub const NM_X: [f64; 3] = [
            3.131800080049133,
            -1.0559288767764934,
            -0.000016894916798387903,
        ];
        pub const NM_VALUE: f64 = -0.7874719991576651;
        pub const NM_CALLS: usize = 112;
    }

    /// SPSA mechanics parity: identical seed ⇒ identical x, history and call
    /// count (pure +−×÷ objective — exact arithmetic both engines).
    #[test]
    fn spsa_matches_captured_esm_trace() {
        let mut objective = ParityObjective;
        let out = spsa(
            &mut objective,
            &[2.0, -2.0, 4.0],
            SpsaOpts {
                iterations: 25,
                a: 0.12,
                c: 0.06,
                seed: 20241119,
            },
        )
        .expect("spsa runs");
        assert_eq!(out.calls, esm::SPSA_CALLS);
        assert_eq!(out.history.len(), 26);
        for (i, v) in out.x.iter().enumerate() {
            assert_eq!(*v, esm::SPSA_X[i], "spsa.x[{i}] bit-exact vs ESM");
        }
        let last3 = &out.history[out.history.len() - 3..];
        for (i, (k, best)) in last3.iter().enumerate() {
            assert_eq!(*k, esm::SPSA_HISTORY_LAST3[i].0);
            assert_eq!(*best, esm::SPSA_HISTORY_LAST3[i].1, "history bit-exact");
        }
    }

    /// Nelder–Mead continuation parity: same x/value/calls as the ESM.
    #[test]
    fn nelder_mead_matches_captured_esm_trace() {
        let mut objective = ParityObjective;
        let spsa_out = spsa(
            &mut objective,
            &[2.0, -2.0, 4.0],
            SpsaOpts {
                iterations: 25,
                a: 0.12,
                c: 0.06,
                seed: 20241119,
            },
        )
        .expect("spsa runs");
        let out = nelder_mead(&mut objective, &spsa_out.x, NmOpts { iterations: 60 })
            .expect("nelder-mead runs");
        assert_eq!(out.calls, esm::NM_CALLS);
        for (i, v) in out.x.iter().enumerate() {
            assert_eq!(*v, esm::NM_X[i], "nm.x[{i}] bit-exact vs ESM");
        }
        assert_eq!(out.value, esm::NM_VALUE);
    }

    /// Fail-closed bounds: NaN/infinite/lo>hi/dimension-mismatch refuse.
    #[test]
    fn invalid_bounds_refuse_fail_closed() {
        assert!(validate_bounds(&[ParamBound::new(0.0, f64::NAN)], 1).is_err());
        assert!(validate_bounds(&[ParamBound::new(f64::INFINITY, 1.0)], 1).is_err());
        assert!(validate_bounds(&[ParamBound::new(2.0, 1.0)], 1).is_err());
        assert!(
            validate_bounds(&[ParamBound::new(0.0, 1.0), ParamBound::new(0.0, 1.0)], 1).is_err()
        );
        assert!(validate_bounds(&[ParamBound::new(0.0, 1.0)], 1).is_ok());
    }

    /// Fail-closed x0: non-finite starts refuse.
    #[test]
    fn invalid_x0_refuses_fail_closed() {
        let mut objective = ParityObjective;
        assert!(spsa(&mut objective, &[2.0, f64::NAN, 4.0], SpsaOpts::default()).is_err());
        assert!(nelder_mead(
            &mut objective,
            &[2.0, -2.0, f64::INFINITY],
            NmOpts::default()
        )
        .is_err());
    }

    /// Fail-closed objective: a NaN objective value refuses with a reason.
    #[derive(Debug, Clone)]
    struct NanObjective;
    impl ObjectiveFn for NanObjective {
        fn kind(&self) -> &str {
            "nan-objective"
        }
        fn dim(&self) -> usize {
            1
        }
        fn bounds(&self) -> Vec<ParamBound> {
            vec![ParamBound::new(0.0, 1.0)]
        }
        fn budget(&self) -> usize {
            100
        }
        fn citation(&self) -> String {
            "test".into()
        }
        fn evaluate(&mut self, _x: &[f64]) -> Result<f64, String> {
            Ok(f64::NAN)
        }
    }

    #[test]
    fn nan_objective_refuses_fail_closed() {
        let mut objective = NanObjective;
        let err = spsa(&mut objective, &[0.5], SpsaOpts::default()).unwrap_err();
        assert!(err.contains("must be finite"), "{err}");
        let err = nelder_mead(&mut objective, &[0.5], NmOpts::default()).unwrap_err();
        assert!(err.contains("must be finite"), "{err}");
    }

    /// Admission budget: exceeding the evaluation budget refuses with the
    /// honest reason (Law 4 — refuse, never clamp).
    #[derive(Debug, Clone)]
    struct BudgetedObjective {
        evals: usize,
    }
    impl ObjectiveFn for BudgetedObjective {
        fn kind(&self) -> &str {
            "budgeted"
        }
        fn dim(&self) -> usize {
            1
        }
        fn bounds(&self) -> Vec<ParamBound> {
            vec![ParamBound::new(0.0, 1.0)]
        }
        fn budget(&self) -> usize {
            3
        }
        fn citation(&self) -> String {
            "test".into()
        }
        fn evaluate(&mut self, x: &[f64]) -> Result<f64, String> {
            self.evals += 1;
            if self.evals > 3 {
                return Err(format!(
                    "evaluation budget exhausted ({} evaluations > admission budget 3)",
                    self.evals
                ));
            }
            Ok((x[0] - 0.5) * (x[0] - 0.5))
        }
    }

    #[test]
    fn budget_exhaustion_refuses_fail_closed() {
        let mut objective = BudgetedObjective { evals: 0 };
        let err = run_coinventor(
            &mut objective,
            &[0.0],
            SpsaOpts {
                iterations: 10,
                ..SpsaOpts::default()
            },
            NmOpts::default(),
        )
        .unwrap_err();
        assert!(err.contains("budget exhausted"), "{err}");
    }
}
