#!/usr/bin/env bash
# Fetch original publicly measured SKY130 resistor test-tile sweeps from an
# immutable Git commit. No synthetic rows, no claims about the ALU's silicon.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD/benchmarks/evidence/phase23"
mkdir -p "$ROOT/raw" "$ROOT/tool-logs"
UPSTREAM="https://raw.githubusercontent.com/google/skywater-pdk-sky130-raw-data/1f7214f2f81a0629303947a07e1ec00a28ae8a33"
fetch() {
  local source="$1" output="$2" blob="$3" bytes="$4"
  curl --globoff --fail --location --retry 3 --retry-delay 2 \
    --connect-timeout 20 --max-time 120 --silent --show-error \
    "$UPSTREAM/$source" -o "$ROOT/raw/$output"
  test "$(wc -c < "$ROOT/raw/$output")" -eq "$bytes"
  test "$(git hash-object "$ROOT/raw/$output")" = "$blob"
  echo "PH23 pinned real upstream blob VERIFIED: $output ($bytes original bytes)"
}
fetch "README.rst" "README.rst" \
  92c6648d707251f1fb62fb662257aef2a85a33a3 3889
fetch 'sky130_fd_pr/cells/unsorted/res/pplus_poly_res_w0p69_l0p345_sq0p5(6208_1_2).mdm' \
  "specimen-6208-1-2.mdm" e82a49007f61006913a8d9cd5bee50288a836d87 3100
fetch 'sky130_fd_pr/cells/unsorted/res/pplus_poly_res_w0p69_l0p345_sq0p5(6208_1_3).mdm' \
  "specimen-6208-1-3.mdm" f0b9986ccdceaa3f01b12dacff58125c32cb6a73 3100
node scripts/phase23-capture.mjs
node scripts/phase23-strict.mjs
