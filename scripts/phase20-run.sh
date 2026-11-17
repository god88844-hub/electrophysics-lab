#!/usr/bin/env bash
# Real pinned SkyWater cell-corner timing on a single extracted RC view.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$PWD/benchmarks/evidence/phase20"
mkdir -p "$OUT/libs" "$OUT/tool-logs"
bash scripts/phase19-run.sh > "$OUT/tool-logs/phase19-prerequisite.log" 2>&1 || {
  tail -n 90 "$OUT/tool-logs/phase19-prerequisite.log" >&2; exit 1;
}
IMAGE="openroad/orfs:26Q4-430-g2272e787c"
test "$(cat benchmarks/evidence/phase19/image-digest.txt)" = \
  "openroad/orfs@sha256:7490fc3602b76ddcb7befe66974be989e34f95664f8c175f4c9b25df6cb89e71"
UPSTREAM="https://raw.githubusercontent.com/fossi-foundation/skywater-pdk-libs-sky130_fd_sc_hd/9cb2d7cb8ed4619094263614039a61b6b2d22a88/timing"
while read -r id corner bytes sha blob; do
  lib="$OUT/libs/sky130_fd_sc_hd__$corner.lib"
  curl --fail --location --retry 3 --connect-timeout 20 --max-time 180 \
    --silent --show-error "$UPSTREAM/sky130_fd_sc_hd__$corner.lib" -o "$lib"
  test "$(wc -c < "$lib")" -eq "$bytes"
  test "$(sha256sum "$lib" | cut -d' ' -f1)" = "$sha"
  test "$(git hash-object "$lib")" = "$blob"
  docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" \
    -e PH20_ID="$id" -e PH20_CORNER="$corner" \
    -e PH20_LIB="/work/benchmarks/evidence/phase20/libs/sky130_fd_sc_hd__$corner.lib" \
    -e PH20_DB="/work/benchmarks/evidence/phase19/orfs/results/sky130hd/alu8/base/5_route.odb" \
    -e PH20_SDC="/work/benchmarks/evidence/phase19/orfs/results/sky130hd/alu8/base/5_route.sdc" \
    -e PH20_SPEF="/work/benchmarks/evidence/phase19/post-route.spef" \
    "$IMAGE" bash -lc 'source /OpenROAD-flow-scripts/env.sh && cd /work && openroad -exit scripts/phase20-corner.tcl' \
    > "$OUT/tool-logs/$id.log" 2>&1 || { tail -n 90 "$OUT/tool-logs/$id.log" >&2; exit 1; }
  echo "PH20 external $id model executed from authentic library $sha"
  grep -E 'PH20_CORNER_|PH20_PATH_BEGIN|slack \(' "$OUT/tool-logs/$id.log" || true
done <<'CORNERS'
tt tt_025C_1v80 12841637 8e78e14442062dba34d414fca6490b2f6b96038d4510d1438ca44fee31487135 1f086a1ae9064d48d36ff66a605491a18f6b5ed6
ss ss_100C_1v60 12845260 9b24f0db3967ac67b4cae1f74bb480fd47922d18d0ed577e3c121739b412c361 06e2c5b3274538a93be7d11464b0726ebc68dd54
ff ff_n40C_1v95 12918504 fb61d91c55a7f85b1989e8149d040b13ba5e7f5478f5bf0c3c16c5da30720139 31b614db0eecc7dce80d1849e4596ee337e72dc8
CORNERS
node scripts/phase20-capture.mjs
node scripts/phase20-strict.mjs
