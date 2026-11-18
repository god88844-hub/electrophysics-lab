#!/usr/bin/env bash
# Stage M native device-placement + physical gate (NO physical signoff).
set -euo pipefail
cd "$(dirname "$0")/.."
: "$PDK_ROOT"
: "$STAGE_M_ORIGINAL_SKY130_MODELS"
test -d "$PDK_ROOT/sky130A" || { echo "Missing SKY130A PDK" >&2; exit 1; }
TECH="$PDK_ROOT/sky130A/libs.tech/magic/sky130A.magicrc"
NETGEN="$PDK_ROOT/sky130A/libs.tech/netgen/sky130A_setup.tcl"
for f in "$TECH" "$NETGEN" "$STAGE_M_ORIGINAL_SKY130_MODELS/models/sky130.lib.spice"; do
  test -s "$f" || { echo "Missing required PDK source: $f" >&2; exit 1; }
done
test "$(git -C "$STAGE_M_ORIGINAL_SKY130_MODELS" rev-parse HEAD)" = \
  "f62031a1be9aefe902d6d54cddd6f59b57627436" || {
    echo "Original SKY130 source commit is not pinned" >&2; exit 1;
  }
# Pinned Python device-placement utility from open_pdks (not an autorouter).
PDK_GENERATOR_SOURCE="/tmp/stage-m-open-pdks-audit"
test "$(git -C "$PDK_GENERATOR_SOURCE" rev-parse HEAD)" = \
  "0c1f82326278a0871f0a1fc4bdacf94c88e78e4d" || {
    echo "Unpinned open_pdks geometry generator" >&2; exit 1;
  }
GENERATOR="$PDK_GENERATOR_SOURCE/runtime/netlist_to_layout.py"
test -s "$GENERATOR" || { echo "Pinned open_pdks geometry generator missing" >&2; exit 1; }
command -v magic && command -v netgen && command -v ngspice
magic --version
ngspice --version
repo="$PWD"
out="$repo/benchmarks/evidence/stage-m-native-eda"
src="$repo/designs/stage-m/q4-candidates"
mkdir -p "$out"
printf '%s\n' "PHYSICAL QUALIFICATION: UNQUALIFIED_NO_GO" > "$out/STATUS.txt"
for cell in q4_thresh_det q4_inv q4_mux4 q4_half_adder; do
  root="$out/$cell"
  mkdir -p "$root/spice" "$root/mag"
  cp "$src/$cell.spice" "$root/spice/$cell.spice"
  ln -s "$TECH" "$root/mag/.magicrc"
  # Source-backed placement is NOT final routing. Unrouted LVS must fail.
  (
    cd "$root"
    python3 "$GENERATOR" "$root/spice/$cell.spice" sky130 -keep \
      > "$root/mag/$cell-import.log" 2>&1
  ) || {
    cat "$root/mag/$cell-import.log" >&2
    echo "NATIVE_DEVICE_PLACEMENT_FAILED $cell" >> "$out/STATUS.txt"
    exit 1
  }
  cd "$root/mag"
  test -s "$cell.mag" || {
    echo "PLACEMENT_DID_NOT_CREATE_NATIVE_MAG $cell" >> "$out/STATUS.txt"
    exit 1
  }
  export STAGE_M_CELL="$cell" STAGE_M_SCHEMATIC="$root/spice/$cell.spice"
  magic -dnull -noconsole -T sky130A -rcfile "$TECH" \
    < "$repo/scripts/stage-m-magic-layout.tcl" \
    > "$cell-magic.log" 2>&1 || {
      cat "$cell-magic.log" >&2
      echo "MAGIC_DRC_OR_EXTRACTION_FAILED $cell" >> "$out/STATUS.txt"
      exit 1
    }
  for artifact in "$cell.mag" "$cell.gds" "$cell-lvs.spice" "$cell-pex.spice" "$cell-magic-drc.txt"; do
    test -s "$artifact" || {
      echo "NATIVE_OUTPUT_MISSING $cell/$artifact" >> "$out/STATUS.txt"
      exit 1
    }
  done
  grep -qx "STAGE_M_DRC_COUNT $cell 0" "$cell-magic-drc.txt" || {
    echo "ZERO_DRC_NOT_PROVEN $cell" >> "$out/STATUS.txt"; exit 1;
  }
  netgen -batch lvs \
    "$PWD/$cell-lvs.spice $cell" "$root/spice/$cell.spice $cell" \
    "$NETGEN" "$PWD/$cell-netgen-lvs.txt" \
    > "$cell-netgen.log" 2>&1 || {
      cat "$cell-netgen.log" >&2
      echo "NETGEN_LVS_FAILED $cell" >> "$out/STATUS.txt"
      exit 1
    }
  grep -Eq 'Circuits match uniquely|Netlists match uniquely' \
    "$cell-netgen-lvs.txt" "$cell-netgen.log" || {
      echo "NETGEN_MATCH_NOT_PROVEN $cell" >> "$out/STATUS.txt"; exit 1;
    }
  sha256sum "$cell.mag" "$cell.gds" "$root/spice/$cell.spice" \
    "$cell-lvs.spice" "$cell-pex.spice" "$cell-netgen-lvs.txt" \
    "$cell-magic-drc.txt" > "$cell-native-sha256.txt"
  echo "NATIVE_DRC_AND_LVS_PASSED_NOT_SILICON_SIGNOFF $cell" >> "$out/STATUS.txt"
  cd "$repo"
done
echo "AUTHENTICATED_POSTLAYOUT_MONTE_CARLO_NOT_YET_IMPLEMENTED" >> "$out/STATUS.txt"
echo "UNQUALIFIED_NO_GO" >> "$out/STATUS.txt"
