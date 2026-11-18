#!/usr/bin/env bash
# Stage M strict native EDA acceptance attempt. Physical status remains NO-GO.
set -euo pipefail
cd "$(dirname "$0")/.."
: "$PDK_ROOT"
: "$STAGE_M_ORIGINAL_SKY130_MODELS"
test -d "$PDK_ROOT/sky130A" || { echo "Missing SKY130A PDK" >&2; exit 1; }
TECH="$PDK_ROOT/sky130A/libs.tech/magic/sky130A.magicrc"
NETGEN="$PDK_ROOT/sky130A/libs.tech/netgen/sky130A_setup.tcl"
for f in "$TECH" "$NETGEN" "$STAGE_M_ORIGINAL_SKY130_MODELS/models/sky130.lib.spice"; do
  test -s "$f" || { echo "Missing required PDK file $f" >&2; exit 1; }
done
test "$(git -C "$STAGE_M_ORIGINAL_SKY130_MODELS" rev-parse HEAD)" = \
  "f62031a1be9aefe902d6d54cddd6f59b57627436" || {
  echo "Original SKY130 model checkout is not pinned" >&2; exit 1;
}
magic --version
ngspice --version
command -v netgen
repo="$PWD"
out="$repo/benchmarks/evidence/stage-m-native-eda"
src="$repo/designs/stage-m/q4-candidates"
mkdir -p "$out"
printf '%s\n' "PHYSICAL QUALIFICATION: UNQUALIFIED_NO_GO" > "$out/STATUS.txt"
for cell in q4_thresh_det q4_inv q4_mux4 q4_half_adder; do
  mkdir -p "$out/$cell"
  cp "$src/$cell.spice" "$out/$cell/$cell.spice"
  cd "$out/$cell"
  export STAGE_M_CELL="$cell" STAGE_M_SCHEMATIC="$PWD/$cell.spice"
  # Real Magic geometry placement, real DRC, extraction and GDS generation.
  # Never convert nonzero tool status or nonzero DRC to a simulated pass.
  magic -dnull -noconsole -rcfile "$TECH" < "$repo/scripts/stage-m-magic-layout.tcl" \
    > "$cell-magic.log" 2>&1 || {
      cat "$cell-magic.log" >&2
      echo "MAGIC_DRC_OR_GEOMETRY_FAILED $cell" >> "$out/STATUS.txt"
      exit 1
    }
  for artifact in "$cell.mag" "$cell.gds" "$cell-lvs.spice" "$cell-pex.spice" "$cell-magic-drc.txt"; do
    test -s "$artifact" || { echo "Missing artifact $cell/$artifact" >&2; exit 1; }
  done
  netgen -batch lvs \
    "$PWD/$cell-lvs.spice $cell" "$PWD/$cell.spice $cell" \
    "$NETGEN" "$PWD/$cell-netgen-lvs.txt" \
    > "$cell-netgen.log" 2>&1 || {
      cat "$cell-netgen.log" >&2
      echo "NETGEN_LVS_FAILED $cell" >> "$out/STATUS.txt"
      exit 1
    }
  # A tool exit zero or existence of a report is NOT evidence of matching nets.
  grep -Eq 'Circuits match uniquely|Netlists match uniquely' \
    "$cell-netgen-lvs.txt" "$cell-netgen.log" || {
      echo "NETGEN_MATCH_NOT_PROVEN $cell" >> "$out/STATUS.txt"
      exit 1
    }
  sha256sum "$cell.mag" "$cell.gds" "$cell.spice" "$cell-lvs.spice" \
    "$cell-pex.spice" "$cell-netgen-lvs.txt" "$cell-magic-drc.txt" \
    > "$cell-native-sha256.txt"
  echo "NATIVE_TOOL_DRC_AND_LVS_SUCCESS_NOT_FOUNDRY_SIGNOFF $cell" >> "$out/STATUS.txt"
  cd "$repo"
done
echo "CALIBRATED_POSTLAYOUT_MONTE_CARLO_NOT_RUN" >> "$out/STATUS.txt"
echo "UNQUALIFIED_NO_GO" >> "$out/STATUS.txt"
