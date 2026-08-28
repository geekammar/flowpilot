# FlowPilot — Release Process

> How FlowPilot gets from working tree to a tagged GitHub release. First
> release: **v0.1.0 — Initial Pilot-Ready Core**. Automated by
> `scripts/release.sh` (`pnpm release`).

## Golden Rules

1. **Never release broken code** — all three gates must pass.
2. **Never release secrets** — security scan + pre-commit hook.
3. Releases are **tags on `main`** (annotated, `vMAJOR.MINOR.PATCH`).
4. The GitHub repository stays **private** during the discovery stage.

## One-Command Release

```bash
pnpm release                    # repo "flowpilot", tag v0.1.0
bash scripts/release.sh [repo] [tag]
```

The script is safe to re-run (idempotent commit/tag/remote/release steps) and
stops at the FIRST failed gate without touching GitHub.

## Prerequisites (once per machine)

```bash
gh auth login     # GitHub.com → HTTPS → "Login with a web browser"
```

and a working environment (`pnpm run doctor` → READY), which mainly means a
real `DATABASE_URL` in `.env.local`.

## Gates (in order)

| #   | Gate    | Command           | Blocks when…                                       |
| --- | ------- | ----------------- | -------------------------------------------------- |
| 0   | gh auth | `gh auth status`  | not logged into GitHub                             |
| 1   | health  | `pnpm run doctor` | any blocking issue (env, DB connection, toolchain) |
| 2   | quality | `pnpm verify`     | lint / typecheck / format / build fails            |
| 3   | secrets | `pnpm security`   | any secret finding in committable files            |

## What the script does after the gates

1. Verifies branch is `main`
2. `git add -A` (pre-commit hook re-scans staged content)
3. Commit `feat: initial pilot-ready release` (skipped if nothing staged)
4. Annotated tag (default `v0.1.0`)
5. Creates private repo `flowpilot` + `origin` remote (if missing):
   `gh repo create flowpilot --private --source=. --remote=origin`
6. `git push -u origin main` + `git push origin <tag>`
7. `gh release create <tag> --verify-tag --title "FlowPilot <tag>" --notes …`

## Manual Equivalent (for reference)

```bash
gh auth status                      # must be logged in
pnpm run doctor && pnpm verify && pnpm security
git switch main && git add -A && git commit -m "feat: initial pilot-ready release"
git tag -a v0.1.0 -m "FlowPilot v0.1.0 — Initial Pilot-Ready Core"
gh repo create flowpilot --private --source=. --remote=origin \
  --description "WhatsApp Appointment Conversion System — book more, chase less."
git push -u origin main && git push origin v0.1.0
gh release create v0.1.0 --verify-tag --title "FlowPilot v0.1.0" \
  --notes "Initial Pilot-Ready Core — see docs/PROJECT_STATUS.md"
```

## Versioning

- `v0.1.x` — Spec A pilot iterations (current)
- Bump MINOR when a roadmap milestone completes (e.g., Spec A exit criteria
  met → `v0.2.0`); PATCH for fixes within a milestone.
- No semver ceremony while pre-1.0 — the tag notes carry the narrative.

## Rollback / Recovery

| Situation                      | Recovery                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Tag pushed but release wrong   | `gh release delete <tag> && git push origin :refs/tags/<tag>` then redo                         |
| Repo created but push rejected | Fix locally, `git push -u origin main` again (script is re-runnable)                            |
| Secret leaked in a commit      | Rotate the secret FIRST, then `git rm --cached <file>` + history rewrite with operator approval |
| Everything wrong               | Delete the repo (`gh repo delete --yes`) — it is private and re-creatable                       |

## See Also

`GITHUB_WORKFLOW.md` (how we use GitHub day-to-day) · `PROJECT_STATUS.md`
(current state) · `RELEASE_REPORT.md` (v0.1.0 report).
