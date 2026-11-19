# Invention Lab — developer and AI-agent continuation guide

This file defines an executable, **fail-closed** protocol for software and physical research. If a tool is unavailable locally, run the authorized CI toolchain and inspect authentic logs/artifacts. Never invent an output, bypass a failing check, or silently qualify hardware.

## 1. Reproduce the software baseline

```bash
git clone https://github.com/god88844-hub/invention-lab.git
cd invention-lab
git status --short
node --version
npm test
npm start
```

Open http://127.0.0.1:8080 and inspect Logic, Chip, 3D and Quantum labs. Read `package.json` before claiming additional build scripts. Run `npm test` before each PR and verify actual shell exit status.

## 2. Understand the evidence levels

**Software/source acceptance** confirms that code and explicitly scoped native DRC/LVS/PEX tests executed and that unavailable evidence is reported honestly. It cannot grant Level-1 foundry qualification, physical yield or fabrication permission.

- Stage M qualified **four standalone primitives** with native Magic/Netgen/PEX and exact terminal counts. Files: `designs/stage-m/q4-candidates/*.spice`, `scripts/stage-m-magic-layout.tcl`, `scripts/stage-m-postroute-placement.py`, `scripts/stage-m-routing-plan.py`, `scripts/stage-m-validate-lvs.py`.
- `scripts/stage-m-pdk-transitive-audit.py` hashes all installed SPICE files and traverses selected dependencies. `scripts/stage-m-phase0-acceptance.py` confirms only the **source-pinned absent-statistical-model** case as an expected software PASS.
- `scripts/stage-m-mm-corner-audit.mjs` remains a strict scientific intake for future authenticated active statistical models. Never replace its true model requirement with a fake `.lib mc`.
- The six ALU builders in `scripts/stage-m-alu-assemble.py` currently produce *candidate* netlists. Their `nativeLvsMatch` flags remain `false`.
- Run records are accessible from `.github/workflows/stage-m-native-eda.yml`, `benchmarks/evidence/`, and [VERIFICATION_STATUS.md](VERIFICATION_STATUS.md).

## 3. Static preflight (no local EDA binary required)

```bash
python3 -m py_compile scripts/stage-m-pdk-transitive-audit.py scripts/stage-m-phase0-acceptance.py
python3 -m unittest discover -s tests -p 'stage_m_*test.py'
node --test tests/stage-m-q4-sources.test.mjs tests/stage-m-native-monte-carlo.test.mjs
bash -n scripts/stage-m-native-eda.sh
npm test
```

Physical tools, PDK models, GDS extraction, and genuine Monte Carlo should be tested inside the pinned native GitHub Actions workflow. **Do not** make their absence locally a reason to skip required native CI acceptance or fake reports.

## 4. Reproduce the pin-locked native verification

Inspect `.github/workflows/stage-m-native-eda.yml`. It uses pinned Magic `4205ad22bf919cc183af997b60c21140fd6d6fa9`, `open_pdks` `0c1f82326278a0871f0a1fc4bdacf94c88e78e4d` and SkyWater devices `f62031a1be9aefe902d6d54cddd6f59b57627436`; Ubuntu runner provisions `magic`, `netgen`, `ngspice`.

```bash
# Requires authenticated gh CLI and repo access
gh workflow list --repo god88844-hub/invention-lab
gh run list --repo god88844-hub/invention-lab --limit 20
gh pr checks 94 --repo god88844-hub/invention-lab
gh run view 44548482333 --repo god88844-hub/invention-lab --log
```

Inspect **the most recent head SHA's checks**, not a successful run on an obsolete branch. Native reports require all four zero DRC files, full top-level Netgen unique match, exact external pins, nonempty extracted PEX, and SHA-256 cross-checks. `source-manifest.json` must keep `soaLimitV=1.95` and `level2=UNQUALIFIED_NO_GO`.

## 5. Frontier 1 — authenticated statistical model

1. Discover a **genuine** upstream source that natively contains the missing active combined statistical model. Do not assert a source release exists without checking exact commit and processed outputs.
2. SHA-pin every source and transitive `.lib` / `.include`; rerun native PDK build, `stage-m-pdk-transitive-audit.py`, both switch checks and ngspice seeded variation sanity checks.
3. Prove separately that real `gauss`/`agauss` is active and that both `mc_mm_switch` and `mc_pr_switch` are genuinely enabled. Plain `tt` cannot masquerade as `mc`.
4. Execute real four-terminal D/G/S/B waveforms across 1.8 V ±5% and 1.65 V ±10% supply envelopes, temperatures -40/25/85/125 °C, keeping worst pairwise voltages **≤ 1.95 V**. Files: `scripts/stage-m-soa-waveform-capture.py`, `scripts/stage-m-four-terminal-soa.py`.
5. Materialize and run all 4,000 Q4 primitive + 2,400 ALU trials from authentic source-bound PEX, with `scripts/stage-m-trial-decks.py` and `scripts/stage-m-parallel-ngspice.py`. Enforce engineering thresholds, real yield numerator/denominator, Wilson 95% confidence interval. No dummy samples.

## 6. Frontier 2 — real physical ALUs

1. Build six separate hierarchical physical top cells (Binary/Ternary/Q4 × 4/8 digits); route bottom-up with explicit `met2`, `met3`, true Magic pins and ≥2 µm spacing.
2. For **each** physical ALU: run Magic `drc check` to zero; perform terminal Netgen `Circuits match uniquely` with unique exact pins; extract actual `ext2spice cthresh 0 rthresh 0` netlists; rehash `.gds`, `.mag`, `-pex.spice`, DRC and LVS reports.
3. Only genuine native reports may flip `nativeLvsMatch` or `aluInterconnectPexVerified`; never count the primitive mux PEX used in a candidate ALU as proof of routed ALU interconnect.
4. Update Stage O Phase 87 optimizer from model-only to post-layout SPICE only after actual authenticated PDK and physical ALU measurements exist.

## 7. Frontier 3 — external hardware

Add opt-in Qiskit hardware integrations and provenance; implement and independently test full RISC-V Linux boot beyond the current functional virtual monitor. Acquire FPGA/Yosys, SCPI/sigrok, oscilloscope and eventually fabricated die/wafer measurements with reference traces, uncertainty, environmental settings, independent holdouts and human engineering signoff. Keep the user-visible status `UNQUALIFIED_NO_GO` until a **particular design** receives authorized physical qualification.

## 8. Merge and release protocol

1. Work in a feature branch and open a PR; preserve existing historical commit ancestry and source metadata.
2. Check all unit tests, per-stage workflow matrices and native evidence at **the current PR head**. Do not mark a failure green because the requested feature's scientific input is missing; instead explicitly qualify *a fail-closed software result* in its own acceptance test.
3. Merge Stage M, then Stage N, O, P, Q, in order; rebase/retarget each PR to `main`, resolve actual conflicts, require all checks green, and record merge SHAs.
4. Land the release docs and independently run `main` CI for the final commit. A source-only release may receive an annotated `v1.0.0-invention-lab-software` tag **only after checks pass**. Never use tag existence as safety signoff.
5. Keep model availability, trial counts, Level-1, Level-2 and physical evidence identities visible and honest in all future PR bodies, dashboards and release notes.
