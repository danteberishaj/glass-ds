#!/usr/bin/env bash
# Builds the library, installs it into examples/next-app as a packed tarball (exactly what
# consumers get from npm, no symlinks, so no duplicate React), and runs `next build`.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/examples/next-app"

cd "$ROOT"
npm run build
TARBALL="$(npm pack --silent --pack-destination "$APP")"
mv "$APP/$TARBALL" "$APP/glass-ds.tgz"

cd "$APP"
# The lockfile pins the previous tarball's integrity hash; drop it or npm reinstalls the stale build.
rm -rf node_modules/glass-ds .next package-lock.json
npm install --no-audit --no-fund
npx next build
