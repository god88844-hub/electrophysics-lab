#!/usr/bin/env python3
"""Authenticate and optionally extract the original Phase 39 archive."""
import hashlib
import importlib.util
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import zipfile


def require(condition, message):
    if not condition:
        raise ValueError(message)


def git(repo, *args):
    return subprocess.check_output(["git", *args], cwd=repo)


def safe_member(name):
    parts = PurePosixPath(name).parts
    return (
        bool(parts) and str(PurePosixPath(name)) == name
        and all(re.fullmatch(r"[^<>:\"\\|?*\x00-\x1f]+", p)
                and not p.endswith((".", " "))
                and p.split(".")[0].upper()
                not in {"CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(1, 10)),
                        *(f"LPT{i}" for i in range(1, 10))}
                for p in parts)
        and not name.startswith("/")
        and ".." not in parts
    )


def check(repo, baseline, destination=None):
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location(
        "phase39", repo / "scripts" / "phase39-source-baseline.py"
    )
    phase39 = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(phase39)

    dirty = git(repo, "status", "--porcelain=v1", "--untracked-files=no")
    require(not dirty, "dirty tracked tree")
    git(repo, "merge-base", "--is-ancestor", phase39.PARENT, "HEAD")
    commit = git(repo, "rev-parse", "HEAD").decode().strip()
    tree = git(repo, "rev-parse", "HEAD^{tree}").decode().strip()
    original = {}
    for record in git(repo, "ls-tree", "-rz", "HEAD").split(b"\0"):
        if not record:
            continue
        raw, name = record.decode("utf-8", "strict").split("\t", 1)
        mode, kind, oid = raw.split()
        require(mode in ("100644", "100755") and kind == "blob" and safe_member(name),
                f"unsupported Phase 39 source member: {name}")
        original[name] = oid
    require(len(original) >= 350, "Phase 39 source tree incomplete")

    archive = baseline / phase39.ARCHIVE.name
    metadata_path = baseline / phase39.INFO.name
    require(archive.is_file() and metadata_path.is_file(), "Phase 39 archive or release metadata missing")
    require(archive.stat().st_size <= 64 * 1024 * 1024, "Phase 39 ZIP exceeds release budget")
    data = archive.read_bytes()
    info = json.loads(metadata_path.read_bytes())
    require(info.get("sourceCommit") == commit and info.get("sourceTree") == tree,
            "Phase 39 baseline does not bind current HEAD and tree")
    require(info.get("archiveSHA256") == phase39.digest(data)
            and info.get("archiveBytes") == len(data), "Phase 39 archive SHA-256 or size mismatch")
    source = {}
    with zipfile.ZipFile(archive) as z:
        names = z.namelist()
        extra = [phase39.MANIFEST_NAME, phase39.SCOPE_NAME]
        require(names == sorted([*original, *extra]) and len(names) == len(set(n.lower() for n in names)),
                "incorrect, duplicate or unsafe Phase 39 members")
        require(sum(x.file_size for x in z.infolist()) <= 128 * 1024 * 1024,
                "Phase 39 source exceeds extraction budget")
        manifest = json.loads(z.read(phase39.MANIFEST_NAME))
        scope = json.loads(z.read(phase39.SCOPE_NAME))
        for name in original:
            content = z.read(name)
            blob = hashlib.sha1(b"blob " + str(len(content)).encode() + b"\0" + content).hexdigest()
            require(blob == original[name], f"Phase 39 ZIP member disagrees with Git object: {name}")
            source[name] = content
    expected_rows = [{"path": path, "sizeBytes": len(source[path]), "sha256": phase39.digest(source[path]),
                      "gitBlobSHA1": original[path]} for path in sorted(source)]
    require(manifest.get("sourceCommit") == commit and manifest.get("sourceTree") == tree
            and manifest.get("format") == phase39.FORMAT and manifest.get("includedFiles") == len(original)
            and manifest.get("sources") == expected_rows and manifest.get("softwareEvidenceOnly") is True
            and manifest.get("physicalValidation") == "none", "Phase 39 source manifest mismatch")
    require(scope.get("manufacturingReleaseAuthorized") is False and scope.get("physicalValidation") == "none"
            and scope.get("realWorldBuildSuccessPercent") is None, "Phase 39 physical scope mismatch")
    require(info == phase39.expected_metadata(manifest, scope, data), "Phase 39 metadata mismatch")
    require(data == phase39.assemble(manifest, scope, source),
            "Phase 39 ZIP is not the canonical archive")
    require(not git(repo, "status", "--porcelain=v1", "--untracked-files=no")
            and git(repo, "rev-parse", "HEAD").decode().strip() == commit,
            "source checkout changed during Phase 39 verification")
    if destination is not None:
        destination = destination.resolve()
        require(not destination.is_relative_to(repo.resolve()), "release extraction must be outside the Git checkout")
        destination.mkdir(parents=True, exist_ok=False)
        for name, content in source.items():
            path = destination / name
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("xb") as output:
                output.write(content)
        for name, value in ((phase39.MANIFEST_NAME, manifest), (phase39.SCOPE_NAME, scope)):
            (destination / name).write_bytes(phase39.serialize(value))
    return info


if __name__ == "__main__":
    try:
        if len(sys.argv) not in (3, 4):
            raise ValueError("usage: phase39-release-source.py REPO BASELINE_DIR [NEW_SOURCE_DIR]")
        args = [Path(x).resolve() for x in sys.argv[1:]]
        print(json.dumps(check(*args), separators=(",", ":")))
    except (OSError, ValueError, TypeError, KeyError, subprocess.SubprocessError, zipfile.BadZipFile) as failure:
        sys.exit(f"Phase 39 release refused: {failure}")
