#!/usr/bin/env python3
"""Independent post-build Phase39 audit using git-index blobs, not builder helpers."""
import hashlib
import json
import pathlib
import stat
import subprocess
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "benchmarks/evidence/phase39"
FORMAT = "invention-lab/phase39-portable-source-only-research-baseline/1"
INTEGRATION_MERGE = "e1c14e52b02c336bb05ac756de9091e069f30fc1"

def research_source_integrated():
    return subprocess.run(["git","merge-base","--is-ancestor",INTEGRATION_MERGE,"HEAD"],
                          cwd=ROOT, capture_output=True, check=False).returncode == 0

def require(check, message):
    if not check:
        raise ValueError(message)

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def independent_audit():
    zip_bytes = (OUT / "invention-lab-phase39-source.zip").read_bytes()
    published = json.loads((OUT / "phase39-release.json").read_bytes())
    commit = git("rev-parse", "HEAD").decode().strip()
    tree = git("rev-parse", "HEAD^{tree}").decode().strip()
    require(published["sourceCommit"] == commit and published["sourceTree"] == tree
            and published["archiveSHA256"] == sha(zip_bytes)
            and published["archiveBytes"] == len(zip_bytes),
            "Stale, altered, or mismatched release archive/commit")
    original_paths = git("ls-files", "-z").split(b"\0")
    original_paths = sorted(p.decode("utf-8") for p in original_paths if p)
    index_rows = git("ls-files", "-s", "-z").split(b"\0")
    staged = {}
    for raw in index_rows:
        if not raw:
            continue
        left, name = raw.split(b"\t", 1)
        mode, blob, stage = left.decode().split()
        require(mode == "100644" or mode == "100755",
                "Executable regular files only; no links/submodules")
        require(stage == "0", "Non-merged Git staging index")
        staged[name.decode("utf-8")] = blob
    require(len(original_paths) == len(staged)
            and len(original_paths) >= 350, "Source Git index incomplete")
    with zipfile.ZipFile(OUT / "invention-lab-phase39-source.zip", "r") as zip_file:
        require(zip_file.testzip() is None, "Corrupt ZIP CRC")
        contents = zip_file.infolist()
        files = [item.filename for item in contents]
        require(files == sorted([*original_paths, "SOURCE-MANIFEST.json",
                                "PHYSICAL-SCOPE.json"]), "Source ZIP does not match tracked files")
        for item in contents:
            require(item.date_time == (1980, 1, 1, 0, 0, 0)
                    and stat.S_IFMT(item.external_attr >> 16) == stat.S_IFREG,
                    "Invalid ZIP mode or nondeterministic timestamp")
        manifest_bytes = zip_file.read("SOURCE-MANIFEST.json")
        scope_bytes = zip_file.read("PHYSICAL-SCOPE.json")
        manifest = json.loads(manifest_bytes)
        scope = json.loads(scope_bytes)
        require(manifest["format"] == FORMAT and
                manifest["sourceCommit"] == commit and
                manifest["sourceTree"] == tree and
                manifest["includedFiles"] == len(original_paths),
                "Embedded manifest version or commit identity mismatched")
        require(published["sourceManifestSHA256"] == sha(manifest_bytes)
                and published["scopeSHA256"] == sha(scope_bytes),
                "Evidence scope or manifest checksum mismatch")
        require(len(manifest["sources"]) == len(original_paths),
                "Manifest omitted sources or added duplicates")
        by_path = {row["path"]: row for row in manifest["sources"]}
        require(len(by_path) == len(original_paths)
                and sorted(by_path) == original_paths,
                "Manifest contains untracked sources")
        total_bytes = 0
        for path in original_paths:
            blob = staged[path]
            original_bytes = git("cat-file", "blob", blob)
            archived_bytes = zip_file.read(path)
            on_disk = (ROOT / path).read_bytes()
            require(original_bytes == archived_bytes == on_disk,
                    "Git object, original working file and ZIP differ: " + path)
            row = by_path[path]
            require(row["gitBlobSHA1"] == blob
                    and row["sha256"] == sha(original_bytes)
                    and row["sizeBytes"] == len(original_bytes),
                    "Git blob or SHA256 evidence falsified: " + path)
            total_bytes += len(original_bytes)
    require(manifest["integrationState"] == ("INTEGRATED_TO_MAIN_RESEARCH_SOURCE_ONLY" if research_source_integrated() else "STAGED_NOT_MERGED_TO_MAIN")
            and manifest["softwareEvidenceOnly"] is True
            and manifest["physicalValidation"] == "none"
            and manifest["physicalVerdict"] == "unknown"
            and manifest["realWorldBuildSuccessPercent"] is None,
            "Published source archive was falsely promoted to physical acceptance")
    require(scope["actualAuthenticatedALUDies"] == 0
            and scope["actualMatching3VBrushedFanPhysicalMeasurements"] == 0
            and scope["sourceOtherBLDCTestBenchNotTargetFan"] is True
            and scope["newHardwarePredictionInterval"] is None
            and scope["manufacturingReleaseAuthorized"] is False
            and scope["realWorldBuildSuccessPercent"] is None,
            "Physical reference data incorrectly promoted to a target qualification")
    require(published["mergedToMain"] is research_source_integrated()
            and published["independentlyCertifiedHardware"] is False
            and published["physicalValidation"] == "none"
            and published["physicalVerdict"] == "unknown"
            and published["realWorldBuildSuccessPercent"] is None,
            "Disallowed release or certification assertion")
    summary = {
        "format": "invention-lab/phase39-independent-original-source-audit/1",
        "sourceCommit": commit, "sourceTree": tree,
        "actualOriginalTrackedFiles": len(original_paths),
        "allGitTrackedBytesIndependentlyVerified": total_bytes,
        "archiveSHA256": sha(zip_bytes),
        "fullyIndependentGitObjectReplay": True,
        "allOriginalSourcesExactlyRepresented": True,
        "researchBaseline": ("INTEGRATED_RESEARCH_SOURCE_ONLY" if research_source_integrated() else "STAGED_SOFTWARE_SOURCE_ONLY"),
        "integrationIntoMain": research_source_integrated(),
        "physicallyQualifiedHardware": False,
        "physicalValidation": "none",
        "physicalVerdict": "unknown",
        "realWorldBuildSuccessPercent": None,
        "accepted": True
    }
    (OUT / "phase39-strict-summary.json").write_text(
        json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print("PH39 STRICT PASS:", len(original_paths),
          "actual Git-tracked sources,", total_bytes, "original bytes;",
          "ZIP SHA256", summary["archiveSHA256"], "hardware manufacturing NO-GO")

if __name__ == "__main__":
    try:
        independent_audit()
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError,
            zipfile.BadZipFile) as ex:
        print("PH39 STRICT FAIL:", ex, file=sys.stderr)
        sys.exit(1)
