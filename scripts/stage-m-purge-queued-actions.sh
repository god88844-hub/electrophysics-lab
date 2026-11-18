#!/usr/bin/env bash
# Authorized branch-scoped Actions queue purge. Requires gh auth (actions:write).
set -euo pipefail
repo="god88844-hub/invention-lab"
branch="stage-m/phase73-77-foundry-guarded"
self_run_id="$(printenv GITHUB_RUN_ID || echo 0)"
# Empty when invoked manually (purge all). With a native CI runner, keep
# same-head CI so the new head can actually get its full green workflow set.
preserve_sha="$(printenv STAGE_M_PRESERVE_SHA || echo '')"
if [[ -n "$preserve_sha" && ! "$preserve_sha" =~ ^[a-f0-9]{40}$ ]]; then
  echo "Refusing malformed preserve SHA" >&2
  exit 1
fi
export STAGE_M_PRESERVE_SHA="$preserve_sha"
: "$GH_TOKEN"
command -v gh >/dev/null
echo "Purging queued/in-progress runs on $repo branch $branch"
echo "Excluding this cleanup workflow run $self_run_id"
cancelled=0
for pass in $(seq 1 30); do
  ids="$(gh api --paginate \
    "repos/$repo/actions/runs?branch=$branch&per_page=100" \
    --jq '.workflow_runs[] | select(.head_branch == "stage-m/phase73-77-foundry-guarded") | select(.head_sha != env.STAGE_M_PRESERVE_SHA) | select(.status == "queued" or .status == "in_progress" or .status == "waiting" or .status == "pending" or .status == "requested") | .id')"
  if [[ -z "$ids" ]]; then
    echo "Older-head queue drained (same-head runs preserved when requested)"
    echo "Accepted cancellation requests: $cancelled"
    exit 0
  fi
  echo "Pass $pass: $(wc -l <<< "$ids") active run IDs"
  while IFS= read -r id; do
    [[ "$id" =~ ^[0-9]+$ ]] || { echo "Malformed run ID" >&2; exit 1; }
    [[ "$id" == "$self_run_id" ]] && continue
    details="$(gh api "repos/$repo/actions/runs/$id" --jq '[.head_branch,.status,.head_sha] | @tsv')"
    IFS=
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
\t' read -r actual_branch state actual_sha <<< "$details"
    if [[ -n "$preserve_sha" && "$actual_sha" == "$preserve_sha" ]]; then
      echo "Preserving current-head workflow $id"
      continue
    fi
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
