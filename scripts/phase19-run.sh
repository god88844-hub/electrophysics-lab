#!/usr/bin/env bash
# External real ORFS SKY130HD detailed route, actual OpenRCX wires, external OpenSTA.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$PWD/benchmarks/evidence/phase19"
BASE="$OUT/orfs"
RES="$BASE/results/sky130hd/alu8/base"
mkdir -p "$RES" "$BASE/logs/sky130hd/alu8/base" \
  "$BASE/reports/sky130hd/alu8/base" "$BASE/objects/sky130hd/alu8/base" "$OUT/tool-logs"
IMAGE="openroad/orfs:26Q4-430-g2272e787c"
DIGEST="openroad/orfs@sha256:7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71"
docker pull "$IMAGE" > "$OUT/tool-logs/docker-pull.log"
docker image inspect "$IMAGE" --format '{{index .RepoDigests 0}}' > "$OUT/image-digest.txt"
grep -Fxq "$DIGEST" "$OUT/image-digest.txt"
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" \
  -w /OpenROAD-flow-scripts/flow "$IMAGE" \
  bash -lc 'source /OpenROAD-flow-scripts/env.sh && \
  make -j 2 DESIGN_CONFIG=/work/benchmarks/phase18/config.mk \
  WORK_HOME=/work/benchmarks/evidence/phase19/orfs route' \
  > "$OUT/tool-logs/detailed-route.log" 2>&1 || {
    tail -n 100 "$OUT/tool-logs/detailed-route.log" >&2
    exit 1
  }
test -s "$RES/5_1_grt.odb"
test -s "$RES/5_2_route.odb"
test -s "$RES/5_route.odb"
test -s "$RES/5_route.sdc"
# The router may legitimately omit the local DRC marker file when no marker\n# is generated. Preserve the real step log; never synthesize a DRC report.\ntest -s "$BASE/logs/sky130hd/alu8/base/5_2_route.log" || {\n  echo "Actual OpenROAD detail-route execution log missing" >&2; exit 1;\n}\n# Actual routed parasitic extraction, followed by SPEF reload and 10 independent
# real constrained max-path timing reports, in a *second* OpenROAD process.
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" \
  -e PH19_DB=/work/benchmarks/evidence/phase19/orfs/results/sky130hd/alu8/base/5_route.odb \
  -e PH19_SDC=/work/benchmarks/evidence/phase19/orfs/results/sky130hd/alu8/base/5_route.sdc \
  -e PH19_SPEF=/work/benchmarks/evidence/phase19/post-route.spef \
  "$IMAGE" bash -lc 'cd /work && openroad -exit scripts/phase19-inspect.tcl' \
  > "$OUT/tool-logs/extraction-timing.log" 2>&1 || {
    tail -n 100 "$OUT/tool-logs/extraction-timing.log" >&2; exit 1;
  }
cat "$OUT/tool-logs/extraction-timing.log" | grep -E '^PH19_|slack \(' || true
test -s "$OUT/post-route.spef"
node scripts/phase19-capture.mjs
node scripts/phase19-strict.mjs
