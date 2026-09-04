# FlowPilot — Environment Setup (All Platforms)

> How to get FlowPilot running on Windows, Linux, macOS, and Termux (Android)
> with the least manual work. Companion scripts live in `scripts/`.

## TL;DR — First Run

| Platform         | Bootstrap                                                        | Run dev                                                    |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| macOS / Linux    | `bash scripts/bootstrap.sh`                                      | `bash scripts/dev.sh`                                      |
| Windows          | `powershell -ExecutionPolicy Bypass -File scripts\bootstrap.ps1` | `powershell -ExecutionPolicy Bypass -File scripts\dev.ps1` |
| Termux (Android) | `bash scripts/bootstrap-termux.sh`                               | `bash scripts/dev-termux.sh`                               |

Each bootstrap script:

1. Detects the OS and verifies **node** (≥ 20), **pnpm**, **git**, **gh**.
2. Installs **only** what is missing — an existing working tool is never
   reinstalled or upgraded.
3. Runs the project setup (`pnpm run setup`): creates `.env.local` if no env
   file exists, installs dependencies, generates the Prisma client.
4. Runs diagnostics (`pnpm run doctor`) — warnings are expected until
   `DATABASE_URL` is set.

> **pnpm name collision:** `pnpm setup` and `pnpm doctor` (without `run`)
> execute pnpm's own built-in commands. Always use **`pnpm run setup`** and
> **`pnpm run doctor`** for the project scripts.

## Platform Notes

### Windows

- Requirements: PowerShell 5.1+ and [winget](https://learn.microsoft.com/windows/package-manager/winget/)
  (included in current Windows 10/11).
- If the script blocks, run it in a **new terminal** after installs — PATH
  changes only apply to new sessions.
- Manual fallbacks: [Node.js LTS](https://nodejs.org), [Git](https://git-scm.com),
  [GitHub CLI](https://cli.github.com), then `npm install -g pnpm@11.24.0`.

### macOS / Linux

- Uses Homebrew where available; otherwise `apt-get` / `dnf` / `pacman` /
  `zypper` (with `sudo` only when not already root).
- pnpm is installed via CorePack when the Node version ships it, otherwise via
  `npm install -g pnpm@11.24.0` (matching `packageManager` in `package.json`).

### Termux (Android)

- Install [Termux from F-Droid](https://f-droid.org/en/packages/com.termux/)
  (the Play Store build is outdated), then clone the repo into `~/projects`.
- **Known Termux quirk:** pnpm's global shim has a `#!/usr/bin/env node`
  shebang, and Termux has no `/usr/bin/env` — so `pnpm` fails with
  `bad interpreter`. `bootstrap-termux.sh` verifies `pnpm --version` first and
  only repairs it when broken, by installing a small `node` wrapper at
  `$PREFIX/bin/pnpm`. Nothing is reinstalled if pnpm already works.
- **Turbopack has no Android bindings** — always use `scripts/dev-termux.sh`
  and `pnpm verify` (both automatically add `--webpack`).
- **The Prisma schema engine cannot run on-device**, so `prisma migrate dev` /
  `db push` may fail on Termux. Sync the database from desktop/CI
  (`pnpm db:deploy`) when needed; the dev server still runs.

## Environment Variables

| Variable              | Required | Purpose                                 |
| --------------------- | -------- | --------------------------------------- |
| `DATABASE_URL`        | Yes      | Neon PostgreSQL connection string       |
| `BETTER_AUTH_SECRET`  | Yes      | Auth signing secret (min 32 chars)      |
| `BETTER_AUTH_URL`     | Yes      | Base URL used by Better Auth            |
| `NEXT_PUBLIC_APP_URL` | Yes      | Public app URL (also used for metadata) |

All server variables are validated at runtime by Zod in `src/lib/env.ts` — the
app fails fast with a readable message if anything is missing.

### Env file conventions

- **Preferred file: `.env.local`** (Next.js convention).
- `.env` is still honored for backwards compatibility.
- **Precedence everywhere:** `.env.local` overrides `.env`, which is overridden
  by real environment variables (CI). This applies to the dev server, Prisma
  CLI (`prisma.config.ts`), and `pnpm db:seed`.
- Never commit env files — `.gitignore` covers `.env*` except `.env.example`.

### Safe automated generation

`pnpm run setup` runs `scripts/setup-env.mjs`, which:

- Does nothing when `.env` or `.env.local` already exists (never overwrites).
- Copies `.env.example` → `.env.local` with file mode `600`.
- Injects a cryptographically random `BETTER_AUTH_SECRET`
  (`node:crypto`, 48 bytes → 64 chars). The value is never printed.
- Leaves `DATABASE_URL` as a placeholder and tells you to edit it.

Manual secret generation (if you prefer):

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
# or: openssl rand -base64 32
```

## Database

- Point `DATABASE_URL` at your Neon database (include `?sslmode=require`).
- `scripts/dev*.sh` run `pnpm db:push` (best effort) before the dev server —
  skipped automatically while `DATABASE_URL` is a placeholder, and failures
  never block the dev server.
- Prefer migrations for schema changes (`pnpm db:migrate` locally,
  `pnpm db:deploy` against shared environments — see `ARCHITECTURE.md`).
- Seed demo data (Arabic demo business) with `pnpm db:seed`.

## Diagnostics & Quality Gate

```bash
pnpm run doctor   # health check → READY / NOT READY with fixes (secrets hidden)
pnpm verify       # lint + typecheck + format:check + build (adds --webpack on Termux)
pnpm security     # secret scan (also runs automatically on every commit)
```

`pnpm verify` encodes the binding quality gate from `AGENT_RULES.md`.
Day-to-day workflow: `LOCAL_DEVELOPMENT.md` · errors: `TROUBLESHOOTING.md` ·
what each check covers: `QUALITY_CHECKS.md`.

## GitHub CLI (optional)

`gh` is installed best-effort by the bootstrap scripts; a missing `gh` never
blocks setup. Authenticate once with `gh auth login` if you use GitHub flows.
