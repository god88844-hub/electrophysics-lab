#!/usr/bin/env bash
# Run genuine OpenSTA at one TT/25 C/1.80 V corner, with fixed virtual-clock I/O budget.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="benchmarks/evidence/phase14"
mkdir -p "$ROOT/source" "$ROOT/tool-logs"
LIB="$ROOT/source/sky130_fd_sc_hd__tt_025C_1v80.lib"
NET="$ROOT/alu8-sky130-mapped.v"
URL="$(node --input-type=module -e "import {readFileSync} from 'node:fs'; console.log(JSON.parse(readFileSync('benchmarks/phase13/acceptance.json')).library.sourceUrl)")"
curl --fail --location --retry 3 --connect-timeout 20 --max-time 180 -sS "$URL" -o "$LIB"
test "$(wc -c < "$LIB")" -eq 12800135
test "$(git hash-object "$LIB")" = "5773657fe730d984ac06726d0addfdad80395b9b"
command -v yosys >/dev/null || { echo "Real Yosys missing" >&2; exit 1; }
command -v sta >/dev/null || { echo "Real OpenSTA missing" >&2; exit 1; }
yosys -l "$ROOT/tool-logs/yosys-mapping.log" -p "
  read_verilog benchmarks/phase13/rtl/alu8.v;
  synth -top alu8 -flatten;
  abc -liberty $LIB;
  clean;
  write_verilog -noattr $NET;
"
test -s "$NET"
grep -q sky130_fd_sc_hd__ "$NET"
# OpenSTA is run noninteractively; capture stderr as well as stdout.
# A reported pass requires a complete tool log with actual constrained paths.
sta -no_splash -exit scripts/phase14-sta.tcl > "$ROOT/tool-logs/sta.log" 2>&1
# Keep full executed STA output visible to reviewers even if evidence parsing fails.
cat "$ROOT/tool-logs/sta.log"
node scripts/phase14-capture.mjs
node scripts/phase14-strict.mjs
