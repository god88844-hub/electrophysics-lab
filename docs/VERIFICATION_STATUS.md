# Verification status — audit ledger

> Snapshot of independently observed evidence through **2026-11-19**. This is a **software research evidence ledger**, not silicon validation or wafer authorization. Updated CI is the source of truth; a markdown badge never overrides genuine reports.

## Native Stage M evidence

| Case | Native CI source | Accepted finding | Scope limit |
| --- | --- | --- | --- |
| Four-cell native geometry | [#44533413910](https://github.com/god88844-hub/invention-lab/actions/runs/44533413910) | 4/4 Magic DRC zero, Netgen `Circuits match uniquely.`, authentic PEX, exact terminal counts | NOT ALU native verification |
| Same pinned model source | [#44536314808](https://github.com/god88844-hub/invention-lab/actions/runs/44536314808) | Real processed library retained and SHA checked | Named `mc` corner absent |
| Transitive statistical closure | [#44548482333](https://github.com/god88844-hub/invention-lab/actions/runs/44548482333) | 783 installed SPICE files inventoried with SHA-256; 150 in selected `tt` include closure, 0 unresolved | **0 active mismatch/process switch references and random expressions** |

## Native primitive acceptance

| Cell | DRC | Netgen top-level | Exact ports | PEX |
| --- | --- | --- | ---: | --- |
| `q4_thresh_det` | 0 errors | unique | 6/6 | present |
| `q4_inv` | 0 errors | unique | 6/6 | present |
| `q4_mux4` | 0 errors | unique | 8/8 | present |
| `q4_half_adder` | 0 errors | unique | 8/8 | present |

## Immutable source and artifact provenance

| Source or artifact | SHA-256 / commit |
| --- | --- |
| Original SkyWater `sky130_fd_pr` Git commit | `f62031a1be9aefe902d6d54cddd6f59b57627436` |
| Source-pinned `open_pdks` Git commit | `0c1f82326278a0871f0a1fc4bdacf94c88e78e4d` |
| Source-pinned Magic Git commit | `4205ad22bf919cc183af997b60c21140fd6d6fa9` |
| Real processed `sky130.lib.spice` SHA-256 | `4fcb2a538312de6f71c718c6be325fe865d5c4248a76dd5f7d2e8512df0d54ef` |
| Evidence ZIP, [#44548482333](https://github.com/god88844-hub/invention-lab/actions/runs/44548482333) | `4895669cee21f56bdbcb5ad1d88569344c223594c8673e936e095e3b0ddf84bb` |
| Transitive audit JSON, same run | `89014e4f6936a1e340eebc5059019fc956e95d78f9f34a9a323972b4fd850123` |
| Stage M provenance manifest, same run | `025ec0441a055d39f7191e6d2218b6f23a81012456e5d71e9127eed0c1f38f41` |

The source-pinned PDK has nine top-level processed sections (`tt sf ff ss fs ll hh hl lh`) and no native `mc` or `tt_mm`. A mismatch slope coefficient file or commented Spectre expression alone **cannot** authenticate real ngspice Monte Carlo.

## Safety and verification contracts

| Gate | Non-negotiable invariant | Current physical result |
| --- | --- | --- |
| SKY130 1.8 V core SOA | Every pair of Drain, Gate, Source, Bulk terminal voltages must remain **≤ 1.95 V**, including dynamic ripple samples | Four-terminal native transient proof NOT completed |
| PDK provenance | Source pin and SHA-256 for the model and every selected transitive dependency | Pinned original source and 783-file inventory verified |
| Geometry | All four primitives have zero Magic DRC errors | 4/4 passed |
| Nets | Terminal Netgen **top-level** LVS unique and exact noncollapsed port set; nested matches alone insufficient | 4/4 passed |
| Six hierarchical ALUs | Separate physical DRC, LVS and RC PEX for Binary/Ternary/Q4 × 4/8 digits | **0/6 verified**; source-built candidate netlists are not a pass |
| Statistical Level-1 | Real PDK randomness plus genuine trials, NM_L/NM_1/NM_2/NM_H, power, delay, Wilson 95% interval | **`INSUFFICIENT_MODEL_DATA`**; yield `UNKNOWN` |
| Physical Level-2 | Independent hardware/silicon evidence and authorized measurement-based signoff | **`UNQUALIFIED_NO_GO`** |
| Software Phase 0 | Native 4-cell gates + exact model-absence verification may PASS while retaining physical NO-GO | Evaluate on current CI HEAD; no release implied by this document |

## Hard rules for CI and public statements

- Never emit `VIRTUALLY_QUALIFIED` from 0 real trials, nominal `tt`, synthetic timing/yield, or an arbitrary 95% Wilson bound.
- Never convert `nativeLvsMatch=false` to true without actual six-ALU extraction and unique Netgen results.
- Never label `PHYSICALLY_QUALIFIED` without authorized independent real hardware measurements.
- Preserve the exact full 1.95 V SOA maximum and PDK/PEX evidence fingerprints.
- A software-only release is allowed to **PASS an expected fail-closed result**, only with an independently verified source-bound model-absence passport. This is not a relaxation of engineering safety.

For an actionable continuation, follow [CONTINUATION_GUIDE.md](CONTINUATION_GUIDE.md).
