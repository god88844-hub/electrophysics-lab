#!/usr/bin/env bash
set -euo pipefail
ROOT="benchmarks/evidence/phase33"
SOURCE="data/analize_misalignment10_SF_500rpm_19mA_bat.csv"
SHA="1ce35456f83be8f36aec183ab19d6e6e46603023"
BLOB="7249edf7f21a337bec52fa11fa3c6e555d3e4627"
mkdir -p "$ROOT"
URL="https://raw.githubusercontent.com/Atikas/OpenBLDCData/$SHA/$SOURCE"
curl --fail --silent --show-error --location --retry 3 --max-time 60 "$URL" -o "$ROOT/source-bldc-original.csv"
test "$(wc -c < "$ROOT/source-bldc-original.csv" | tr -d ' ')" = "421672"
test "$(git hash-object "$ROOT/source-bldc-original.csv")" = "$BLOB"
echo "PH33 exact published CC-BY raw source Git blob VERIFIED: $BLOB (historical other 24V motor, NOT target fan)"
