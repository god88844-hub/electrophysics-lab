#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Fully replay Phase14's actual synthesis and strictly verified TT timing.
bash scripts/phase14-run.sh >/dev/null
OUT="benchmarks/evidence/phase15"
mkdir -p "$OUT/logs"
cases=(
  "0 0.05 0.005"
  "1 0.05 0.01"
  "2 0.05 0.02"
  "3 0.1 0.005"
  "4 0.1 0.01"
  "5 0.1 0.02"
  "6 0.2 0.005"
  "7 0.2 0.01"
  "8 0.2 0.02"
)
for entry in "${cases[@]}"; do
  read -r id slew load <<<"$entry"
  # NO shared STA state across cases. stdout+stderr are immutable raw evidence.
  PHASE15_ID="$id" PHASE15_SLEW="$slew" PHASE15_LOAD="$load" \
    sta -no_splash -exit scripts/phase15-case.tcl >"$OUT/logs/case-$id.log" 2>&1
done
node scripts/phase15-capture.mjs
node scripts/phase15-strict.mjs
