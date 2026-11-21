//! Dynamic power accounting — `P_dyn = α·C·V²·f`
//! (`03_PHYSICS_MATH_FUNDAMENTALS.md` §3, first bullet).
//!
//! This is a declared architectural model, tagged
//! `SIMULATED_ARCHITECTURAL_MODEL` by construction: the per-instruction-class
//! switching capacitances below are model parameters of textbook order, NOT
//! silicon measurements, and §3 requires (and the tests assert) only the
//! physical scaling laws `P ∝ f` and `P ∝ V²` — the same laws the Phase 0
//! chip-engine tests verify for its α·C·V²·f MAC power.
//!
//! The anchor for the whole-core envelope is the offline reference vault
//! (`data/reference-library/05_chip_architecture_benchmarks.json`,
//! `riscv_rv32im`): typical 130 nm educational core at 100 MHz dissipating
//! ~15 mW — the model's output must stay in that envelope's order of
//! magnitude for the declared default parameters, which the tests assert as
//! a bounded sanity range (Law 5: no invented precision beyond the model).

use ep_core::{ProvenanceBadge, Volt, Watt};
use serde::{Deserialize, Serialize};

/// Capacitance unit (Farad) — newtype in the `ep-core` SI-unit style.
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize, Default)]
pub struct Farad(pub f64);

impl Farad {
    /// SI symbol.
    pub const SYMBOL: &'static str = "F";
    /// Wrap a value.
    #[must_use]
    pub const fn new(v: f64) -> Self {
        Self(v)
    }
    /// Underlying value.
    #[must_use]
    pub const fn value(&self) -> f64 {
        self.0
    }
}

impl std::fmt::Display for Farad {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:.6e} {}", self.0, Self::SYMBOL)
    }
}

/// Frequency unit (Hertz) — newtype in the `ep-core` SI-unit style.
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize, Default)]
pub struct Hertz(pub f64);

impl Hertz {
    /// SI symbol.
    pub const SYMBOL: &'static str = "Hz";
    /// Wrap a value.
    #[must_use]
    pub const fn new(v: f64) -> Self {
        Self(v)
    }
    /// Underlying value.
    #[must_use]
    pub const fn value(&self) -> f64 {
        self.0
    }
    /// Megahertz convenience constructor.
    #[must_use]
    pub fn from_megahertz(mhz: f64) -> Self {
        Self(mhz * 1e6)
    }
}

impl std::fmt::Display for Hertz {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:.6e} {}", self.0, Self::SYMBOL)
    }
}

/// Power-model parameter errors — fail-closed on non-physical inputs.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PowerError {
    /// A negative or non-finite α, C, V or f was supplied.
    NonPhysicalInput(String),
}

impl std::fmt::Display for PowerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NonPhysicalInput(what) => {
                write!(f, "non-physical dynamic-power input: {what}")
            }
        }
    }
}

impl std::error::Error for PowerError {}

/// Instruction classes of the RV32IM twin's declared cycle model.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct InstructionMix {
    /// ALU / OP-IMM / LUI / JAL / JALR / untaken branches (1 CPI class).
    pub alu: u64,
    /// Loads and stores (2-cycle class).
    pub memory: u64,
    /// Taken branches (+1 flush cycle class).
    pub branch_taken: u64,
    /// M-extension multiply/divide.
    pub mul_div: u64,
}

impl InstructionMix {
    /// Declared per-class effective switching capacitance (femtofarads).
    ///
    /// MODEL PARAMETERS — declared, not measured. This model covers ONLY the
    /// arithmetic datapath's per-instruction switching events; clock tree,
    /// leakage, memory arrays and I/O power are out of scope, so the whole-
    /// core envelope below is an upper bound for the model's output, not a
    /// reproduction target. The verified physics is the scaling (∝V², ∝f).
    pub const CAP_ALU_FF: f64 = 12.0;
    /// Load/store class capacitance (fF) — heavier (bit-line + word-line toggling).
    pub const CAP_MEMORY_FF: f64 = 24.0;
    /// Taken-branch class capacitance (fF).
    pub const CAP_BRANCH_FF: f64 = 9.0;
    /// Multiply/divide class capacitance (fF) — 1.5× the ALU class.
    pub const CAP_MUL_DIV_FF: f64 = 18.0;
    /// Declared nominal operating voltage of the anchor point (model
    /// parameter; the offline vault does not cite a voltage for the RV32IM
    /// reference, so the anchor normalization declares this value).
    pub const ANCHOR_VOLT_NOMINAL: f64 = 1.2;

    /// Total switching capacitance of the mix (Farads).
    #[must_use]
    pub fn total_capacitance(&self) -> Farad {
        Farad::new(
            (self.alu as f64 * Self::CAP_ALU_FF
                + self.memory as f64 * Self::CAP_MEMORY_FF
                + self.branch_taken as f64 * Self::CAP_BRANCH_FF
                + self.mul_div as f64 * Self::CAP_MUL_DIV_FF)
                * 1e-15,
        )
    }

    /// Declared default activity factor α (clock-gated average toggle rate).
    pub const DEFAULT_ACTIVITY: f64 = 0.15;

    /// Whole-core envelope anchor cited from the offline vault:
    /// `05_chip_architecture_benchmarks.json → riscv_rv32im →
    /// power_mw_at_100mhz_130nm = 15`. The datapath-only model output must
    /// stay strictly inside this envelope (it excludes clock tree, leakage,
    /// memory arrays and I/O — see the capacitance note above).
    pub const ANCHOR_POWER_MW_AT_100MHZ: f64 = 15.0;
}

/// Dynamic power computer over instruction-class mixes.
#[derive(Debug, Clone, Copy)]
pub struct DynamicPowerModel {
    activity: f64,
}

impl DynamicPowerModel {
    /// Model with the declared default activity factor.
    #[must_use]
    pub const fn new() -> Self {
        Self {
            activity: InstructionMix::DEFAULT_ACTIVITY,
        }
    }

    /// Model with an explicit activity factor.
    #[must_use]
    pub const fn with_activity(activity: f64) -> Self {
        Self { activity }
    }

    /// `P_dyn = α·C·V²·f` for one switching-capacitance load.
    ///
    /// # Errors
    /// [`PowerError::NonPhysicalInput`] for negative or non-finite inputs
    /// (fail-closed; no silent clamping).
    pub fn dynamic_power(
        activity: f64,
        cap: Farad,
        volt: Volt,
        freq: Hertz,
    ) -> Result<Watt, PowerError> {
        for (name, v) in [
            ("activity", activity),
            ("capacitance", cap.value()),
            ("voltage", volt.value()),
            ("frequency", freq.value()),
        ] {
            if !v.is_finite() || v < 0.0 {
                return Err(PowerError::NonPhysicalInput(format!("{name} = {v}")));
            }
        }
        // C·V²·f = (Joule) × (1/s) → Watt; α is dimensionless.
        Ok(Watt::new(
            activity * cap.value() * volt.value() * volt.value() * freq.value(),
        ))
    }

    /// Average dynamic power for a retired-instruction mix at `volt`/`freq`.
    ///
    /// The mix's switching capacitance toggles once per instruction event at
    /// the retired rate `f_retired = freq / CPI` (declared model: events are
    /// spread over the clock at the average cycles-per-instruction).
    ///
    /// # Errors
    /// [`PowerError::NonPhysicalInput`] for non-physical inputs.
    pub fn mix_power(
        &self,
        mix: &InstructionMix,
        volt: Volt,
        freq: Hertz,
    ) -> Result<Watt, PowerError> {
        let cap = mix.total_capacitance();
        Self::dynamic_power(self.activity, cap, volt, freq)
    }

    /// Provenance of every number this model can emit.
    #[must_use]
    pub const fn provenance() -> ProvenanceBadge {
        ProvenanceBadge::SimulatedArchitecturalModel
    }
}

impl Default for DynamicPowerModel {
    fn default() -> Self {
        Self::new()
    }
}
