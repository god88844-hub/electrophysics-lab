# Phase 17 — mapped-gate functional equivalence

The previous Yosys formal comparison proved only *RTL against independent RTL*.
This stage checks the **actual synthesized and Liberty-mapped SKY130 ALU gate
netlist** against the separately written `alu8_spec` module. Yosys imports
real source-pinned Liberty **functional Boolean equations** (not blackboxes),
expands mapped cells and uses SAT-based `equiv_simple` with
`equiv_status -assert`. The second proof must **reject** the separately
authored XOR-to-OR fault (`alu8_bad_spec`). Both proofs must execute against
the *same* mapped cell netlist; unit-test fixtures cannot substitute for logs.

Run `bash scripts/phase17-run.sh` on a system with `yosys`, `sta`, `git`
and `curl`. This regenerates real Phase 14 mapped gates and independent
timing prerequisites, runs positive and negative SAT jobs, hashes all outputs,
and independently reopens the original transcripts and pins. Original data,
generated SAT scripts, Yosys logs and verdict are archived by the Phase 17 CI.

A successful Boolean proof is **not** a post-layout circuit, actual setup/hold
timing closure, powered simulation, analog accuracy, DRC, LVS, measured silicon,
or physical failure-rate/yield calibration. Physical verdict is *unknown* and
manufacturing-success probability is *not estimated*. The Open SKY130 PDK is
an experimental preview, not a production-qualified substitute for fabrication.
