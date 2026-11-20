# Roadmap Master — Phase 0A → 6 Dependency DAG

Phases are ordered by data dependencies (arrows = "requires outputs of").
Each phase's granular playbook lives in `phases/`; every WP-X.Y is tracked in
`05_ACCEPTANCE_LEDGER.md`.

```
Phase 0A (CI + Plan + Vault lock)
   └─▶ Phase 01 (Desktop CAD shell + Rust kernel core)
          └─▶ Phase 02 (Silicon physics + forensics; ngspice oracle)
                 └─▶ Phase 03 (Multi-radix logic + custom ICs)
                        └─▶ Phase 04 (Chips/SoC + live software; QEMU/ONNX oracles)
                               └─▶ Phase 05 (Quantum + hybrid studio)
                                      └─▶ Phase 06 (Academy + Co-Inventor + release installer)
```

Cross-cutting (any phase): Phase 30/39 provenance gates must stay green;
Phase 0 regression suite (1054+) must stay green; honesty badges per Law 5.

## Phase dependency notes

- **0A** unlocks everything: the data vault + schemas + ledger are the
  contract all later WPs cite.
- **01** delivers the kernel skeleton (`ep-core` admission, `eplab` project
  I/O, undo/redo) — 02..05 all commit through its command-pattern pipeline.
- **02** produces the ngspice-verified MNA + implicit thermal core that 03
  (cell characterization) and 04 (tile power) consume.
- **03** produces custom-IC macro-models that 04 instantiates as SoC blocks.
- **04** produces the SoC digital twin whose tile telemetry 05's hybrid
  control chips and 06's Academy missions reference.
- **05** quantum rig outputs feed 06's academy grading and the cryo quench
  forensics shared with 02's thermal path.
- **06** is release engineering: installer reproducibility verified against
  the Phase 39 source-baseline ZIP.
