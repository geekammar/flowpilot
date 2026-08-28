#!/data/data/com.termux/files/usr/bin/bash
# FlowPilot dev launcher — Termux (Android).
# Same pipeline as dev.sh, but:
# - uses the Webpack bundler (Turbopack has no native Android bindings),
# - treats on-device `prisma db push` as best effort (the Prisma schema
#   engine cannot run on Android; sync from desktop/CI when it fails).

set -euo pipefail

log() { printf '\033[1;34m▸\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m⚠\033[0m %s\n' "$*"; }

cd "$(dirname "$0")/.."

# ── 1. Dependencies ──────────────────────────────────────────────────────────
if [ ! -d node_modules ]; then
  log "node_modules missing — installing dependencies…"
  pnpm install
else
  log "dependencies present — skipping install"
fi

# ── 2. Prisma client ─────────────────────────────────────────────────────────
if [ ! -d src/generated/prisma ]; then
  log "Prisma client missing — generating…"
  pnpm db:generate
else
  log "Prisma client present — skipping generate"
fi

# ── 3. Environment ───────────────────────────────────────────────────────────
if [ ! -f .env ] && [ ! -f .env.local ]; then
  log "No env file — creating .env.local…"
  node scripts/setup-env.mjs
fi

get_env_var() { # get_env_var KEY — .env.local wins over .env
  local key="$1" file line
  for file in .env.local .env; do
    [ -f "$file" ] || continue
    line="$(grep -E "^[[:space:]]*${key}[[:space:]]*=" "$file" | tail -1 || true)"
    line="${line#*=}"
    line="${line%\"}"; line="${line#\"}"; line="${line%\'}"; line="${line#\'}"
    line="$(printf '%s' "$line" | xargs || true)"
    if [ -n "$line" ]; then printf '%s' "$line"; return 0; fi
  done
  return 0
}

# ── 4. Schema sync (best effort — schema engine unsupported on-device) ───────
DB_URL="$(get_env_var DATABASE_URL)"
if [ -z "$DB_URL" ] \
  || printf '%s' "$DB_URL" | grep -qi "user:password@" \
  || printf '%s' "$DB_URL" | grep -qi "replace-with"; then
  warn "DATABASE_URL not configured — skipping prisma db push (set it in .env.local)"
else
  log "Attempting schema sync (prisma db push)…"
  if ! pnpm db:push; then
    warn "on-device prisma db push failed (schema engine is unsupported on Android)."
    warn "The dev server still starts; sync the database from desktop/CI (pnpm db:deploy) if routes fail."
  fi
fi

# ── 5. Dev server (Webpack on Termux) ────────────────────────────────────────
log "Starting Next.js dev server (Webpack — Termux)…"
exec pnpm exec next dev --webpack
