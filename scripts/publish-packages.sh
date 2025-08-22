#!/usr/bin/env bash
set -euo pipefail

# publish-packages.sh
# Publish two unscoped packages:
#  - chat-assistant-plugin (vanilla)
#  - react-chat-widget (react)
# The script supports --dry-run. If a version already exists on npm the script
# will auto-increment the patch version until an available version is found.

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

echo "[publish] root version: $PKG_VERSION"

TMPDIR=$(mktemp -d)
echo "[publish] tmpdir: $TMPDIR"

function bump_until_free() {
  local name=$1
  local ver=$2
  # compute the highest published version for the package and return the next patch
  # fetch published versions as JSON (empty array if not found)
  local versions_json
  versions_json=$(npm view "$name" versions --json 2>/dev/null || echo "[]")
  # if no published versions, keep requested version
  if [ "$versions_json" = "[]" ] || [ -z "$versions_json" ]; then
    echo "$ver"
    return
  fi
  # compute next version: if any published version is >= requested, bump patch past the max
  next=$(node -e '
const vers = JSON.parse(process.argv[1]||"[]");
let req = process.argv[2].split(".").map(n=>parseInt(n,10));
// normalize versions to arrays of numbers
function parseV(s){ const p=s.split(".").map(n=>parseInt(n,10)); while(p.length<3) p.push(0); return p }
let max = [0,0,0];
for(const v of vers){ const pv=parseV(v); for(let i=0;i<3;i++){ if(pv[i]>max[i]){ max=pv; break } if(pv[i]<max[i]) break } }
// if max >= req, set next to max with patch+1, else use req
let use;
for(let i=0;i<3;i++){ if(max[i]>req[i]){ use=[max[0],max[1],max[2]+1]; break } if(max[i]<req[i]){ use=req; break } if(i===2){ use=[max[0],max[1],max[2]+1] } }
if(!use) use=req;
console.log(use.join("."));
' "$versions_json" "$ver")
  echo "$next"
}

###############################
# Vanilla package
V_NAME="chat-assistant-plugin"
V_VER=${VANILLA_VERSION:-$PKG_VERSION}
V_DIR="$TMPDIR/vanilla"
mkdir -p "$V_DIR"

# copy plugin files (prefer build output when present)
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
  "name": "$V_NAME",
  "version": "$V_VER",
  "description": "Aurora standalone chat plugin (vanilla JS)",
  "main": "plugin.js",
  "files": ["plugin.js","plugin.css","README.md"],
  "license": "MIT"
}
JSON

echo "[publish] prepared vanilla at $V_DIR"
if [ "$DRY_RUN" = true ]; then
  echo "[publish] dry-run: packing vanilla"
  (cd "$V_DIR" && npm pack)
else
  # ensure version is available
  V_VER=$(bump_until_free "$V_NAME" "$V_VER")
  # update package.json with chosen version
  (cd "$V_DIR" && node -e "p=require('./package.json'); p.version=process.argv[1]; require('fs').writeFileSync('package.json', JSON.stringify(p,null,2));" "$V_VER")
  echo "[publish] publishing $V_NAME@$V_VER"
  (cd "$V_DIR" && npm publish)
fi

###############################
# React package
R_NAME="@mohamedabu.basith/react-chat-widget"
R_VER=${REACT_VERSION:-$PKG_VERSION}
R_DIR="$TMPDIR/react-widget"
mkdir -p "$R_DIR/src" "$R_DIR/styles" "$R_DIR/adapters"

cp src/components/ChatWidget.tsx "$R_DIR/src/ChatWidget.tsx"
cp src/components/MessageBubble.tsx "$R_DIR/src/MessageBubble.tsx"
cp src/types.ts "$R_DIR/types.ts"
cp src/styles/chat.css "$R_DIR/styles/chat.css" || true
cp src/adapters/sampleAdapter.ts "$R_DIR/adapters/sampleAdapter.ts" || true
cp public/react-plugin/README.md "$R_DIR/README.md" || true

cat > "$R_DIR/src/index.ts" <<'TS'
export { default } from './ChatWidget'
TS

cat > "$R_DIR/package.json" <<JSON
{
  "name": "$R_NAME",
  "version": "$R_VER",
  "description": "React chat widget",
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

# if this is a real publish, ensure the version is available before building
if [ "$DRY_RUN" = false ]; then
  R_VER=$(bump_until_free "$R_NAME" "$R_VER")
  (cd "$R_DIR" && node -e "p=require('./package.json'); p.version=process.argv[1]; require('fs').writeFileSync('package.json', JSON.stringify(p,null,2));" "$R_VER")
fi

echo "[publish] installing microbundle in temp react package"
(cd "$R_DIR" && npm install --no-audit --no-fund microbundle typescript)

echo "[publish] building react package"
(cd "$R_DIR" && npm run build)

if [ "$DRY_RUN" = true ]; then
  echo "[publish] dry-run: packing react package"
  (cd "$R_DIR" && npm pack)
else
  echo "[publish] publishing $R_NAME@$R_VER"
  # if publishing a scoped package, make it public explicitly
  PUBLISH_ARGS=""
  if [[ "$R_NAME" == @* ]]; then
    PUBLISH_ARGS="--access public"
  fi

  # try publishing; if npm rejects because the version already exists, bump and retry
  MAX_ATTEMPTS=10
  attempt=0
  tmp_errfile=$(mktemp)
  while true; do
    attempt=$((attempt+1))
    echo "[publish] attempt $attempt: npm publish $PUBLISH_ARGS"
    set +e
    (cd "$R_DIR" && npm publish $PUBLISH_ARGS) 2>"$tmp_errfile"
    pub_rc=$?
    set -e
    if [ $pub_rc -eq 0 ]; then
      echo "[publish] success: $R_NAME@$R_VER"
      break
    fi
    pub_err=$(cat "$tmp_errfile" || true)
    # detect the error message for already published version
    if echo "$pub_err" | grep -qi "Cannot publish over previously published version"; then
      echo "[publish] publish failed: previously published version, bumping and retrying" >&2
  # increment the local patch version (avoid registry-query flakiness) and write it
  R_VER=$(node -e "v=process.argv[1].split('.').map(Number); v[2]+=1; console.log(v.join('.'))" "$R_VER")
  (cd "$R_DIR" && node -e "p=require('./package.json'); p.version=process.argv[1]; require('fs').writeFileSync('package.json', JSON.stringify(p,null,2));" "$R_VER")
      echo "[publish] rebuilding react package at $R_VER"
      (cd "$R_DIR" && npm run build)
      if [ $attempt -ge $MAX_ATTEMPTS ]; then
        echo "[publish] max publish attempts reached ($MAX_ATTEMPTS), aborting" >&2
        cat "$tmp_errfile" >&2 || true
        rm -f "$tmp_errfile"
        exit 1
      fi
      continue
    else
      echo "[publish] publish failed with an unexpected error:" >&2
      cat "$tmp_errfile" >&2 || true
      rm -f "$tmp_errfile"
      exit $pub_rc
    fi
  done
  rm -f "$tmp_errfile"
fi

echo "[publish] cleaning up $TMPDIR"
rm -rf "$TMPDIR"

echo "[publish] done"
