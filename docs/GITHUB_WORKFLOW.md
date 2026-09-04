# FlowPilot — GitHub Workflow

> How the FlowPilot repository is structured and used on GitHub during the
> discovery stage. Keep it boring: one private repo, one branch, tags as
> releases.

## Repository

| Setting     | Value                                                           |
| ----------- | --------------------------------------------------------------- |
| Name        | `flowpilot` (under the operator's GitHub account)               |
| Visibility  | **Private** (pilot businesses + strategy are confidential)      |
| Remote      | `origin`                                                        |
| Branch      | `main` (single-branch model while solo + agent-driven)          |
| Description | WhatsApp Appointment Conversion System — book more, chase less. |

No CI, GitHub Actions, apps, or environments are configured yet — adding
infrastructure requires a `DECISIONS.md` entry (see `ARCHITECTURE.md`).

## GitHub CLI (gh)

Install: https://cli.github.com (bootstraps install it best-effort).

```bash
gh auth status        # verify login
gh auth login         # GitHub.com → HTTPS → "Login with a web browser"
gh repo view          # open repo in browser: gh repo view --web
gh release list       # releases
```

Everything the release process needs gh for (repo create, push access,
release creation) requires a successful `gh auth login` first.

## Branch & Commit Model (pilot stage)

- **`main` is the only branch.** Solo founder + agent development makes PR
  flow overhead; every prompt/ops pass lands as a commit on `main` after the
  quality gates pass.
- **Commit messages**: conventional style —
  `feat:`, `fix:`, `docs:`, `ops:`, `chore:`, `refactor:`.
  Examples: `feat: initial pilot-ready release`, `ops: health tooling`.
- **Never commit secrets**: the pre-commit hook blocks env/key files and
  secret-looking content (`pnpm run hooks:install` after a fresh clone).
- **Tags mark releases**: `v0.1.0`, `v0.1.1`, … from `main`, annotated.
  Process: `RELEASE_PROCESS.md` — routine shipping via `pnpm ship
patch/minor` (lightweight operator path), full gates via `pnpm release`.

## When collaboration starts (future)

When a second human/agent with a GitHub account joins, revisit (requires a
`DECISIONS.md` entry):

1. Branch protection on `main` (require PR, at least one review)
2. Feature branches (`feat/<prompt>` → PR → `main`)
3. CI running `pnpm install --frozen-lockfile && pnpm db:generate && pnpm verify`
   (the encoded gate from `QUALITY_CHECKS.md`)
4. `CODEOWNERS`, issue templates — only if the team grows

## Secrets on GitHub (rules)

- Real credentials live ONLY in: local `.env.local`, Vercel project env vars,
  and the Neon console — never in the repo, issues, PRs, or releases.
- Vercel + Neon access is managed in their consoles; grant per-person, never
  share accounts.
- If a secret ever lands in git: rotate first, clean history second
  (`TROUBLESHOOTING.md` → Git & Security).

## Release Artifacts on GitHub

Each release (`gh release`) contains: the tag, title `FlowPilot vX.Y.Z`, and
notes summarizing included product surface + known placeholders. No binaries
are attached — the repo is the artifact. See `RELEASE_PROCESS.md`.
