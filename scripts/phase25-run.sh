#!/usr/bin/env bash
# Publish real source-locked resistor discrepancy, never ALU silicon calibration.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$PWD/benchmarks/evidence/phase25"
mkdir -p "$OUT/tool-logs"
bash scripts/phase23-run.sh > "$OUT/tool-logs/phase23-source-replay.log" 2>&1 || {
 tail -n 90 "$OUT/tool-logs/phase23-source-replay.log" >&2; exit 1;
}
node scripts/phase24-run.mjs > "$OUT/tool-logs/phase24-no-hardware.log" 2>&1 || {
 tail -n 90 "$OUT/tool-logs/phase24-no-hardware.log" >&2; exit 1;
}
node scripts/phase24-strict.mjs >> "$OUT/tool-logs/phase24-no-hardware.log"
node scripts/phase25-capture.mjs
node scripts/phase25-strict.mjs
