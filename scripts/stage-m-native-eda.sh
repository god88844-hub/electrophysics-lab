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
if [[ "${STAGE_M_CAMPAIGN_ONLY:-0}" == "1" ]]; then
  # Never regenerate geometry or change the real DRC/LVS evidence between
  # physical preflight and Monte Carlo. The runner verifies hashes and SOA.
  test -s "$out/source-manifest.json" || { echo "Missing source-bound PEX manifest" >&2; exit 1; }
  for cell in q4_thresh_det q4_inv q4_mux4 q4_half_adder; do
    test -s "$out/pex/$cell-pex.spice" || { echo "Missing real PEX $cell" >&2; exit 1; }
  done
  # Generate real per-MOS four-terminal PEX waveforms for both supply
  # ripple envelopes and all four temperatures. Missing/native SPICE
  # vectors remain a HARD error, never a synthesized waveform substitute.
  python3 "$repo/scripts/stage-m-soa-waveform-capture.py" \
    --manifest "$out/source-manifest.json" \
    --pex "$out/pex" \
    --out "$out/soa-waveforms"
  # Every real MOS terminal is checked from ngspice-generated waveforms,
  # not from nominal rails alone. No CSV -> no signed SOA manifest.
  python3 "$repo/scripts/stage-m-four-terminal-soa.py" \
    --manifest "$out/source-manifest.json" \
    --schematics "$src" --pex "$out/pex" \
    --waveforms "$out/soa-waveforms" \
    --output "$out/four-terminal-soa-evidence.json"
  # Requires source-verified binary/ternary/Q4 ALU PEX and real .meas
  # testbenches. No behavioral substitutes or fabricated trial logs.
  python3 "$repo/scripts/stage-m-trial-decks.py" \
    --plan "$out/native-campaign-plan.json" \
    --sources "$out/source-manifest.json" \
    --templates "$repo/benchmarks/stage-m-native-testbenches" \
    --decks "$out/trial-decks"
  python3 "$repo/scripts/stage-m-parallel-ngspice.py" \
    --plan "$out/native-campaign-plan.json" \
    --sources "$out/source-manifest.json" \
    --acceptance "$repo/benchmarks/stage-m-qualification-thresholds.json" \
    --decks "$out/trial-decks" \
    --out "$out/native-monte-carlo"
  exit 0
fi
printf '%s\n' "PHYSICAL QUALIFICATION: UNQUALIFIED_NO_GO" > "$out/STATUS.txt"
# Each hierarchy is routed from the actual SPICE dependency DAG, NOT in
# source placer order. All children are physically saved before parents are
# re-laid out. A descendant without zero native DRC cannot be admitted.
for cell in q4_thresh_det q4_inv q4_mux4 q4_half_adder; do
  root="$out/$cell"
  mkdir -p "$root/spice" "$root/mag"
  cp "$src/$cell.spice" "$root/spice/$cell.spice"
  if [[ -L "$root/mag/.magicrc" ]]; then
    test "$(readlink "$root/mag/.magicrc")" = "$TECH" || {
      echo "Refusing wrong pinned Magic setup link" >&2; exit 1; }
  elif [[ -e "$root/mag/.magicrc" ]]; then
    echo "Refusing unexpected Magic setup file" >&2; exit 1
  else
    ln -s "$TECH" "$root/mag/.magicrc"
  fi
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
    echo "NATIVE_TOP_CELL_MISSING $cell" >> "$out/STATUS.txt"
    exit 1
  }
  python3 "$repo/scripts/stage-m-routing-plan.py" \
    --spice "$root/spice/$cell.spice" --mag-dir "$root/mag" \
    --cell "$cell" --emit-order > "$cell-bottomup-order.txt" || {
      echo "SPICE_HIERARCHY_DAG_INVALID $cell" >> "$out/STATUS.txt"; exit 1
    }
  # Use the same Magic technology and CIF coordinate units as geometry
  # construction: halo microns must never be confused with Magic DBU.
  scale="$(printf 'puts "STAGE_M_SCALE:[cif scale out]"\nquit -noprompt\n' |
    magic -dnull -noconsole -T sky130A -rcfile "$TECH" |
    sed -n 's/^.*STAGE_M_SCALE:\([0-9.eE+-]*\).*$/\1/p' | tail -1)"
  python3 - "$scale" <<'PY'
import math,sys
v=float(sys.argv[1]);assert math.isfinite(v) and v>0
PY
  # Every child gets a fresh Magic invocation. Parent files are relocated
  # against the saved, POST-ROUTE child .mag bounding boxes (negative origins
  # included), not the source importer's stale instance boxes.
  while IFS= read -r sub; do
    test -n "$sub" || continue
    test -s "$sub.mag" || {
      echo "UNPLACED_SPICE_CHILD $cell/$sub" >> "$out/STATUS.txt"; exit 1
    }
    python3 "$repo/scripts/stage-m-postroute-placement.py" \
      --mag-dir "$root/mag" --spice "$root/spice/$cell.spice" \
      --cell "$sub" --halo-um 2.0 --scale-um "$scale" \
      --report "$sub-postroute-placement.json" || {
        echo "NATIVE_CHILD_BBOX_OR_HALO_COLLISION $cell/$sub" >> "$out/STATUS.txt"
        exit 1
      }
    python3 "$repo/scripts/stage-m-routing-plan.py" \
      --spice "$root/spice/$cell.spice" --mag-dir "$root/mag" \
      --cell "$cell" --only-cell "$sub" --scale-um "$scale" \
      --output "$sub-routes.tcl" > "$sub-route-plan.log" 2>&1 || {
        cat "$sub-route-plan.log" >&2
        echo "NATIVE_BOTTOM_UP_ROUTE_PLAN_FAILED $cell/$sub" >> "$out/STATUS.txt"
        exit 1
      }
    export STAGE_M_CELL="$sub" STAGE_M_TOP_CELL="$cell"
    export STAGE_M_SCHEMATIC="$root/spice/$cell.spice"
    export STAGE_M_ROUTE_PLAN="$root/mag/$sub-routes.tcl"
    magic -dnull -noconsole -T sky130A -rcfile "$TECH" \
      < "$repo/scripts/stage-m-magic-layout.tcl" \
      > "$sub-magic.log" 2>&1 || {
        cat "$sub-magic.log" >&2
        echo "BOTTOM_UP_MAGIC_DRC_OR_EXTRACT_FAILED $cell/$sub" >> "$out/STATUS.txt"
        exit 1
      }
    for output in "$sub.mag" "$sub.gds" "$sub-lvs.spice" \
                  "$sub-pex.spice" "$sub-magic-drc.txt"; do
      test -s "$output" || {
        echo "BOTTOM_UP_OUTPUT_MISSING $cell/$sub/$output" >> "$out/STATUS.txt"
        exit 1
      }
    done
    grep -qx "STAGE_M_DRC_COUNT $sub 0" "$sub-magic-drc.txt" || {
      echo "BOTTOM_UP_DRC_NOT_ZERO $cell/$sub" >> "$out/STATUS.txt"; exit 1
    }
    if grep -Eiq 'Ports? ".*" and ".*" are electrically shorted' "$sub-magic.log"; then
      grep -Ei 'electrically shorted' "$sub-magic.log" >&2
      echo "EXTRACTION_ELECTRICAL_SHORTS $cell/$sub" >> "$out/STATUS.txt"
      exit 1
    fi
    # Write only after the child has been saved and its DRC established;
    # this is a sequencing marker, NOT a standalone LVS or silicon passport.
    sha256sum "$sub.mag" "$sub-pex.spice" "$sub-magic-drc.txt" \
       > "$sub.stage-m-routed"
  done < "$cell-bottomup-order.txt"
  # The strict terminal LVS matcher checks the ROOT verdict, not merely any
  # uniquely matching nested subcell message.
  netgen -batch lvs \
    "$PWD/$cell-lvs.spice $cell" "$root/spice/$cell.spice $cell" \
    "$NETGEN" "$PWD/$cell-netgen-lvs.txt" \
    > "$cell-netgen.log" 2>&1 || {
      cat "$cell-netgen.log" >&2
      echo "NETGEN_LVS_FAILED $cell" >> "$out/STATUS.txt"
      exit 1
    }
  python3 "$repo/scripts/stage-m-validate-lvs.py" \
    --cell "$cell" --schematic "$root/spice/$cell.spice" \
    --lvs-netlist "$cell-lvs.spice" --pex "$cell-pex.spice" \
    --report "$cell-netgen-lvs.txt" || {
      echo "NETGEN_TOP_LEVEL_LVS_FAILED $cell" >> "$out/STATUS.txt"
      exit 1
    }
  sha256sum "$cell.mag" "$cell.gds" "$root/spice/$cell.spice" \
    "$cell-lvs.spice" "$cell-pex.spice" "$cell-netgen-lvs.txt" \
    "$cell-magic-drc.txt" > "$cell-native-sha256.txt"
  echo "NATIVE_DRC_AND_LVS_PASSED_NOT_SILICON_SIGNOFF $cell" >> "$out/STATUS.txt"
  cd "$repo"
done
# Preserve real generated PEX and hashes for the source-bound Monte Carlo runner.
# The four-terminal SOA test is NOT marked true without genuine model evidence.
mkdir -p "$out/pex" "$out/trial-decks" "$out/native-monte-carlo"
for cell in q4_thresh_det q4_inv q4_mux4 q4_half_adder; do
  cp "$out/$cell/mag/$cell-pex.spice" "$out/pex/$cell-pex.spice"
done
python3 - "$out" "$PDK_ROOT" <<'PY'
import hashlib,json,sys
from pathlib import Path
out=Path(sys.argv[1]);pdk=Path(sys.argv[2])
lib=pdk/'sky130A/libs.tech/ngspice/sky130.lib.spice'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
assert lib.is_file()
names=['q4_thresh_det','q4_inv','q4_mux4','q4_half_adder']
data={'pdkLibrary':str(lib.resolve()),'pdkLibrarySha256':sha(lib),
      'pexRoot':str((out/'pex').resolve()),
      'pexSha256':{n:sha(out/'pex'/(n+'-pex.spice')) for n in names},
      'drcLvsAllFourVerified':True,'soaLimitV':1.95,
      'allCoreTerminalSOAChecksPassed':False,
      'minimumWilsonLower95':None,'level2':'UNQUALIFIED_NO_GO',
      'qualification':'INSUFFICIENT_MODEL_DATA'}
(out/'source-manifest.json').write_text(json.dumps(data,indent=2)+'\n')
PY
# Six hierarchical arithmetic circuits are assembled from the same
# SHA-authenticated post-layout Q4 mux PEX. Their ALU-level metal
# interconnect and LVS are NOT verified by this composition step.
python3 "$repo/scripts/stage-m-alu-assemble.py" \
  --pex-mux "$out/pex/q4_mux4-pex.spice" \
  --sources "$out/source-manifest.json" \
  --out "$out/alu-candidates"
python3 - "$out" <<'PY'
import json,sys
from pathlib import Path
out=Path(sys.argv[1])
source=out/'source-manifest.json'
m=json.loads(source.read_text())
alu=json.loads((out/'alu-candidates'/'candidates-manifest.json').read_text())
if len(alu.get('aluNetlists',{}))!=6 or any(
    record.get('nativeLvsMatch') is not False
    for record in alu['aluNetlists'].values()):
    raise ValueError('ALU candidate physical gate was weakened')
m['aluNetlists']=alu['aluNetlists']
source.write_text(json.dumps(m,indent=2)+'\n')
PY
echo "REAL_PEX_EXTRACTED_PENDING_SOA_AND_POST_LAYOUT_TRIAL_DECKS" >> "$out/STATUS.txt"
# Complete real DRC/LVS/PEX before statistical-corner admission, if requested.
# Do not issue a Level-1 passport for layout-only results.
if [[ "${STAGE_M_LAYOUT_ONLY:-0}" == "1" ]]; then
  echo "LAYOUT_ONLY_NOT_QUALIFIED" >> "$out/STATUS.txt"
  echo "UNQUALIFIED_NO_GO" >> "$out/STATUS.txt"
  exit 0
fi
python3 "$repo/scripts/stage-m-parallel-ngspice.py" \
  --plan "$out/native-campaign-plan.json" \
  --sources "$out/source-manifest.json" \
  --acceptance "$repo/benchmarks/stage-m-qualification-thresholds.json" \
  --decks "$out/trial-decks" \
  --out "$out/native-monte-carlo"
echo "UNQUALIFIED_NO_GO" >> "$out/STATUS.txt"
