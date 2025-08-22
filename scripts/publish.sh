#!/usr/bin/env bash
set -euo pipefail

# publish.sh
# Automates: check npm auth, build (optional), and npm publish
# Usage: ./scripts/publish.sh [--no-build] [--access public] [--dry-run]

ACCESS="public"
BUILD=true
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-build)
      BUILD=false; shift ;;
    --access)
      ACCESS="$2"; shift 2 ;;
    --dry-run)
      DRY_RUN=true; shift ;;
    -h|--help)
      echo "Usage: $0 [--no-build] [--access public|restricted] [--dry-run]"; exit 0 ;;
    *)
      echo "Unknown arg: $1"; echo "Usage: $0 [--no-build] [--access public|restricted] [--dry-run]"; exit 1 ;;
  esac
done

echo "[publish] Checking npm authentication..."
if ! npm whoami >/dev/null 2>&1; then
  echo "You are not logged in to npm from this environment."
  echo "Options:"
  echo "  - run 'npm login' and follow instructions (opens browser), or"
  echo "  - set token: echo \"//registry.npmjs.org/:_authToken=TOKEN\" > ~/.npmrc"
  exit 1
fi

USER=$(npm whoami)
echo "[publish] Authenticated as: $USER"

if [ "$BUILD" = true ]; then
  echo "[publish] Building project (npm run build)..."
  npm run build
fi

if [ "$DRY_RUN" = true ]; then
  echo "[publish] Dry run: packing instead of publishing"
  npm pack
  echo "[publish] Saved tarball. Inspect before publishing.";
  exit 0
fi

echo "[publish] Publishing to npm with access=$ACCESS"
npm publish --access "$ACCESS"
echo "[publish] Publish command completed. Check npm registry for new version." 
