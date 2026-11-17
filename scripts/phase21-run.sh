#!/usr/bin/env bash
# Execute actual ORFS + KLayout GDS-level DRC/LVS on small SKY130HD alu8.
# These experimental open rule decks do NOT certify foundry signoff.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$PWD/benchmarks/evidence/phase21"
BASE="$OUT/orfs"
RES="$BASE/results/sky130hd/alu8/base"
REP="$BASE/reports/sky130hd/alu8/base"
LOG="$BASE/logs/sky130hd/alu8/base"
mkdir -p "$RES" "$REP" "$LOG" "$BASE/objects/sky130hd/alu8/base" "$OUT/tool-logs" "$OUT/decks"
IMAGE="openroad/orfs:26Q4-430-g2272e787c"
DIGEST="openroad/orfs@sha256:7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71"
docker pull "$IMAGE" > "$OUT/tool-logs/docker-pull.log"
docker image inspect "$IMAGE" --format '{{index .RepoDigests 0}}' > "$OUT/image-digest.txt"
grep -Fxq "$DIGEST" "$OUT/image-digest.txt"
# Actual GDS assembled from placed/routed standard cells; genuine open rule
# checks on layout geometry against the flow's source-cell CDL netlist.
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" \
  -w /OpenROAD-flow-scripts/flow "$IMAGE" \
  bash -lc 'source /OpenROAD-flow-scripts/env.sh && \
    echo "PH21 KLayout executable: $KLAYOUT_CMD" && \
    klayout -v && \
    make -j 2 DESIGN_CONFIG=/work/benchmarks/phase18/config.mk \
    WORK_HOME=/work/benchmarks/evidence/phase21/orfs drc lvs' \
  > "$OUT/tool-logs/layout-drc-lvs.log" 2>&1 || {
    tail -n 130 "$OUT/tool-logs/layout-drc-lvs.log" >&2; exit 1;
  }
# Archive exact source-pinned installed rule decks, not an approximated rule list.
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" "$IMAGE" bash -lc \
 'cp /OpenROAD-flow-scripts/flow/platforms/sky130hd/drc/sky130hd.lydrc /work/benchmarks/evidence/phase21/decks/sky130hd.lydrc &&
  cp /OpenROAD-flow-scripts/flow/platforms/sky130hd/lvs/sky130hd.lylvs /work/benchmarks/evidence/phase21/decks/sky130hd.lylvs'
test "$(git hash-object "$OUT/decks/sky130hd.lydrc")" = "e1a1bbb4721bd02bac42c2cb92ec2d24b25db8b6"
test "$(git hash-object "$OUT/decks/sky130hd.lylvs")" = "12eb8bf51a404b7a7cc149b00e93c302d39f7108"
for f in "$RES/6_final.gds" "$RES/6_final.cdl" "$RES/6_final.v" \
  "$RES/6_final.def" "$RES/6_lvs.lvsdb" "$REP/6_drc.lyrdb" \
  "$REP/6_drc_count.rpt" "$LOG/6_lvs.log" "$LOG/6_drc.log"; do
  test -s "$f" || { echo "PH21 missing authentic check artifact: $f" >&2; exit 1; }
done
node scripts/phase21-capture.mjs
node scripts/phase21-strict.mjs
