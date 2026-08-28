#!/data/data/com.termux/files/usr/bin/bash
# FlowPilot bootstrap — Termux (Android).
# Verifies node, pnpm, git, gh via pkg. Installs ONLY what is missing.
# Also repairs the stock Termux pnpm shim, whose `#!/usr/bin/env node`
# shebang is broken on Termux (no /usr/bin/env) — verified working before
# any change is made. Then runs the project one-command setup.

set -euo pipefail

PREFIX="${PREFIX:-/data/data/com.termux/files/usr}"
PNPM_VERSION="11.24.0" # must match "packageManager" in package.json
PNPM_MJS="$PREFIX/lib/node_modules/pnpm/bin/pnpm.mjs"

log() { printf '\033[1;32m▸\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m⚠\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }
works() { "$@" >/dev/null 2>&1; }

[ -d "$PREFIX" ] || fail "Not running inside Termux (PREFIX=$PREFIX). Use scripts/bootstrap.sh instead."
cd "$(dirname "$0")/.."
log "FlowPilot bootstrap — Termux ($(uname -m))"

log "Updating package lists…"
pkg update -y || warn "pkg update failed — continuing with cached repositories"

# ── node ─────────────────────────────────────────────────────────────────────
if have node && works node --version; then
  ok "node $(node --version) already installed — skipping"
else
  log "Installing nodejs-lts…"
  pkg install -y nodejs-lts || fail "Could not install nodejs-lts. Run: pkg install nodejs-lts"
  ok "node $(node --version) installed"
fi

# ── git ──────────────────────────────────────────────────────────────────────
if have git && works git --version; then
  ok "git already installed — skipping"
else
  log "Installing git…"
  pkg install -y git || fail "Could not install git. Run: pkg install git"
  ok "git installed"
fi

# ── gh (best effort — never blocks) ──────────────────────────────────────────
if have gh && works gh --version; then
  ok "gh already installed — skipping"
else
  log "Installing GitHub CLI (optional)…"
  if pkg install -y gh; then
    ok "gh installed"
  else
    warn "gh is unavailable in your Termux repositories. See https://cli.github.com/ — only needed for GitHub workflows."
  fi
fi

# ── pnpm (install if missing, repair if the stock shim is broken) ────────────
if works pnpm --version; then
  ok "pnpm $(pnpm --version) already works — skipping"
else
  log "pnpm is missing or has a broken Termux shebang — fixing…"
  [ -f "$PNPM_MJS" ] || npm install -g "pnpm@${PNPM_VERSION}" \
    || fail "Could not install pnpm. Run: npm install -g pnpm@${PNPM_VERSION}"
  # Replace the env-shebang shim with a direct node wrapper (idempotent).
  rm -f "$PREFIX/bin/pnpm"
  printf '#!%s/bin/sh\nexec %s/bin/node "%s" "$@"\n' "$PREFIX" "$PREFIX" "$PNPM_MJS" \
    > "$PREFIX/bin/pnpm"
  chmod +x "$PREFIX/bin/pnpm"
  works pnpm --version || fail "pnpm wrapper still not runnable — report this with: pnpm --version"
  ok "pnpm $(pnpm --version) installed (Termux wrapper)"
fi

# ── Project setup ────────────────────────────────────────────────────────────
# NOTE: "pnpm run" is required — pnpm has built-in `setup`/`doctor` commands
# that would otherwise shadow the package.json scripts.
log "Running project setup (pnpm run setup)…"
pnpm run setup

log "Running diagnostics…"
pnpm run doctor || warn "doctor reported issues (expected until DATABASE_URL is set in .env.local)."

printf '\n'
ok "Bootstrap complete. Next: set DATABASE_URL in .env.local, then run scripts/dev-termux.sh"
warn "Note: on-device prisma migrate/db push may fail (schema engine unsupported) — sync the database from desktop/CI when needed."
