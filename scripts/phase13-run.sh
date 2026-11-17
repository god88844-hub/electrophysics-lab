#!/usr/bin/env bash
# Phase 13: REAL Yosys + ABC Sky130 Liberty mapping and Icarus HDL proof.
# This is a technology-mapping demonstration, NOT physical signoff.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="benchmarks/evidence/phase13"
SRC="$ROOT/source"
REPORT="$ROOT/tool-logs"
mkdir -p "$SRC" "$REPORT"
LIB="$SRC/sky130_fd_sc_hd__tt_025C_1v80.lib"
MAPPED="$ROOT/alu8-sky130-mapped.v"
ACCEPT="benchmarks/phase13/acceptance.json"
UPSTREAM_URL="$(node --input-type=module -e "import {readFileSync} from 'node:fs'; const a=JSON.parse(readFileSync('$ACCEPT')); process.stdout.write(a.library.sourceUrl)")"

# The OpenROAD flow-platform Liberty file is a real open SKY130 tt/25C/1.8V
# standard-cell library. Both commit SHA and upstream Git blob are pinned.
curl --fail --location --retry 3 --connect-timeout 20 --max-time 180 \
  --silent --show-error "$UPSTREAM_URL" -o "$LIB"
test "$(wc -c < "$LIB")" -eq 12800135
test "$(git hash-object "$LIB")" = "5773657fe730d984ac06726d0addfdad80395b9b"
echo "PHASE13 PINNED REAL SKY130 LIBERTY SOURCE VERIFIED"

# Exhaustive independent behavioral reference: all 2^18 combinations.
iverilog -g2012 -s alu8_tb -o "$ROOT/alu8-exhaustive.vvp" \
  benchmarks/phase13/rtl/alu8.v \
  benchmarks/phase13/rtl/alu8_spec.v \
  benchmarks/phase13/rtl/alu8_tb.v
vvp "$ROOT/alu8-exhaustive.vvp" | tee "$REPORT/exhaustive.log"
grep -Fxq "PHASE13 EXHAUSTIVE RTL PASS 262144/262144" "$REPORT/exhaustive.log"

# Real Yosys combinational equivalence with no invented reference values.
yosys -l "$REPORT/formal.log" -p "
  read_verilog benchmarks/phase13/rtl/alu8.v benchmarks/phase13/rtl/alu8_spec.v;
  proc;
  opt;
  equiv_make alu8_spec alu8 eq;
  hierarchy -top eq;
  equiv_simple;
  equiv_status -assert;
"
echo "PHASE13 RTL EQUIVALENCE PASS"

# Negative control MUST FAIL for the actual XOR→OR source-code bug.
# Reject mere syntax/command errors: an actual unproven equivalence is required.
if yosys -l "$REPORT/negative-control.log" -p "
  read_verilog benchmarks/phase13/rtl/alu8.v benchmarks/phase13/rtl/alu8_bad_spec.v;
  proc;
  opt;
  equiv_make alu8_bad_spec alu8 bad_eq;
  hierarchy -top bad_eq;
  equiv_simple;
  equiv_status -assert;
"; then
  echo "PHASE13 FAIL: broken reference incorrectly passed formal equivalence" >&2
  exit 1
fi
if ! grep -Eqi 'unproven|unmatched|not proven' "$REPORT/negative-control.log"; then
  echo "PHASE13 FAIL: negative-control returned error without proving actual inequality" >&2
  exit 1
fi
echo "PHASE13 EXPECTED XOR/OR MUTANT REJECTION PASS"

# Actual standard-cell technology mapping with Yosys ABC against the pinned
# real SkyWater Liberty file. A gate-level netlist is produced and archived.
yosys -l "$REPORT/mapping.log" -p "
  read_verilog benchmarks/phase13/rtl/alu8.v;
  synth -top alu8 -flatten;
  abc -liberty $LIB;
  clean;
  stat -liberty $LIB;
  write_verilog -noattr $MAPPED;
"
test -s "$MAPPED"
grep -q 'sky130_fd_sc_hd__' "$MAPPED"
echo "PHASE13 REAL SKY130 STANDARD-CELL MAPPING PASS"

# Only after all 4 independently executed gates pass do we emit evidence.
node scripts/phase13-capture.mjs
node scripts/phase13-strict.mjs
