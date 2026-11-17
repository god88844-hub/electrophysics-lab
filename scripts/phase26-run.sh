#!/usr/bin/env bash
# Re-run actual original source-locked resistor chain. No physical ALU.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$PWD/benchmarks/evidence/phase26"
mkdir -p "$OUT/tool-logs"
bash scripts/phase25-run.sh > "$OUT/tool-logs/phase25-original-measured-source.log" 2>&1 || {
 tail -n 110 "$OUT/tool-logs/phase25-original-measured-source.log" >&2; exit 1;
}
node scripts/phase26-capture.mjs
node scripts/phase26-strict.mjs
