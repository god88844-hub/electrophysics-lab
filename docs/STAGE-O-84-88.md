# Stage O — 3D Co-Invention foundations (Phases 84–88)

**Phase 0 software status: research tooling, NOT a calibrated silicon-yield optimizer.** Integration of this software stage is allowed only after the inherited CI matrix passes. All foundry-statistical/physical-correlation acceptance remains explicitly **OPEN**: Stage O yield optimization is `SYNTHETIC_ONLY` / model-based until a SHA-authenticated active statistical PDK, real post-layout ngspice trials and independent hardware data exist. Software merge never changes Level-1 `INSUFFICIENT_MODEL_DATA` or Level-2 `UNQUALIFIED_NO_GO`.

## Phase 84: structured co-inventor API
`stage-o-agent-tools.js` exposes a bounded schema of explicit scene-inspection, registered-component, parameter editing, port wiring, mm envelopes and injected-solver calls. Every editing plan runs on a cloned canonical diagram, with type and size validation, and needs a separate human approval action before the workspace is updated. The new 3D panel supports local JSON actions and parses prompts such as Q4 half-adders with >300 mV noise margin on SKY130. It **does not** call a language model or generate transistor-certified circuits automatically. It refuses to present SKY130 1.8 V standard models as validated 3.3 V Q4 transistors.

## Phase 85: topology hypotheses
A deterministic seeded batch generator perturbs bounded drive scaling, threshold selection, routing clearance, gate counts and pipeline depth. The fast prefilter provides 4/8-digit radix-2/3/4 arithmetic golden references; **functional equivalence remains unverified until an actual candidate RTL evaluator is supplied**. Expensive SPICE verification is adapter-based and never inferred from a reference-only test. A failed candidate is pruned before SPICE.

## Phase 86: stress and root-cause analysis
Separate guarded stress inputs cover supply droop, hotspots, timing skew, crosstalk and quantum noise. Diagnostics require explicit solver observations and declared units, node limits and 3D locations. They produce traceable *hypotheses*, not measured hardware failure reports; missing model data returns INSUFFICIENT_SOLVER_DATA. The regression fixture verifies a Q4 intermediate node drift from 2.20 V to 1.78 V at 95°C / SS with a 62 mV declared-window violation.

## Phase 87: constrained evolution
Deterministic seeded populations evolve around the last feasible candidate according to explicitly supplied objective metrics. Frequency, area, power, simulated thermal limits, noise margins and DRC are hard constraints. Candidate evaluation requires a separate simulator callback. Synthetic test evaluators are **not wafer yield models**. Even a user-supplied `calibratedFoundryYieldVerified: true` flag cannot authenticate a calibrated yield. The optimizer cannot self-issue a 60% -> 92% *physical* yield improvement; it returns UNKNOWN until independent foundry distributions, full ngspice runs, and verified layouts arrive.

## Phase 88: content-addressed ledger
Canonical diagram snapshots are SHA-256-addressed and branched, with deterministic stable JSON encoding and parent revision links. Per-version differences show changed components, wires, and declared performance metrics. Model-only DRC/thermal attributes are self-declared, and the calibrated build-success percentage remains UNKNOWN. The ledger is locally tamper-evident, **not** externally signed or tamper-proof.

## Critical acceptance limitations
The requested benchmark from <60% to >92% **calibrated** Monte Carlo yield is NOT established. At present there is no authenticated foundry variation distribution, verified Q4 transistor topology or real calibrated statistical validation. Claiming those figures would manufacture evidence. The existing Phase 30, 52, 54, and 72 physical fail-closed gates are unchanged. A successful test or PR does not authorize `PHYSICALLY_QUALIFIED`.

The 3D view's Stage O panel is a research interaction prototype. Automated cloud-agent connections, a production authenticated tool server, accepted transistor-level automatic circuit generation, hardware-tested adversarial runs, full Bayesian optimization and independent yield qualification remain outside this verified revision.

Run `node --test tests/stage-o-*.test.mjs`, `npm test` and the browser smoke on the staged branch. CI must pass on the final head across Windows, Linux, macOS and the existing 82+ repo workflows before even considering promotion.

## Reproducible toy-only optimization exercise

`node scripts/stage-o-synthetic-benchmark.mjs` runs 1,000 seeded Bernoulli *synthetic* trials per scenario and attempts a modeled improvement from below 60% to above 92%. These are **toy survival counts**, not foundry SPICE Monte Carlo results or calibrated wafer yield. The reported `simulatedPhysicalBuildSuccessPercent` remains `UNKNOWN`. This CI exercise cannot satisfy the original silicon-yield acceptance requirement.

The goal panel can also generate a deterministic, fully wired **ideal logic-lab half-adder** (inputs, radix-ADDN, constant-zero carry input and sum/carry probes) for binary, ternary or Q4. That circuit is a functional reference only: it contains **no verified transistor sizing, threshold implementation or noise-margin claim**, and does not automatically overwrite the active chip lab.
