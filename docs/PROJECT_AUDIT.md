# FlowPilot — Project Audit (Run & Reproducibility)

> Developer-experience audit: can a new machine (Windows, Linux, macOS, Termux)
> get FlowPilot running with minimal manual steps? Audit date: 2026-08-27.
> Scope: tooling and scripts only — no product/architecture changes.

## Method

Reviewed `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `prisma/`,
`prisma.config.ts`, `.env.example`, `.gitignore`, `next.config.ts`,
`scripts/`, PWA configuration (`src/app/manifest.ts`, `public/sw.js`,
`public/icons/*`), bundled Next 16 docs, and the live Termux environment.

## Current Status

| Area                  | Status | Notes                                                                                |
| --------------------- | ------ | ------------------------------------------------------------------------------------ |
| `package.json`        | ✅     | Clear script names, `packageManager: pnpm@11.24.0` pinned, lockfile verified in sync |
| `pnpm-lock.yaml`      | ✅     | `pnpm install --frozen-lockfile --dry-run` reports no drift                          |
| `pnpm-workspace.yaml` | ✅     | `onlyBuiltDependencies` / `allowBuilds` correctly scoped for postinstalls            |
| Prisma schema + seed  | ✅     | Full Spec A schema, 1 migration, idempotent Arabic seed (`pnpm db:seed`)             |
| Prisma client         | ✅     | Generated to `src/generated/prisma` (gitignored) — must be regenerated after clone   |
| `.env.example`        | ✅     | All 4 required variables documented with generation hints                            |
| Env validation        | ✅     | `src/lib/env.ts` (Zod, fail-fast, Arabic messages)                                   |
| Secrets hygiene       | ✅     | `.gitignore` covers `.env*` with `!.env.example` exception; no secrets in repo       |
| Build config          | ✅     | `next.config.ts` intentionally minimal; Turbopack default per Next 16                |
| PWA                   | ✅     | Manifest (RTL, PNG icons, shortcuts), service worker v2, offline page, `pnpm icons`  |
| Quality scripts       | ✅     | `lint`, `typecheck`, `format:check`, `build` all present and passing                 |

## Missing Items (before this pass)

1. **No bootstrap automation** — a fresh machine required hand-installing
   node/pnpm/git/gh and knowing pnpm's version pin.
2. **No one-command setup** — first run was 4+ manual steps
   (`install` → copy env → generate client → push schema).
3. **No doctor/diagnostics** — env problems only surfaced as runtime Zod
   errors after starting the dev server.
4. **No `verify` aggregate** — the AGENT_RULES quality gate was a long
   manual chain, with a Termux-specific `--webpack` exception applied by hand.
5. **No dev-server launcher** — prerequisites (install, client generation,
   schema sync) had to be remembered on every run.
6. **Env-file convention split** — Next.js prefers `.env.local`, but
   `prisma.config.ts` and `pnpm db:seed` read `.env` only. Users following
   the Next.js convention got an empty `DATABASE_URL` in Prisma tooling.
7. **No per-OS setup documentation** — Windows and Termux paths existed only
   as tribal knowledge in `BUILD_STATE.md` known-issues.

## Risks Found

| #   | Risk                                                                                                                                                     | Severity        | Mitigation                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Termux pnpm is broken out of the box**: the global shim has a `#!/usr/bin/env node` shebang and Termux has no `/usr/bin/env` → `pnpm: bad interpreter` | High (Termux)   | `scripts/bootstrap-termux.sh` verifies `pnpm --version` and installs a `node`-wrapper in `$PREFIX/bin` when the shim is broken |
| 2   | **Turbopack has no Android/Termux bindings** → default `next dev`/`next build` fail on-device                                                            | High (Termux)   | `dev-termux.sh` and `pnpm verify` auto-append `--webpack` on Android                                                           |
| 3   | **Prisma schema-engine cannot run on Android** → `migrate`/`db push` may fail on-device                                                                  | Medium (Termux) | Dev scripts treat `db push` as best-effort with a clear warning; docs recommend pushing from desktop/CI against Neon           |
| 4   | **Node ≥ 25 ships without CorePack** → `corepack enable` is not a universal pnpm install path                                                            | Medium          | Bootstrap scripts fall back to `npm install -g pnpm@11.24.0` (matches `packageManager`)                                        |
| 5   | **`gh` CLI absent on many machines** and installation differs per OS                                                                                     | Low             | Bootstrap treats `gh` as best-effort (warn, never block) — only needed for GitHub flows                                        |
| 6   | **All work since the initial create-next-app commit is uncommitted** (26+ paths)                                                                         | High            | Flagged here; committing is an operator decision, not an agent action                                                          |
| 7   | **No CI pipeline** — quality gate depends on agents running it manually                                                                                  | Low             | `pnpm verify` now encodes the gate as one command; CI is a Spec-B-era decision                                                 |
| 8   | **Env placeholder foot-gun** — a copied `.env.example` with placeholder `DATABASE_URL` looks valid enough to reach runtime                               | Medium          | `pnpm doctor` fails fast on placeholder/missing `DATABASE_URL` and short auth secrets                                          |

## Recommendations Implemented (this pass)

| Recommendation                                                             | Delivered as                                                     |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| One-command tool bootstrap per OS                                          | `scripts/bootstrap.sh` · `bootstrap.ps1` · `bootstrap-termux.sh` |
| Install-only-if-missing, never-reinstall semantics                         | All bootstrap scripts (guarded `command -v` checks)              |
| Safe `.env.local` generation with a real random secret, no secret printing | `scripts/setup-env.mjs` via `pnpm setup`                         |
| `.env.local` recognized by Prisma tooling (Next.js precedence preserved)   | `prisma.config.ts` + `db:seed` load `.env.local` before `.env`   |
| One-command environment diagnostics                                        | `pnpm doctor` (`scripts/doctor.mjs`)                             |
| One-command quality gate incl. Termux `--webpack` handling                 | `pnpm verify` (`scripts/verify.mjs`)                             |
| One-command full setup (env + install + client generation)                 | `pnpm setup`                                                     |
| Dev launcher (install → generate → db push → dev server)                   | `scripts/dev.sh` · `dev.ps1` · `dev-termux.sh`                   |
| Per-OS setup documentation                                                 | `docs/ENVIRONMENT_SETUP.md`                                      |

## Explicitly Not Done (out of scope per mission rules)

- No CI workflow files, Docker, or any infrastructure beyond what exists
  (Vercel + Neon only, per `ARCHITECTURE.md`).
- No framework/dependency upgrades; no schema, migration, or seed changes.
- No changes to business features, route logic, or UI.
- No git commits (operator decision).
