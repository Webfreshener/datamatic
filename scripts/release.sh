#!/usr/bin/env bash
set -euo pipefail

version_type="${1:-patch}"

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" != "main" ]]; then
  echo "error: must be on main (current: $branch)" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: working tree not clean" >&2
  exit 1
fi

git pull origin main

npm version "$version_type"
git push origin main --tags
npm publish
