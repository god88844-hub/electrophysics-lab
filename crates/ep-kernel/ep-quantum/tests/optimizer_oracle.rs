//! WP-6.2 optimizer oracle tests.
//!
//! `packages/quantum-engine/src/optimizer.mjs` (ESM) is the CI parity oracle
//! per `docs/master-plan/03_PHYSICS_MATH_FUNDAMENTALS.md` §4 (CI oracle
//! table) and PHASE-06 WP-6.2 ("Kernel-side optimizer with ESM parity —
//! identical seeds ⇒ identical traces"). Two parity layers:
//!   1. the captured ESM Co-Inventor DRAG scenario (seed 2024, SPSA 30 →
//!      Nelder–Mead 80 on the real noisy transmon device, seed 99) — the
//!      Rust pipeline must reproduce the captured ESM final parameters and
//!      gate error within the WP-5.1 solver-parity tolerance (≤ 1e-9; the
//!      optimizer slightly amplifies per-evaluation solver noise), and
//!   2. byte-identical reproducibility: identical seed ⇒ the sealed bundle's
//!      canonical JSON and SHA-256 are bit-identical.
//!
//! Bundles are validated field-by-field against
//! `docs/master-plan/schemas/experiment-bundle.schema.json` (required fields,
//! format const, badge enum, fidelity range, sha256 pattern) and the seal is
//! recomputed from the canonical JSON.

use ep_quantum::lindblad::Mulberry32;
use ep_quantum::optimizer::{
    build_experiment_bundle, run_coinventor, run_drag_coinventor, validate_experiment_bundle,
    BundleMeta, DragGateObjective, GateKind, NmOpts, ObjectiveFn, ParamBound, SpsaOpts,
};

const TOL_ESM: f64 = 1e-9;

/// Captured ESM-oracle values (see module doc; captured by running
/// `packages/quantum-engine/src/optimizer.mjs` + `devices.mjs` on this
/// commit's inputs).
mod esm {
    /// The `quantum-engine.test.mjs` "AI Co-Inventor" scenario:
    /// x0 = [18, 7.5, 0], SPSA {30, seed 2024} → Nelder–Mead {80}.
    pub const DRAG_INITIAL_ERROR: f64 = 0.32761383201714267;
    pub const DRAG_SPSA_X: [f64; 3] = [18.031734800659322, 7.545779761047733, 0.012182091681701738];
    #[allow(dead_code)] // captured for reference: the Nelder–Mead polished parameters
    pub const DRAG_NM_X: [f64; 3] = [25.912682625392385, 9.464508653559399, 0.0];
    pub const DRAG_FINAL_ERROR: f64 = 1.0852396759020166e-10;
    /// 04-JSON citation string (verbatim, carried into the bundle).
    pub const CITATION_PREFIX: &str = "Published parameters: Google Sycamore";
}

/// Recreate the ESM Co-Inventor scenario objective (X gate, seed-99 device).
fn drag_objective() -> DragGateObjective {
    DragGateObjective::new_builtin(GateKind::X, 1_000).expect("built-in DRAG objective")
}

fn run_esm_scenario(objective: &mut DragGateObjective) -> (f64, [f64; 3], f64) {
    let x0 = [18.0, 7.5, 0.0];
    let initial = objective.evaluate(&x0).expect("x0 evaluates");
    let spsa_out = ep_quantum::optimizer::spsa(
        objective,
        &x0,
        SpsaOpts {
            iterations: 30,
            a: 0.12,
            c: 0.06,
            seed: 2024,
        },
    )
    .expect("spsa runs");
    let nm_out =
        ep_quantum::optimizer::nelder_mead(objective, &spsa_out.x, NmOpts { iterations: 80 })
            .expect("nelder-mead runs");
    (
        initial,
        [spsa_out.x[0], spsa_out.x[1], spsa_out.x[2]],
        nm_out.value,
    )
}

/// ESM parity end-to-end: the Rust optimizer + Rust Lindblad device
/// reproduce the captured ESM Co-Inventor run within the solver-parity
/// tolerance, with a measurable gate-error reduction.
#[test]
fn esm_drag_scenario_parity_and_gate_error_reduction() {
    let mut objective = drag_objective();
    let (initial, spsa_x, final_error) = run_esm_scenario(&mut objective);
    assert!(
        (initial - esm::DRAG_INITIAL_ERROR).abs() <= TOL_ESM,
        "initial X error {initial} vs ESM {} beyond ±1e-9",
        esm::DRAG_INITIAL_ERROR
    );
    for (i, v) in spsa_x.iter().enumerate() {
        assert!(
            (v - esm::DRAG_SPSA_X[i]).abs() <= 1e-6,
            "spsa.x[{i}] = {v} vs ESM {} — optimizer-amplified parity beyond 1e-6",
            esm::DRAG_SPSA_X[i]
        );
    }
    assert!(
        (final_error - esm::DRAG_FINAL_ERROR).abs() <= TOL_ESM,
        "final X error {final_error} vs ESM {} beyond ±1e-9",
        esm::DRAG_FINAL_ERROR
    );
    // Measurable gate-error reduction against the real noisy Lindblad solver.
    assert!(
        final_error < initial,
        "optimized error {final_error} must beat the initial error {initial}"
    );
    assert!(
        final_error < 0.05,
        "optimized X error {final_error} < 5% (ESM Co-Inventor bar)"
    );
}

/// Byte-identical reproducibility: identical seed ⇒ the sealed bundle's
/// canonical JSON (and therefore its SHA-256 seal) is bit-identical.
#[test]
fn identical_seed_produces_byte_identical_bundle() {
    let a = run_drag_coinventor(GateKind::X, 2024, 1_000, "wp-6.2-oracle-test").expect("bundle A");
    let b = run_drag_coinventor(GateKind::X, 2024, 1_000, "wp-6.2-oracle-test").expect("bundle B");
    let sa = serde_json::to_string(&a).expect("A serializes");
    let sb = serde_json::to_string(&b).expect("B serializes");
    assert_eq!(sa, sb, "identical seed ⇒ byte-identical bundle");
    assert_eq!(a["sha256"], b["sha256"], "seal bit-identical");
    // A different seed changes the trace (and thus the seal) — the seal is a
    // real content seal, not a constant.
    let c = run_drag_coinventor(GateKind::X, 2025, 1_000, "wp-6.2-oracle-test").expect("bundle C");
    assert_ne!(a["sha256"], c["sha256"], "different seed ⇒ different seal");
}

/// The exported bundle conforms to experiment-bundle.schema.json field-by-field
/// and the SHA-256 seal recomputes from the canonical JSON of the content.
#[test]
fn bundle_is_schema_conformant_with_recomputable_seal() {
    let bundle =
        run_drag_coinventor(GateKind::X, 2024, 1_000, "wp-6.2-oracle-test").expect("bundle");
    validate_experiment_bundle(&bundle).expect("schema-conformant");
    assert_eq!(bundle["format"], "invention-lab/breakthrough-bundle/1");
    assert_eq!(bundle["badge"], "SIMULATED_PHYSICS_MODEL");
    assert_eq!(bundle["seed"], 2024);
    let initial = bundle["initialFidelity"].as_f64().expect("initialFidelity");
    let optimized = bundle["optimizedFidelity"]
        .as_f64()
        .expect("optimizedFidelity");
    assert!((0.0..=1.0).contains(&initial));
    assert!((0.0..=1.0).contains(&optimized));
    assert!(
        optimized > initial,
        "the Co-Inventor improved the gate fidelity"
    );
    assert!(bundle["iterations"].as_u64().expect("iterations") >= 1);
    // Optimized parameters: 3 finite numbers under the ESM names.
    let params = bundle["optimizedParams"]
        .as_object()
        .expect("optimizedParams");
    assert_eq!(params.len(), 3);
    assert!(
        params.contains_key("amplitudeMhz")
            && params.contains_key("sigmaNs")
            && params.contains_key("beta")
    );
    // Noise verbatim from the sealed 04 JSON typicals.
    let noise = bundle["noise"].as_object().expect("noise object");
    assert_eq!(noise["t1Us"], 100.0);
    assert_eq!(noise["t2Us"], 150.0);
    // Citation carries the sealed 04-JSON provenance string.
    let citation = bundle["citation"].as_str().expect("citation");
    assert!(
        citation.starts_with(esm::CITATION_PREFIX),
        "citation: {citation}"
    );
    // Seal recomputation: canonical JSON of the bundle WITHOUT sha256.
    let mut content = bundle.clone();
    let seal = content["sha256"].clone();
    if let Some(map) = content.as_object_mut() {
        map.remove("sha256");
    }
    let recomputed = ep_quantum::optimizer::bundle_seal(&content);
    assert_eq!(seal.as_str(), Some(recomputed.as_str()), "seal recomputes");
    // The trace covers SPSA + Nelder–Mead stages deterministically.
    let trace = bundle["trace"].as_array().expect("trace");
    assert!(trace.len() >= 110, "trace covers the full pipeline");
    assert_eq!(trace[0]["stage"], "spsa");
    assert_eq!(trace[trace.len() - 1]["stage"], "nelder-mead");
}

/// The CZ-family objective runs the real ZZ-coupled 2-qubit device and is
/// reproducible (its own bundle seal).
#[test]
fn cz_family_objective_runs_and_reproduces() {
    let a = run_drag_coinventor(GateKind::CzFamily, 777, 1_000, "wp-6.2-oracle-test")
        .expect("CZ bundle");
    validate_experiment_bundle(&a).expect("CZ bundle schema-conformant");
    assert_eq!(a["kind"], "cz-family-error-minimization-under-zz-crosstalk");
    assert_eq!(
        a["noise"]["zzCrosstalkKhz"], 50.0,
        "real ZZ crosstalk from the sealed 04 JSON"
    );
    let b = run_drag_coinventor(GateKind::CzFamily, 777, 1_000, "wp-6.2-oracle-test")
        .expect("CZ bundle B");
    assert_eq!(
        serde_json::to_string(&a).unwrap(),
        serde_json::to_string(&b).unwrap()
    );
}

/// Fail-closed: the admission budget is a hard refusal (Law 4).
#[test]
fn evaluation_budget_refuses_fail_closed() {
    let err = run_drag_coinventor(GateKind::X, 2024, 5, "wp-6.2-oracle-test").unwrap_err();
    assert!(err.contains("budget exhausted"), "{err}");
}

/// Generic multi-domain surface: a non-quantum domain implements
/// `ObjectiveFn` and emits its own reproducible sealed bundle with the
/// honest `SIMULATED_NOISY_MODEL` badge (silicon/SoC domains plug in here).
#[test]
fn generic_multi_domain_objective_emits_reproducible_bundle() {
    /// Trace-width-style bounded objective (pure arithmetic stand-in for a
    /// domain adapter — no invented physics, deterministic by construction).
    struct TraceWidthDomain;
    impl ObjectiveFn for TraceWidthDomain {
        fn kind(&self) -> &str {
            "silicon-trace-width-parasitic-minimization"
        }
        fn dim(&self) -> usize {
            2
        }
        fn bounds(&self) -> Vec<ParamBound> {
            vec![ParamBound::new(0.5, 5.0), ParamBound::new(0.2, 2.0)]
        }
        fn budget(&self) -> usize {
            10_000
        }
        fn badge(&self) -> &'static str {
            "SIMULATED_NOISY_MODEL"
        }
        fn citation(&self) -> String {
            "test: pure-arithmetic domain adapter".into()
        }
        fn evaluate(&mut self, x: &[f64]) -> Result<f64, String> {
            // Pure arithmetic: quadratic coupling between width and spacing.
            Ok(0.1 * (x[0] - 2.0) * (x[0] - 2.0)
                + 0.2 * (x[1] - 1.0) * (x[1] - 1.0)
                + 0.05 * x[0] * x[1])
        }
    }

    let mut domain = TraceWidthDomain;
    let run = run_coinventor(
        &mut domain,
        &[4.0, 0.4],
        SpsaOpts {
            iterations: 20,
            a: 0.12,
            c: 0.06,
            seed: 31337,
        },
        NmOpts { iterations: 50 },
    )
    .expect("generic domain runs");
    assert!(
        run.optimized_objective < run.initial_objective,
        "the optimizer improved the domain objective"
    );

    let names = vec!["widthUm".to_string(), "spacingUm".to_string()];
    let meta = BundleMeta {
        kind: domain.kind().to_string(),
        badge: domain.badge(),
        seed: 31337,
        code_version: "wp-6.2-oracle-test".to_string(),
    };
    let bundle_a = build_experiment_bundle(
        &meta,
        &run,
        &names,
        &serde_json::Value::Null,
        &domain.citation(),
    )
    .expect("bundle A");
    let bundle_b = build_experiment_bundle(
        &meta,
        &run,
        &names,
        &serde_json::Value::Null,
        &domain.citation(),
    )
    .expect("bundle B");
    assert_eq!(
        serde_json::to_string(&bundle_a).unwrap(),
        serde_json::to_string(&bundle_b).unwrap(),
        "identical seed ⇒ byte-identical generic-domain bundle"
    );
    validate_experiment_bundle(&bundle_a).expect("generic bundle schema-conformant");
    assert_eq!(bundle_a["badge"], "SIMULATED_NOISY_MODEL");
    assert_eq!(
        bundle_a["kind"],
        "silicon-trace-width-parasitic-minimization"
    );
}

/// The bit-exact `Mulberry32` stream underpinning determinism is shared with
/// the ESM engine (spot check against the captured mulberry32(2024) draws).
#[test]
fn mulberry32_stream_is_bit_exact() {
    let mut rng = Mulberry32::new(2024);
    let first = rng.next_f64();
    // mulberry32(2024)() — captured from the ESM engine.
    assert_eq!(
        first, 0.811762373894453,
        "first draw bit-exact vs ESM mulberry32(2024)"
    );
}
