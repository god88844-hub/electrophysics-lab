#!/usr/bin/env python3
"""Phase38 read-only integration preflight of the LIVE Invention Lab PR stack.

Fetches public GitHub PR refs, audits the exact dependency DAG and performs
local throwaway Git merges from main. Never pushes, updates main or merges PRs.
"""
import json
import os
import pathlib
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request

OWNER_REPO = "god88844-hub/invention-lab"
FIRST = 3
LAST = 37


def assert_condition(condition, message):
    if not condition:
        raise RuntimeError(message)


def git(*arguments, cwd=None, check=True):
    return subprocess.run(
        ["git", *arguments], cwd=cwd, check=check,
        capture_output=True, text=True)


def read_live_pull_requests():
    url = f"https://api.github.com/repos/{OWNER_REPO}/pulls?state=open&per_page=100"
    headers = {"Accept": "application/vnd.github+json",
               "User-Agent": "invention-lab-phase38-integration-audit"}
    token = os.getenv("GH_TOKEN")
    if token:
        headers["Authorization"] = "Bearer " + token
    with urllib.request.urlopen(
            urllib.request.Request(url, headers=headers), timeout=40) as response:
        data = json.load(response)
    assert_condition(isinstance(data, list), "Live GitHub PR list invalid")
    by_num = {item["number"]: item for item in data}
    expected = set(range(FIRST, LAST + 1))
    missing = sorted(expected - by_num.keys())
    assert_condition(not missing, f"Missing live unmerged PRs: {missing}")
    entries = []
    for number in sorted(expected):
        pr = by_num[number]
        base = pr["base"]["ref"]
        head = pr["head"]["ref"]
        expected_base = ("main" if number in (3, 4)
                         else entries[-1]["headBranch"])
        assert_condition(pr["state"] == "open" and pr["merged_at"] is None,
                         f"PR{number} not open/unmerged")
        assert_condition(pr["head"]["repo"]["full_name"] == OWNER_REPO,
                         f"PR{number} comes from a foreign repository")
        assert_condition(base == expected_base,
                         f"PR{number} must target {expected_base}; got {base}")
        assert_condition(isinstance(pr["head"]["sha"], str)
                         and len(pr["head"]["sha"]) == 40,
                         f"Missing exact PR{number} head SHA")
        entries.append({
            "number": number,
            "headBranch": head,
            "headSha": pr["head"]["sha"],
            "baseBranch": base,
            "draft": pr["draft"],
            "url": pr["html_url"],
            "merged": False
        })
    return entries


def assert_local_worktree_unchanged(before):
    assert_condition(git("status", "--porcelain").stdout == before,
                     "Phase38 preflight modified checkout working tree")


def simulate_local_integration(prs):
    # Never fetch or checkout into actual main; use private, disposable worktree.
    git("fetch", "--no-tags", "origin", "main")
    refspecs = [
        f"+refs/pull/{pr['number']}/head:refs/remotes/phase38/pr-{pr['number']}"
        for pr in prs
    ]
    git("fetch", "--no-tags", "origin", *refspecs)
    for pr in prs:
        local_ref = f"refs/remotes/phase38/pr-{pr['number']}"
        real_head = git("rev-parse", local_ref).stdout.strip()
        assert_condition(real_head == pr["headSha"],
                         f"PR{pr['number']} changed during integration preflight")
    real_main_sha = git("rev-parse", "refs/remotes/origin/main").stdout.strip()
    summary = {
        "format": "invention-lab/phase38-readonly-dryrun-live-pr-stack/1",
        "repository": OWNER_REPO, "sourceCommit": git("rev-parse", "HEAD").stdout.strip(),
        "originalMainSha": real_main_sha, "originalPRCount": len(prs),
        "expectedPRNumbers": [p["number"] for p in prs],
        "originalPRHeads": prs,
        "expectedIntegrationOrder": [p["number"] for p in prs],
        "integrationBasis": "live PR head refs merged locally in a temporary worktree",
        "localOnly": True, "remotePRsMerged": 0, "originalMainModified": False,
        "reviewedAndIntegratedPRs": [], "firstBlockingPR": None,
        "conflictedFiles": [], "mergeErrorExcerpt": None,
        "fullDryRunIntegrated": False, "integratedNpmTestsPassed": None,
        "physicalValidation": "none", "physicalVerdict": "unknown",
        "realWorldBuildSuccessPercent": None
    }
    status_before = git("status", "--porcelain").stdout
    with tempfile.TemporaryDirectory(prefix="invention-lab-phase38-") as directory:
        working = pathlib.Path(directory) / "staging"
        git("worktree", "add", "--detach", str(working),
            "refs/remotes/origin/main")
        try:
            git("config", "user.name", "Invention Lab CI temporary integration",
                cwd=working)
            git("config", "user.email", "integration-preflight@example.invalid",
                cwd=working)
            for pr in prs:
                ref = f"refs/remotes/phase38/pr-{pr['number']}"
                result = git("merge", "--no-ff", "--no-edit", "--no-gpg-sign",
                             "-m", f"Phase38 temporary PR #{pr['number']} merge preflight",
                             ref, cwd=working, check=False)
                if result.returncode != 0:
                    files = git("diff", "--name-only", "--diff-filter=U",
                                cwd=working).stdout.splitlines()
                    summary["firstBlockingPR"] = pr["number"]
                    summary["conflictedFiles"] = files
                    summary["mergeErrorExcerpt"] = (
                        result.stdout + "\n" + result.stderr)[-5000:]
                    git("merge", "--abort", cwd=working, check=False)
                    print(f"PH38 MERGE CONFLICT: original PR #{pr['number']}, "
                          f"files {files}")
                    break
                summary["reviewedAndIntegratedPRs"].append(pr["number"])
                print(f"PH38 DRY-RUN MERGED PR #{pr['number']} (NO remote writes)")
            if len(summary["reviewedAndIntegratedPRs"]) == len(prs):
                summary["fullDryRunIntegrated"] = True
                result = subprocess.run(["npm", "test"], cwd=working,
                                        capture_output=True, text=True,
                                        timeout=300, check=False)
                summary["integratedNpmTestsPassed"] = result.returncode == 0
                summary["integratedNpmTestsExcerpt"] = (
                    result.stdout + "\n" + result.stderr)[-5000:]
                if result.returncode != 0:
                    print("PH38 INTEGRATION TESTS FAILED on temporary merge tree")
                else:
                    print("PH38 INTEGRATION TESTS PASS on complete temporary tree")
        finally:
            git("worktree", "remove", "--force", str(working), check=False)
    assert_local_worktree_unchanged(status_before)
    return summary


def self_test():
    mocked = [{"number": n, "headBranch": f"branch-{n}"}
              for n in range(FIRST, LAST + 1)]
    assert_condition(len(mocked) == 35 and mocked[-1]["number"] == 37,
                     "Unexpected integration phase count")
    assert_condition(mocked[1]["number"] == 4
                     and mocked[2]["number"] == 5, "Broken PR dependency ordering")
    print("PH38 SELF-TEST PASS: 35 ordered legacy development PRs, no remote mutations")


def main():
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
        return
    assert_condition(len(sys.argv) == 1, "Expected --self-test or no arguments")
    live = read_live_pull_requests()
    result = simulate_local_integration(live)
    out = pathlib.Path("benchmarks/evidence/phase38")
    out.mkdir(parents=True, exist_ok=True)
    (out / "phase38-preflight.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    summary = {
        "format": "invention-lab/phase38-preflight-result/1",
        "sourceCommit": result["sourceCommit"],
        "liveStackValid": True, "unmergedPRCount": len(live),
        "mergeableWithoutConflict": result["fullDryRunIntegrated"],
        "firstBlockingPR": result["firstBlockingPR"],
        "conflictedFiles": result["conflictedFiles"],
        "integratedNpmTestsPassed": result["integratedNpmTestsPassed"],
        "mainUnchanged": True, "PRsActuallyMerged": 0,
        "phase38IntegrationComplete": False,
        "physicalValidation": "none", "physicalVerdict": "unknown",
        "realWorldBuildSuccessPercent": None
    }
    (out / "phase38-summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if result["fullDryRunIntegrated"] and result["integratedNpmTestsPassed"]:
        print(f"PH38 PREFLIGHT PASS: {len(live)} PRs locally merged and "
              "temporary integrated Node tests passed. Main remains unchanged.")
    else:
        print(f"PH38 PREFLIGHT BLOCKED: first blocking PR {result['firstBlockingPR']}; "
              f"conflicts: {result['conflictedFiles']}; "
              "no pull requests or main were changed.")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, OSError, ValueError, KeyError, subprocess.CalledProcessError,
            urllib.error.URLError, subprocess.TimeoutExpired) as exc:
        print("PH38 PREFLIGHT ERROR:", str(exc), file=sys.stderr)
        sys.exit(1)
