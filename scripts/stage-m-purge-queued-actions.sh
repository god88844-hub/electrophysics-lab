#!/usr/bin/env bash
# Cancel superseded same-branch runs only; does not waive any required CI gate.
set -euo pipefail
repo='god88844-hub/invention-lab'
branch='stage-m/phase73-77-foundry-guarded'
self_run_id="$GITHUB_RUN_ID"
preserve_sha="$STAGE_M_PRESERVE_SHA"
: "$GH_TOKEN"
command -v gh >/dev/null
if [[ -n "$preserve_sha" && ! "$preserve_sha" =~ ^[a-f0-9]{40}$ ]]; then
  echo 'Invalid SHA-to-preserve' >&2
  exit 1
fi
for pass in $(seq 1 30); do
  filter='.workflow_runs[] | select(.head_branch == "stage-m/phase73-77-foundry-guarded") | select(.status == "queued" or .status == "in_progress" or .status == "waiting" or .status == "pending" or .status == "requested")'
  if [[ -n "$preserve_sha" ]]; then
    filter="$filter | select(.head_sha != \"$preserve_sha\")"
  fi
  ids="$(gh api --paginate "repos/$repo/actions/runs?branch=$branch&per_page=100" --jq "$filter | .id")"
  if [[ -z "$ids" ]]; then
    echo 'No stale active runs remain for this branch'
    exit 0
  fi
  while IFS= read -r id; do
    [[ "$id" =~ ^[0-9]+$ ]] || { echo 'Malformed run ID' >&2; exit 1; }
    [[ "$id" == "$self_run_id" ]] && continue
    details="$(gh api "repos/$repo/actions/runs/$id" --jq '[.head_branch,.status,.head_sha] | @tsv')"
    IFS=$'\t' read -r actual_branch state actual_sha <<< "$details"
    [[ "$actual_branch" == "$branch" ]] || { echo 'Refusing cross-branch cancellation' >&2; exit 1; }
    [[ -n "$preserve_sha" && "$actual_sha" == "$preserve_sha" ]] && continue
    case "$state" in
      queued|in_progress|waiting|pending|requested)
        if ! gh api -X POST "repos/$repo/actions/runs/$id/cancel" --silent; then
          current="$(gh api "repos/$repo/actions/runs/$id" --jq '.status')"
          [[ "$current" == completed ]] || { echo "Cancellation refused for $id" >&2; exit 1; }
        fi
        sleep 0.25
        ;;
      completed) ;;
      *) echo "Unrecognized run state $state" >&2; exit 1 ;;
    esac
  done <<< "$ids"
  sleep 8
done
echo 'Queue did not drain; failing closed' >&2
exit 1
