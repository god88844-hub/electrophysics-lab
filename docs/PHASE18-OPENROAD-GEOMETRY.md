# Phase 18 — genuine OpenROAD SKY130HD physical geometry (pre-signoff)

Independent actual-flow gate invokes a versioned Docker image of
[OpenROAD-flow-scripts](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts)
using the original 8-bit ALU RTL and existing explicitly hypothetical 20 ns SDC.
The flow executes real standard-cell technology synthesis, floorplanning,
legal placement and a **global-route wire guide**, archived with OpenDB native
databases and the runtime Docker image digest. An independent OpenROAD process
reopens the actual OpenDB and counts placed standard cells, nets, outputs, and
die geometry. SKY130HD routing adds two power BTerms to the original\n28 functional ALU ports (30 total BTerms); these are not new functional I/O. Source, results and logs are independently SHA-256 replayed.

The phase is separately synthesized by ORFS and is **not** a claim that its
mapped netlist has been proven identical to the Phase 17 mapped netlist.
Global-routing guides are **not detailed routed shapes**, extracted signoff
wire parasitics, physical DRC/LVS, power integrity, or fabrication proof.
Any alleged real-world build-success probability remains null. The SKY130
open experimental PDK is not an accredited foundry signoff flow.

To run: `bash scripts/phase18-run.sh` with Docker, Node 22+, and Git.
Image version: `openroad/orfs:26Q4-430-g2272e787c`; full SHA digest
is frozen to `7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71`,\nnot silently treated as latest.
