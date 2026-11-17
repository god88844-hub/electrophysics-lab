#!/usr/bin/env bash
# Actual gate-level SAT against original mapped SKY130 cells and real Liberty functions.
# Boolean logic only: not setup/hold, placement, parasitics, DRC/LVS or silicon.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="benchmarks/evidence/phase17"
mkdir -p "$ROOT/tool-logs"
# The original Phase14 runner performs real Yosys synthesis, verifies source
# provenance, writes real SKY130 mapped cells and executes real OpenSTA.
bash scripts/phase14-run.sh > "$ROOT/tool-logs/phase14-prerequisite.log" 2>&1
LIB="benchmarks/evidence/phase14/source/sky130_fd_sc_hd__tt_025C_1v80.lib"
NET="benchmarks/evidence/phase14/alu8-sky130-mapped.v"
test "$(git hash-object "$LIB")" = "5773657fe730d984ac06726d0addfdad80395b9b"
grep -q 'sky130_fd_sc_hd__' "$NET"
for kind in positive mutant; do
  if test "$kind" = positive; then
    spec="benchmarks/phase13/rtl/alu8_spec.v"; mod=alu8_spec
  else
    spec="benchmarks/phase13/rtl/alu8_bad_spec.v"; mod=alu8_bad_spec
  fi
  sed -e "s|__SPEC__|$spec|g" -e "s|__MODULE__|$mod|g"     scripts/phase17-proof.ys > "$ROOT/tool-logs/$kind.ys"
  if yosys -l "$ROOT/tool-logs/$kind.log" -s "$ROOT/tool-logs/$kind.ys"       > "$ROOT/tool-logs/$kind.stdout" 2>&1; then
    if test "$kind" = mutant; then
      echo "FAIL: mapped-gate XOR/OR mutant was falsely proven equivalent" >&2
      exit 1
    fi
  else
    if test "$kind" = positive; then
      echo "FAIL: real mapped-gate positive proof failed" >&2
      tail -n 60 "$ROOT/tool-logs/$kind.log" >&2
      exit 1
    fi
  fi
done
node scripts/phase17-capture.mjs
node scripts/phase17-strict.mjs
