# FlowPilot — Environment Variables Reference

> Every variable FlowPilot needs, where it lives, and how it is validated.
> Env files are gitignored; real credentials live only in `.env.local` (dev),
> the Vercel project settings (deploys), and the Neon console.

## The Four Required Variables

| Variable              | Scope           | Example                                                    | Used by                                                  |
| --------------------- | --------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| `DATABASE_URL`        | server          | `postgresql://user:pass@ep-x.neon.tech/db?sslmode=require` | Prisma (`@prisma/adapter-pg`), migrations, seed          |
| `BETTER_AUTH_SECRET`  | server          | 64-char random base64 string                               | Better Auth session/cookie signing                       |
| `BETTER_AUTH_URL`     | server          | `https://flowpilot-demo.vercel.app`                        | Better Auth `baseURL` (redirects, callback URLs)         |
| `NEXT_PUBLIC_APP_URL` | server + client | `https://flowpilot-demo.vercel.app`                        | Root layout `metadataBase`, Better Auth `trustedOrigins` |

There are no optional variables today — all four are required everywhere
(dev, build, production runtime).

## Validation

Two layers catch problems early:

1. **At deploy time** — `pnpm vercel:check` (`scripts/vercel-check.mjs`):
   presence, placeholder detection, URL schemes, secret length, origin
   consistency. Run by every `pnpm deploy:*` command as its first gate.
2. **At app boot / build** — `src/lib/env.ts` (Zod, fail-fast). On Vercel the
   build itself fails with a readable Arabic error listing the offending
   variable — so configure variables **before** the first deploy.

Placeholder detection includes `replace-with`, `your-`, `user:password@`,
and similar markers, in both layers.

## Where Values Live

| Environment             | File / Place                               | Precedence                            |
| ----------------------- | ------------------------------------------ | ------------------------------------- |
| Local development       | `.env.local` (preferred) or `.env`         | real env vars > `.env.local` > `.env` |
| Vercel builds + runtime | Project → Settings → Environment Variables | set for **Production and Preview**    |
| Prisma CLI / seed       | same files via `prisma.config.ts`          | same precedence as dev server         |

## Generation Recipes

```bash
# BETTER_AUTH_SECRET (use ONE value everywhere):
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"

# DATABASE_URL: Neon console → your project → Connect → connection string
# (keep ?sslmode=require; use the pooled connection string for serverless if
#  Neon offers one for your plan)
```

## Local Development Setup

```bash
pnpm run setup      # creates .env.local from .env.example with a real random secret
# then edit .env.local and set DATABASE_URL (+ URLs for remote testing)
pnpm vercel:check   # validate exactly what the deploy gate validates
```

Local URLs are fine for development: `BETTER_AUTH_URL=http://localhost:3000`
and `NEXT_PUBLIC_APP_URL=http://localhost:3000`.

## Vercel Production Values

| Variable              | Value                                           |
| --------------------- | ----------------------------------------------- |
| `DATABASE_URL`        | your Neon string with `?sslmode=require`        |
| `BETTER_AUTH_SECRET`  | the same secret you use locally (≥ 32 chars)    |
| `BETTER_AUTH_URL`     | `https://<project-name>.vercel.app` (or domain) |
| `NEXT_PUBLIC_APP_URL` | same as `BETTER_AUTH_URL`                       |

Notes:

- `NEXT_PUBLIC_APP_URL` is inlined at **build time** — changing it requires a
  redeploy, not just a restart.
- Keep Production and Preview values identical except when deliberately
  testing a different database on previews.
- Never commit any env file (`.gitignore` + pre-commit hook + `pnpm security`
  all enforce this). If a secret leaks: rotate first (`docs/TROUBLESHOOTING.md`).

## Optional Variables

| Variable    | Default | Purpose                                                                                                                                                                                                                                            |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEMO_MODE` | unset   | `"true"` → the dev launcher scripts (`scripts/dev.sh` / `dev.ps1` / `dev-termux.sh`) re-seed the Arabic demo business before starting the dev server (best effort, never blocks; requires a real `DATABASE_URL`). Never used by production builds. |

## Optional Platform Variables (provided by Vercel, informational)

| Variable     | Provided by Vercel        | FlowPilot usage                                  |
| ------------ | ------------------------- | ------------------------------------------------ |
| `VERCEL_URL` | deployment host per build | not required by the app; useful for quick checks |
| `VERCEL_ENV` | `production` / `preview`  | `/api/health` reports `NODE_ENV` (same value)    |

Full step-by-step: `VERCEL_DEPLOYMENT.md` · What each check covers:
`QUALITY_CHECKS.md`.
