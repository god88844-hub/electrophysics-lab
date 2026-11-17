#!/usr/bin/env bash
# Actual pinned three-corner Liberty analysis with real OpenSTA on CI.
# This is PRE-LAYOUT modeling. No DRC, LVS, routing, extracted RC, physical die.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="benchmarks/evidence/phase16"
mkdir -p "$OUT/libs" "$OUT/tool-logs"
# Real Yosys TT mapping and Phase14 strict log verification, never synthesized CI data.
bash scripts/phase14-run.sh > "$OUT/tool-logs/phase14-baseline.log" 2>&1

UPSTREAM="https://raw.githubusercontent.com/fossi-foundation/skywater-pdk-libs-sky130_fd_sc_hd/9cb2d7cb8ed4619094263614039a61b6b2d22a88/timing"
# Exact upstream sizes, sha256 and real Git blob SHA-1 from frozen source.
cases=(
"tt tt_025C_1v80 12841637 8e78e14442062dba34d414fca6490b2f6b96038d4510d1438ca44fee31487135 1f086a1ae9064d48d36ff66a605491a18f6b5ed6"
"ss ss_100C_1v60 12845260 9b24f0db3967ac67b4cae1f74bb480fd47922d18d0ed577e3c121739b412c361 06e2c5b3274538a93be7d11464b0726ebc68dd54"
"ff ff_n40C_1v95 12918504 fb61d91c55a7f85b1989e8149d040b13ba5e7f5478f5bf0c3c16c5da30720139 31b614db0eecc7dce80d1849e4596ee337e72dc8"
)
for entry in "${cases[@]}"; do
  read -r id corner bytes sha blob <<< "$entry"
  lib="$OUT/libs/sky130_fd_sc_hd__${corner}.lib"
  curl --fail --location --retry 3 --connect-timeout 20 --max-time 180 \
    --silent --show-error "$UPSTREAM/sky130_fd_sc_hd__${corner}.lib" -o "$lib"
  test "$(wc -c < "$lib")" -eq "$bytes" || { echo "Library size mismatch for $corner" >&2; exit 1; }
  test "$(sha256sum "$lib" | cut -d' ' -f1)" = "$sha" || { echo "SHA-256 mismatch for $corner" >&2; exit 1; }
  test "$(git hash-object "$lib")" = "$blob" || { echo "Git blob mismatch for $corner" >&2; exit 1; }
  echo "Verified real 130nm $corner Liberty, $bytes bytes"
  # Fresh OpenSTA state per library. Actual warnings/errors in raw log cause strict FAILURE.
  PHASE16_CORNER_ID="$id" PHASE16_CORNER_NAME="$corner" PHASE16_LIBRARY="$lib" \
    sta -no_splash -exit scripts/phase16-corner.tcl > "$OUT/tool-logs/$id.log" 2>&1
done
# Preserve original logs and expose diagnostics even when the strict gate rejects them.
for corner_id in tt ss ff; do
  echo "PHASE16 raw OpenSTA diagnostics for $corner_id"
  grep -E '^(Error:|Warning:|Startpoint:|Endpoint:|PHASE16_CORNER_)|slack \(|Path Type:|Path Group:' "$OUT/tool-logs/$corner_id.log" || true
done
node scripts/phase16-capture.mjs
node scripts/phase16-strict.mjs
