#!/usr/bin/env bash
set -euo pipefail
bash scripts/phase35-download.sh
dir="benchmarks/evidence/phase36"
mkdir -p "$dir"
filename="analize_healthy20_2000rpm_96mA_mait.csv"
curl --fail --silent --show-error --location --retry 3 --max-time 180 "https://raw.githubusercontent.com/Atikas/OpenBLDCData/1ce35456f83be8f36aec183ab19d6e6e46603023/data/$filename" -o "$dir/$filename"
test "$(wc -c < "$dir/$filename" | tr -d ' ')" = 23964792
test "$(git hash-object "$dir/$filename")" = 195dea9f1b551e6ad209a511713895727af27c94
echo "PH36 ORIGINAL FOUR FILES GIT BLOB VERIFIED: independent motor3 at 2000 and 2500 RPM; motor2 at 2000 and 2500 RPM"