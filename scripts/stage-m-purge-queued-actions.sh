#!/usr/bin/env bash
# Authorized branch-scoped Actions queue purge. Requires gh auth (actions:write).
set -euo pipefail
repo="god88844-hub/invention-lab"
branch="stage-m/phase73-77-foundry-guarded"
self_run_id="$(printenv GITHUB_RUN_ID || echo 0)"
: "$GH_TOKEN"
command -v gh >/dev/null
echo "Purging queued/in-progress runs on $repo branch $branch"
echo "Excluding this cleanup workflow run $self_run_id"
cancelled=0
for pass in $(seq 1 30); do
  ids="$(gh api --paginate \
    "repos/$repo/actions/runs?branch=$branch&per_page=100" \
    --jq '.workflow_runs[] | select(.head_branch == "stage-m/phase73-77-foundry-guarded") | select(.status == "queued" or .status == "in_progress" or .status == "waiting" or .status == "pending" or .status == "requested") | .id')"
  if [[ -z "$ids" ]]; then
    echo "Queue drained: no active workflow runs for this branch"
    echo "Accepted cancellation requests: $cancelled"
    exit 0
  fi
  echo "Pass $pass: $(wc -l <<< "$ids") active run IDs"
  while IFS= read -r id; do
    [[ "$id" =~ ^[0-9]+$ ]] || { echo "Malformed run ID" >&2; exit 1; }
    [[ "$id" == "$self_run_id" ]] && continue
    details="$(gh api "repos/$repo/actions/runs/$id" --jq '[.head_branch,.status] | @tsv')"
    IFS=$'\t' read -r actual_branch state <<< "$details"
    [[ "$actual_branch" == "$branch" ]] || {
      echo "Refusing cross-branch cancellation on run $id" >&2; exit 1;
    }
    case "$state" in queued|in_progress|waiting|pending|requested)
      if gh api -X POST "repos/$repo/actions/runs/$id/cancel" --silent; then
        cancelled=$((cancelled+1))
        echo "Cancel requested: $id"
      else
        now="$(gh api "repos/$repo/actions/runs/$id" --jq .status)"
        if [[ "$now" != "completed" ]]; then
          echo "Could not cancel active run $id ($now)" >&2
          exit 1
        fi
      fi
      sleep 0.25
      ;;
    completed) ;;
    *) echo "Unexpected run state $state" >&2; exit 1 ;;
    esac
  done <<< "$ids"
  # GitHub handles cancellation asynchronously; verify transitions.
  sleep 8
done
echo "Queue not drained after 30 passes; fail closed" >&2
exit 1
