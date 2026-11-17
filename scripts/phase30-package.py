#!/usr/bin/env python3
"""Deterministic complete Git-tracked research source ZIP; never silicon signoff.

python3 scripts/phase30-package.py [--verify]
"""
import hashlib
import json
import pathlib
import subprocess
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "benchmarks" / "evidence" / "phase30"
MANIFEST = OUT / "phase30-source-manifest.json"
PACKAGE = OUT / "invention-lab-phase30-research-source.zip"
PACKAGE_INFO = OUT / "phase30-package.json"
EXTRA_MANIFEST = "RELEASE-SOURCE-MANIFEST.json"
EXTRA_LIMIT = "PHYSICAL-RELEASE-BLOCKERS.txt"
BLOCKERS = (
    "Invention Lab Phase30 source-only research candidate.\n"
    "Original target ALU silicon: NOT physically validated.\n"
    "Measured original ALU hardware: ZERO.\n"
    "Manufacturing success percent: UNKNOWN / NULL.\n"
    "Model-only CI does not qualify physical chip fabrication.\n"
    "Product release: NO-GO pending independent physical measurements.\n"
    "No development PRs were merged by this release process.\n"
).encode("utf-8")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def source_paths():
    raw = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT)
    paths = sorted(p.decode("utf-8") for p in raw.split(b"\0") if p)
    for path in paths:
        posix = pathlib.PurePosixPath(path)
        if path.startswith("/") or ".." in posix.parts or "\\" in path or not path:
            raise ValueError("Unsafe tracked release file: " + path)
    return paths


def source_manifest():
    manifest_bytes = MANIFEST.read_bytes()
    manifest = json.loads(manifest_bytes)
    if (manifest.get("format") !=
            "invention-lab/phase30-tracked-source-distribution/1"
            or manifest.get("softwareOnly") is not True
            or manifest.get("authenticatedHardwareMeasurements") != 0
            or manifest.get("physicalValidation") != "none"
            or manifest.get("physicalVerdict") != "unknown"
            or manifest.get("realWorldBuildSuccessPercent") is not None):
        raise ValueError("Original source manifest promotes physical validity")
    actual = source_paths()
    if actual != [f["path"] for f in manifest["files"]]:
        raise ValueError("Manifest did not enumerate all original tracked source files")
    source = {}
    for item in manifest["files"]:
        name = item["path"]
        data = (ROOT / name).read_bytes()
        if len(data) != item["bytes"] or sha(data) != item["sha256"]:
            raise ValueError("Tracked file byte or SHA mismatch: " + name)
        source[name] = data
    if len(source) < 100:
        raise ValueError("Incomplete original research release source set")
    return manifest_bytes, manifest, source


def zip_item(z, name, data):
    meta = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    meta.compress_type = zipfile.ZIP_DEFLATED
    meta.external_attr = 0o100644 << 16
    meta.create_system = 3
    z.writestr(meta, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)


def info_for(manifest_bytes, manifest, archive):
    return {
        "format": "invention-lab/phase30-original-research-source-distribution/1",
        "sourceCommit": manifest["sourceCommit"],
        "distributionFile": PACKAGE.name,
        "distributionSha256": sha(archive),
        "distributionBytes": len(archive),
        "sourceManifestSha256": sha(manifest_bytes),
        "sourceFileCount": len(manifest["files"]),
        "sourceOnly": True,
        "actualQualifiedALUHardwareCount": 0,
        "physicalValidation": "none",
        "physicalVerdict": "unknown",
        "realWorldBuildSuccessPercent": None,
    }


def verify():
    manifest_bytes, manifest, original = source_manifest()
    with zipfile.ZipFile(PACKAGE, "r") as archive:
        if archive.testzip() is not None:
            raise ValueError("Research release ZIP CRC mismatch")
        expected = sorted([*original, EXTRA_MANIFEST, EXTRA_LIMIT])
        if sorted(archive.namelist()) != expected:
            raise ValueError("Unexpected, missing or duplicated ZIP source paths")
        for path, data in original.items():
            if archive.read(path) != data:
                raise ValueError("Archived source differs from original: " + path)
        if archive.read(EXTRA_MANIFEST) != manifest_bytes or archive.read(EXTRA_LIMIT) != BLOCKERS:
            raise ValueError("Release statement or original source manifest not reproducible")
        if any(item.date_time != (1980, 1, 1, 0, 0, 0) for item in archive.infolist()):
            raise ValueError("Source ZIP contains nonreproducible timestamps")
    expected_info = info_for(manifest_bytes, manifest, PACKAGE.read_bytes())
    if json.loads(PACKAGE_INFO.read_text(encoding="utf-8")) != expected_info:
        raise ValueError("Final release source SHA, physical flag or length corrupted")
    print("PH30 PACKAGE STRICT PASS:", len(original), "SHA256 original tracked source files;",
          "zip digest", expected_info["distributionSha256"], "physical UNKNOWN")


def main():
    manifest_bytes, manifest, original = source_manifest()
    if sys.argv[1:] == ["--verify"]:
        verify()
        return
    if len(sys.argv) != 1:
        raise ValueError("Usage: python3 scripts/phase30-package.py [--verify]")
    if EXTRA_MANIFEST in original or EXTRA_LIMIT in original:
        raise ValueError("Reserved source manifest ZIP entry collision")
    OUT.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(PACKAGE, "w") as archive:
        for name, data in original.items():
            zip_item(archive, name, data)
        zip_item(archive, EXTRA_MANIFEST, manifest_bytes)
        zip_item(archive, EXTRA_LIMIT, BLOCKERS)
    metadata = info_for(manifest_bytes, manifest, PACKAGE.read_bytes())
    PACKAGE_INFO.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    verify()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("PH30 PACKAGE FAIL:", e, file=sys.stderr)
        sys.exit(1)
