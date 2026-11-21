//! WP-4.3 parity + acceptance gate: the systolic TPU kernel against the
//! Phase 0 oracle and the sealed offline vault.
//!
//! Gates enforced here (PHASE_04 acceptance: "cargo test -p ep-chip green
//! (bit-exact CPU, exact GEMM, cycle models)"; 03 §5: TPU GEMM oracle =
//! exact INT8 reference math, tolerance **bit-exact**):
//!  1. Vault constants: every module constant is verified against the
//!     SHA-256-sealed `data/reference-library/05` / `03` payloads via
//!     `ep-core` (fail-closed manifest verification) — Law 5.
//!  2. Bit-exact GEMM parity with `packages/chip-engine/src/accelerators.mjs`
//!     :: systolicMatmul (golden fixture captured deterministically by
//!     `tests/data/gen_tpu_parity.mjs`, re-validated live against Node when
//!     Node is available — absent tool ⇒ loud SKIP, never a silent pass).
//!  3. Exact §3 wave-front cycle + utilization equations for P×P grids.
//!  4. Power scaling laws `P ∝ f`, `P ∝ V²` (exact) + the 05-JSON operating
//!     envelope admission.
//!  5. Fail-closed guards: dimensions, non-physical inputs, accumulator bound
//!     `K_max = 2³¹/(255·255)` (Refuse) and documented saturation (events).
//!  6. Q4 multi-radix mode: 2-digits/byte packing, digit-domain exact
//!     accumulation, verified dequant table, `tiles·P` dequant cycles.
//!  7. Per-tile MAC activity & switching power telemetry (64-tile heatmap).

use ep_chip::power::{DynamicPowerModel, Farad, Hertz};
use ep_chip::tpu::{
    ensure_k_bound, pack_q4, unpack_q4, OverflowEvent, OverflowPolicy, Q4DequantTable, QdqScales,
    SystolicTpu, TpuConfig, TpuError, K_MAX_INT32_ACC, K_MAX_Q4_ACC, VDD_MAX, VDD_MIN,
};
use ep_core::reference::verify_library_dir;
use ep_core::Volt;
use serde_json::Value;

fn repo_root() -> std::path::PathBuf {
    // crates/ep-kernel/ep-chip → repo root is three levels up.
    std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(3)
        .expect("repo root")
        .to_path_buf()
}

fn fixture() -> Value {
    serde_json::from_str(include_str!("data/tpu_parity_vectors.json")).expect("fixture parses")
}

fn matrix(v: &Value) -> (Vec<f64>, usize, usize) {
    let rows = v.as_array().expect("rows");
    let m = rows.len();
    let k = rows[0].as_array().expect("cols").len();
    let flat: Vec<f64> = rows
        .iter()
        .flat_map(|r| r.as_array().expect("cols").iter())
        .map(|x| x.as_f64().expect("f64"))
        .collect();
    (flat, m, k)
}

fn config_from(vector: &Value, policy: OverflowPolicy) -> TpuConfig {
    let opts = &vector["opts"];
    TpuConfig {
        grid_p: opts["gridSize"].as_u64().expect("gridSize") as usize,
        clock: Hertz::new(opts["clockMHz"].as_f64().expect("clockMHz") * 1e6),
        vdd: Volt::new(opts["vdd"].as_f64().expect("vdd")),
        activity: opts["activityFactor"].as_f64().expect("activityFactor"),
        cap_per_mac: Farad::new(opts["capPerMacFf"].as_f64().expect("capPerMacFf")),
        overflow_policy: policy,
    }
}

// ---------------------------------------------------------------------------
// 1. Vault constants (Law 5 — verified, never invented)
// ---------------------------------------------------------------------------

#[test]
fn vault_verifies_and_anchors_every_tpu_constant() {
    // SHA-256 fail-closed verification of the whole sealed vault.
    let n = verify_library_dir(&repo_root().join("data").join("reference-library"))
        .expect("reference library must verify byte-exactly");
    assert_eq!(n, 8, "all eight reference files verify");

    let raw05 = std::fs::read_to_string(
        repo_root().join("data/reference-library/05_chip_architecture_benchmarks.json"),
    )
    .unwrap();
    let j05: Value = serde_json::from_str(&raw05).unwrap();

    let tpu = &j05["parameters"]["systolic_array_tpu"];
    assert_eq!(tpu["dataflow"], "weight-stationary", "05 JSON dataflow");
    assert_eq!(tpu["arithmetic"], "INT8 multiply + INT32 accumulate");
    assert!(
        tpu["quantization"]
            .as_str()
            .unwrap()
            .contains("per-axis symmetric INT8"),
        "per-axis QDQ quantization contract"
    );
    assert_eq!(tpu["grid_size"]["educational"], 8, "educational grid");
    assert_eq!(tpu["clock_mhz"]["educational"], 100.0);
    assert_eq!(
        tpu["mac_per_cycle"]["educational_8x8"], 64,
        "8×8 grid = 64 MACs/tile"
    );

    // The exact §3 equations, verbatim from the vault's `equations` block.
    let equations: Vec<&str> = j05["equations"]
        .as_array()
        .unwrap()
        .iter()
        .map(|e| e.as_str().unwrap())
        .collect();
    assert!(
        equations[0].contains("cycles = ceil(M/P) · ceil(N/P) · (K + 2P − 2)"),
        "cycles equation verbatim: {}",
        equations[0]
    );
    assert!(
        equations[1].contains("U = (M·N·K) / (tiles · (K + 2P − 2) · P²)"),
        "utilization equation verbatim: {}",
        equations[1]
    );

    // INT32 accumulator safety: the normative formula evaluated exactly.
    assert_eq!(255u64 * 255u64, 65025);
    assert_eq!(
        K_MAX_INT32_ACC,
        (1u64 << 31) / (255u64 * 255u64),
        "K_max = 2^31 / (255·255), exact integer math"
    );
    assert_eq!(K_MAX_INT32_ACC, 33025, "exact formula value");
    // The sealed prose approximates the same formula ("≈ 33038" — which
    // corresponds to dividing 2^31 by 65000, not 65025). The formula is
    // normative; this assertion documents the source approximation honestly.
    let envelope_note = j05["valid_operating_envelope"]["systolic_tpu"]["note"]
        .as_str()
        .unwrap();
    assert!(
        envelope_note.contains("33038"),
        "05-JSON prose note about the accumulator bound: {envelope_note}"
    );
    assert!(
        envelope_note.contains("2^31 / (255 × 255)"),
        "05-JSON prose states the normative formula: {envelope_note}"
    );

    // Operating envelope.
    let vdd_range = j05["valid_operating_envelope"]["systolic_tpu"]["vdd_range_v"]
        .as_array()
        .unwrap();
    assert_eq!(vdd_range[0].as_f64().unwrap(), VDD_MIN);
    assert_eq!(vdd_range[1].as_f64().unwrap(), VDD_MAX);
    assert_eq!((VDD_MIN, VDD_MAX), (0.7, 0.9));
}

#[test]
fn q4_dequant_table_comes_from_the_verified_vault() {
    let raw03 = std::fs::read_to_string(
        repo_root().join("data/reference-library/03_multiradix_logic_baselines.json"),
    )
    .unwrap();
    let table = Q4DequantTable::from_multiradix_json(&raw03).expect("verified Q4 table");
    assert_eq!(
        table.levels_v,
        [0.0, 0.6, 1.2, 1.8],
        "Q4 LDO levels (03 JSON)"
    );

    // Tampered payloads are refused fail-closed (Law 5 / admission discipline).
    let j: Value = serde_json::from_str(&raw03).unwrap();
    let mut tampered = j.clone();
    tampered["parameters"]["quaternary_q4_1p8v_ldo"]["voltage_levels_v"] =
        serde_json::json!([0.0, 0.6, 1.2]);
    assert!(matches!(
        Q4DequantTable::from_multiradix_json(&tampered.to_string()),
        Err(TpuError::NonPhysicalInput(_))
    ));
    let mut tampered = j.clone();
    tampered["parameters"]["quaternary_q4_1p8v_ldo"]["voltage_levels_v"] =
        serde_json::json!([0.1, 0.6, 1.2, 1.8]);
    assert!(
        matches!(
            Q4DequantTable::from_multiradix_json(&tampered.to_string()),
            Err(TpuError::NonPhysicalInput(_))
        ),
        "ground level must be exactly 0 V"
    );
    let mut tampered = j;
    tampered["parameters"]["quaternary_q4_1p8v_ldo"]["voltage_levels_v"] =
        serde_json::json!([0.0, 1.2, 0.6, 1.8]);
    assert!(
        matches!(
            Q4DequantTable::from_multiradix_json(&tampered.to_string()),
            Err(TpuError::NonPhysicalInput(_))
        ),
        "levels must be strictly ascending"
    );
}

// ---------------------------------------------------------------------------
// 2. Bit-exact GEMM parity with the Phase 0 oracle
// ---------------------------------------------------------------------------

#[test]
fn every_oracle_vector_matches_bit_for_bit() {
    let fixture = fixture();
    for vector in fixture["vectors"].as_array().expect("vectors") {
        let name = vector["name"].as_str().expect("name");
        let (a, m, k) = matrix(&vector["A"]);
        let (b, kb, n) = matrix(&vector["B"]);
        assert_eq!(kb, k, "{name}: B row count == K");

        let tpu = SystolicTpu::new(config_from(vector, OverflowPolicy::SaturateAndRecord))
            .expect("oracle config admits");
        let res = tpu
            .matmul_int8(&a, m, k, &b, n, &QdqScales::unity())
            .unwrap_or_else(|e| panic!("{name}: {e:?}"));

        // C bit-exact (INT32 grid, row-major).
        let expected_c: Vec<i32> = vector["C"]
            .as_array()
            .expect("C rows")
            .iter()
            .flat_map(|r| r.as_array().unwrap().iter())
            .map(|x| x.as_i64().expect("i32") as i32)
            .collect();
        assert_eq!(res.c_i32, expected_c, "{name}: C bit-exact");

        // Dequant identity under unity scales: C as exact f64.
        let expected_dequant: Vec<f64> = expected_c.iter().map(|&x| x as f64).collect();
        assert_eq!(
            res.c_dequant, expected_dequant,
            "{name}: unity dequant identity"
        );

        // Cycle model + utilization + MAC accounting, bit-exact.
        assert_eq!(
            res.cycles,
            vector["cycles"].as_u64().unwrap(),
            "{name}: cycles"
        );
        assert_eq!(
            res.tiles,
            vector["tiles"].as_u64().unwrap(),
            "{name}: tiles"
        );
        assert_eq!(
            res.mac_ops,
            vector["macOps"].as_u64().unwrap(),
            "{name}: macOps"
        );
        assert_eq!(
            res.utilization.to_bits(),
            vector["utilization"].as_f64().unwrap().to_bits(),
            "{name}: utilization bit-exact"
        );

        // Power: α·C·V²·f·P² in the oracle's exact multiplication order.
        assert_eq!(
            res.dynamic_power_w.value().to_bits(),
            vector["dynamicPowerW"].as_f64().unwrap().to_bits(),
            "{name}: dynamicPowerW bit-exact"
        );
        assert_eq!(
            res.peak_tile_power_w.value().to_bits(),
            vector["peakTilePowerW"].as_f64().unwrap().to_bits(),
            "{name}: peakTilePowerW bit-exact"
        );

        // Documented overflow events, exact (i, j, k) sequences.
        let expected_events: Vec<(u64, u64, u64)> = vector["tileOverflow"]
            .as_array()
            .unwrap()
            .iter()
            .map(|e| {
                (
                    e[0].as_u64().unwrap(),
                    e[1].as_u64().unwrap(),
                    e[2].as_u64().unwrap(),
                )
            })
            .collect();
        let got_events: Vec<(u64, u64, u64)> = res
            .tile_overflow
            .iter()
            .map(|e| (e.i as u64, e.j as u64, e.k as u64))
            .collect();
        assert_eq!(got_events, expected_events, "{name}: overflow events");

        // Quantized operands: the oracle's clamp8 grid (±127, JS rounding).
        assert!(
            res.q_a
                .iter()
                .chain(res.q_b.iter())
                .all(|&q| (-127..=127).contains(&q)),
            "{name}: quantized operands stay on the ±127 QDQ grid"
        );
    }
}

#[test]
fn exact_64_tile_heatmap_case_produces_64_tiles() {
    let fixture = fixture();
    let vector = fixture["vectors"]
        .as_array()
        .unwrap()
        .iter()
        .find(|v| v["name"] == "exact_64_tiles_heatmap")
        .expect("64-tile case");
    let (a, m, k) = matrix(&vector["A"]);
    let (b, _, n) = matrix(&vector["B"]);
    let tpu = SystolicTpu::educational().expect("educational config");
    let res = tpu
        .matmul_int8(&a, m, k, &b, n, &QdqScales::unity())
        .expect("compute");
    assert_eq!(
        res.tiles, 64,
        "8×8 grid over 64×64 GEMM = 64 SoC-heatmap tiles"
    );
    assert_eq!(res.tiles_telemetry.len(), 64);
    // Full tiles: every tile runs the same MAC count and activity.
    for t in &res.tiles_telemetry {
        assert_eq!(t.macs, 8 * 8 * 64, "full tile MACs");
        assert_eq!(
            t.mac_activity.to_bits(),
            res.utilization.to_bits(),
            "per-tile activity == global utilization for uniform full tiles"
        );
    }
}

/// Live differential against the real oracle: re-runs `systolicMatmul` in
/// Node on the same fixture inputs and compares the kernel's outputs again.
/// Absent Node ⇒ loud SKIP (PHASE_04 failure-modes contract).
#[test]
fn live_esm_oracle_differential_when_node_available() {
    let probe = std::process::Command::new(if cfg!(windows) { "where" } else { "which" })
        .arg("node")
        .output();
    let node_present = probe
        .as_ref()
        .map(|o| o.status.success() && !o.stdout.is_empty())
        .unwrap_or(false);
    if !node_present {
        eprintln!(
            "ESM-ORACLE-SKIP: node is not available on PATH — the live accelerators.mjs \
             differential executes only where Node exists; the committed golden fixture \
             (captured from the same oracle) was still asserted bit-exact."
        );
        return;
    }

    let script = r#"
        const { readFileSync } = require('node:fs');
        const { createRequire } = require('node:module');
        const path = require('node:path');
        const { systolicMatmul } = require(process.argv[1]);
        const fixture = JSON.parse(readFileSync(process.argv[2], 'utf8'));
        const out = [];
        for (const v of fixture.vectors) {
            const r = systolicMatmul(v.A, v.B, v.opts);
            out.push({
                name: v.name,
                cycles: r.cycles,
                tiles: r.tiles,
                macOps: r.macOps,
                utilization: r.utilization,
                dynamicPowerW: r.dynamicPowerW,
                c00: r.C[0][0],
                cLast: r.C[r.C.length - 1][r.C[r.C.length - 1].length - 1],
                overflow: r.tileOverflow.length,
            });
        }
        console.log(JSON.stringify(out));
    "#;
    let oracle = repo_root().join("packages/chip-engine/src/accelerators.mjs");
    let fixture_path =
        repo_root().join("crates/ep-kernel/ep-chip/tests/data/tpu_parity_vectors.json");
    let output = std::process::Command::new("node")
        .arg("-e")
        .arg(script)
        .arg(&oracle)
        .arg(&fixture_path)
        .output()
        .expect("node runs");
    assert!(
        output.status.success(),
        "node oracle run failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let live: Vec<Value> = serde_json::from_slice(&output.stdout).expect("oracle JSON");

    let fixture = fixture();
    for v in live {
        let vector = fixture["vectors"]
            .as_array()
            .unwrap()
            .iter()
            .find(|x| x["name"] == v["name"])
            .expect("fixture vector");
        let (a, m, k) = matrix(&vector["A"]);
        let (b, _, n) = matrix(&vector["B"]);
        let tpu = SystolicTpu::new(config_from(vector, OverflowPolicy::SaturateAndRecord)).unwrap();
        let res = tpu
            .matmul_int8(&a, m, k, &b, n, &QdqScales::unity())
            .unwrap_or_else(|e| panic!("{}: {e:?}", v["name"]));
        let name = v["name"].as_str().unwrap();
        assert_eq!(
            res.cycles,
            v["cycles"].as_u64().unwrap(),
            "{name}: live cycles"
        );
        assert_eq!(
            res.tiles,
            v["tiles"].as_u64().unwrap(),
            "{name}: live tiles"
        );
        assert_eq!(
            res.mac_ops,
            v["macOps"].as_u64().unwrap(),
            "{name}: live macOps"
        );
        assert_eq!(
            res.utilization.to_bits(),
            v["utilization"].as_f64().unwrap().to_bits(),
            "{name}: live utilization bit-exact"
        );
        assert_eq!(
            res.dynamic_power_w.value().to_bits(),
            v["dynamicPowerW"].as_f64().unwrap().to_bits(),
            "{name}: live dynamicPowerW bit-exact"
        );
        assert_eq!(
            res.c_i32[0],
            v["c00"].as_i64().unwrap() as i32,
            "{name}: live C[0][0]"
        );
        assert_eq!(
            res.tile_overflow.len(),
            v["overflow"].as_u64().unwrap() as usize,
            "{name}: live overflow count"
        );
    }
}

// ---------------------------------------------------------------------------
// 3. Exact §3 wave-front cycle + utilization equations
// ---------------------------------------------------------------------------

#[test]
fn cycle_and_utilization_equations_are_exact() {
    let tpu = SystolicTpu::educational().unwrap();
    // (M, K, N, P) → (tiles, cycles) per the §3 equations.
    let cases = [
        (64u64, 64u64, 64u64, 8u64, 64u64, 4992u64),
        (1, 1, 1, 1, 1, 1),
        (10, 7, 9, 8, 4, 84),
        (4, 3, 5, 2, 6, 30),
        (3, 3, 3, 4, 1, 9),  // M, N < P: single partial tile, K + 2P − 2 = 9
        (5, 1, 5, 8, 1, 15), // K < P: K + 2P − 2 = 1 + 16 − 2 = 15
        (65, 64, 64, 8, 72, 5616),
        (256, 256, 256, 8, 1024, 276480),
    ];
    for (m, k, n, p, exp_tiles, exp_cycles) in cases {
        let cfg = TpuConfig {
            grid_p: p as usize,
            ..TpuConfig::educational()
        };
        let t = SystolicTpu::new(cfg).unwrap();
        let (tiles, cycles, utilization) =
            t.cycle_model(m as usize, k as usize, n as usize).unwrap();
        assert_eq!(tiles, exp_tiles, "tiles for M={m} K={k} N={n} P={p}");
        assert_eq!(cycles, exp_cycles, "cycles for M={m} K={k} N={n} P={p}");
        // Independent restatement of the §3 utilization equation.
        let expected_util = (m * n * k) as f64 / (exp_tiles * (k + 2 * p - 2) * p * p) as f64;
        assert_eq!(
            utilization.to_bits(),
            expected_util.to_bits(),
            "utilization M={m} K={k} N={n} P={p}"
        );
    }
    // Single full tile: U = K / (K + 2P − 2) (fill/drain overhead form).
    let (_, _, util) = tpu.cycle_model(8, 64, 8).unwrap();
    assert_eq!(util.to_bits(), (64.0f64 / 78.0).to_bits());
}

// ---------------------------------------------------------------------------
// 4. Power scaling laws + envelope admission (§3 first bullet)
// ---------------------------------------------------------------------------

#[test]
fn dynamic_power_scales_exactly_with_f_and_v_squared() {
    let base = TpuConfig::educational();
    let tpu = SystolicTpu::new(base).unwrap();
    let p1 = tpu.dynamic_power().unwrap().value();

    // P ∝ f: doubling the clock exactly doubles the power (2× is exact in f64).
    let tpu2f = SystolicTpu::new(TpuConfig {
        clock: Hertz::new(base.clock.value() * 2.0),
        ..base
    })
    .unwrap();
    let p2f = tpu2f.dynamic_power().unwrap().value();
    assert_eq!(p2f, 2.0 * p1, "P(2f) == 2·P(f) exactly");
    assert_eq!(
        (p2f / p1).to_bits(),
        2.0f64.to_bits(),
        "∝f ratio is exactly 2"
    );

    // P ∝ V² through the shared ep-chip power primitive (the TPU calls the
    // same `DynamicPowerModel::dynamic_power`; the 4× doubling sits outside
    // the TPU's [0.7, 0.9] V envelope, which is asserted separately below).
    let cap = base.cap_per_mac;
    let freq = base.clock;
    let pv = DynamicPowerModel::dynamic_power(base.activity, cap, Volt::new(0.8), freq).unwrap();
    let pv2 = DynamicPowerModel::dynamic_power(base.activity, cap, Volt::new(1.6), freq).unwrap();
    assert_eq!(pv2.value(), 4.0 * pv.value(), "P(2V) == 4·P(V) exactly");
    assert_eq!(
        (pv2.value() / pv.value()).to_bits(),
        4.0f64.to_bits(),
        "∝V² ratio is exactly 4"
    );

    // Structural form at the anchor point: α·C·V²·f·P².
    let expected = base.activity * cap.value() * 0.8 * 0.8 * (100.0 * 1e6) * 8.0 * 8.0;
    assert_eq!(
        p1, expected,
        "P_dyn = α·C·V²·f·P² (oracle multiplication order)"
    );
}

#[test]
fn vdd_envelope_admission_is_fail_closed() {
    for vdd in [0.65, 0.6999, 0.9001, 0.95, 1.2] {
        let cfg = TpuConfig {
            vdd: Volt::new(vdd),
            ..TpuConfig::educational()
        };
        assert!(
            matches!(SystolicTpu::new(cfg), Err(TpuError::EnvelopeViolated(_))),
            "vdd = {vdd} must be refused outside [0.7, 0.9] V"
        );
    }
    for vdd in [0.7, 0.8, 0.9] {
        let cfg = TpuConfig {
            vdd: Volt::new(vdd),
            ..TpuConfig::educational()
        };
        assert!(
            SystolicTpu::new(cfg).is_ok(),
            "vdd = {vdd} is inside the envelope"
        );
    }
}

// ---------------------------------------------------------------------------
// 5. Fail-closed guards + accumulator bound
// ---------------------------------------------------------------------------

#[test]
fn accumulator_bound_admission_is_exact_and_fail_closed() {
    // Exact formula bounds for both radix domains.
    assert_eq!(K_MAX_INT32_ACC, 33025, "2^31/(255·255)");
    assert_eq!(
        K_MAX_Q4_ACC,
        (1u64 << 31) / 9,
        "2^31/9 for the digit domain"
    );

    // K == bound passes admission; K == bound+1 is refused.
    assert!(ensure_k_bound(33025, 255 * 255, OverflowPolicy::Refuse).is_ok());
    assert_eq!(
        ensure_k_bound(33026, 255 * 255, OverflowPolicy::Refuse),
        Err(TpuError::OverflowRefused {
            k: 33026,
            k_max: 33025
        })
    );
    assert!(ensure_k_bound(33026, 255 * 255, OverflowPolicy::SaturateAndRecord).is_ok());

    // Q4 digit domain (worst product 9).
    assert!(ensure_k_bound(K_MAX_Q4_ACC as usize, 9, OverflowPolicy::Refuse).is_ok());
    assert!(ensure_k_bound(K_MAX_Q4_ACC as usize + 1, 9, OverflowPolicy::Refuse).is_err());

    // End-to-end refusal: K = 33026 is refused on the BOUND even for all-zero
    // operands (admission is fail-closed, never sampled).
    let zeros = vec![0.0f64; 2 * 33026];
    let tpu = SystolicTpu::educational().unwrap();
    assert_eq!(
        tpu.matmul_int8(&zeros, 2, 33026, &zeros, 2, &QdqScales::unity()),
        Err(TpuError::OverflowRefused {
            k: 33026,
            k_max: 33025
        })
    );
    // K == 33025 with all-127 INT8 inputs: max |acc| = 33025·16129 = 532 660 225
    // — no overflow (the 255·255 bound is the conservative guard).
    let m127 = vec![127.0f64; 33025];
    let res = tpu
        .matmul_int8(&m127, 1, 33025, &m127, 1, &QdqScales::unity())
        .expect("K == K_max admits");
    assert_eq!(res.c_i32[0], 532_660_225);
    assert!(res.tile_overflow.is_empty());
}

#[test]
fn saturation_records_documented_events_exactly() {
    // K·127·127 > 2^31 − 1 ⇒ K ≥ 133145 saturates with one documented event
    // per output element, at the exact MAC index where the bound is crossed.
    let a = vec![127.0f64; 2 * 133145];
    let b = vec![127.0f64; 133145 * 2];
    let tpu = SystolicTpu::new(TpuConfig {
        overflow_policy: OverflowPolicy::SaturateAndRecord,
        ..TpuConfig::educational()
    })
    .unwrap();
    let res = tpu
        .matmul_int8(&a, 2, 133145, &b, 2, &QdqScales::unity())
        .expect("saturating policy runs");
    assert_eq!(
        res.c_i32,
        vec![2_147_483_647i32; 4],
        "saturated at INT32_MAX"
    );
    let expected = (0..2usize)
        .flat_map(|i| (0..2usize).map(move |j| OverflowEvent { i, j, k: 133_144 }))
        .collect::<Vec<_>>();
    assert_eq!(
        res.tile_overflow, expected,
        "documented overflow events (i, j, k)"
    );

    // Negative-side saturation at INT32_MIN.
    let a = vec![-127.0f64; 2 * 133145];
    let res = tpu
        .matmul_int8(&a, 2, 133145, &b, 2, &QdqScales::unity())
        .expect("saturating policy runs");
    assert_eq!(
        res.c_i32,
        vec![-2_147_483_648i32; 4],
        "saturated at INT32_MIN"
    );
}

#[test]
fn dimension_and_input_checks_are_fail_closed() {
    let tpu = SystolicTpu::educational().unwrap();
    let scales = QdqScales::unity();

    // Zero dimensions.
    assert!(matches!(
        tpu.matmul_int8(&[1.0], 0, 1, &[1.0], 1, &scales),
        Err(TpuError::Dimensions(_))
    ));
    assert!(matches!(
        tpu.matmul_int8(&[1.0], 1, 0, &[1.0], 1, &scales),
        Err(TpuError::Dimensions(_))
    ));
    // Flat-length mismatches.
    assert!(matches!(
        tpu.matmul_int8(&[1.0, 2.0], 2, 2, &[1.0; 4], 2, &scales),
        Err(TpuError::Dimensions(_))
    ));
    // B flat length must equal K·N exactly (B is K×N row-major).
    assert!(matches!(
        tpu.matmul_int8(&[1.0; 4], 2, 2, &[1.0; 5], 2, &scales),
        Err(TpuError::Dimensions(_))
    ));
    // Non-finite operands.
    let mut nan_a = vec![1.0f64; 4];
    nan_a[2] = f64::NAN;
    assert!(matches!(
        tpu.matmul_int8(&nan_a, 2, 2, &[1.0; 4], 2, &scales),
        Err(TpuError::NonPhysicalInput(_))
    ));
    let mut inf_b = vec![1.0f64; 4];
    inf_b[3] = f64::INFINITY;
    assert!(matches!(
        tpu.matmul_int8(&[1.0; 4], 2, 2, &inf_b, 2, &scales),
        Err(TpuError::NonPhysicalInput(_))
    ));
    // Non-physical scales.
    for bad in [[0.0f64], [-0.5], [f64::NAN]] {
        assert!(
            matches!(
                tpu.matmul_int8(
                    &[1.0; 4],
                    2,
                    2,
                    &[1.0; 4],
                    2,
                    &QdqScales {
                        a_per_row: bad.to_vec(),
                        b_per_col: vec![]
                    }
                ),
                Err(TpuError::NonPhysicalInput(_))
            ),
            "scale {bad:?} must be refused"
        );
    }
    // Per-axis length must be 0/1/dim.
    assert!(matches!(
        tpu.matmul_int8(
            &[1.0; 4],
            2,
            2,
            &[1.0; 4],
            2,
            &QdqScales {
                a_per_row: vec![1.0, 2.0, 3.0],
                b_per_col: vec![]
            }
        ),
        Err(TpuError::Dimensions(_))
    ));
    // Non-physical model parameters + empty grid.
    let mut cfg = TpuConfig::educational();
    cfg.grid_p = 0;
    assert!(matches!(
        SystolicTpu::new(cfg),
        Err(TpuError::Dimensions(_))
    ));
    let mut cfg = TpuConfig::educational();
    cfg.activity = -0.1;
    assert!(matches!(
        SystolicTpu::new(cfg),
        Err(TpuError::NonPhysicalInput(_))
    ));
    let mut cfg = TpuConfig::educational();
    cfg.clock = Hertz::new(0.0);
    assert!(matches!(
        SystolicTpu::new(cfg),
        Err(TpuError::NonPhysicalInput(_))
    ));
}

// ---------------------------------------------------------------------------
// 6. Per-axis QDQ dequant math (exact reference identities)
// ---------------------------------------------------------------------------

#[test]
fn per_axis_qdq_matches_exact_reference_math() {
    // A = [[1.2, -0.4], [3.3, 2.6]], sA per row = [0.1, 0.1]
    // B = [[0.25, -0.75], [1.5, 2.0]], sB per col = [0.5, 0.25]
    let a = [1.2, -0.4, 3.3, 2.6];
    let b = [0.25, -0.75, 1.5, 2.0];
    let scales = QdqScales {
        a_per_row: vec![0.1, 0.1],
        b_per_col: vec![0.5, 0.25],
    };
    let tpu = SystolicTpu::new(TpuConfig {
        grid_p: 2,
        ..TpuConfig::educational()
    })
    .unwrap();
    let res = tpu.matmul_int8(&a, 2, 2, &b, 2, &scales).expect("QDQ run");

    // Hand-derived quantized operands (JS Math.round semantics).
    assert_eq!(res.q_a, vec![12, -4, 33, 26], "qA = clamp8(v / sA[row])");
    assert_eq!(res.q_b, vec![1, -3, 3, 8], "qB = clamp8(v / sB[col])");

    // Exact INT32 accumulation (row-major): [0, -68, 111, 109].
    assert_eq!(res.c_i32, vec![0, -68, 111, 109]);

    // Dequant identity: c = acc · sA[row] · sB[col], bit-exact.
    let expected_dequant = [
        0.0f64,
        -68.0 * 0.1 * 0.25,
        111.0 * 0.1 * 0.5,
        109.0 * 0.1 * 0.25,
    ];
    for (got, want) in res.c_dequant.iter().zip(expected_dequant.iter()) {
        assert_eq!(got.to_bits(), want.to_bits(), "dequant identity bit-exact");
    }

    // QDQ correctness bound: |c_dequant − A·B| ≤ Σ (|qA|·sA·0.5·sB +
    // 0.5·sA·|qB|·sB + 0.25·sA·sB) — the exact algebra of the ±0.5-scale
    // quantization error over the reduction axis.
    let real = [
        1.2 * 0.25 + (-0.4) * 1.5,
        1.2 * (-0.75) + (-0.4) * 2.0,
        3.3 * 0.25 + 2.6 * 1.5,
        3.3 * (-0.75) + 2.6 * 2.0,
    ];
    let sa = [0.1, 0.1];
    let sb = [0.5, 0.25];
    for i in 0..2 {
        for j in 0..2 {
            let mut bound = 0.0;
            for kk in 0..2 {
                let qa = res.q_a[i * 2 + kk] as f64;
                let qb = res.q_b[kk * 2 + j] as f64;
                bound += qa.abs() * sa[i] * 0.5 * sb[j]
                    + 0.5 * sa[i] * qb.abs() * sb[j]
                    + 0.25 * sa[i] * sb[j];
            }
            let err = (res.c_dequant[i * 2 + j] - real[i * 2 + j]).abs();
            assert!(
                err <= bound,
                "QDQ error {err} within algebraic bound {bound} at ({i},{j})"
            );
        }
    }

    // Per-tensor (scalar) scale form: same qA grid, but sB = 0.25 for BOTH
    // columns requantizes column 0 — hand-derived: qB = [1, −3, 6, 8] ⇒
    // acc = [12−24, −68, 33+156, 109] = [−12, −68, 189, 109].
    let scalar = QdqScales {
        a_per_row: vec![0.1],
        b_per_col: vec![0.25],
    };
    let res_scalar = tpu
        .matmul_int8(&a, 2, 2, &b, 2, &scalar)
        .expect("scalar scales");
    assert_eq!(
        res_scalar.q_b,
        vec![1, -3, 6, 8],
        "scalar sB applies to every column"
    );
    assert_eq!(
        res_scalar.c_i32,
        vec![-12, -68, 189, 109],
        "scalar-grid accumulation"
    );
    // The dequant identity still holds bit-exactly in the scalar layout.
    let expected_scalar = [
        (-12.0f64) * 0.1 * 0.25,
        (-68.0f64) * 0.1 * 0.25,
        189.0f64 * 0.1 * 0.25,
        109.0f64 * 0.1 * 0.25,
    ];
    for (got, want) in res_scalar.c_dequant.iter().zip(expected_scalar.iter()) {
        assert_eq!(
            got.to_bits(),
            want.to_bits(),
            "scalar dequant identity bit-exact"
        );
    }
}

// ---------------------------------------------------------------------------
// 7. Q4 multi-radix mode (experimental)
// ---------------------------------------------------------------------------

#[test]
fn q4_packing_is_two_digits_per_byte_with_roundtrip() {
    let digits = [0u8, 1, 2, 3, 3, 0, 1, 2, 1]; // odd length → half-used last byte
    let packed = pack_q4(&digits).expect("pack");
    assert_eq!(packed.bytes.len(), 5, "ceil(9/2) bytes");
    assert_eq!(
        packed.bytes[0], 0b0001_0000,
        "low nibble = digit[0], high = digit[1]"
    );
    assert_eq!(unpack_q4(&packed).expect("unpack"), digits);

    // Digit > 3 refused at pack time…
    assert!(matches!(
        pack_q4(&[0, 4]),
        Err(TpuError::Q4DigitOutOfRange { index: 1, value: 4 })
    ));
    // …and at unpack time (tampered nibble).
    let mut tampered = packed_for_tamper();
    tampered.bytes[0] = 0x40; // high nibble = 4 → digit[1] out of range
    assert!(matches!(
        unpack_q4(&tampered),
        Err(TpuError::Q4DigitOutOfRange { index: 1, value: 4 })
    ));
    // Length mismatch refused.
    let mut bad = packed_for_tamper();
    bad.bytes.pop();
    assert!(matches!(unpack_q4(&bad), Err(TpuError::Dimensions(_))));
}

fn packed_for_tamper() -> ep_chip::tpu::Q4Packed {
    pack_q4(&[0u8, 1, 2, 3]).expect("pack")
}

#[test]
fn q4_digit_domain_matmul_is_exact_with_verified_dequant() {
    let raw03 = std::fs::read_to_string(
        repo_root().join("data/reference-library/03_multiradix_logic_baselines.json"),
    )
    .unwrap();
    let table = Q4DequantTable::from_multiradix_json(&raw03).unwrap();

    // A = [[0,1],[2,3]], B = [[3,2],[1,0]] → digit-domain product:
    // C[0][0] = 0·3 + 1·1 = 1; C[0][1] = 0·2 + 1·0 = 0;
    // C[1][0] = 2·3 + 3·1 = 9; C[1][1] = 2·2 + 3·0 = 4.
    let a = [0u8, 1, 2, 3];
    let b = [3u8, 2, 1, 0];
    let tpu = SystolicTpu::new(TpuConfig {
        grid_p: 2,
        ..TpuConfig::educational()
    })
    .unwrap();
    let res = tpu.matmul_q4(&a, 2, 2, &b, 2, &table).expect("Q4 run");

    assert_eq!(
        res.c_i32,
        vec![1, 0, 9, 4],
        "exact digit-domain accumulation"
    );
    // Dequant pass: nearest-partition digit transfer onto the verified levels.
    assert_eq!(
        res.c_digit,
        vec![1, 0, 3, 3],
        "nearest partition digit (q4_thresh_det semantics)"
    );
    assert_eq!(
        res.c_voltage_v,
        vec![0.6, 0.0, 1.8, 1.8],
        "Q4 LDO levels [0, 0.6, 1.2, 1.8] V"
    );

    // Cycle model: compute (§3) + declared dequant pass `tiles·P`
    // (tiles = 1 for the 2×2 case: ceil(2/2)·ceil(2/2)).
    assert_eq!(res.compute_cycles, 2 + 2 * 2 - 2, "tiles·(K + 2P − 2)");
    assert_eq!(res.dequant_cycles, 2, "tiles·P (ESM q4 dequant contract)");
    assert_eq!(res.total_cycles, res.compute_cycles + res.dequant_cycles);
    assert_eq!(res.mac_ops, 2 * 2 * 2);
    assert_eq!(res.tiles_telemetry.len(), 1);

    // Naive reference cross-check on a bigger digit GEMM (bit-exact).
    let (m, k, n) = (5usize, 7usize, 6usize);
    let mut state = 0x9E3779B9u64;
    let mut next_digit = move || {
        state = state
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        ((state >> 33) % 4) as u8
    };
    let a_big: Vec<u8> = (0..m * k).map(|_| next_digit()).collect();
    let b_big: Vec<u8> = (0..k * n).map(|_| next_digit()).collect();
    let res_big = tpu
        .matmul_q4(&a_big, m, k, &b_big, n, &table)
        .expect("Q4 big");
    let mut naive = vec![0i64; m * n];
    for i in 0..m {
        for j in 0..n {
            for kk in 0..k {
                naive[i * n + j] += (a_big[i * k + kk] as i64) * (b_big[kk * n + j] as i64);
            }
        }
    }
    let naive_i32: Vec<i32> = naive.iter().map(|&x| x as i32).collect();
    assert_eq!(
        res_big.c_i32, naive_i32,
        "digit-domain GEMM bit-exact vs naive reference"
    );
    assert_eq!(res_big.tiles, (m.div_ceil(2) * n.div_ceil(2)) as u64);
    assert_eq!(
        res_big.compute_cycles,
        (m.div_ceil(2) * n.div_ceil(2)) as u64 * (k as u64 + 2 * 2 - 2)
    );
}

// ---------------------------------------------------------------------------
// 8. Per-tile MAC activity & switching power (64-tile heatmap feed)
// ---------------------------------------------------------------------------

#[test]
fn per_tile_telemetry_sums_to_the_gemm_and_scales_with_power() {
    let tpu = SystolicTpu::educational().unwrap();
    // Partial-edge case: M=65 → one 1-row edge tile row; tiles = 9·8 = 72.
    let (m, k, n) = (65usize, 64usize, 64usize);
    let telemetry = tpu.tiles_telemetry(m, k, n).unwrap();
    assert_eq!(telemetry.len(), 72);

    let total_macs: u64 = telemetry.iter().map(|t| t.macs).sum();
    assert_eq!(total_macs, (m * n * k) as u64, "Σ tile MACs == M·N·K");

    // Full tiles: MACs = P²·K, activity = K/(K + 2P − 2) — the per-tile §3 form.
    for t in telemetry.iter().take(64) {
        assert_eq!(t.macs, 8 * 8 * 64);
        assert_eq!(t.mac_activity, 64.0 / 78.0);
    }
    // Edge row (tile_row 8): rows = min(P, M − 8P) = 1.
    for t in telemetry.iter().skip(64) {
        assert_eq!(t.tile_row, 8);
        assert_eq!(t.macs, 8 * 64);
        assert_eq!(t.mac_activity, (8.0 * 64.0) / (64.0 * 78.0));
    }

    // Power per tile: peak = α·C·V²·f·P²; avg = peak · activity (exact).
    let peak = tpu.dynamic_power().unwrap().value();
    for t in &telemetry {
        assert_eq!(t.peak_switching_power_w.value().to_bits(), peak.to_bits());
        assert_eq!(
            t.avg_switching_power_w.value().to_bits(),
            (peak * t.mac_activity).to_bits()
        );
    }

    // Activity shifts with f (the heatmap feed inherits the ∝f law).
    let tpu2f = SystolicTpu::new(TpuConfig {
        clock: Hertz::new(200.0 * 1e6),
        ..TpuConfig::educational()
    })
    .unwrap();
    let telemetry2f = tpu2f.tiles_telemetry(m, k, n).unwrap();
    assert_eq!(
        telemetry2f[0].peak_switching_power_w.value(),
        2.0 * telemetry[0].peak_switching_power_w.value(),
        "per-tile peak power exactly doubles with the clock"
    );
    assert_eq!(
        telemetry2f[0].mac_activity.to_bits(),
        telemetry[0].mac_activity.to_bits(),
        "MAC activity is clock-invariant (a count ratio)"
    );
}
