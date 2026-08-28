# FlowPilot — Vercel Deployment Audit

> Deployment-readiness audit performed before any changes (Ops 04).
> Scope: deployment only — no product, schema, or architecture changes.
> Audit date: 2026-08-28 · Audited by: Ops 04 (Deployment Engineer pass).

## Method

Reviewed every deployment-relevant surface: `next.config.ts`, `package.json`
(scripts, engines, packageManager), `prisma/schema.prisma` +
`prisma.config.ts`, `src/server/db/index.ts` (Prisma + `@prisma/adapter-pg`),
`src/lib/env.ts` + `src/lib/auth.ts` (Better Auth), `src/app/layout.tsx`
(metadata), `src/app/manifest.ts` + `public/sw.js` (PWA), `.gitignore`,
`.env.example`, `pnpm-workspace.yaml`, existing `scripts/`, and git history
(including the reverted "Fix Prisma generation for Vercel" commit), plus the
bundled Next 16 docs in `node_modules/next/dist/docs/`.

## Per-Area Findings

### 1. Next.js configuration

| Item             | Status | Notes                                                                                                                                                     |
| ---------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.ts` | ✅     | Intentionally minimal — nothing Vercel-hostile                                                                                                            |
| Framework preset | ✅     | Vercel auto-detects Next.js 16 (App Router, Turbopack build)                                                                                              |
| Node runtime     | ✅     | `engines.node >= 20.9.0`; Vercel default (20/22) satisfies it                                                                                             |
| Route handlers   | ⚠️     | Only `api/auth/[...all]`; any future public handler must be added to `proxy.ts` public paths — this bit `/api/health` during validation (fixed this pass) |
| `src/generated`  | ⚠️     | Gitignored — see Blocker B1                                                                                                                               |

### 2. Prisma configuration

| Item                 | Status | Notes                                                                                                |
| -------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Schema               | ✅     | Prisma 7 `prisma-client` generator, output `src/generated/prisma` (gitignored), `runtime = "nodejs"` |
| Driver adapter       | ✅     | `@prisma/adapter-pg` with `connectionString` at runtime — serverless-safe (no URL baked into schema) |
| Generation on Vercel | ❌     | **Blocker B1** — nothing generates the client during a Vercel build (see below)                      |
| `prisma.config.ts`   | ✅     | Loads `.env.local` > `.env`; real env vars (Vercel) still win                                        |
| Migrations           | ⚠️     | 2 committed migrations; must be applied to Neon via `pnpm db:deploy` from desktop/CI (Risk R3)       |

### 3. PostgreSQL (Neon) usage

| Item              | Status | Notes                                                                                           |
| ----------------- | ------ | ----------------------------------------------------------------------------------------------- |
| Connection        | ✅     | TCP via `pg` adapter; works on Vercel Node runtime                                              |
| Pooling           | ⚠️     | One pool per lambda singleton (dev pattern); acceptable at pilot volume — documented, not coded |
| Cold starts       | ⚠️     | Neon suspend-on-idle adds ~0.5–1s to first request; acceptable for pilots                       |
| `sslmode=require` | ✅     | Expected in URL; `pg` adapter honors it                                                         |

### 4. Better Auth configuration

| Item             | Status | Notes                                                                                         |
| ---------------- | ------ | --------------------------------------------------------------------------------------------- |
| `baseURL`        | ✅     | Explicit from `BETTER_AUTH_URL` — must equal the final Vercel domain                          |
| `secret`         | ✅     | From env; ≥ 32 chars enforced by env validation                                               |
| `trustedOrigins` | ⚠️     | Only `NEXT_PUBLIC_APP_URL` — preview deployments use a different origin (Risk R2, documented) |
| DB adapter       | ✅     | Prisma adapter over the same `pg`-backed client — fine on Vercel                              |

### 5. PWA configuration

| Item            | Status | Notes                                                                                                                                    |
| --------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Manifest        | ✅     | Static metadata route; no env dependency                                                                                                 |
| Service worker  | ✅     | Cache-first only for immutable/hashed assets; navigations network-first → no stale-UI trap                                               |
| Fixed-name PNGs | ⚠️     | `/sw.js`, `/offline.html`, `/icons/*` are fixed-name — default Vercel caching is fine; defensive `Cache-Control` header added (low cost) |

### 6. Build configuration

| Item               | Status | Notes                                                                                            |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------ |
| Build command      | ❌→✅  | Fixed: `vercel.json` sets `pnpm db:generate && pnpm build`; `postinstall` runs `prisma generate` |
| pnpm build scripts | ✅     | `pnpm-workspace.yaml` allowlists prisma/esbuild postinstalls (pnpm 10+ requirement)              |
| ESLint/Prettier    | ✅     | Not part of Vercel build (kept fast); enforced locally via `pnpm verify`                         |
| Termux quirk       | ℹ️     | `--webpack` local-only; Vercel uses Turbopack — no conflict                                      |

### 7. Environment variables

| Variable              | Build time needed? | Why                                                                      |
| --------------------- | ------------------ | ------------------------------------------------------------------------ |
| `DATABASE_URL`        | Yes                | `env.ts` fail-fast runs during prerendering of every page (module graph) |
| `BETTER_AUTH_SECRET`  | Yes                | Same module graph (auth → db → env)                                      |
| `BETTER_AUTH_URL`     | Yes                | Validated in `env.ts`; must be the production URL                        |
| `NEXT_PUBLIC_APP_URL` | Yes                | `metadataBase` in root layout + `env.ts` validation; build-time value    |

All four must exist in **Vercel Project → Settings → Environment Variables**
(Production + Preview) **before the first deploy**, or the build fails with
`Invalid server environment variables` — almost certainly the reason the
operator's earlier `prisma generate && next build` attempt (commit `299eb08`,
since reverted) did not unblock the deployment on its own.

## Deployment Blockers (must fix)

| #   | Blocker                                                                                                                                              | Fix (this pass)                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| B1  | Prisma client (`src/generated/prisma`) is gitignored and nothing regenerates it on Vercel → `next build` fails at `@/generated/prisma/client` import | `postinstall: prisma generate` + explicit `buildCommand` in `vercel.json`          |
| B2  | No environment validation step tied to deployment — a Vercel build fails with a runtime Arabic error instead of a clear pre-deploy report            | `scripts/vercel-check.mjs` (`pnpm vercel:check`) + deploy commands that gate on it |

## Deployment Risks (documented, monitored)

| #   | Risk                                                                                                                         | Severity | Mitigation                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| R1  | Env vars missing in Vercel project settings at build time (fail-fast throws mid-build)                                       | High     | Deployment guide Section 3 is ordered **before** deploy; `deploy:check` catches it locally   |
| R2  | Better Auth `trustedOrigins`/`baseURL` point at the production URL only → sign-in on `*.vercel.app` preview URLs may 401/403 | Medium   | Documented: test auth on production domain, or set Preview env to the preview URL            |
| R3  | Database schema not migrated on Neon → app builds but every query fails                                                      | High     | `pnpm db:deploy` (from desktop; Termux cannot run it) documented as required pre-deploy step |
| R4  | Neon idle suspend → first request latency spike (demo impression)                                                            | Low      | Acceptable at pilot scale; documented in troubleshooting                                     |
| R5  | Per-lambda connection pools (`pg`) can exhaust Neon's connection limit under load                                            | Low      | Pilot volume (tens/day); revisit if Neon reports connection errors                           |
| R6  | Fixed-name PWA assets (`/sw.js`, `/offline.html`) cached by intermediaries                                                   | Low      | Defensive `Cache-Control` headers in `vercel.json`                                           |

## Missing Requirements (implemented this pass)

- [x] `postinstall` Prisma generation + explicit Vercel build command (B1)
- [x] `scripts/vercel-check.mjs` + `pnpm vercel:check` (B2)
- [x] `pnpm deploy:check` / `deploy:preview` / `deploy:vercel` commands
- [x] `/api/health` endpoint (liveness: status/version/environment; includes
      making it public in the auth `proxy.ts` — it was redirecting to
      `/sign-in`)
- [x] `vercel.json` (minimal: build command + cache headers)
- [x] `docs/VERCEL_DEPLOYMENT.md` + `docs/ENVIRONMENT_VARIABLES.md`
- [x] `docs/DEPLOYMENT_REPORT.md`

## Readiness Score

| Area                          |   Before   | After this pass |
| ----------------------------- | :--------: | :-------------: |
| Build pipeline on Vercel      |    3/10    |      9/10       |
| Environment validation        |    5/10    |      9/10       |
| Database / migration path     |    6/10    |      8/10       |
| Auth on production domain     |    7/10    |      8/10       |
| Observability (health)        |    2/10    |      8/10       |
| Documentation / repeatability |    4/10    |      9/10       |
| **Overall**                   | **4.5/10** |   **8.5/10**    |

Remaining 1.5 points are **user actions, not code**: set env vars in Vercel,
run `pnpm db:deploy` against Neon, push the repo to GitHub, and import it into
Vercel (all covered step-by-step in `VERCEL_DEPLOYMENT.md`).
