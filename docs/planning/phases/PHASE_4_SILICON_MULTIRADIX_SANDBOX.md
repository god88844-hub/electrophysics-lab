# PHASE 4 — Silicon Multi-Radix Sandbox

## Sub-phase 4.1 — Interactive 3D Transistor/Gate/Wire Sandbox
- Drag-and-drop SKY130 transistor/gate primitives on a 3D substrate
- Live electrical simulation via the physics daemon

## Sub-phase 4.2 — True-Geometry 3D Viewer for the 4 Verified SKY130A Q4 Primitives
- Load the 4 verified Q4 primitive layouts (DRC=0, LVS ✓, PEX ✓) from Phase 0
- Layer peel: li1 → met1 → met2 → met3 → met4 → met5
- Zoom from die → cell → transistor → atom

## Sub-phase 4.3 — Bottom-Up Native Magic/Netgen DRC/LVS/PEX for 6 ALUs
- Binary (radix-2), ternary (radix-3), quaternary (radix-4) ALU designs
- Native Magic DRC → Netgen LVS → RC PEX (same toolchain as Phase 0 primitives)
- 6 ALUs: binary 8-bit, binary 16-bit, ternary balanced, ternary unbalanced, Q4 nibble, Q4 byte

## Sub-phase 4.4 — Optional Authenticated Statistical PDK Ingestion Gate
- Statistical PDK models (corner/monte-carlo) are INGESTED, not shipped
- Requires authenticated access to the foundry's statistical model files
- Gate: Level-1 INSUFFICIENT_MODEL_DATA until real statistical expressions are loaded
