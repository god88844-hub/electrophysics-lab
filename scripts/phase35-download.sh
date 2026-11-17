#!/usr/bin/env bash
set -euo pipefail
DIR="benchmarks/evidence/phase35"
SRC="https://raw.githubusercontent.com/Atikas/OpenBLDCData/1ce35456f83be8f36aec183ab19d6e6e46603023/data"
mkdir -p "$DIR"
fetch_and_verify() {
  local filename="$1" bytes="$2" blob="$3"
  curl --fail --silent --show-error --location --retry 3 --max-time 150 "$SRC/$filename" -o "$DIR/$filename"
  test "$(wc -c < "$DIR/$filename" | tr -d ' ')" = "$bytes"
  test "$(git hash-object "$DIR/$filename")" = "$blob"
  echo "PH35 GIT-BLOB-VERIFIED $filename / $bytes original publisher bytes / $blob"
}
fetch_and_verify "analize_healthy11_2500rpm_96mA_mait.csv" 4737417 329d53ec77d708cca07f6b3a37f6a3346063eb66
fetch_and_verify "analize_healthy20_2500rpm_96mA_mait.csv" 4982886 2de45c123e65711bb33f28609889581826f10cb2
fetch_and_verify "analize_healthy11_2000rpm_96mA_mait.csv" 4707183 7d02bca4073775be034ec00e906b4f7d28a49725
echo "PH35 ORIGINAL PUBLISHED DATA FETCH PASS: 3 healthy original 24V BLDC files, two distinct motor units, no target 3V fan measurement"
