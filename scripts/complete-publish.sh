#!/usr/bin/env bash
set -euo pipefail

# complete-publish.sh
# Complete pipeline: Build → Publish → Clean caches
# Usage: ./scripts/complete-publish.sh [--dry-run]

DRY_RUN=false
while [[ ${1:-} != "" ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    -h|--help) 
      echo "Usage: $0 [--dry-run]"
      echo ""
      echo "Complete publishing pipeline:"
      echo "  1. Build vanilla plugin"
      echo "  2. Publish both packages"
      echo "  3. Clean all caches"
      echo ""
      echo "Options:"
      echo "  --dry-run    Test without publishing"
      echo "  -h, --help   Show this help"
      exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ROOT=$(pwd)
echo "🚀 Starting complete publishing pipeline..."
echo "📁 Working directory: $ROOT"

# Step 1: Build vanilla plugin
echo ""
echo "🏗️  STEP 1: Building vanilla plugin..."
if command -v node >/dev/null 2>&1; then
  node scripts/build-vanilla.js
else
  echo "❌ Node.js not found. Please install Node.js."
  exit 1
fi

# Step 2: Publish packages
echo ""
echo "📦 STEP 2: Publishing packages..."
if [ "$DRY_RUN" = true ]; then
  echo "🧪 Running in dry-run mode..."
  ./scripts/publish-packages.sh --dry-run
else
  echo "🚀 Publishing to npm..."
  ./scripts/publish-packages.sh
fi

# Step 3: Clean caches
echo ""
echo "🧹 STEP 3: Cleaning caches..."

# Clean npm cache
echo "🔄 Cleaning npm cache..."
npm cache clean --force 2>/dev/null || echo "⚠️  npm cache clean failed (may not have permissions)"

# Clean node_modules if exists
if [ -d "node_modules" ]; then
  echo "🗑️  Removing node_modules..."
  rm -rf node_modules
fi

# Clean package-lock.json
if [ -f "package-lock.json" ]; then
  echo "🗑️  Removing package-lock.json..."
  rm -f package-lock.json
fi

# Clean yarn cache if yarn is available
if command -v yarn >/dev/null 2>&1; then
  echo "🧶 Cleaning yarn cache..."
  yarn cache clean 2>/dev/null || echo "⚠️  yarn cache clean failed"
fi

# Clean build directories
echo "🗑️  Cleaning build directories..."
[ -d "build" ] && rm -rf build && echo "   ✅ Removed build/"
[ -d "dist" ] && rm -rf dist && echo "   ✅ Removed dist/"
[ -d ".next" ] && rm -rf .next && echo "   ✅ Removed .next/"
[ -d ".vite" ] && rm -rf .vite && echo "   ✅ Removed .vite/"

# Clean temporary files
echo "🗑️  Cleaning temporary files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Clean npm temporary directories in /tmp
echo "🗑️  Cleaning npm temp directories..."
rm -rf /tmp/npm-* 2>/dev/null || true
rm -rf /tmp/tmp.* 2>/dev/null || true

# Clean system caches (if available)
if command -v docker >/dev/null 2>&1; then
  echo "🐳 Cleaning Docker build cache..."
  docker builder prune -f 2>/dev/null || echo "⚠️  Docker cache clean failed"
fi

# Reinstall clean dependencies (unless dry-run)
if [ "$DRY_RUN" = false ]; then
  echo ""
  echo "📥 STEP 4: Reinstalling clean dependencies..."
  npm install
  echo "✅ Dependencies reinstalled"
fi

echo ""
echo "🎉 Complete publishing pipeline finished!"
echo ""
if [ "$DRY_RUN" = true ]; then
  echo "📋 Summary (DRY RUN):"
  echo "  ✅ Vanilla plugin built"
  echo "  🧪 Packages tested (not published)"
  echo "  🧹 Caches cleaned"
else
  echo "📋 Summary:"
  echo "  ✅ Vanilla plugin built"
  echo "  📦 Packages published to npm"
  echo "  🧹 All caches cleaned"
  echo "  📥 Fresh dependencies installed"
  echo ""
  echo "🌐 Your packages are live on npm:"
  echo "  • chat-assistant-plugin"
  echo "  • @mohamedabu.basith/react-chat-widget"
fi
echo ""
