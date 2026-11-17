#!/usr/bin/env bash
set -euo pipefail
OUT="benchmarks/evidence/phase34"
SHA="1ce35456f83be8f36aec183ab19d6e6e46603023"
BLOB="8dd094813462b489e3a24519d1b7a154bd12cf04"
PATHNAME="data/analize_healthy10_500rpm_19mA_bat.csv"
mkdir -p "$OUT"
curl --fail --silent --show-error --location --retry 4 --max-time 180 \
  "https://raw.githubusercontent.com/Atikas/OpenBLDCData/$SHA/$PATHNAME" \
  -o "$OUT/original-healthy.csv"
actual="$(wc -c < "$OUT/original-healthy.csv" | tr -d ' ')"
test "$actual" = "22712053" || { echo "PH34 FAIL: original source length $actual" >&2; exit 1; }
blob="$(git hash-object "$OUT/original-healthy.csv")"
test "$blob" = "$BLOB" || { echo "PH34 FAIL: original SHA1 changed $blob" >&2; exit 1; }
echo "PH34 publisher ORIGINAL CC-BY physical raw source verified: $actual bytes, Git blob $blob"
