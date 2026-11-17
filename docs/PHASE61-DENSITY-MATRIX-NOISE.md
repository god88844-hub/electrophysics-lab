# Phase 61 — Bounded quantum noise and density matrices

Three-qubit maximum dense complex density matrices, Kraus channels for amplitude damping, dephasing and depolarizing, correct target-qubit embedding, trace/Hermitian checks and completeness of Kraus operators. Exact tests cover Bell coherence, damping, pure and mixed states.

This is a mathematical noise simulator with assumed channel rates. The construction keeps positive semidefiniteness for supported valid inputs; this is not a general quantum state tomography or physical hardware calibration workflow. No real quantum device has been measured. All reported hardware error rates remain unknown.

Run `node --test tests/phase61-density-noise.test.mjs`, `node scripts/phase61-run.mjs`, `node scripts/phase61-strict.mjs`, `npm test`.
