#!/usr/bin/env bash
# FlowPilot bootstrap — macOS & Linux.
# Verifies node, pnpm, git, gh. Installs ONLY what is missing, then runs
# the project one-command setup (env file + dependencies + Prisma client).
# Never reinstalls or upgrades an existing, working tool.

set -euo pipefail

PNPM_VERSION="11.24.0" # must match "packageManager" in package.json
MIN_NODE_MAJOR=20

log() { printf '\033[1;32m▸\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m⚠\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }
works() { "$@" >/dev/null 2>&1; }

if [ -n "${TERMUX_VERSION:-}" ] || case "${PREFIX:-}" in *com.termux*) true;; *) false;; esac; then
  fail "Termux detected — use scripts/bootstrap-termux.sh instead."
fi

cd "$(dirname "$0")/.."
log "FlowPilot bootstrap — $(uname -sm)"

# ── Package manager detection ───────────────────────────────────────────────
PKGMAN=""
if have brew; then PKGMAN="brew";
elif have apt-get; then PKGMAN="apt";
elif have dnf; then PKGMAN="dnf";
elif have pacman; then PKGMAN="pacman";
elif have zypper; then PKGMAN="zypper"; fi

sudu() { # prefix sudo only when needed
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi
}

pkg_install() { # pkg_install <pkg> [<alt-pkg>]
  case "$PKGMAN" in
    brew) brew install "$1" ;;
    apt) sudu apt-get update -y && sudu apt-get install -y "$1" ;;
    dnf) sudu dnf install -y "$1" ;;
    pacman) sudu pacman -S --needed --noconfirm "$1" ;;
    zypper) sudu zypper --non-interactive install "$1" ;;
    *) return 1 ;;
  esac
}

# ── OS detection ─────────────────────────────────────────────────────────────
case "$(uname -s)" in
  Darwin) OS="macOS" ;;
  Linux) OS="Linux ($PKGMAN)" ;;
  *) fail "Unsupported OS: $(uname -s). Use scripts/bootstrap-termux.sh on Termux." ;;
esac
log "Detected: $OS"

# ── node ─────────────────────────────────────────────────────────────────────
if have node && works node --version; then
  NODE_MAJOR="$(node --version | sed 's/^v//' | cut -d. -f1)"
  if [ "${NODE_MAJOR:-0}" -lt "$MIN_NODE_MAJOR" ]; then
    fail "node $(node --version) is too old (need >= v${MIN_NODE_MAJOR}). Upgrade via brew/nvm, then re-run."
  fi
  ok "node $(node --version) already installed — skipping"
else
  log "Installing node…"
  if ! pkg_install nodejs; then
    fail "Could not install node automatically. Install Node.js >= ${MIN_NODE_MAJOR} manually: https://nodejs.org (or use nvm), then re-run."
  fi
  ok "node $(node --version) installed"
fi

# ── pnpm ─────────────────────────────────────────────────────────────────────
if have pnpm && works pnpm --version; then
  ok "pnpm $(pnpm --version) already installed — skipping"
else
  log "Installing pnpm@${PNPM_VERSION}…"
  INSTALLED=0
  if have corepack && works corepack --version; then
    corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate && INSTALLED=1
  fi
  if [ "$INSTALLED" -eq 0 ]; then
    have npm || fail "npm missing — node installation looks incomplete."
    npm install -g "pnpm@${PNPM_VERSION}"
  fi
  works pnpm --version || fail "pnpm installed but not runnable — open a new terminal and re-run."
  ok "pnpm $(pnpm --version) installed"
fi

# ── git ──────────────────────────────────────────────────────────────────────
if have git && works git --version; then
  ok "git $(git --version | cut -d' ' -f3) already installed — skipping"
else
  log "Installing git…"
  pkg_install git \
    || fail "Could not install git automatically. Install it from https://git-scm.com, then re-run."
  ok "git installed"
fi

# ── gh (best effort — never blocks) ──────────────────────────────────────────
if have gh && works gh --version; then
  ok "gh $(gh --version | head -1 | awk '{print $3}') already installed — skipping"
else
  log "Installing GitHub CLI (optional)…"
  if pkg_install gh; then
    ok "gh installed"
  else
    warn "gh could not be installed automatically. See https://cli.github.com/ — only needed for GitHub workflows."
  fi
fi

# ── Project setup ────────────────────────────────────────────────────────────
# NOTE: "pnpm run" is required — pnpm has built-in `setup`/`doctor` commands
# that would otherwise shadow the package.json scripts.
log "Running project setup (pnpm run setup)…"
pnpm run setup

log "Running diagnostics…"
pnpm run doctor || warn "doctor reported issues (expected until DATABASE_URL is set in .env.local)."

printf '\n'
ok "Bootstrap complete. Next: set DATABASE_URL in .env.local, then run scripts/dev.sh"
