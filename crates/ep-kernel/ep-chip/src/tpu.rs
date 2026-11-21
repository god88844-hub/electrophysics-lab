//! WP-4.3 — weight-stationary systolic TPU kernel: INT8/per-axis-QDQ quantized
//! GEMM + experimental Q4 multi-radix mode, with the exact §3 wave-front cycle
//! model, per-tile MAC telemetry and switching power.
//!
//! Provenance: every number this module emits is a
//! [`ep_core::ProvenanceBadge::SimulatedArchitecturalModel`] architectural
//! model — deterministic, bounded, fail-closed functional math over the
//! sealed offline vault constants, NOT a silicon measurement (Builder Rule 5).
//!
//! Exact contracts implemented here (docs/master-plan/03_PHYSICS_MATH_FUNDAMENTALS.md §3,
//! `data/reference-library/05_chip_architecture_benchmarks.json`):
//! - wave-front cycles  `cycles = ceil(M/P)·ceil(N/P)·(K + 2P − 2)` for a P×P tile;
//! - utilization        `U = (M·N·K) / (tiles · (K + 2P − 2) · P²)`;
//! - INT32 accumulator safety `K_max = 2³¹ / (255·255)` — the exact integer
//!   value of the normative §3 formula is **33025** (the sealed 05-JSON prose
//!   notes "≈ 33038", which corresponds to dividing by 65000 instead of
//!   65025; this module implements the normative formula and the tests
//!   assert both the exact value and the real saturation boundary);
//! - dynamic power      `P_dyn = α·C·V²·f` per switching MAC event
//!   (verified ∝f and ∝V² by tests, as §3 requires);
//! - operating envelope `systolic_tpu.vdd_range_v = [0.7, 0.9]` (fail-closed);
//! - INT8 quantization  per-axis symmetric QDQ with the EXACT accumulation
//!   contract of `packages/chip-engine/src/accelerators.mjs` (`systolicMatmul`):
//!   quantize (clamp to ±127, JS `Math.round` semantics) → INT8 multiply →
//!   INT32 accumulate (saturating, with per-(i,j,k) overflow events) →
//!   dequantize. Scale-1 QDQ is bit-exact against the oracle; explicit
//!   per-axis scales follow the ONNX QLinearMatMul layout (per-M row for the
//!   activations, per-N column for the weights) so the INT32 accumulation
//!   stays exact and the dequantize pass is a single exact multiply.
//! - Q4 multi-radix mode (EXPERIMENTAL): radix-4 digits (0..3) packed 2 per
//!   byte (`05`-adjacent contract: "Q4 packing 2 digits/byte",
//!   PHASE_04 interface contracts), exact INT32 digit-domain accumulation,
//!   and a dequant pass that transfers outputs onto the verified Q4 LDO
//!   voltage levels (`data/reference-library/03_multiradix_logic_baselines.json`,
//!   `quaternary_q4_1p8v_ldo.voltage_levels_v = [0, 0.6, 1.2, 1.8]`) by
//!   nearest-partition digit transfer (the `q4_thresh_det` semantics), with
//!   the declared dequant pass cycle overhead `tiles·P` (the ESM
//!   `compareArchitectures` q4 contract).
//!
//! Per-tile telemetry: every GEMM emits one [`TileTelemetry`] per output tile
//! — MACs executed, average MAC activity fraction, average and peak switching
//! power (`P_dyn = α·C·V²·f`) — ready for the 64-tile 3D SoC heatmap (the
//! educational 8×8 grid over a 64×64 GEMM is exactly 64 tiles).

use crate::power::{DynamicPowerModel, Farad, Hertz};
use ep_core::{ProvenanceBadge, Volt, Watt};
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Vault-anchored constants (each asserted against the sealed JSONs by
// tests/tpu_oracle.rs — Law 5: no invented constants).
// ---------------------------------------------------------------------------

/// Exact INT32 bounds.
pub const I32_MAX: i64 = 2_147_483_647;
pub const I32_MIN: i64 = -2_147_483_648;

/// Worst-case |INT8 product| for the symmetric ±127 QDQ grid: 255·255 = 65025.
pub const INT8_PRODUCT_MAX: i64 = 255 * 255;

/// `K_max = 2³¹ / (255·255)` — exact integer value of the normative §3
/// formula (= 33025). Accumulating more than `K_MAX_INT32_ACC` MACs with
/// worst-case ±255 products can exceed the INT32 accumulator range.
pub const K_MAX_INT32_ACC: u64 = (1u64 << 31) / (255u64 * 255u64);

/// Worst-case |Q4 digit product|: digit 3 × digit 3 = 9.
pub const Q4_PRODUCT_MAX: i64 = 9;

/// `K_max` for the Q4 digit-domain accumulator: `2³¹ / 9`.
pub const K_MAX_Q4_ACC: u64 = (1u64 << 31) / (9u64);

/// Symmetric INT8 quantization grid (the oracle clamps to ±127, not ±128).
pub const INT8_MIN: i32 = -127;
pub const INT8_MAX: i32 = 127;

/// Q4 (quaternary) digit range and packing density (2 digits/byte).
pub const Q4_MAX_DIGIT: u8 = 3;
pub const Q4_DIGITS_PER_BYTE: usize = 2;

/// Declared defaults (05 JSON `systolic_array_tpu.educational` anchor + the
/// ESM oracle defaults the parity fixture captured).
pub const DEFAULT_GRID_P: usize = 8;
pub const DEFAULT_CLOCK_MHZ: f64 = 100.0;
pub const DEFAULT_VDD: f64 = 0.8;
/// Default switching activity factor (ESM oracle `activityFactor` default).
pub const DEFAULT_ACTIVITY: f64 = 0.35;
/// Declared per-MAC switching capacitance (ESM oracle `capPerMacFf` default,
/// order-of-magnitude model parameter — NOT a measurement).
pub const CAP_PER_MAC_F: f64 = 1.2e-13;

/// Operating envelope `05 → valid_operating_envelope.systolic_tpu.vdd_range_v`.
pub const VDD_MIN: f64 = 0.7;
pub const VDD_MAX: f64 = 0.9;

/// Educational reference grid: `05 → parameters.systolic_array_tpu.grid_size.educational`.
/// A full 8×8 grid over a 64×64 GEMM is exactly the 64 tiles of the 3D SoC heatmap.
pub const EDUCATIONAL_GRID_P: usize = 8;

// ---------------------------------------------------------------------------
// Errors — fail-closed, never silent clamping of inputs.
// ---------------------------------------------------------------------------

/// Fail-closed TPU errors (admission discipline: refuse, never crash).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TpuError {
    /// Matrix/flat-buffer/grid dimension problems.
    Dimensions(String),
    /// `K` beyond the INT32 (or Q4) accumulator bound under [`OverflowPolicy::Refuse`].
    OverflowRefused { k: u64, k_max: u64 },
    /// Negative or non-finite operand, scale, α, C, V or f.
    NonPhysicalInput(String),
    /// Voltage outside the `05`-JSON `systolic_tpu` operating envelope.
    EnvelopeViolated(String),
    /// A packed Q4 digit outside 0..=3.
    Q4DigitOutOfRange { index: usize, value: u8 },
}

impl std::fmt::Display for TpuError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Dimensions(what) => write!(f, "TPU dimension check failed: {what}"),
            Self::OverflowRefused { k, k_max } => {
                write!(f, "TPU refused: K = {k} exceeds the INT32 accumulator bound K_max = 2^31/(255·255) = {k_max} (fail-closed admission)")
            }
            Self::NonPhysicalInput(what) => write!(f, "non-physical TPU input: {what}"),
            Self::EnvelopeViolated(what) => write!(f, "TPU operating envelope violated: {what}"),
            Self::Q4DigitOutOfRange { index, value } => {
                write!(
                    f,
                    "Q4 digit out of range at flat index {index}: {value} (valid 0..=3)"
                )
            }
        }
    }
}

impl std::error::Error for TpuError {}

/// Accumulator overflow handling (PHASE_04 failure modes: "INT32 accumulator
/// overflow → saturation + documented overflow event").
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum OverflowPolicy {
    /// Refuse the workload up-front when `K` exceeds the worst-case bound —
    /// fail-closed admission (default; the kernel never guesses).
    #[default]
    Refuse,
    /// Run the wave-front and saturate the accumulator at the INT32 bounds,
    /// recording one documented overflow event `(i, j, k)` per offending MAC
    /// — bit-exact against the ESM oracle's overflow behavior.
    SaturateAndRecord,
}

/// Per-axis QDQ scales (ONNX QLinearMatMul layout): activations carry a
/// per-M-row scale, weights a per-N-column scale, so the INT32 accumulation
/// over the reduction axis stays exact and dequantization is one multiply.
/// Empty vecs (or a single entry) mean the per-tensor scale 1.0 — the exact
/// `accelerators.mjs` oracle layout.
#[derive(Debug, Clone, PartialEq, Default, Serialize, Deserialize)]
pub struct QdqScales {
    /// Per-M-row activation scales (empty = per-tensor 1.0).
    pub a_per_row: Vec<f64>,
    /// Per-N-column weight scales (empty = per-tensor 1.0).
    pub b_per_col: Vec<f64>,
}

impl QdqScales {
    /// Unity (per-tensor 1.0) scales — the exact `systolicMatmul` oracle path.
    #[must_use]
    pub fn unity() -> Self {
        Self::default()
    }
}

/// Fail-closed accumulator-bound admission shared by both radix modes:
/// the worst-case |acc| is `K · worst_case_product`, so `K` beyond
/// `2³¹ / worst_case_product` is refused under [`OverflowPolicy::Refuse`]
/// (the bound protects ANY INT8/digit inputs — admission is on the bound,
/// never on the sample). [`OverflowPolicy::SaturateAndRecord`] passes the
/// admission and saturates with documented events instead.
///
/// # Errors
/// [`TpuError::OverflowRefused`] when the bound is exceeded under `Refuse`.
pub fn ensure_k_bound(
    k: usize,
    worst_case_product: i64,
    policy: OverflowPolicy,
) -> Result<(), TpuError> {
    if worst_case_product <= 0 {
        return Err(TpuError::NonPhysicalInput(format!(
            "worst-case product magnitude {worst_case_product} must be > 0"
        )));
    }
    let k_u64 = k as u64;
    let k_max = (1u64 << 31) / (worst_case_product as u64);
    if policy == OverflowPolicy::Refuse && k_u64 > k_max {
        return Err(TpuError::OverflowRefused { k: k_u64, k_max });
    }
    Ok(())
}

/// TPU array configuration. All fields are declared model parameters; `vdd`
/// is admitted against the `05`-JSON operating envelope.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct TpuConfig {
    /// P×P systolic grid (e.g. 4, 8 — the educational reference grid).
    pub grid_p: usize,
    /// Array clock.
    pub clock: Hertz,
    /// Supply voltage (admitted against `05 → vdd_range_v = [0.7, 0.9]`).
    pub vdd: Volt,
    /// Switching activity factor α (dimensionless, ≥ 0).
    pub activity: f64,
    /// Per-MAC switching capacitance C (declared model parameter).
    pub cap_per_mac: Farad,
    /// Accumulator overflow policy.
    pub overflow_policy: OverflowPolicy,
}

impl TpuConfig {
    /// The educational reference anchor: 8×8 grid, 100 MHz, 0.8 V, α = 0.35,
    /// C = 1.2e-13 F — the exact `accelerators.mjs` default parameter set.
    #[must_use]
    pub fn educational() -> Self {
        Self {
            grid_p: DEFAULT_GRID_P,
            clock: Hertz::from_megahertz(DEFAULT_CLOCK_MHZ),
            vdd: Volt::new(DEFAULT_VDD),
            activity: DEFAULT_ACTIVITY,
            cap_per_mac: Farad::new(CAP_PER_MAC_F),
            overflow_policy: OverflowPolicy::Refuse,
        }
    }
}

/// One documented INT32 accumulator overflow event (post-MAC index).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct OverflowEvent {
    pub i: usize,
    pub j: usize,
    pub k: usize,
}

/// Per-output-tile MAC telemetry — the 3D SoC heatmap feed (solver-frame
/// `soc.tileActivity` consumers, WP-4.4/WP-4.5).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct TileTelemetry {
    /// Tile row index in the `ceil(M/P) × ceil(N/P)` output tile grid.
    pub tile_row: usize,
    /// Tile column index.
    pub tile_col: usize,
    /// MAC events executed by this tile over its wave-front (`rows·cols·K`).
    pub macs: u64,
    /// Average MAC activity fraction: `macs / (P²·(K + 2P − 2))` — the
    /// per-tile form of the §3 utilization equation (wave-front fill/drain).
    pub mac_activity: f64,
    /// Time-averaged switching power `peak · mac_activity` (W).
    pub avg_switching_power_w: Watt,
    /// Peak switching power with every MAC cell switching (W): `α·C·V²·f·P²`.
    pub peak_switching_power_w: Watt,
}

/// INT8/QDQ GEMM result — bit-exact oracle fields + telemetry.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SystolicResult {
    /// Exact INT32 accumulated output (row-major M×N).
    pub c_i32: Vec<i32>,
    /// Dequantized output `c_i32[i,j] · sA[i] · sB[j]` (unity scales ⇒ identity).
    pub c_dequant: Vec<f64>,
    /// Quantized activations actually fed to the array (row-major M×K).
    pub q_a: Vec<i32>,
    /// Quantized weights actually fed to the array (row-major K×N).
    pub q_b: Vec<i32>,
    /// Output tile count `ceil(M/P)·ceil(N/P)`.
    pub tiles: u64,
    /// §3 wave-front cycles `tiles·(K + 2P − 2)`.
    pub cycles: u64,
    /// §3 utilization `(M·N·K) / (tiles·(K + 2P − 2)·P²)`.
    pub utilization: f64,
    /// Total MAC events `M·N·K`.
    pub mac_ops: u64,
    /// Array dynamic power `α·C·V²·f·P²` (W) — also the peak per-tile power.
    pub dynamic_power_w: Watt,
    /// Peak per-tile switching power (W) — identical to [`SystolicResult::dynamic_power_w`].
    pub peak_tile_power_w: Watt,
    /// Documented accumulator overflow events (empty under the exact bound).
    pub tile_overflow: Vec<OverflowEvent>,
    /// Per-tile telemetry (heatmap-ready).
    pub tiles_telemetry: Vec<TileTelemetry>,
}

/// Q4 dequantization table — loaded from the SHA-256-verified
/// `03_multiradix_logic_baselines.json` payload (never hardcoded guesses).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Q4DequantTable {
    /// The four Q4 LDO voltage levels in volts, ascending, `levels[0] == 0.0`.
    pub levels_v: [f64; 4],
}

impl Q4DequantTable {
    /// Parse + validate the table from the verified 03-JSON bytes.
    ///
    /// # Errors
    /// [`TpuError::NonPhysicalInput`] when the payload's
    /// `parameters.quaternary_q4_1p8v_ldo.voltage_levels_v` is missing, not
    /// four finite ascending values, or does not start at 0 V (fail-closed:
    /// a tampered vault must never silently dequantize).
    pub fn from_multiradix_json(json: &str) -> Result<Self, TpuError> {
        #[derive(Deserialize)]
        struct Ldo {
            #[serde(rename = "voltage_levels_v")]
            voltage_levels_v: Vec<f64>,
        }
        #[derive(Deserialize)]
        struct Parameters {
            #[serde(rename = "quaternary_q4_1p8v_ldo")]
            quaternary_q4_1p8v_ldo: Ldo,
        }
        #[derive(Deserialize)]
        struct File03 {
            parameters: Parameters,
        }
        let file: File03 = serde_json::from_str(json)
            .map_err(|e| TpuError::NonPhysicalInput(format!("03 multiradix JSON parse: {e}")))?;
        let raw = file.parameters.quaternary_q4_1p8v_ldo.voltage_levels_v;
        if raw.len() != 4 {
            return Err(TpuError::NonPhysicalInput(format!(
                "Q4 LDO voltage_levels_v must hold exactly 4 levels, got {}",
                raw.len()
            )));
        }
        let mut levels = [0.0f64; 4];
        levels.copy_from_slice(&raw);
        if levels.iter().any(|v| !v.is_finite() || *v < 0.0) {
            return Err(TpuError::NonPhysicalInput(
                "Q4 levels must be finite ≥ 0 V".into(),
            ));
        }
        if levels[0] != 0.0 {
            return Err(TpuError::NonPhysicalInput(format!(
                "Q4 LDO ground level must be 0 V, got {}",
                levels[0]
            )));
        }
        for w in levels.windows(2) {
            if w[1] <= w[0] {
                return Err(TpuError::NonPhysicalInput(
                    "Q4 levels must be strictly ascending".into(),
                ));
            }
        }
        Ok(Self { levels_v: levels })
    }

    /// Nearest-partition digit transfer (`q4_thresh_det` semantics): clamp the
    /// value to the Q4 wire domain [0, 3] and pick the closest partition digit.
    #[must_use]
    pub fn nearest_digit(&self, value: f64) -> u8 {
        let v = value.clamp(0.0, 3.0);
        let d = (v - 0.0).round(); // partition points are the integers 0..3
        d.clamp(0.0, 3.0) as u8
    }

    /// Voltage of a digit.
    #[must_use]
    pub fn voltage_of(&self, digit: u8) -> f64 {
        self.levels_v[digit.min(Q4_MAX_DIGIT) as usize]
    }
}

/// Packed Q4 digits: two 4-bit digits per byte (2 digits/byte, low nibble =
/// even flat index). Construction is fail-closed on digits > 3.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Q4Packed {
    /// Logical digit count (bytes hold 2 digits; the last byte is half-used
    /// for odd lengths).
    pub len: usize,
    /// Packed nibbles, low nibble first.
    pub bytes: Vec<u8>,
}

/// Pack Q4 digits (each 0..=3), two per byte, low nibble first.
///
/// # Errors
/// [`TpuError::Q4DigitOutOfRange`] for any digit > 3;
/// [`TpuError::Dimensions`] for an empty operand.
pub fn pack_q4(digits: &[u8]) -> Result<Q4Packed, TpuError> {
    if digits.is_empty() {
        return Err(TpuError::Dimensions("Q4 operand must be non-empty".into()));
    }
    for (index, &d) in digits.iter().enumerate() {
        if d > Q4_MAX_DIGIT {
            return Err(TpuError::Q4DigitOutOfRange { index, value: d });
        }
    }
    let mut bytes = vec![0u8; digits.len().div_ceil(Q4_DIGITS_PER_BYTE)];
    for (index, &d) in digits.iter().enumerate() {
        if index % 2 == 0 {
            bytes[index / 2] |= d; // low nibble
        } else {
            bytes[index / 2] |= d << 4; // high nibble
        }
    }
    Ok(Q4Packed {
        len: digits.len(),
        bytes,
    })
}

/// Unpack into the logical digit slice (validates the packed payload).
///
/// # Errors
/// [`TpuError::Dimensions`] on length mismatch; [`TpuError::Q4DigitOutOfRange`]
/// when a nibble exceeds 3.
pub fn unpack_q4(packed: &Q4Packed) -> Result<Vec<u8>, TpuError> {
    let expect = packed.len.div_ceil(Q4_DIGITS_PER_BYTE);
    if packed.bytes.len() != expect {
        return Err(TpuError::Dimensions(format!(
            "Q4 packed length mismatch: {} bytes for {} digits (expected {expect})",
            packed.bytes.len(),
            packed.len
        )));
    }
    let mut digits = Vec::with_capacity(packed.len);
    for index in 0..packed.len {
        let byte = packed.bytes[index / 2];
        let d = if index % 2 == 0 {
            byte & 0x0f
        } else {
            byte >> 4
        };
        if d > Q4_MAX_DIGIT {
            return Err(TpuError::Q4DigitOutOfRange { index, value: d });
        }
        digits.push(d);
    }
    Ok(digits)
}

/// Q4 digit-domain GEMM result (EXPERIMENTAL multi-radix mode).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Q4Result {
    /// Exact INT32 digit-domain accumulation (row-major M×N).
    pub c_i32: Vec<i32>,
    /// Dequant-pass output digit (nearest-partition transfer onto 0..3).
    pub c_digit: Vec<u8>,
    /// Dequant-pass output voltage (V) of [`Q4Result::c_digit`].
    pub c_voltage_v: Vec<f64>,
    /// §3 wave-front compute cycles `tiles·(K + 2P − 2)`.
    pub compute_cycles: u64,
    /// Declared dequant-pass overhead `tiles·P` (ESM q4 contract).
    pub dequant_cycles: u64,
    /// `compute_cycles + dequant_cycles`.
    pub total_cycles: u64,
    /// Output tile count.
    pub tiles: u64,
    /// §3 utilization over the compute wave-front.
    pub utilization: f64,
    /// Total MAC events `M·N·K`.
    pub mac_ops: u64,
    /// Array dynamic power `α·C·V²·f·P²` (W).
    pub dynamic_power_w: Watt,
    /// Documented overflow events (empty under the Q4 accumulator bound).
    pub tile_overflow: Vec<OverflowEvent>,
    /// Per-tile telemetry (heatmap-ready).
    pub tiles_telemetry: Vec<TileTelemetry>,
}

/// The weight-stationary systolic TPU (WP-4.3).
#[derive(Debug, Clone, Copy)]
pub struct SystolicTpu {
    config: TpuConfig,
}

impl SystolicTpu {
    /// Build an admitted array: fail-closed on non-physical parameters and on
    /// voltages outside the `05`-JSON `systolic_tpu` envelope.
    ///
    /// # Errors
    /// [`TpuError::Dimensions`] for an empty grid; [`TpuError::NonPhysicalInput`]
    /// for negative/non-finite α, C, V or f; [`TpuError::EnvelopeViolated`]
    /// when `vdd` ∉ [0.7, 0.9] V.
    pub fn new(config: TpuConfig) -> Result<Self, TpuError> {
        if config.grid_p == 0 {
            return Err(TpuError::Dimensions("grid P must be ≥ 1".into()));
        }
        for (name, v) in [
            ("activity α", config.activity),
            ("capacitance C", config.cap_per_mac.value()),
            ("voltage V", config.vdd.value()),
            ("clock f", config.clock.value()),
        ] {
            if !v.is_finite() || v < 0.0 {
                return Err(TpuError::NonPhysicalInput(format!("{name} = {v}")));
            }
        }
        if config.clock.value() <= 0.0 {
            return Err(TpuError::NonPhysicalInput(format!(
                "clock f = {} must be > 0",
                config.clock.value()
            )));
        }
        let vdd = config.vdd.value();
        if !(VDD_MIN..=VDD_MAX).contains(&vdd) {
            return Err(TpuError::EnvelopeViolated(format!(
                "vdd = {vdd} V outside the 05-JSON systolic_tpu envelope [{VDD_MIN}, {VDD_MAX}] V"
            )));
        }
        Ok(Self { config })
    }

    /// The educational 8×8 reference array (exact `accelerators.mjs` defaults).
    ///
    /// # Errors
    /// Same as [`SystolicTpu::new`].
    pub fn educational() -> Result<Self, TpuError> {
        Self::new(TpuConfig::educational())
    }

    /// Declared provenance of every emitted number.
    #[must_use]
    pub const fn provenance() -> ProvenanceBadge {
        ProvenanceBadge::SimulatedArchitecturalModel
    }

    /// Array configuration.
    #[must_use]
    pub const fn config(&self) -> &TpuConfig {
        &self.config
    }

    /// `P_dyn = α·C·V²·f·P²` — the array/peak-tile dynamic power (W), in the
    /// exact ESM-oracle multiplication order for bit-exact parity.
    ///
    /// # Errors
    /// [`TpuError::NonPhysicalInput`] (fail-closed; already admitted at
    /// construction, so this is unreachable in practice).
    pub fn dynamic_power(&self) -> Result<Watt, TpuError> {
        let base = DynamicPowerModel::dynamic_power(
            self.config.activity,
            self.config.cap_per_mac,
            self.config.vdd,
            self.config.clock,
        )
        .map_err(|e| TpuError::NonPhysicalInput(e.to_string()))?;
        let p = self.config.grid_p as f64;
        // Left-to-right `…·f · P · P` — bit-exact with
        // `alpha * capPerMacFf * vdd * vdd * (clockMHz * 1e6) * P * P`.
        Ok(Watt::new(base.value() * p * p))
    }

    /// Exact wave-front cycle model + utilization for an `M×K · K×N` GEMM
    /// (pure equations, no operand validation — the math surface WP-4.4/WP-4.6
    /// can query without materializing matrices).
    ///
    /// Cycles: `ceil(M/P)·ceil(N/P)·(K + 2P − 2)`;
    /// utilization: `(M·N·K) / (tiles·(K + 2P − 2)·P²)`.
    ///
    /// # Errors
    /// [`TpuError::Dimensions`] for zero dimensions or grid.
    pub fn cycle_model(&self, m: usize, k: usize, n: usize) -> Result<(u64, u64, f64), TpuError> {
        if m == 0 || k == 0 || n == 0 {
            return Err(TpuError::Dimensions(format!(
                "GEMM dimensions must be ≥ 1, got M={m}, K={k}, N={n}"
            )));
        }
        let p = self.config.grid_p;
        let tiles = (m.div_ceil(p) as u64) * (n.div_ceil(p) as u64);
        let cycles = tiles * (k as u64 + 2 * p as u64 - 2);
        let macs = (m as u64) * (n as u64) * (k as u64);
        let utilization =
            macs as f64 / (tiles * (k as u64 + 2 * p as u64 - 2) * (p as u64) * (p as u64)) as f64;
        Ok((tiles, cycles, utilization))
    }

    /// Weight-stationary INT8 / per-axis-QDQ GEMM: quantize (clamp ±127, JS
    /// `Math.round` semantics) → exact INT32 accumulate (saturating + events
    /// per the policy) → dequantize. `a` is M×K row-major, `b` is K×N
    /// row-major; `scales` follow the QLinearMatMul per-axis layout (unity =
    /// the exact `accelerators.mjs` oracle path).
    ///
    /// # Errors
    /// [`TpuError::Dimensions`] for zero dimensions, flat-length mismatches or
    /// a `B` whose row count ≠ K; [`TpuError::NonPhysicalInput`] for
    /// non-finite operands or non-positive/non-finite scales;
    /// [`TpuError::OverflowRefused`] when the policy refuses a `K` beyond the
    /// accumulator bound.
    pub fn matmul_int8(
        &self,
        a: &[f64],
        m: usize,
        k: usize,
        b: &[f64],
        n: usize,
        scales: &QdqScales,
    ) -> Result<SystolicResult, TpuError> {
        if m == 0 || k == 0 || n == 0 {
            return Err(TpuError::Dimensions(format!(
                "GEMM dimensions must be ≥ 1, got M={m}, K={k}, N={n}"
            )));
        }
        if a.len() != m * k {
            return Err(TpuError::Dimensions(format!(
                "A flat length {} != M·K = {}",
                a.len(),
                m * k
            )));
        }
        if b.len() != k * n {
            return Err(TpuError::Dimensions(format!(
                "B flat length {} != K·N = {} (B must be K×N)",
                b.len(),
                k * n
            )));
        }
        for (index, v) in a.iter().chain(b.iter()).enumerate() {
            if !v.is_finite() {
                return Err(TpuError::NonPhysicalInput(format!(
                    "operand[{index}] = {v} is not finite"
                )));
            }
        }
        let scale_a = validated_scale(&scales.a_per_row, m, "sA")?;
        let scale_b = validated_scale(&scales.b_per_col, n, "sB")?;

        // Overflow admission (fail-closed): worst-case |acc| = K·255·255.
        ensure_k_bound(k, INT8_PRODUCT_MAX, self.config.overflow_policy)?;

        // QDQ quantize (exact oracle semantics: JS Math.round + clamp ±127).
        let q_a = quantize_axis(a, m, k, &scale_a, ScaleAxis::Rows);
        let q_b = quantize_axis(b, k, n, &scale_b, ScaleAxis::Cols);

        // Exact INT32 accumulation with the oracle's saturation contract.
        let mut c_i32 = vec![0i32; m * n];
        let mut c_dequant = vec![0f64; m * n];
        let mut tile_overflow = Vec::new();
        let saturating = self.config.overflow_policy == OverflowPolicy::SaturateAndRecord;
        for i in 0..m {
            for j in 0..n {
                let mut acc: i64 = 0;
                for kk in 0..k {
                    acc += (q_a[i * k + kk] as i64) * (q_b[kk * n + j] as i64);
                    if !(I32_MIN..=I32_MAX).contains(&acc) {
                        tile_overflow.push(OverflowEvent { i, j, k: kk });
                        if !saturating {
                            return Err(TpuError::OverflowRefused {
                                k: k as u64,
                                k_max: K_MAX_INT32_ACC,
                            });
                        }
                        acc = acc.clamp(I32_MIN, I32_MAX);
                    }
                }
                c_i32[i * n + j] = acc as i32;
                // Dequantize: one exact multiply per axis (QLinearMatMul layout).
                c_dequant[i * n + j] = (acc as f64) * scale_a.at(i) * scale_b.at(j);
            }
        }

        let mac_ops = (m as u64) * (n as u64) * (k as u64);
        let (tiles, cycles, utilization) = self.cycle_model(m, k, n)?;
        let dynamic = self.dynamic_power()?;
        let tiles_telemetry = self.tiles_telemetry(m, k, n)?;

        Ok(SystolicResult {
            c_i32,
            c_dequant,
            q_a,
            q_b,
            tiles,
            cycles,
            utilization,
            mac_ops,
            dynamic_power_w: dynamic,
            peak_tile_power_w: dynamic,
            tile_overflow,
            tiles_telemetry,
        })
    }

    /// EXPERIMENTAL Q4 multi-radix systolic mode: radix-4 digit operands
    /// (0..=3, packed 2/byte), exact INT32 digit-domain accumulation, then the
    /// dequant pass (nearest-partition digit transfer onto the verified Q4 LDO
    /// levels, declared overhead `tiles·P` cycles).
    ///
    /// # Errors
    /// Dimension/non-physical/fail-closed-overflow errors as for
    /// [`SystolicTpu::matmul_int8`], plus [`TpuError::Q4DigitOutOfRange`] for
    /// malformed packed operands.
    pub fn matmul_q4_packed(
        &self,
        a: &Q4Packed,
        m: usize,
        k: usize,
        b: &Q4Packed,
        n: usize,
        dequant: &Q4DequantTable,
    ) -> Result<Q4Result, TpuError> {
        if m == 0 || k == 0 || n == 0 {
            return Err(TpuError::Dimensions(format!(
                "GEMM dimensions must be ≥ 1, got M={m}, K={k}, N={n}"
            )));
        }
        if a.len != m * k {
            return Err(TpuError::Dimensions(format!(
                "A digits {} != M·K = {}",
                a.len,
                m * k
            )));
        }
        if b.len != k * n {
            return Err(TpuError::Dimensions(format!(
                "B digits {} != K·N = {}",
                b.len,
                k * n
            )));
        }
        // Overflow admission before any unpacking work (fail-closed on the
        // digit-domain bound: worst-case |acc| = K·9).
        ensure_k_bound(k, Q4_PRODUCT_MAX, self.config.overflow_policy)?;
        let a_digits = unpack_q4(a)?;
        let b_digits = unpack_q4(b)?;

        let mut c_i32 = vec![0i32; m * n];
        let mut c_digit = vec![0u8; m * n];
        let mut c_voltage = vec![0f64; m * n];
        let mut tile_overflow = Vec::new();
        let saturating = self.config.overflow_policy == OverflowPolicy::SaturateAndRecord;
        for i in 0..m {
            for j in 0..n {
                let mut acc: i64 = 0;
                for kk in 0..k {
                    acc += (a_digits[i * k + kk] as i64) * (b_digits[kk * n + j] as i64);
                    if !(I32_MIN..=I32_MAX).contains(&acc) {
                        tile_overflow.push(OverflowEvent { i, j, k: kk });
                        if !saturating {
                            return Err(TpuError::OverflowRefused {
                                k: k as u64,
                                k_max: K_MAX_Q4_ACC,
                            });
                        }
                        acc = acc.clamp(I32_MIN, I32_MAX);
                    }
                }
                let digit = dequant.nearest_digit(acc as f64);
                c_i32[i * n + j] = acc as i32;
                c_digit[i * n + j] = digit;
                c_voltage[i * n + j] = dequant.voltage_of(digit);
            }
        }

        let mac_ops = (m as u64) * (n as u64) * (k as u64);
        let (tiles, compute_cycles, utilization) = self.cycle_model(m, k, n)?;
        let dequant_cycles = tiles * self.config.grid_p as u64;
        let dynamic = self.dynamic_power()?;
        let tiles_telemetry = self.tiles_telemetry(m, k, n)?;
        Ok(Q4Result {
            c_i32,
            c_digit,
            c_voltage_v: c_voltage,
            compute_cycles,
            dequant_cycles,
            total_cycles: compute_cycles + dequant_cycles,
            tiles,
            utilization,
            mac_ops,
            dynamic_power_w: dynamic,
            tile_overflow,
            tiles_telemetry,
        })
    }

    /// Convenience digit-slice entry for [`SystolicTpu::matmul_q4_packed`].
    ///
    /// # Errors
    /// Packed-operand errors as above.
    pub fn matmul_q4(
        &self,
        a_digits: &[u8],
        m: usize,
        k: usize,
        b_digits: &[u8],
        n: usize,
        dequant: &Q4DequantTable,
    ) -> Result<Q4Result, TpuError> {
        let a = pack_q4(a_digits)?;
        let b = pack_q4(b_digits)?;
        self.matmul_q4_packed(&a, m, k, &b, n, dequant)
    }

    /// Per-tile telemetry for the 3D SoC heatmap (heatmap-ready form of the
    /// §3 utilization equation per tile).
    ///
    /// # Errors
    /// [`TpuError::Dimensions`] for zero dimensions (see [`SystolicTpu::cycle_model`]).
    pub fn tiles_telemetry(
        &self,
        m: usize,
        k: usize,
        n: usize,
    ) -> Result<Vec<TileTelemetry>, TpuError> {
        let p = self.config.grid_p;
        let peak = self.dynamic_power()?;
        let mut out = Vec::with_capacity(m.div_ceil(p) * n.div_ceil(p));
        for ti in 0..m.div_ceil(p) {
            for tj in 0..n.div_ceil(p) {
                let rows = p.min(m - ti * p);
                let cols = p.min(n - tj * p);
                let macs = (rows as u64) * (cols as u64) * (k as u64);
                let activity =
                    macs as f64 / ((p as u64) * (p as u64) * (k as u64 + 2 * p as u64 - 2)) as f64;
                out.push(TileTelemetry {
                    tile_row: ti,
                    tile_col: tj,
                    macs,
                    mac_activity: activity,
                    avg_switching_power_w: Watt::new(peak.value() * activity),
                    peak_switching_power_w: peak,
                });
            }
        }
        Ok(out)
    }
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

enum ScaleAxis {
    Rows,
    Cols,
}

/// Normalized scale spec: borrowed per-axis table, scalar, or unity.
#[derive(Debug, Clone, Copy)]
enum ScaleSpec<'s> {
    Unity,
    Scalar(f64),
    PerAxis(&'s [f64]),
}

impl ScaleSpec<'_> {
    fn at(&self, idx: usize) -> f64 {
        match *self {
            Self::Unity => 1.0,
            Self::Scalar(s) => s,
            Self::PerAxis(table) => table[idx],
        }
    }
}

fn validated_scale<'s>(
    scales: &'s [f64],
    dim: usize,
    name: &str,
) -> Result<ScaleSpec<'s>, TpuError> {
    match scales.len() {
        0 => Ok(ScaleSpec::Unity),
        1 => {
            let s = scales[0];
            check_scale(s, name)?;
            Ok(ScaleSpec::Scalar(s))
        }
        len if len == dim => {
            for (index, s) in scales.iter().enumerate() {
                check_scale(*s, &format!("{name}[{index}]"))?;
            }
            Ok(ScaleSpec::PerAxis(scales))
        }
        len => Err(TpuError::Dimensions(format!(
            "{name} axis length {len} must be 0 (per-tensor), 1 (per-tensor value) or {dim} (per-axis)"
        ))),
    }
}

fn check_scale(s: f64, name: &str) -> Result<(), TpuError> {
    if !s.is_finite() || s <= 0.0 {
        return Err(TpuError::NonPhysicalInput(format!(
            "{name} = {s} must be finite > 0 (symmetric quantization scale)"
        )));
    }
    Ok(())
}

/// QDQ quantize: `clamp(round(v / s), ±127)` with JS rounding, per axis.
fn quantize_axis(
    data: &[f64],
    outer: usize,
    inner: usize,
    scale: &ScaleSpec<'_>,
    axis: ScaleAxis,
) -> Vec<i32> {
    let mut q = Vec::with_capacity(data.len());
    match axis {
        // A[M×K]: the scale axis is the outer (M-row) index.
        ScaleAxis::Rows => {
            for i in 0..outer {
                let s = scale.at(i);
                for v in &data[i * inner..(i + 1) * inner] {
                    q.push(clamp8(*v / s));
                }
            }
        }
        // B[K×N]: the scale axis is the inner (N-column) index.
        ScaleAxis::Cols => {
            for row in data.chunks(inner) {
                for (j, v) in row.iter().enumerate() {
                    q.push(clamp8(*v / scale.at(j)));
                }
            }
        }
    }
    q
}

/// JS `Math.round` semantics (round half toward +∞) — required for bit-exact
/// quantization parity with the ESM oracle (Rust `f64::round` rounds half
/// away from zero, which differs on the −0.5 boundary).
fn js_round(v: f64) -> f64 {
    (v + 0.5).floor()
}

/// The oracle's `clamp8`: JS `Math.round` then clamp to ±127.
fn clamp8(v: f64) -> i32 {
    let r = js_round(v);
    if r < f64::from(INT8_MIN) {
        INT8_MIN
    } else if r > f64::from(INT8_MAX) {
        INT8_MAX
    } else {
        r as i32
    }
}
