#!/usr/bin/env bash
# FlowPilot release automation — creates the first (and future) GitHub releases.
#
# Hard gates (ALL must pass, in order — never pushes broken code):
#   1. gh installed + authenticated
#   2. pnpm run doctor      (READY)
#   3. pnpm verify          (lint + typecheck + format + build)
#   4. pnpm security        (no secrets staged/trackable)
#
# Then (idempotent where possible):
#   - stage everything, commit "feat: initial pilot-ready release" (first release)
#   - tag v0.1.0 (annotated)
#   - create PRIVATE GitHub repo "flowpilot" under your account + origin remote
#   - push main + tag
#   - create GitHub Release "FlowPilot v0.1.0 — Initial Pilot-Ready Core"
#
# Usage:
#   pnpm release                                        # default: repo "flowpilot", tag v0.1.0
#   bash scripts/release.sh [repo-name] [tag] [notes-file]
#
# [notes-file] (optional, for per-feature releases after v0.1.0): a
# Markdown file whose FIRST LINE is the release subject (e.g.
# "Invitation Creation Foundation") — the script composes the title
# "FlowPilot <tag> — <subject>" for both the annotated tag and the
# GitHub Release; the remaining lines become the release notes body.
# Without it, the original v0.1.0 message/notes are used.

set -euo pipefail

REPO_NAME="${1:-flowpilot}"
TAG="${2:-v0.1.0}"
NOTES_FILE="${3:-}"
COMMIT_MSG="feat: initial pilot-ready release"
DESCRIPTION="WhatsApp Appointment Conversion System — book more, chase less."

if [ -n "$NOTES_FILE" ]; then
  [ -f "$NOTES_FILE" ] || { printf '\033[1;31m✗\033[0m notes file not found: %s\n' "$NOTES_FILE" >&2; exit 1; }
  SUBJECT="$(head -n 1 "$NOTES_FILE")"
  BODY="$(tail -n +2 "$NOTES_FILE")"
  RELEASE_TITLE="FlowPilot $TAG — $SUBJECT"
  TAG_MESSAGE="$RELEASE_TITLE"
  RELEASE_NOTES="## $RELEASE_TITLE

$BODY"
else
  RELEASE_TITLE="FlowPilot $TAG"
  TAG_MESSAGE="FlowPilot $TAG — Initial Pilot-Ready Core"
  RELEASE_NOTES="$(cat <<'NOTES'
## FlowPilot $TAG — Initial Pilot-Ready Core

First release: the Spec A engine for converting WhatsApp conversations into
confirmed appointments (Arabic-first, RTL, vertical-agnostic, PWA).

### Included
- Foundation: Next.js 16 + TS strict + Tailwind v4 + shadcn/ui, Better Auth,
  Prisma 7 / Neon Postgres, feature-based modular monolith
- Product: onboarding wizard, business admin dashboard, conversations inbox,
  appointments agenda + detail + creation, optimistic staff replies
- Polish: loading/error/empty states, a11y pass, PWA PNG icons + service
  worker, Arabic demo seed (demo credentials in docs/DATABASE.md)
- Ops: cross-platform bootstrap (Windows/Linux/macOS/Termux), doctor /
  verify / security tooling, pre-commit secret guard, full docs/

### Known placeholders (Spec A continues)
Auth sign-up, customers directory, services, settings, team, staff area.

See docs/PROJECT_STATUS.md and docs/BUILD_STATE.md for details.
NOTES
)"
  # Expand $TAG inside the default notes.
  RELEASE_NOTES="${RELEASE_NOTES//\$TAG/$TAG}"
fi

log() { printf '\033[1;34m▸\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

cd "$(dirname "$0")/.."

# ── Gate 0: tooling ──────────────────────────────────────────────────────────
command -v gh >/dev/null 2>&1 || fail "gh CLI not installed — see https://cli.github.com/"
log "Checking GitHub authentication…"
if ! gh auth status >/dev/null 2>&1; then
  fail "Not authenticated with GitHub. Run: gh auth login  (choose GitHub.com → HTTPS → browser), then re-run: pnpm release"
fi
ok "gh authenticated as: $(gh api user --jq .login 2>/dev/null || echo '(unknown)')"

# ── Gate 1: doctor ───────────────────────────────────────────────────────────
log "Gate 1/3 — pnpm run doctor…"
pnpm run doctor || fail "doctor NOT READY — fix the reported issues first (usually DATABASE_URL in .env.local)."

# ── Gate 2: verify ───────────────────────────────────────────────────────────
log "Gate 2/3 — pnpm verify…"
pnpm verify || fail "verify FAILED — do not release broken code. Fix and re-run."

# ── Gate 3: secrets ──────────────────────────────────────────────────────────
log "Gate 3/3 — pnpm security…"
pnpm security || fail "security check FAILED — resolve secret findings before releasing."

# ── Release ──────────────────────────────────────────────────────────────────
BRANCH="$(git branch --show-current)"
[ "$BRANCH" = "main" ] || fail "Not on main (currently: ${BRANCH:-detached}). Releases happen from main."

log "Staging all changes…"
git add -A   # pre-commit hook runs the staged secret scan automatically

if git diff --cached --quiet; then
  ok "Nothing new to commit — continuing with existing history."
else
  log "Creating release commit…"
  git commit -m "$COMMIT_MSG"
fi

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  ok "Tag $TAG already exists — skipping."
else
  log "Creating annotated tag $TAG…"
  git tag -a "$TAG" -m "$TAG_MESSAGE"
fi

if git remote get-url origin >/dev/null 2>&1; then
  ok "origin remote already configured: $(git remote get-url origin)"
else
  log "Creating private GitHub repository '$REPO_NAME'…"
  gh repo create "$REPO_NAME" --private --source=. --remote=origin --description "$DESCRIPTION" \
    || fail "gh repo create failed — check the name is free and you are authenticated."
fi

log "Pushing main + $TAG…"
git push -u origin main
git push origin "$TAG"

log "Creating GitHub Release…"
if gh release view "$TAG" >/dev/null 2>&1; then
  ok "Release $TAG already exists — skipping creation."
else
  gh release create "$TAG" --verify-tag \
    --title "$RELEASE_TITLE" \
    --notes "$RELEASE_NOTES"
fi

printf '\n'
ok "Released $TAG → $(git remote get-url origin) (private)"
ok "Release page: $(gh repo view --json url --jq .url)/releases/tag/$TAG"
