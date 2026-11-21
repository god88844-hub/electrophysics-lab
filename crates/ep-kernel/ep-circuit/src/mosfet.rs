//! Symmetric drain/source Shichman–Hodges MOSFET (parity with
//! `packages/physics-engine/src/mna.mjs` → `mosfetOperatingPoint`).
//!
//! When the assigned drain/source terminals reverse, the roles swap so the
//! model is continuous everywhere — no Newton oscillation at the reverse
//! boundary. Current `i > 0` ENTERS the device at the terminal named by
//! `in_is_drain` and exits at the other terminal (NMOS conducts
//! drain→source; PMOS conducts source→drain; reversed operation swaps).

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MosfetType {
    N,
    P,
}

#[derive(Debug, Clone)]
pub struct MosfetParams {
    pub mosfet_type: MosfetType,
    /// Signed threshold: + for N, − for P (per SKY130A 02 JSON).
    pub vth: f64,
    /// KP = µ·Cox·W/L in A/V².
    pub kp: f64,
    /// Channel-length modulation, 1/V.
    pub lambda: f64,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct OperatingPoint {
    pub i: f64,
    pub in_is_drain: bool,
}

/// Square-law core on the effective terminals (vdE, vsE).
fn core(q: &MosfetParams, vg_e: f64, vd_e: f64, vs_e: f64) -> f64 {
    let vth_abs = if q.mosfet_type == MosfetType::N {
        q.vth
    } else {
        -q.vth
    };
    let drive = if q.mosfet_type == MosfetType::N {
        vg_e - vs_e - vth_abs
    } else {
        vs_e - vg_e - vth_abs
    };
    let vds = if q.mosfet_type == MosfetType::N {
        vd_e - vs_e
    } else {
        vs_e - vd_e
    };
    if drive <= 0.0 {
        return 0.0;
    }
    if vds >= drive {
        0.5 * q.kp * drive * drive * (1.0 + q.lambda * vds)
    } else {
        q.kp * (drive * vds - 0.5 * vds * vds) * (1.0 + q.lambda * vds)
    }
}

pub fn operating_point(q: &MosfetParams, vg: f64, vd: f64, vs: f64) -> OperatingPoint {
    match q.mosfet_type {
        MosfetType::N => {
            if vd >= vs {
                OperatingPoint {
                    i: core(q, vg, vd, vs),
                    in_is_drain: true,
                }
            } else {
                OperatingPoint {
                    i: core(q, vg, vs, vd),
                    in_is_drain: false,
                }
            }
        }
        MosfetType::P => {
            if vs >= vd {
                OperatingPoint {
                    i: core(q, vg, vd, vs),
                    in_is_drain: false,
                }
            } else {
                OperatingPoint {
                    i: core(q, vg, vs, vd),
                    in_is_drain: true,
                }
            }
        }
    }
}

/// Legacy single-number API: current entering the in-terminal.
pub fn mosfet_current(q: &MosfetParams, vg: f64, vd: f64, vs: f64) -> f64 {
    operating_point(q, vg, vd, vs).i
}
