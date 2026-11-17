#!/usr/bin/env bash
# Real open SKY130 FEOL+BEOL+OFFGRID layout DRC and independent
# SAT proof on the *actual* final post-GDS ORFS gate netlist.
# Physical PDK is experimental; no fab/yield/silicon assertion.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$PWD/benchmarks/evidence/phase22"
mkdir -p "$OUT/tool-logs" "$OUT/lib" "$OUT/orfs/results/sky130hd/alu8/base" \
  "$OUT/orfs/reports/sky130hd/alu8/base" \
  "$OUT/orfs/logs/sky130hd/alu8/base" \
  "$OUT/orfs/objects/sky130hd/alu8/base"
# Re-run independently proven genuine Phase21 GDS and open-deck DRC/LVS.
bash scripts/phase21-run.sh > "$OUT/tool-logs/phase21-prerequisite.log" 2>&1 || {
  tail -n 110 "$OUT/tool-logs/phase21-prerequisite.log" >&2; exit 1;
}
# Preserve original Phase21 GDS final netlist byte-for-byte, rather than
# resynthesize and accidentally prove a different design.
SOURCE="$PWD/benchmarks/evidence/phase21/orfs/results/sky130hd/alu8/base"
TARGET="$OUT/orfs/results/sky130hd/alu8/base"
for name in 6_final.gds 6_final.v 6_final.def 6_final.cdl; do
  cp "$SOURCE/$name" "$TARGET/$name"
  cmp "$SOURCE/$name" "$TARGET/$name"
done
cp benchmarks/evidence/phase21/decks/sky130hd.lydrc "$OUT/source-sky130hd.lydrc"
cp benchmarks/evidence/phase21/image-digest.txt "$OUT/image-digest.txt"
test "$(git hash-object "$OUT/source-sky130hd.lydrc")" = \
  "e1a1bbb4721bd02bac42c2cb92ec2d24b25db8b6"
node scripts/phase22-enable-feol.mjs
IMAGE="openroad/orfs:26Q4-430-g2272e787c"
test "$(cat "$OUT/image-digest.txt")" = \
  "openroad/orfs@sha256:7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71"
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" \
  -w /work "$IMAGE" bash -lc \
 'source /OpenROAD-flow-scripts/env.sh && klayout -v && \
  klayout -b -rd in_gds=/work/benchmarks/evidence/phase22/orfs/results/sky130hd/alu8/base/6_final.gds \
  -rd report_file=/work/benchmarks/evidence/phase22/feol-enabled-drc.lyrdb \
  -r /work/benchmarks/evidence/phase22/feol-enabled-sky130hd.lydrc' \
  > "$OUT/tool-logs/feol-drc.log" 2>&1 || {
    tail -n 120 "$OUT/tool-logs/feol-drc.log" >&2; exit 1;
  }
test -s "$OUT/feol-enabled-drc.lyrdb"
# Source-locked independent behavioral specification and deliberate XOR->OR mutant.
UPSTREAM="https://raw.githubusercontent.com/fossi-foundation/skywater-pdk-libs-sky130_fd_sc_hd/9cb2d7cb8ed4619094263614039a61b6b2d22a88/timing"
LIB="$OUT/lib/sky130_fd_sc_hd__tt_025C_1v80.lib"
curl --fail --location --retry 3 --connect-timeout 20 --max-time 180 \
  --silent --show-error "$UPSTREAM/sky130_fd_sc_hd__tt_025C_1v80.lib" -o "$LIB"
test "$(wc -c < "$LIB")" -eq 12841637
test "$(sha256sum "$LIB" | cut -d ' ' -f1)" = \
 "8e78e14442062dba34d414fca6490b2f6b96038d4510d1438ca44fee31487135"
test "$(git hash-object "$LIB")" = \
 "1f086a1ae9064d48d36ff66a605491a18f6b5ed6"
grep -q 'sky130_fd_sc_hd__' "$TARGET/6_final.v"
for kind in positive mutant; do
  if test "$kind" = positive; then
    spec=benchmarks/phase13/rtl/alu8_spec.v; mod=alu8_spec
  else
    spec=benchmarks/phase13/rtl/alu8_bad_spec.v; mod=alu8_bad_spec
  fi
  sed -e "s|__SPEC__|$spec|g" -e "s|__MODULE__|$mod|g" \
    scripts/phase22-proof.ys > "$OUT/tool-logs/$kind.ys"
  if yosys -l "$OUT/tool-logs/$kind.log" -s "$OUT/tool-logs/$kind.ys" \
      > "$OUT/tool-logs/$kind.stdout" 2>&1; then
    if test "$kind" = mutant; then
      echo 'PH22 FAIL: independent deliberate faulty spec falsely equivalent' >&2
      exit 1
    fi
  else
    if test "$kind" = positive; then
      echo 'PH22 FAIL: final placed/routed GDS gate netlist is not proven equivalent' >&2
      tail -n 80 "$OUT/tool-logs/positive.log" >&2; exit 1
    fi
  fi
done
node scripts/phase22-capture.mjs
node scripts/phase22-strict.mjs
