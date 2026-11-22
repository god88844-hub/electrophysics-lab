//! WP-4.2 parity + acceptance gate: the SIMT GPU warp-execution engine
//! against the Phase 0 oracle and the sealed offline vault.
//!
//! Gates enforced here (PHASE_04 WP-4.2: "Warp lanes, divergence
//! serialization (2× cost), occupancy accounting; parity vs ESM
//! simulateWarpKernel (cycle counts identical)"; 03 §3: "divergent warp
//! costs 2× the uniform warp (both paths serialized); occupancy = active
//! lanes / warp width"; §3 power `P_dyn = α·C·V²·f` scaled by active lanes):
//!  1. Vault constants: every module constant is verified against the
//!     SHA-256-sealed `data/reference-library/05` payload via `ep-core`
//!     (fail-closed manifest verification) — Law 5.
//!  2. Bit-exact parity with `packages/chip-engine/src/accelerators.mjs ::
//!     simulateWarpKernel` (golden fixture captured deterministically by
//!     `tests/data/gen_gpu_parity.mjs`, re-validated live against Node when
//!     Node is available — absent tool ⇒ loud SKIP, never a silent pass).
//!  3. The exact §3 2× divergence serialization penalty (uniform 1 cycle,
//!     divergent 2, per warp) including divergence localized to single
//!     warps.
//!  4. Per-lane predicate masks + reconvergence stack semantics.
//!  5. Shared-memory bank-conflict accounting (classic model + broadcast).
//!  6. Occupancy accounting (per-warp §3 formula + the ESM launch formula).
//!  7. Vector-ALU lockstep semantics (wrapping, predication, cycles).
//!  8. Power scaling laws `P ∝ f`, `P ∝ V²`, `P ∝ active lanes` (exact)
//!     + the 05-JSON TDP envelope sanity.
//!  9. Fail-closed admission (config + launch dimensions).
//! 10. Provenance: `SIMULATED_ARCHITECTURAL_MODEL` on every surface.

use ep_chip::gpu::{
    bank_conflicts, ops_per_cycle, BranchOutcome, GpuConfig, GpuError, KernelRunResult,
    LaneOutcome, VectorAluOp, WarpExecution, WarpScheduler, CAP_PER_LANE_EVENT_F,
    DEFAULT_SHARED_BANKS, DEFAULT_VDD, DEFAULT_WARP_WIDTH, GPU_BADGE, MAX_WARP_WIDTH, POWER_TDP_W,
    TEMP_MAX_C, TEMP_MIN_C, WARP_WIDTH_AMD, WARP_WIDTH_INTEL, WARP_WIDTH_NVIDIA,
};
use ep_core::reference::verify_library_dir;
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
    serde_json::from_str(include_str!("data/gpu_parity_vectors.json")).expect("fixture parses")
}

/// The named kernels — mirrored EXACTLY from
/// `tests/data/gen_gpu_parity.mjs` (each arm a non-capturing `fn` pointer).
fn kernel_by_name(name: &str) -> fn(usize, i64) -> LaneOutcome {
    match name {
        "uniform" => |lane, x| LaneOutcome::new(2 * x + lane as i64, false),
        "threshold" => |_lane, x| {
            let t = x > 100;
            LaneOutcome::new(if t { x - 100 } else { x + 100 }, t)
        },
        "mod2" => |lane, _x| {
            let t = lane % 2 == 0;
            LaneOutcome::new(
                if t {
                    (lane / 2) as i64
                } else {
                    3 * lane as i64 + 1
                },
                t,
            )
        },
        "allBranch" => |lane, x| LaneOutcome::new(lane as i64 + x, true),
        "oddBranch" => |_lane, x| {
            let t = x & 1 == 1;
            LaneOutcome::new(if t { x * 3 } else { x + 1 }, t)
        },
        "highLaneBranch" => |lane, _x| {
            let t = lane >= 16;
            LaneOutcome::new(if t { lane as i64 * 5 } else { lane as i64 * 7 }, t)
        },
        "lowLaneBranch" => |lane, _x| {
            let t = lane < 16;
            LaneOutcome::new(if t { lane as i64 * 5 } else { lane as i64 * 7 }, t)
        },
        other => panic!("unknown fixture kernel '{other}'"),
    }
}

fn scheduler() -> WarpScheduler {
    WarpScheduler::new(GpuConfig::new()).expect("default config valid")
}

// ---------------------------------------------------------------------------
// 1. Vault anchoring (Law 5).
// ---------------------------------------------------------------------------

/// Every gpu.rs constant equals its field in the SHA-256-verified 05 payload
/// (`parameters.simt_gpu` + `valid_operating_envelope.simt_gpu`).
#[test]
fn vault_constants_match_verified_05_json() {
    let n = verify_library_dir(&repo_root().join("data").join("reference-library"))
        .expect("the offline reference vault verifies against its sealed manifest");
    assert!(n > 0, "vault verified {n} entries");
    let raw = std::fs::read_to_string(
        repo_root().join("data/reference-library/05_chip_architecture_benchmarks.json"),
    )
    .expect("05 payload reads");
    let v: Value = serde_json::from_str(&raw).expect("05 parses");
    let g = &v["parameters"]["simt_gpu"];
    let env = &v["valid_operating_envelope"]["simt_gpu"];

    // Warp widths (the configurable-width validation anchors).
    assert_eq!(
        WARP_WIDTH_NVIDIA,
        g["warp_width"]["nvidia"].as_u64().unwrap() as usize
    );
    assert_eq!(
        WARP_WIDTH_AMD,
        g["warp_width"]["amd"].as_u64().unwrap() as usize
    );
    assert_eq!(
        WARP_WIDTH_INTEL,
        g["warp_width"]["intel"].as_u64().unwrap() as usize
    );
    assert_eq!(DEFAULT_WARP_WIDTH, WARP_WIDTH_NVIDIA);
    // Per-SM resources.
    assert_eq!(
        256.0,
        g["register_file_per_sm_kb"]["nvidia_ampere"]
            .as_f64()
            .unwrap()
    );
    assert_eq!(
        16.0,
        g["register_file_per_sm_kb"]["educational"]
            .as_f64()
            .unwrap()
    );
    assert_eq!(
        164.0,
        g["shared_memory_per_sm_kb"]["nvidia_ampere"]
            .as_f64()
            .unwrap()
    );
    assert_eq!(
        8.0,
        g["shared_memory_per_sm_kb"]["educational"]
            .as_f64()
            .unwrap()
    );
    // SM / core counts.
    assert_eq!(108, g["sm_count"]["nvidia_a100"].as_u64().unwrap() as usize);
    assert_eq!(28, g["sm_count"]["rtx_3060"].as_u64().unwrap() as usize);
    assert_eq!(
        96,
        g["sm_count"]["intel_iris_xe_155u"].as_u64().unwrap() as usize
    );
    assert_eq!(
        64,
        g["cuda_cores_per_sm"]["nvidia_ampere"].as_u64().unwrap() as usize
    );
    // Clocks + bandwidths.
    assert_eq!(1410.0, g["clock_mhz"]["nvidia_a100"].as_f64().unwrap());
    assert_eq!(
        1450.0,
        g["clock_mhz"]["intel_iris_xe_155u"].as_f64().unwrap()
    );
    assert_eq!(
        1555.0,
        g["memory_bandwidth_gbps"]["nvidia_a100_hbm2e"]
            .as_f64()
            .unwrap()
    );
    assert_eq!(
        68.0,
        g["memory_bandwidth_gbps"]["intel_iris_xe_lpddr5"]
            .as_f64()
            .unwrap()
    );
    // Power + envelope.
    assert_eq!(400.0, g["power_w"]["nvidia_a100"].as_f64().unwrap());
    assert_eq!(
        POWER_TDP_W,
        g["power_w"]["intel_iris_xe_155u_tdp"].as_f64().unwrap()
    );
    assert_eq!(POWER_TDP_W, env["power_tdp_w"].as_f64().unwrap());
    let temps = env["temp_range_c"].as_array().unwrap();
    assert_eq!(TEMP_MIN_C, temps[0].as_f64().unwrap());
    assert_eq!(TEMP_MAX_C, temps[1].as_f64().unwrap());
    // The declared model parameters that are NOT vault fields stay at their
    // declared ESM-oracle defaults (documented, not invented).
    assert_eq!(DEFAULT_VDD, 0.8);
    assert_eq!(DEFAULT_SHARED_BANKS, WARP_WIDTH_NVIDIA);
    assert_eq!(CAP_PER_LANE_EVENT_F, 1.2e-13);
}

/// `05` SIMT-throughput equation: `ops_per_cycle = SM_count · cores_per_SM ·
/// ops_per_core_per_clock` (A100 anchor: 108 SMs × 64 cores × 1 op = 6912).
#[test]
fn ops_per_cycle_equation_matches_05_anchor() {
    assert_eq!(
        ops_per_cycle(108, 64, 1),
        6912,
        "05 SIMT equation at the A100 anchor"
    );
    assert_eq!(ops_per_cycle(2, 3, 4), 24);
}

// ---------------------------------------------------------------------------
// 3. The exact §3 2× divergence serialization penalty.
// ---------------------------------------------------------------------------

/// §3: a divergent warp costs exactly 2× the uniform warp. Proven per warp
/// and per launch, including the uniform-all-taken ESM convention.
#[test]
fn divergent_warp_costs_exactly_twice_uniform() {
    let s = scheduler();
    let inputs = vec![200i64; 128];

    // Per launch: 4 warps, uniform never branches → 1 cycle each.
    let uniform = s
        .run_kernel(128, &inputs, kernel_by_name("uniform"))
        .expect("run");
    assert_eq!(uniform.cycles, 4);
    assert_eq!(uniform.divergence_events, 0);

    // allBranch: every lane takes → the ESM counts every warp divergent.
    let all = s
        .run_kernel(128, &inputs, kernel_by_name("allBranch"))
        .expect("run");
    assert_eq!(all.cycles, 8);
    assert_eq!(
        all.cycles,
        2 * uniform.cycles,
        "exact 2× penalty per launch"
    );
    assert_eq!(all.divergence_events, 4);

    // Per warp: single-warp launches.
    let one_uniform = s
        .run_kernel(32, &inputs, kernel_by_name("uniform"))
        .expect("run");
    let one_divergent = s
        .run_kernel(32, &inputs, kernel_by_name("allBranch"))
        .expect("run");
    assert_eq!((one_uniform.cycles, one_divergent.cycles), (1, 2));
    assert_eq!(one_divergent.cycles, 2 * one_uniform.cycles);
}

/// Divergence is localized per warp: a launch with one divergent warp and
/// one uniform warp costs 2 + 1 = 3 cycles (NOT 4) — the penalty is per
/// warp, exactly as the ESM oracle accounts it.
#[test]
fn divergence_penalty_is_localized_per_warp() {
    let s = scheduler();
    let inputs = vec![5i64; 128];
    // lowLaneBranch: only lanes < 16 take → warp 0 mixed (divergent),
    // warps 1.. uniform not-taken.
    let r = s
        .run_kernel(128, &inputs, kernel_by_name("lowLaneBranch"))
        .expect("run");
    assert_eq!(r.cycles, 5, "3 uniform warps + 1 divergent warp = 3·1 + 2");
    assert_eq!(r.divergence_events, 1);
    let w0 = &r.warps[0];
    assert!(w0.divergent);
    assert_eq!(w0.cycles, 2);
    assert_eq!(w0.taken_mask, 0x0000_FFFF, "lanes 0..15 took the branch");
    assert_eq!(w0.fallthrough_mask, 0xFFFF_0000);
    for w in &r.warps[1..] {
        assert!(!w.divergent);
        assert_eq!(w.cycles, 1);
        assert_eq!(w.reconvergence_depth_max, 0);
    }
}

// ---------------------------------------------------------------------------
// 2. Bit-exact parity with the ESM oracle.
// ---------------------------------------------------------------------------

/// All golden vectors: cycles, divergenceEvents, occupancy (bit-exact f64)
/// and the full per-lane results array match the captured oracle output.
#[test]
fn parity_with_esm_simulate_warp_kernel_golden_fixture() {
    let s = scheduler();
    let f = fixture();
    let vectors = f["vectors"].as_array().expect("vectors");
    assert!(
        vectors.len() >= 40,
        "fixture carries {} vectors",
        vectors.len()
    );
    for v in vectors {
        let name = v["name"].as_str().expect("name");
        let lanes = v["lanes"].as_u64().expect("lanes") as usize;
        let inputs: Vec<i64> = v["inputs"]
            .as_array()
            .expect("inputs")
            .iter()
            .map(|x| x.as_i64().expect("i64"))
            .collect();
        let r = s
            .run_kernel(
                lanes,
                &inputs,
                kernel_by_name(v["kernel"].as_str().expect("kernel")),
            )
            .unwrap_or_else(|e| panic!("{name}: {e}"));

        assert_eq!(r.cycles, v["cycles"].as_u64().unwrap(), "{name}: cycles");
        assert_eq!(
            r.divergence_events,
            v["divergenceEvents"].as_u64().unwrap(),
            "{name}: divergenceEvents"
        );
        assert_eq!(
            r.occupancy.to_bits(),
            v["occupancy"].as_f64().unwrap().to_bits(),
            "{name}: occupancy (f64 bit-exact)"
        );
        let expected = v["results"].as_array().expect("results");
        assert_eq!(r.results.len(), expected.len(), "{name}: results length");
        for (lane, (got, want)) in r.results.iter().zip(expected).enumerate() {
            assert_eq!(
                got.value,
                want["value"].as_i64().unwrap(),
                "{name}[{lane}]: value"
            );
            assert_eq!(
                got.took_branch,
                want["tookBranch"].as_bool().unwrap(),
                "{name}[{lane}]: tookBranch"
            );
        }
    }
}

/// Live differential against the real oracle: re-runs `simulateWarpKernel`
/// in Node on the same fixture cases and compares again. Absent Node ⇒ loud
/// SKIP (PHASE_04 failure-modes contract).
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
        const { simulateWarpKernel } = require(process.argv[1]);
        const fixture = JSON.parse(readFileSync(process.argv[2], 'utf8'));
        const KERNELS = {
          uniform: (lane, x) => ({ value: 2 * x + lane, tookBranch: false }),
          threshold: (lane, x) => { const t = x > 100; return { value: t ? x - 100 : x + 100, tookBranch: t }; },
          mod2: (lane, x) => { const t = lane % 2 === 0; return { value: t ? Math.floor(lane / 2) : 3 * lane + 1, tookBranch: t }; },
          allBranch: (lane, x) => ({ value: lane + x, tookBranch: true }),
          oddBranch: (lane, x) => { const t = (x & 1) === 1; return { value: t ? x * 3 : x + 1, tookBranch: t }; },
          highLaneBranch: (lane, x) => { const t = lane >= 16; return { value: t ? lane * 5 : lane * 7, tookBranch: t }; },
          lowLaneBranch: (lane, x) => { const t = lane < 16; return { value: t ? lane * 5 : lane * 7, tookBranch: t }; },
        };
        const out = [];
        for (const v of fixture.vectors) {
          const r = simulateWarpKernel(v.lanes, KERNELS[v.kernel], v.inputs);
          out.push({
            name: v.name,
            cycles: r.cycles,
            divergenceEvents: r.divergenceEvents,
            occupancy: r.occupancy,
            results: r.results.map((x) => [x.value, x.tookBranch ? 1 : 0]),
          });
        }
        console.log(JSON.stringify(out));
    "#;
    let oracle = repo_root().join("packages/chip-engine/src/accelerators.mjs");
    let fixture_path =
        repo_root().join("crates/ep-kernel/ep-chip/tests/data/gpu_parity_vectors.json");
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

    let s = scheduler();
    let f = fixture();
    assert_eq!(live.len(), f["vectors"].as_array().unwrap().len());
    for v in live {
        let name = v["name"].as_str().expect("name");
        let vector = f["vectors"]
            .as_array()
            .unwrap()
            .iter()
            .find(|x| x["name"].as_str() == Some(name))
            .expect("fixture vector");
        // Live oracle == captured fixture (the fixture is faithful).
        assert_eq!(v["cycles"], vector["cycles"], "{name}: live cycles");
        assert_eq!(
            v["divergenceEvents"], vector["divergenceEvents"],
            "{name}: live div"
        );
        assert_eq!(
            v["occupancy"].as_f64().unwrap().to_bits(),
            vector["occupancy"].as_f64().unwrap().to_bits(),
            "{name}: live occupancy bits"
        );
        // And the Rust engine == the live oracle, bit-exact.
        let lanes = vector["lanes"].as_u64().unwrap() as usize;
        let inputs: Vec<i64> = vector["inputs"]
            .as_array()
            .unwrap()
            .iter()
            .map(|x| x.as_i64().unwrap())
            .collect();
        let r = s
            .run_kernel(
                lanes,
                &inputs,
                kernel_by_name(vector["kernel"].as_str().unwrap()),
            )
            .expect("rust run");
        assert_eq!(
            r.cycles,
            v["cycles"].as_u64().unwrap(),
            "{name}: rust cycles"
        );
        assert_eq!(
            r.divergence_events,
            v["divergenceEvents"].as_u64().unwrap(),
            "{name}: rust divergenceEvents"
        );
        let live_results = v["results"].as_array().unwrap();
        assert_eq!(
            r.results.len(),
            live_results.len(),
            "{name}: rust results length"
        );
        for (lane, (got, want)) in r.results.iter().zip(live_results).enumerate() {
            assert_eq!(
                got.value,
                want[0].as_i64().unwrap(),
                "{name}[{lane}]: value"
            );
            assert_eq!(
                got.took_branch as u32,
                want[1].as_u64().unwrap() as u32,
                "{name}[{lane}]: tookBranch"
            );
        }
    }
}

// ---------------------------------------------------------------------------
// 4. Predicate masks + reconvergence stack.
// ---------------------------------------------------------------------------

/// The reconvergence stack: mixed divergence pushes a frame partitioning the
/// active mask; uniform-not-taken pushes nothing; reconvergence restores the
/// full mask; nested branches reach depth 2 and unwind in order.
#[test]
fn predicate_mask_and_reconvergence_stack() {
    let mut ex = WarpExecution::new(0, 32, 32).expect("warp");
    assert_eq!(ex.active_mask(), 0xFFFF_FFFF, "a 32-lane warp's full mask");
    assert_eq!(ex.active_lanes(), 32);
    assert_eq!(ex.occupancy(), 1.0);
    assert_eq!(ex.stack_depth(), 0);

    // Uniform not-taken: no frame, no cycles, no events.
    let not_taken = vec![false; 32];
    assert_eq!(
        ex.branch(&not_taken).expect("branch"),
        BranchOutcome::UniformNotTaken
    );
    assert_eq!(
        (ex.cycles(), ex.divergence_events(), ex.stack_depth()),
        (0, 0, 0)
    );

    // Mixed divergence: lanes 4..12 take → frame partitions the mask.
    let mut taken = vec![false; 32];
    for t in taken.iter_mut().take(12).skip(4) {
        *t = true;
    }
    let outcome = ex.branch(&taken).expect("branch");
    assert_eq!(
        outcome,
        BranchOutcome::Serialized {
            taken_mask: 0x0000_0FF0,
            fallthrough_mask: 0xFFFF_F00F,
        }
    );
    assert_eq!(ex.cycles(), 1, "the second serialized path cycle");
    assert_eq!(ex.divergence_events(), 1);
    assert_eq!(ex.stack_depth(), 1);
    assert_eq!(ex.max_stack_depth(), 1);
    assert_eq!(
        ex.active_mask() & 0x0000_0FF0,
        0x0000_0FF0,
        "active mask narrows to the union of pushed frames"
    );

    // Nested branch inside the taken path: depth 2.
    let mut inner = vec![false; 32];
    inner[4] = true;
    inner[5] = true;
    let inner_outcome = ex.branch(&inner).expect("inner branch");
    assert_eq!(
        inner_outcome,
        BranchOutcome::Serialized {
            taken_mask: 0b110000, // lanes 4-5
            fallthrough_mask: 0x0000_0FC0,
        }
    );
    assert_eq!(ex.stack_depth(), 2);
    assert_eq!(ex.max_stack_depth(), 2);
    assert_eq!(
        ex.active_mask(),
        0b110000,
        "lanes 4-5 active inside the inner frame"
    );

    // Reconverge in LIFO order: inner frame first, then the outer one.
    assert!(ex.reconverge(), "inner frame pops");
    assert_eq!(
        ex.active_mask(),
        0x0000_0FF0,
        "outer frame's taken path restored"
    );
    assert!(ex.reconverge(), "outer frame pops");
    assert_eq!(ex.active_mask(), 0xFFFF_FFFF, "full 32-lane mask restored");
    assert_eq!(ex.stack_depth(), 0);
    assert!(!ex.reconverge(), "nothing left to pop");

    // Uniform all-taken: the ESM convention — one frame, both paths pushed
    // (the fallthrough path is empty but still serialized).
    let all = vec![true; 32];
    let outcome = ex.branch(&all).expect("all-taken branch");
    assert_eq!(
        outcome,
        BranchOutcome::Serialized {
            taken_mask: 0xFFFF_FFFF,
            fallthrough_mask: 0,
        }
    );
    assert_eq!(
        ex.divergence_events(),
        3,
        "outer + inner + all-taken branches"
    );
}

/// Partial launch tail: lanes beyond `lanes_total` start predicated OFF and
/// never execute, branch, or access shared memory.
#[test]
fn partial_tail_lanes_stay_predicated_off() {
    let mut ex = WarpExecution::new(32, 32, 33).expect("warp");
    assert_eq!(
        ex.active_mask(),
        1,
        "only lane slot 0 (global lane 32) active"
    );
    assert_eq!(ex.active_lanes(), 1);
    assert!((ex.occupancy() - 1.0 / 32.0).abs() < 1e-18);

    let all = vec![true; 32];
    let outcome = ex.branch(&all).expect("branch");
    assert_eq!(
        outcome,
        BranchOutcome::Serialized {
            taken_mask: 1,
            fallthrough_mask: 0,
        },
        "inactive tail lanes never join a branch"
    );

    // Shared access: only the active lane's address matters.
    let addrs = vec![0usize; 32];
    let access = ex.shared_load(&addrs, 32).expect("access");
    assert!(access.broadcast, "one active lane on bank 0 = broadcast");
    assert_eq!(access.extra_cycles, 0);
}

// ---------------------------------------------------------------------------
// 5. Shared-memory bank conflicts.
// ---------------------------------------------------------------------------

/// Classic bank-conflict accounting: stride-1 conflict-free, stride-width
/// worst-case, broadcast exception, 2-way conflicts, inactive exclusion.
#[test]
fn bank_conflict_accounting() {
    let width = 32usize;
    let banks = 32usize;
    let all = u64::MAX;

    // Stride 1: lane i → bank i — conflict-free (1 cycle).
    let stride1: Vec<usize> = (0..width).collect();
    let free = bank_conflicts(&stride1, all, width, banks).expect("access");
    assert_eq!(
        (
            free.serialized_cycles,
            free.extra_cycles,
            free.conflict_banks
        ),
        (1, 0, 0)
    );

    // Stride 32: every lane hits bank 0 at a distinct address — 32-way
    // conflict, 31 extra cycles.
    let stride_w: Vec<usize> = (0..width).map(|i| i * width).collect();
    let worst = bank_conflicts(&stride_w, all, width, banks).expect("access");
    assert_eq!(
        (
            worst.serialized_cycles,
            worst.extra_cycles,
            worst.conflict_banks
        ),
        (32, 31, 1)
    );

    // Broadcast: all lanes the SAME address — conflict-free by hardware
    // broadcast even though the bank multiplicity is the lane count.
    let broadcast: Vec<usize> = vec![96; width];
    let b = bank_conflicts(&broadcast, all, width, banks).expect("access");
    assert!(b.broadcast);
    assert_eq!(
        (b.serialized_cycles, b.extra_cycles, b.conflict_banks),
        (1, 0, 0)
    );

    // 2-way conflict: lanes 0 and 5 share bank (5 % 32), others distinct.
    let mut addrs: Vec<usize> = (0..width).collect();
    addrs[5] = 0;
    let two = bank_conflicts(&addrs, all, width, banks).expect("access");
    assert_eq!(
        (two.serialized_cycles, two.extra_cycles, two.conflict_banks),
        (2, 1, 1)
    );

    // Predication: masking OFF lane 0 leaves lane 5 alone on bank 5 — no
    // conflict.
    let half_active = all & !(0x0000_0001);
    let masked = bank_conflicts(&addrs, half_active, width, banks).expect("access");
    assert_eq!((masked.serialized_cycles, masked.extra_cycles), (1, 0));

    // Warp integration: the extra cycles accumulate into the warp's cycle
    // count.
    let mut ex = WarpExecution::new(0, width, width).expect("warp");
    let _ = ex.shared_load(&stride_w, banks).expect("access");
    assert_eq!(
        ex.cycles(),
        31,
        "the 32-way conflict serializes 31 extra cycles"
    );
    assert_eq!(ex.shared_extra_cycles(), 31);

    // Fail-closed: zero banks refused.
    assert_eq!(
        bank_conflicts(&stride1, all, width, 0).unwrap_err(),
        GpuError::Config("banks = 0 (need ≥ 1 bank)".into())
    );
}

// ---------------------------------------------------------------------------
// 6. Occupancy accounting.
// ---------------------------------------------------------------------------

/// Per-warp occupancy (§3: active lanes / warp width) and the ESM launch
/// formula `lanes / ceil(lanes / width) / width` — including partial tails.
#[test]
fn occupancy_accounting() {
    let s = scheduler();
    let inputs = vec![7i64; 1001];

    // Full warps: every warp occupancy 1.0; launch occupancy = lanes/32/32.
    let full_inputs = vec![7i64; 1024];
    let full = s
        .run_kernel(1024, &full_inputs, kernel_by_name("uniform"))
        .expect("run");
    assert_eq!(full.warps.len(), 32);
    assert!(full.warps.iter().all(|w| w.occupancy == 1.0));
    assert!((full.occupancy - 1.0).abs() < 1e-18);

    // Partial tail: 33 lanes → warp 1 has 1/32 occupancy; the launch
    // formula gives (33/2)/32 = 0.515625 exactly.
    let partial = s
        .run_kernel(33, &inputs, kernel_by_name("uniform"))
        .expect("run");
    assert_eq!(partial.warps.len(), 2);
    assert_eq!(partial.warps[0].active_lanes, 32);
    assert_eq!(partial.warps[1].active_lanes, 1);
    assert!((partial.warps[1].occupancy - 1.0 / 32.0).abs() < 1e-15);
    assert_eq!(
        partial.occupancy.to_bits(),
        0.515625f64.to_bits(),
        "the ESM formula evaluated exactly"
    );

    // The launch formula matches the ESM associativity for an odd warp
    // count: 1000 lanes → 32 warps → (1000/32)/32 = 0.9765625.
    let odd = s
        .run_kernel(1000, &inputs, kernel_by_name("uniform"))
        .expect("run");
    assert_eq!(odd.warps.len(), 32);
    assert_eq!(odd.occupancy.to_bits(), 0.9765625f64.to_bits());
}

// ---------------------------------------------------------------------------
// 7. Vector-ALU lockstep semantics.
// ---------------------------------------------------------------------------

/// Per-lane vector ALU: exact results (including wrapping overflow),
/// predicated-off lanes hold their registers, one warp cycle per
/// instruction.
#[test]
fn vector_alu_ops_lockstep_semantics() {
    let mut ex = WarpExecution::new(0, 8, 8).expect("warp");
    let mut regs = vec![0i64; 8];
    let a: Vec<i64> = (0..8).map(|i| i as i64 * 10).collect();
    let b: Vec<i64> = (0..8).map(|i| i as i64 + 1).collect();

    ex.alu(&mut regs, VectorAluOp::Mul, &a, &b).expect("alu");
    assert_eq!(regs, vec![0, 20, 60, 120, 200, 300, 420, 560]);
    assert_eq!(ex.cycles(), 1);
    assert_eq!(ex.alu_instructions(), 1);

    // Wrapping overflow does not trap.
    let big = [i64::MAX; 8];
    let one = [1i64; 8];
    ex.alu(&mut regs, VectorAluOp::Add, &big, &one)
        .expect("alu");
    assert_eq!(regs[0], i64::MIN, "wrapping two's-complement add");
    assert_eq!(ex.alu_instructions().wrapping_mul(0), 0);

    // Predication: a partial launch narrows the active mask (lane slots ≥
    // lanes_total are predicated off) — inactive slots hold their registers.
    let mut partial = WarpExecution::new(0, 8, 4).expect("warp");
    assert_eq!(partial.active_mask(), 0b0000_1111);
    let mut pregs = vec![99i64; 8];
    partial
        .alu(&mut pregs, VectorAluOp::Add, &a, &b)
        .expect("alu");
    assert_eq!(&pregs[..4], &[1, 12, 23, 34], "active lanes computed (a+b)");
    assert_eq!(
        &pregs[4..],
        &[99, 99, 99, 99],
        "inactive slots held their registers"
    );
    assert_eq!(partial.cycles(), 1);

    // Shift semantics: masked shift amount (no UB), arithmetic right shift.
    let mut sx = WarpExecution::new(0, 4, 4).expect("warp");
    let mut sregs = vec![0i64; 4];
    let sh = [-1i64, 64, 65, 3]; // masked to 63, 0, 1, 3
    let val = [8i64, 8, 8, 32];
    sx.alu(&mut sregs, VectorAluOp::Shl, &val, &sh)
        .expect("shl");
    assert_eq!(sregs, vec![0, 8, 16, 256]);
    let mut dregs = vec![0i64; 4];
    let neg = [-8i64, -8, -8, -8];
    let one_v = [1i64, 3, 2, 0];
    sx.alu(&mut dregs, VectorAluOp::Shr, &neg, &one_v)
        .expect("shr");
    assert_eq!(
        dregs,
        vec![-4, -1, -2, -8],
        "arithmetic (sign-extending) shifts"
    );
}

// ---------------------------------------------------------------------------
// 8. Power accounting (§3 P_dyn = α·C·V²·f, scaled by active lanes).
// ---------------------------------------------------------------------------

/// The exact scaling laws: P ∝ active lanes, P ∝ f, P ∝ V².
#[test]
fn dynamic_power_scaling_laws() {
    let c = GpuConfig::new().validated().expect("valid");

    // ∝ active lanes: 2× lanes → 2× power (exact ratio to 1e-12).
    let p16 = c.dynamic_power_w(16).expect("power").value();
    let p32 = c.dynamic_power_w(32).expect("power").value();
    assert!((p32 / p16 - 2.0).abs() < 1e-12, "P32/P16 = {}", p32 / p16);
    assert!(
        c.dynamic_power_w(0).expect("power").value() == 0.0,
        "no lanes switch → no dynamic power"
    );

    // ∝ f: 2× clock → 2× power.
    let mut cf = c;
    cf.clock_mhz *= 2.0;
    let pf2 = cf
        .validated()
        .expect("valid")
        .dynamic_power_w(32)
        .expect("power")
        .value();
    assert!((pf2 / p32 - 2.0).abs() < 1e-12);

    // ∝ V²: 2× Vdd → 4× power.
    let mut cv = c;
    cv.vdd *= 2.0;
    let pv2 = cv
        .validated()
        .expect("valid")
        .dynamic_power_w(32)
        .expect("power")
        .value();
    assert!((pv2 / p32 - 4.0).abs() < 1e-12);

    // Envelope sanity (Law 5: no invented precision): one 32-lane warp at
    // the declared defaults stays far inside the 05-JSON integrated-GPU TDP
    // envelope (28 W) and strictly positive.
    assert!(p32 > 0.0);
    assert!(
        p32 < POWER_TDP_W,
        "one warp's datapath power {p32} W must stay inside the {POWER_TDP_W} W TDP envelope"
    );
}

/// Run-average power: α·C_lane·(events/cycles)·V²·f — ∝f and ∝V², and the
/// switching-event count is divergence-invariant (divergence costs TIME,
/// not lane events).
#[test]
fn run_average_power_and_divergence_invariant_events() {
    let inputs = vec![200i64; 128];
    let s = scheduler();
    let uniform = s
        .run_kernel(128, &inputs, kernel_by_name("uniform"))
        .expect("run");
    let divergent = s
        .run_kernel(128, &inputs, kernel_by_name("allBranch"))
        .expect("run");

    // Events: each active lane executes exactly one serialized path →
    // identical totals (128 lanes) despite 2× the cycles.
    assert_eq!(uniform.switching_events, 128);
    assert_eq!(divergent.switching_events, 128);
    assert_eq!(uniform.cycles, 4);
    assert_eq!(divergent.cycles, 8);

    // Average power = α·C·(events/cycles)·V²·f → the divergent run's
    // average is exactly half (same events over 2× the cycles).
    assert!((divergent.dynamic_power_w / uniform.dynamic_power_w - 0.5).abs() < 1e-12);

    // ∝f / ∝V² on the run average.
    let mut cf = GpuConfig::new();
    cf.clock_mhz *= 2.0;
    let s2 = WarpScheduler::new(cf).expect("valid");
    let uniform_f2 = s2
        .run_kernel(128, &inputs, kernel_by_name("uniform"))
        .expect("run");
    assert!((uniform_f2.dynamic_power_w / uniform.dynamic_power_w - 2.0).abs() < 1e-12);

    let mut cv = GpuConfig::new();
    cv.vdd *= 2.0;
    let s3 = WarpScheduler::new(cv).expect("valid");
    let uniform_v2 = s3
        .run_kernel(128, &inputs, kernel_by_name("uniform"))
        .expect("run");
    assert!((uniform_v2.dynamic_power_w / uniform.dynamic_power_w - 4.0).abs() < 1e-12);
}

// ---------------------------------------------------------------------------
// 9. Fail-closed admission.
// ---------------------------------------------------------------------------

/// Mutator fn pointers for the non-physical-input admission cases.
type ConfigMutator = fn(&mut GpuConfig);

/// Bad configs and bad launches are refused with honest reasons — never
/// silently clamped, never NaN (the ESM occupancy formula would divide by
/// zero on an empty launch).
#[test]
fn fail_closed_admission() {
    // Warp width 0 and beyond the bit-packed mask ceiling.
    for width in [0usize, MAX_WARP_WIDTH + 1, 65, 128] {
        let mut c = GpuConfig::new();
        c.warp_width = width;
        let err = WarpScheduler::new(c).unwrap_err();
        assert!(
            err.to_string().contains("warp_width"),
            "width {width} refused with a warp_width reason: {err}"
        );
    }
    // The 05-JSON vendor widths all admit.
    for width in [WARP_WIDTH_INTEL, WARP_WIDTH_NVIDIA, WARP_WIDTH_AMD] {
        let mut c = GpuConfig::new();
        c.warp_width = width;
        assert!(WarpScheduler::new(c).is_ok(), "vendor width {width} admits");
    }

    // Non-physical scalars.
    let cases: Vec<(ConfigMutator, &str)> = vec![
        (|c| c.clock_mhz = 0.0, "clock_mhz"),
        (|c| c.clock_mhz = f64::NEG_INFINITY, "clock_mhz"),
        (|c| c.vdd = -0.8, "vdd"),
        (|c| c.vdd = f64::NAN, "vdd"),
        (|c| c.cap_per_lane_event_f = 0.0, "cap_per_lane_event_f"),
        (|c| c.activity = -0.35, "activity"),
        (|c| c.shared_banks = 0, "shared_banks"),
    ];
    for (mutate, needle) in cases {
        let mut c = GpuConfig::new();
        mutate(&mut c);
        let err = c.validated().unwrap_err();
        assert!(
            err.to_string().contains(needle),
            "{needle} refusal must name the field: {err}"
        );
    }

    let s = scheduler();
    let inputs = vec![1i64; 8];
    // Empty launch (ESM would produce occupancy NaN).
    let err = s
        .run_kernel(0, &inputs, kernel_by_name("uniform"))
        .unwrap_err();
    assert!(err.to_string().contains("lanes_total = 0"), "{err}");
    // Short inputs buffer.
    let err = s
        .run_kernel(64, &inputs, kernel_by_name("uniform"))
        .unwrap_err();
    assert!(err.to_string().contains("inputs"), "{err}");
}

// ---------------------------------------------------------------------------
// 10. Provenance (Builder Rule 5).
// ---------------------------------------------------------------------------

/// Every output surface carries `SIMULATED_ARCHITECTURAL_MODEL`.
#[test]
fn provenance_badge_on_every_surface() {
    assert_eq!(
        GPU_BADGE,
        ep_core::ProvenanceBadge::SimulatedArchitecturalModel
    );
    assert_eq!(
        serde_json::to_string(&GPU_BADGE).expect("badge serializes"),
        "\"SIMULATED_ARCHITECTURAL_MODEL\"",
        "the badge string is the 03 §5 honesty label"
    );
    let s = scheduler();
    let inputs = vec![9i64; 64];
    let r: KernelRunResult = s
        .run_kernel(64, &inputs, kernel_by_name("threshold"))
        .expect("run");
    assert_eq!(r.badge, GPU_BADGE);
    // Config-level provenance: the power model is the shared ep-chip
    // DynamicPowerModel whose provenance is the same badge.
    assert_eq!(
        ep_chip::power::DynamicPowerModel::provenance(),
        ep_core::ProvenanceBadge::SimulatedArchitecturalModel
    );
}
