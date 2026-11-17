#!/usr/bin/env python3
"""Deterministic, source-only Invention Lab integration baseline.

Every original tracked source byte is frozen into a canonical ZIP. This
does not merge any PR, qualify silicon, or grant a hardware build GO.
"""
import hashlib
import io
import json
import pathlib
import stat
import subprocess
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "benchmarks" / "evidence" / "phase39"
ARCHIVE = OUT / "invention-lab-phase39-source.zip"
INFO = OUT / "phase39-release.json"
MANIFEST_NAME = "SOURCE-MANIFEST.json"
SCOPE_NAME = "PHYSICAL-SCOPE.json"
FORMAT = "invention-lab/phase39-portable-source-only-research-baseline/1"
PARENT = "04ace607290021c60d017b4a5d115044b811abcd"
ZIP_TIME = (1980, 1, 1, 0, 0, 0)

def require(test, reason):
    if not test:
        raise ValueError(reason)

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT).decode().strip()

def digest(data):
    return hashlib.sha256(data).hexdigest()

def valid_path(name):
    p = pathlib.PurePosixPath(name)
    return (bool(name) and name == str(p) and not name.startswith("/")
            and "\\" not in name and ".." not in p.parts
            and not name.startswith("./") and "\0" not in name
            and name not in (MANIFEST_NAME, SCOPE_NAME))

def manifest_and_sources():
    subprocess.run(["git", "diff", "--quiet", "HEAD", "--"], cwd=ROOT,
                   check=True)
    subprocess.run(["git", "diff", "--cached", "--quiet", "--"], cwd=ROOT,
                   check=True)
    source_commit, tree = git("rev-parse", "HEAD"), git("rev-parse", "HEAD^{tree}")
    subprocess.run(["git", "merge-base", "--is-ancestor", PARENT, "HEAD"],
                   cwd=ROOT, check=True)
    raw = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT)
    paths = [p.decode("utf-8", "strict") for p in raw.split(b"\0") if p]
    require(paths and len(paths) >= 350 and len(set(paths)) == len(paths),
            "Missing or repeated original tracked research sources")
    source = {}
    rows = []
    for name in sorted(paths):
        require(valid_path(name), "Unsafe original source path: " + name)
        actual = ROOT / name
        st = actual.lstat()
        require(stat.S_ISREG(st.st_mode), "Nonregular source or symlink: " + name)
        data = actual.read_bytes()
        blob_sha = git("hash-object", "--", name)
        git_check = subprocess.check_output(
            ["git", "cat-file", "blob", blob_sha], cwd=ROOT)
        require(git_check == data, "Not an original Git-verified file: " + name)
        source[name] = data
        rows.append({"path": name, "sizeBytes": len(data),
                     "sha256": digest(data), "gitBlobSHA1": blob_sha})
    manifest = {"format": FORMAT, "sourceCommit": source_commit,
                "sourceTree": tree, "repository": "god88844-hub/invention-lab",
                "includedFiles": len(rows), "sources": rows,
                "baselineAncestorPhase38": PARENT,
                "integrationState": "STAGED_NOT_MERGED_TO_MAIN",
                "softwareEvidenceOnly": True,
                "physicalValidation": "none",
                "physicalVerdict": "unknown",
                "realWorldBuildSuccessPercent": None}
    scope = {
        "format": "invention-lab/phase39-explicit-physical-boundaries/1",
        "project": "invention-lab",
        "simulationEvidenceIsAutomaticallyPhysicalValidation": False,
        "actualAuthenticatedALUDies": 0,
        "actualMatching3VBrushedFanPhysicalMeasurements": 0,
        "sourceOtherBLDCTestBenchNotTargetFan": True,
        "newHardwarePredictionInterval": None,
        "physicalValidation": "none",
        "physicalVerdict": "unknown",
        "realWorldBuildSuccessPercent": None,
        "manufacturingReleaseAuthorized": False
    }
    return manifest, scope, source

def serialize(data):
    return (json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode("utf-8")

def archive_entry(z, name, data):
    meta = zipfile.ZipInfo(name, date_time=ZIP_TIME)
    meta.compress_type = zipfile.ZIP_DEFLATED
    meta.external_attr = (0o100644 << 16)
    meta.create_system = 3
    z.writestr(meta, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

def assemble(manifest, scope, source):
    payload = {**source, MANIFEST_NAME: serialize(manifest),
               SCOPE_NAME: serialize(scope)}
    require(len(payload) == len(source) + 2, "Reserved payload collision")
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as z:
        for name in sorted(payload):
            archive_entry(z, name, payload[name])
    return buffer.getvalue()

def inspect_zip(zip_bytes, manifest, scope, source):
    expected = {**source, MANIFEST_NAME: serialize(manifest),
                SCOPE_NAME: serialize(scope)}
    with zipfile.ZipFile(io.BytesIO(zip_bytes), "r") as z:
        entries = z.infolist()
        require(len(entries) == len(expected), "Missing/extra ZIP entries")
        require([f.filename for f in entries] == sorted(expected),
                "Archive order, duplicate path, or source path altered")
        require(z.testzip() is None, "Corrupted compressed source data")
        for meta in entries:
            require(valid_path(meta.filename) or meta.filename in
                    (MANIFEST_NAME, SCOPE_NAME), "Unsafe ZIP entry")
            require(meta.date_time == ZIP_TIME and
                    stat.S_IFMT(meta.external_attr >> 16) == stat.S_IFREG,
                    "Timestamps or file types not reproducible")
            require(z.read(meta.filename) == expected[meta.filename],
                    "Archive does not exactly reproduce original tracked bytes")

def expected_metadata(manifest, scope, zip_bytes):
    return {
        "format": "invention-lab/phase39-verified-source-release/1",
        "sourceCommit": manifest["sourceCommit"],
        "sourceTree": manifest["sourceTree"],
        "archiveName": ARCHIVE.name,
        "archiveBytes": len(zip_bytes),
        "archiveSHA256": digest(zip_bytes),
        "sourceManifestSHA256": digest(serialize(manifest)),
        "scopeSHA256": digest(serialize(scope)),
        "trackedFilesVerified": manifest["includedFiles"],
        "deterministicBuild": True,
        "independentlyCertifiedHardware": False,
        "mergedToMain": False,
        "physicalValidation": "none",
        "physicalVerdict": "unknown",
        "realWorldBuildSuccessPercent": None}

def self_test():
    require(valid_path("js/labs/chip/engine.js"), "Valid file rejected")
    for path in ("/tmp/evil", "../secret", "a/../secret", "./bad",
                 "bad\\path", "", MANIFEST_NAME, SCOPE_NAME):
        require(not valid_path(path), "Unsafe filename accepted: " + path)
    fake = {"format": FORMAT, "sourceCommit": "a" * 40,
            "sourceTree": "b" * 40, "includedFiles": 1}
    scope = {"physicalValidation": "none", "realWorldBuildSuccessPercent": None}
    original = {"test.txt": b"source test\n"}
    archive = assemble(fake, scope, original)
    inspect_zip(archive, fake, scope, original)
    try:
        inspect_zip(archive, fake, scope, {"test.txt": b"altered"})
    except ValueError:
        pass
    else:
        raise ValueError("Corrupt source alteration was not rejected")
    require(assemble(fake, scope, original) == archive, "ZIP not deterministic")
    print("PH39 SELF-TEST PASS: canonical ZIP, path exclusions and source corruption refusals")

def main():
    if sys.argv[1:] == ["--self-test"]:
        self_test()
        return
    require(sys.argv[1:] in (["--build"], ["--verify"]),
            "Expected --build, --verify, --self-test")
    manifest, scope, source = manifest_and_sources()
    new_archive = assemble(manifest, scope, source)
    inspect_zip(new_archive, manifest, scope, source)
    info = expected_metadata(manifest, scope, new_archive)
    if sys.argv[1:] == ["--build"]:
        OUT.mkdir(parents=True, exist_ok=True)
        ARCHIVE.write_bytes(new_archive)
        INFO.write_bytes(serialize(info))
    else:
        require(ARCHIVE.read_bytes() == new_archive,
                "Published ZIP differs from deterministic original source rebuild")
        require(INFO.read_bytes() == serialize(info),
                "Release metadata or scientific-scope statements differ")
    print("PH39 SOURCE BASELINE PASS:", len(source), "tracked original source files;",
          len(new_archive), "ZIP bytes; SHA256", info["archiveSHA256"],
          "; 0 authenticated ALU or matching fan samples")

if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError,
            zipfile.BadZipFile) as e:
        print("PH39 SOURCE BASELINE FAIL:", e, file=sys.stderr)
        sys.exit(1)
