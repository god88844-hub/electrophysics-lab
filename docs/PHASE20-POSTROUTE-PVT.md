# Phase 20 — real TT/SS/FF source-locked cell PVT on the routed SKY130 ALU

Rebuild the actual Phase 19 detailed-routed ALU, verify real wire extraction
from the routed OpenDB using the OpenRCX rules, then use three independent
OpenROAD/OpenSTA processes with authentic SkyWater TT 25C/1.80V,
SS 100C/1.60V and FF -40C/1.95V Liberty files. Libraries come from
FOSSi skywater-pdk-libs-sky130_fd_sc_hd revision
9cb2d7cb8ed4619094263614039a61b6b2d22a88, with frozen SHA256,
Git blob and sizes. All three use the SAME original OpenDB, SDC and
TT-extracted SPEF. Each independently reports ten bounded maximum
timing paths, and evidence is independently SHA-replayed against
the real source, binary OpenDB, extracted RC and raw tool logs.

This is a source-pinned single-wire-RC-view combinational timing model,
not all physical corners, not accurate sequential setup/hold signoff,
not independent production-qualified foundry DRC/LVS and not physical
manufacturing evidence. Physical validation stays none, real silicon
verdict unknown, build-success percentage null.
