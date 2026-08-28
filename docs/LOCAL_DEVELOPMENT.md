# FlowPilot — Local Development Guide

> Day-to-day development workflow after first-time setup. For first-run
> bootstrap (Windows/Linux/macOS/Termux), see `ENVIRONMENT_SETUP.md`.

## Daily Workflow

```bash
pnpm run doctor      # health check: tools, env, DB connection, build readiness
bash scripts/dev.sh  # or dev.ps1 / dev-termux.sh — install→generate→db push→dev
pnpm verify          # full quality gate before finishing any work
pnpm security        # secret scan (also runs automatically on every commit)
```

## What dev scripts do

`scripts/dev.sh` / `dev.ps1` / `dev-termux.sh` are idempotent launchers:

1. `pnpm install` — only when `node_modules` is missing
2. `pnpm db:generate` — only when the Prisma client is missing
3. Create `.env.local` — only when no env file exists
4. `pnpm db:push` — best effort; skipped on placeholder `DATABASE_URL`,
   failures never block the dev server
5. Start the dev server (`--webpack` on Termux)

## Database Work

```bash
pnpm db:migrate      # create + apply a dev migration (preferred for schema changes)
pnpm db:deploy       # apply committed migrations (prod/CI/shared Neon)
pnpm db:push         # quick prototype sync (never on shared environments)
pnpm db:seed         # Arabic demo data (idempotent, demo-business-scoped wipe)
pnpm db:studio       # browse data
```

Rules (from `ARCHITECTURE.md`): schema changes go through migrations;
`db push` is for throwaway local schemas only. On Termux, migration engine
binaries can't run — push/deploy from desktop or CI instead.

## Environment Files

- Preferred file: **`.env.local`** (`pnpm run setup` creates it safely with a
  random `BETTER_AUTH_SECRET`).
- Precedence everywhere (dev server, Prisma CLI, seed): real env vars >
  `.env.local` > `.env`.
- Never commit env files — `.gitignore` covers `.env*`, the pre-commit hook
  enforces it, and `pnpm security` audits it.
- After editing env vars, restart the dev server (values are read at startup).

## Commit Safety

`pnpm run setup` installs the repo-managed git hook (`.githooks/pre-commit`
via `core.hooksPath`). Every commit is checked for:

- env/key/credential **filenames** (`.env*`, `*.pem`, `id_rsa*`, …)
- secret-looking **content** (tokens, private keys, credential URLs)

Bypass (last resort, not recommended): `git commit --no-verify`.
Reinstall after a fresh clone: `pnpm run hooks:install`.

## Quality Gates (binding)

Per `AGENT_RULES.md`, finish any work only when this passes:

```bash
pnpm verify   # = lint + typecheck + format:check + build (Termux-aware)
```

Details: `QUALITY_CHECKS.md`.

## Platform Quirks

| Platform | Notes                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Termux   | Always `--webpack` (handled automatically by `dev-termux.sh`/`verify`); pnpm shim repair via `bootstrap-termux.sh`; Prisma migrate/db push may fail on-device |
| Windows  | Use `dev.ps1`; run bootstrap in a NEW terminal after installs (PATH refresh)                                                                                  |
| Any      | `pnpm run setup` / `pnpm run doctor` — the `run` is required (pnpm built-in name collision)                                                                   |

Stuck? See `TROUBLESHOOTING.md`.
