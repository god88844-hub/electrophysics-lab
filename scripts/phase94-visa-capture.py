#!/usr/bin/env python3
"""Optional real instrument VISA read-only acquisition.

Requires explicit operator command, installed PyVISA and vendor-compatible VISA
backend/drivers. Does NOT authenticate instrument identity or physical release.
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys
from datetime import datetime, timezone

READ_ONLY = {"*IDN?", "*OPC?", "SYST:ERR?", "CURV?", "WAV:DATA?"}
RESOURCE = re.compile(r"^[A-Za-z0-9_.:/+-]{3,180}$")

def acquire(resource, query, output, timeout_ms, visa_factory):
    if query not in READ_ONLY or not RESOURCE.fullmatch(resource):
        raise ValueError("Only explicitly allowed VISA resource and read-only query")
    if timeout_ms < 100 or timeout_ms > 10000:
        raise ValueError("VISA timeout outside range")
    path = pathlib.Path(output)
    if path.suffix.lower() not in {".csv", ".txt"}:
        raise ValueError("Capture requires .csv or .txt output")
    rm = visa_factory()
    try:
        instrument = rm.open_resource(resource)
        try:
            instrument.timeout = timeout_ms
            response = instrument.query(query)
        finally:
            instrument.close()
    finally:
        rm.close()
    if not isinstance(response, str) or len(response) > 2_000_000:
        raise ValueError("Invalid instrument text reply")
    data = response.encode("utf-8")
    if len(data) < 1:
        raise ValueError("Empty VISA response")
    path.write_bytes(data)
    return {
        "format": "invention-lab/phase94-native-visa-source-claim/1",
        "resourceClaim": resource,
        "query": query,
        "fileName": path.name,
        "rawSHA256": hashlib.sha256(data).hexdigest(),
        "bytes": len(data),
        "recordedAtUTC": datetime.now(timezone.utc).isoformat(),
        "instrumentCalibrated": False,
        "physicalSourceAuthenticated": False,
        "independentReviewComplete": False,
        "physicalQualification": "NO_GO",
    }

def main():
    p = argparse.ArgumentParser(description="Explicit read-only VISA acquisition; no hardware qualification")
    p.add_argument("--resource", required=True, help="Operator-confirmed VISA resource ID")
    p.add_argument("--query", choices=sorted(READ_ONLY), default="CURV?")
    p.add_argument("--output", required=True)
    p.add_argument("--timeout-ms", type=int, default=3000)
    a = p.parse_args()
    try:
        import pyvisa
    except ImportError as e:
        raise SystemExit("Install and configure PyVISA and a compatible VISA backend first") from e
    try:
        report = acquire(a.resource, a.query, a.output, a.timeout_ms, pyvisa.ResourceManager)
    except (ValueError, OSError, TimeoutError) as e:
        raise SystemExit("VISA acquisition rejected: " + str(e)) from e
    print(json.dumps(report, sort_keys=True, indent=2))

if __name__ == "__main__":
    main()
