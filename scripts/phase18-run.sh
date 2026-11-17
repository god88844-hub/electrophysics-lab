#!/usr/bin/env bash
# Real, external ORFS/OpenROAD via pinned release tag; no invented routing/physical verdict.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$PWD/benchmarks/evidence/phase18"
mkdir -p "$OUT" "$OUT/orfs" "$OUT/tool-logs"
IMAGE="openroad/orfs:26Q4-430-g2272e787c"
docker pull "$IMAGE" | tee "$OUT/tool-logs/image-pull.log"
docker image inspect "$IMAGE" --format '{{index .RepoDigests 0}}' > "$OUT/image-digest.txt"
grep -Eq '^openroad/orfs@sha256:[0-9a-f]{64}$' "$OUT/image-digest.txt"
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" \
  -w /OpenROAD-flow-scripts/flow "$IMAGE" \
  bash -lc 'source /OpenROAD-flow-scripts/env.sh && \
  openroad -version && yosys -V && \
  make -j 2 DESIGN_CONFIG=/work/benchmarks/phase18/config.mk \
  WORK_HOME=/work/benchmarks/evidence/phase18/orfs grt' \
  > "$OUT/tool-logs/physical-flow.log" 2>&1 || {
    tail -n 100 "$OUT/tool-logs/physical-flow.log" >&2
    exit 1
  }
RESULTS="$OUT/orfs/results/sky130hd/alu8/base"
test -s "$RESULTS/3_place.odb"
test -s "$RESULTS/5_1_grt.odb"
test -s "$RESULTS/route.guide"
PH18_ODB="/work/benchmarks/evidence/phase18/orfs/results/sky130hd/alu8/base/5_1_grt.odb" \
docker run --rm --user "$(id -u):$(id -g)" -e PH18_ODB \
  -v "$PWD:/work" "$IMAGE" \
  bash -lc 'source /OpenROAD-flow-scripts/env.sh && cd /work && openroad -exit scripts/phase18-geometry.tcl' \
  > "$OUT/tool-logs/geometry.log" 2>&1 || {
    cat "$OUT/tool-logs/geometry.log" >&2; exit 1;
  }
cat "$OUT/tool-logs/geometry.log"
node scripts/phase18-capture.mjs
node scripts/phase18-strict.mjs
