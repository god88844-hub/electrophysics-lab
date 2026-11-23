# Custom IC packages (WP-3.3)

`packager` compiles selected logic regions, arbitrary supported Layer-1
transistor graphs, and recursively composed IC instances into the pinned
`custom-ic.schema.json` format. The existing Phase 0 event engine is unchanged.

- `Packager::package_region`: select block IDs in a `LogicDiagram`. Selected
  IN/PROBE blocks and crossing wires define the pin boundary. Delays are
  extracted automatically; caller-edited delay defaults are ignored.
- `Packager::package_transistors`: retain the complete `TransistorNetlist`,
  solve every input state and directed one-pin transition, integrate supply
  energy, extract partition-crossing delays, and solve DC leakage. Repeat
  independently at half the timestep before assigning verification status.
- `Packager::package_circuit`: connect packaged instances using `Circuit`.
  Check the sub-IC DAG, pins, declared operating conditions and dependency
  seals. Compare the resulting black-box behavior with recursive flattening.
- `PackagedRegion::install`: atomically install generated leaves and the region.
  `CustomIcInstance` exposes pin states/transitions. `run_circuit` simulates
  pin stimuli through black-box or recursively flattened instances using the
  deterministic ep-logic queue (custom IC time resolution: 1 fs).
- `CustomIcPackage::from_json`: validate every declared constraint directly
  from the pinned schema, then executable-model invariants and the SHA-256
  content seal computed by `ep-core`. `reverify` reruns the internal reference
  and records VERIFIED or STALE using the 5% timing / 10% energy and leakage
  gates. Stale packages, modified children and cyclic inclusion cannot run.

Pins declare `L_k = k VDD/(R-1)`, R=2..8. Binary, ternary and Q4 use the named
schema domains; R=5..8 uses `analog` with explicit discrete `voltageLevelsV`
(the schema has no custom-radix enum). Connections require identical domains
and levels. Different domains can coexist in one circuit through correctly
characterized conversion ICs. No implicit radix conversion occurs.

`Footprint` holds parametric width, height and depth in micrometres and provides
millimetre conversion. `hd_footprint` reads SHA-verified reference-library 08
width/height; the caller declares depth. Custom package dimensions are explicit
user geometry, not inferred transistor layout or fabrication signoff.

`dynamicPower.wattsPerToggle` is the worst characterized one-input out-and-back
cycle energy in joules, equivalent to watts per cycle/second. `power_w(f)` adds
DC leakage and multiplies this coefficient by cycle rate. Directed transition
energies retain signed charge return to the rail. Binary leaves include
non-sensitized input activity from direct Layer-1 solves. Graph power counts
actual leaf input activity, including reconvergent events, once per delivery.
Wires are ideal; unspecified interconnect parasitics are not invented.

Q4 models preserve WP-3.2's stage-chain abstraction and unqualified-candidate
provenance. They are verified against that internal model, not a Q4 transistor
solve. Missing Q4 leakage remains `null`; total physical power requests return
`INSUFFICIENT_MODEL_DATA`. A new physical function/corner needs Layer-1 model
data. In particular an inverter is not used as a buffer, and a half-adder is
not passed off as the three-input full-adder.

Admission is fail closed: finite combinational graphs only, up to 1,024 states,
16,384 directed transitions, 1,024 instances, depth 64 and 250,000 events per
model/run; Layer-1 graphs have at most 64 nodes and 100,000 samples per solve.
Non-settling circuits, unsupported models, negative schema-unrepresentable
delays and out-of-envelope characterization are refused. Black-box instances
reject overlapping transitions; choose the flattened event solver for that
architectural waveform. No arbitrary waveform analog accuracy is claimed.

`with_progress` reports state/transition extraction and verification progress;
`Verification.status` and its measured errors supply the composer badge.
The app panel itself is outside this work package's explicit file isolation.

Oracles: `cargo test -p ep-logic --test packager_oracle -- --nocapture`.
