#!/usr/bin/env bash
set -euo pipefail

# publish-all.sh
# Build the project, publish the vanilla plugin (from build or public), then
# scaffold a temporary React package using microbundle to build and publish it.
# Usage: scripts/publish-all.sh [--dry-run]

DRY_RUN=false
while [[ ${1:-} != "" ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    -h|--help) echo "Usage: $0 [--dry-run]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ROOT=$(pwd)
PKG_VERSION=$(node -p "require('./package.json').version")
USER_NAME=$(npm whoami 2>/dev/null || true)
if [ -z "$USER_NAME" ]; then
  echo "Not logged in to npm. Run 'npm login' or set //registry.npmjs.org/:_authToken in ~/.npmrc" >&2
  exit 1
fi

echo "[publish-all] npm user: $USER_NAME"

echo "[publish-all] Building root project..."
npm run build

########################################
# Publish vanilla plugin
VANILLA_PKG_NAME=${VANILLA_PKG_NAME:-"@${USER_NAME}/aurora-plugin"}
VANILLA_VERSION=${VANILLA_VERSION:-$PKG_VERSION}
TMPDIR=$(mktemp -d)
V_DIR="$TMPDIR/vanilla"
mkdir -p "$V_DIR"

# prefer build/vanilla-plugin if present, otherwise public/vanilla-plugin
if [ -d build/vanilla-plugin ]; then
  cp build/vanilla-plugin/plugin.js "$V_DIR/plugin.js" || true
  cp build/vanilla-plugin/plugin.css "$V_DIR/plugin.css" || true
else
  cp public/vanilla-plugin/plugin.js "$V_DIR/plugin.js" || true
  cp public/vanilla-plugin/plugin.css "$V_DIR/plugin.css" || true
fi
cp public/vanilla-plugin/README.md "$V_DIR/README.md" || true

cat > "$V_DIR/package.json" <<JSON
{
  "name": "$VANILLA_PKG_NAME",
  "version": "$VANILLA_VERSION",
  "description": "Aurora standalone chat plugin (vanilla JS)",
  "main": "plugin.js",
  "files": ["plugin.js","plugin.css","README.md"],
  "license": "MIT"
}
JSON

echo "[publish-all] Prepared vanilla package at $V_DIR"
if [ "$DRY_RUN" = true ]; then
  echo "[publish-all] Dry run: packing vanilla..."
  (cd "$V_DIR" && npm pack)
else
  echo "[publish-all] Publishing vanilla as $VANILLA_PKG_NAME"
  (cd "$V_DIR" && npm publish --access public)
fi

########################################
# Publish React widget using microbundle (temporary package)
REACT_PKG_NAME=${REACT_PKG_NAME:-"@${USER_NAME}/react-chat-widget"}
REACT_VERSION=${REACT_VERSION:-$PKG_VERSION}
R_DIR="$TMPDIR/react-widget"
mkdir -p "$R_DIR/src"

# Copy minimal needed files (component and bubble). We copy and adapt imports to local.
cp src/components/ChatWidget.tsx "$R_DIR/src/ChatWidget.tsx"
cp src/components/MessageBubble.tsx "$R_DIR/src/MessageBubble.tsx"
cp src/types.ts "$R_DIR/src/types.ts"
cp src/styles/chat.css "$R_DIR/src/chat.css" || true

# Create entry that exports default ChatWidget
cat > "$R_DIR/src/index.ts" <<'TS'
export { default } from './ChatWidget'
TS

cat > "$R_DIR/package.json" <<JSON
{
  "name": "$REACT_PKG_NAME",
  "version": "$REACT_VERSION",
  "description": "React chat widget (Aurora)",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "microbundle --no-compress --no-sourcemap"
  },
  "peerDependencies": {
    "react": "^17 || ^18",
    "react-dom": "^17 || ^18"
  }
}
JSON

echo "[publish-all] Installing microbundle in temp react package (this may take a minute)..."
(cd "$R_DIR" && npm install --no-audit --no-fund --silent microbundle typescript)

echo "[publish-all] Building React package..."
(cd "$R_DIR" && npm run build)

if [ "$DRY_RUN" = true ]; then
  echo "[publish-all] Dry run: packing react package..."
  (cd "$R_DIR" && npm pack)
else
  echo "[publish-all] Publishing React package as $REACT_PKG_NAME"
  (cd "$R_DIR" && npm publish --access public)
fi

echo "[publish-all] Cleanup tempdir $TMPDIR"
rm -rf "$TMPDIR"

echo "[publish-all] Done."
