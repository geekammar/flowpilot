# FlowPilot — Build State

> ⚠️ CRITICAL: the authoritative progress ledger. Every agent MUST update
> this file after finishing a prompt. Read it before starting any work.
> Last updated: PROMPT-12 (Smart Create Appointment — Step 4:
> Available-Slot Selection).

## Prompt 01 — Repository Foundation

**Status:** ✅ Complete

### Completed Work

- Scaffolded Next.js (16.3.2) + TypeScript + Tailwind v4 via create-next-app
- Installed full stack: Prisma 7, Better Auth, TanStack Query, React Hook
  Form, Zod, shadcn/ui, Lucide, Recharts, sonner, next-themes
- Tooling: strict tsconfig (+`noUncheckedIndexedAccess`), flat ESLint,
  Prettier (+ import sorting + Tailwind class sorting), quality scripts
- Better Auth wired end-to-end (`lib/auth.ts`, `auth-client.ts`,
  `api/auth/[...all]/route.ts`)
- Env validation (`src/lib/env.ts`, Zod, fail-fast) + `.env.example`
- Feature-based folder skeleton; route groups `(auth)/(app)/(admin)/(staff)`
- Error boundaries with Next 16 `{ error, retry }`; PWA manifest

### Generated Files

`src/app/**` layouts & placeholders, `src/lib/{env,auth,auth-client,utils}.ts`,
`src/server/db/index.ts`, `prisma/schema.prisma` (auth models),
`prisma.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.prettierrcignore`,
`.env.example`, README.

### Known Issues

- Turbopack has no native Android/Termux bindings → local builds use
  `next build --webpack`; normal machines/Vercel use Turbopack.
- Prisma schema-engine binary cannot execute on-device → run migrations from
  desktop/CI against Neon.
- SVG-only PWA icons (no PNG tooling on device).

---

## Prompt 02 — Design System, RTL, Responsive Layouts, PWA

**Status:** ✅ Complete

### Completed Work

- Design tokens in `globals.css`: premium indigo brand, light/dark themes,
  status colors, shadow scale, z-index scale, animation scale
- RTL infrastructure: `dir="rtl" lang="ar"`, Arabic-first copy, logical
  properties throughout, IBM Plex Sans Arabic font
- Status system: `src/lib/status.ts` + `StatusBadge`
- Component library: PageHeader, SectionHeader, EmptyState, StatCard(+skeleton),
  DataTable, SearchInput, StatusBadge + shadcn primitives (textarea, select,
  dialog, drawer, sheet, badge, alert, skeleton, table, separator)
- Responsive AppShell: desktop right sidebar / mobile bottom nav; wired into
  `(app)`, `(admin)`, `(staff)`; dedicated `(auth)` layout
- PWA: service worker (static cache-first, offline fallback), Arabic
  offline.html, install prompt banner, SW registration, maskable icons,
  upgraded manifest (`dir/lang`, shortcuts)

### Generated Files

`src/components/shared/{layout/*,pwa/*,status-badge,page-header,section-header,
empty-state,stat-card,data-table,search-input}.tsx`, `public/sw.js`,
`public/offline.html`, `public/icons/*`, updated `globals.css`, `layout.tsx`,
`manifest.ts`, placeholder pages for `/appointments`, `/conversations`,
`/customers`.

### Known Issues

- Same device limitations as Prompt 01 (SVG icons only).

---

## Prompt 03 — Database Layer, Schema, Seed, Validation, Repositories

**Status:** ✅ Complete

### Completed Work

- Full Spec A domain model: Business, Service, Customer, Conversation,
  Message, Appointment + User domain fields (`businessId`, `role`, `isActive`);
  4 enums; UUID PKs; soft deletes; all practical indexes
- Zod validation layer per entity with Arabic messages + DTO types
  (`src/lib/validation/*`)
- Typed server models (`src/types/domain.ts`)
- Six repositories (`src/server/repositories/*`) as sole Prisma consumers;
  transactional `addMessage`; conflict check; phone upsert
- Seed script with realistic Arabic demo data (عيادة الابتسامة), idempotent,
  `pnpm db:seed`
- Documentation: `docs/DATABASE.md`

### Generated Files

`prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/validation/{common,business,
service,customer,conversation,appointment,user,index}.ts`,
`src/server/repositories/{business,user,service,customer,conversation,
appointment,index}.repository.ts` (see index name), `src/types/domain.ts`.

### Known Issues

- Migrations not yet created/applied — requires reachable Neon DATABASE_URL
  from desktop/CI (`pnpm db:migrate` then `pnpm db:seed`).
- Demo seed users exist only after seeding; no auth accounts are provisioned
  by seed beyond domain fields (Better Auth owns credentials).

---

## Prompt 04 — Onboarding Wizard

**Status:** ✅ Complete

### Completed Work

- Six-screen Arabic-first onboarding flow: welcome, business setup, services,
  availability, business knowledge, and completion
- Dedicated responsive wizard shell with progress indicator, clear navigation,
  RTL behavior, and existing design-system tokens/primitives
- React Hook Form + Zod validation for business details, service duration,
  work days/hours, slot duration, about text, FAQs, and cancellation policy
- Debounced autosave for form steps plus blocking save-before-navigation;
  visible saving, saved, and error states
- Authenticated server actions with input validation and tenant ownership checks;
  transactional Business creation + authenticated user assignment as `ADMIN`
- Service add/edit/delete during onboarding and authoritative completion checks
- Business persistence fields for slot duration, plain JSON FAQs, and onboarding
  completion timestamp, including a Prisma migration
- Dashboard root redirects incomplete accounts back to onboarding

### Generated Files

`src/app/(onboarding)/**`, `src/features/onboarding/{actions,components,hooks,
schemas,types}/*`, `prisma/migrations/20260826120000_onboarding_fields/
migration.sql`; updated Business schema/validation/repository and dashboard root.

### Verification

- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm format:check` ✅
- `pnpm build --webpack` ✅ (required locally on Android/Termux)

### Known Issues

- The new migration is generated but not applied locally; apply it from
  desktop/CI against Neon with `pnpm db:deploy` before using onboarding.
- Auth sign-up remains a placeholder from the prior build state, so a complete
  self-service first-run path still requires the auth feature prompt.

---

## Prompt 05 — Business Admin Dashboard

**Status:** ✅ Complete

### Completed Work

- Replaced the placeholder root page with the Arabic-first Business Admin
  Dashboard focused on what requires attention today
- Added repository-backed dashboard queries for today's conversations, open
  human-attention conversations, pending appointments, confirmed appointments,
  recent conversations, and today's agenda
- Added business-timezone-aware day boundaries for appointment and conversation
  counts; no analytics charts or vanity metrics introduced
- Added reusable dashboard feature components for stat cards, today's agenda,
  recent conversations, quick actions, and empty states
- Added responsive mobile-first layouts using the existing design-system
  components and semantic tokens
- Added quick actions for creating appointments, opening conversations,
  managing services, and managing the team
- Extended canonical status display support for `BOOKED` and `INCOMPLETE`

### Generated Files

`src/features/dashboard/{components,server}/*`; updated
`src/app/(app)/page.tsx`, `src/server/repositories/{appointment,
conversation}.repository.ts`, and `src/lib/status.ts`.

### Verification

- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm format:check` ✅
- `pnpm build --webpack` ✅ (required locally on Android/Termux)

### Known Issues

- Appointment creation, inbox, services, and team destinations are existing
  placeholder routes until their respective Spec A prompts are implemented.
- Auth sign-up remains a placeholder from the prior build state.

---

## Prompt 06 — Conversations Inbox

**Status:** ✅ Complete

### Completed Work

- Replaced the placeholder Conversations page with a WhatsApp-inspired,
  Arabic-first team inbox at `/conversations`
- Added conversation list search across customer name, phone, and latest message
- Added status filters for `AI_ACTIVE`, `NEED_HUMAN`, `BOOKED`, and `INCOMPLETE`
- Added assigned-user and unassigned filters with active team members
- Added mobile-friendly conversation rows showing customer, latest message,
  assignment, status, and activity time
- Added tenant-scoped detail route at `/conversations/[id]`
- Added ordered message thread with distinct customer, AI, and staff bubbles,
  latest-message scrolling, and responsive mobile sizing
- Added customer context, booking context, AI summary editor, and assignment
  panel in the detail view
- Added guarded actions for assigning users, taking over, returning to AI,
  marking booked, handing off to the team, saving AI summaries, and replying
- Staff replies use the existing transactional immutable message write path and
  automatically assign the replying user while keeping human handoff active
- Added route revalidation for inbox, conversation detail, and dashboard after
  mutations
- Extended existing conversation and appointment repositories with inbox/detail
  read methods; no new database tables or infrastructure introduced

### Generated Files

`src/app/(app)/conversations/page.tsx`,
`src/app/(app)/conversations/[id]/page.tsx`,
`src/features/conversations/{actions,components,schemas,server,types}/*`; updated
`src/server/repositories/{conversation,appointment}.repository.ts`.

### Verification

- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm format:check` ✅
- `pnpm build --webpack` ✅ (required locally on Android/Termux)

### Known Issues

- WhatsApp provider transport is still outside this prompt; the inbox currently
  reads seeded/database messages and staff replies persist through repositories.
- Appointment creation and customer detail destinations remain placeholders until
  their respective Spec A prompts are implemented.

---

## Prompt 07 — Appointments Agenda

**Status:** ✅ Complete

### Completed Work

- Replaced the placeholder Appointments screen with the mandated Agenda View at
  `/appointments`; no calendar grid or calendar-view dependency introduced
- Added business-timezone-aware day selection with previous/next day and
  return-to-today controls
- Added status filtering for pending, confirmed, cancelled, no-show, and
  completed appointments
- Added mobile-first agenda rows showing time, customer, service, duration,
  status, notes, quick confirmation, and detail navigation
- Added actionable empty states for empty days and filtered results
- Added tenant-scoped Appointment Detail at `/appointments/[id]` with customer,
  service, date/time, notes, status, and latest customer Conversation link
- Added lifecycle actions for confirm, reschedule, cancel, mark completed, and
  mark no-show, with server-enforced valid status transitions
- Added Create Appointment at `/appointments/new` with customer, active service,
  date, time, and note fields; service duration derives the end time
- New appointments assign to the creating user and reject overlapping active
  appointments; rescheduling preserves duration and also rejects overlaps
- Conflict checks and writes execute in repository transactions to reduce
  same-request race windows
- Added Zod validation and tenant ownership checks to every appointment action
- Added strict date validation and transactionally updated customer appointment
  activity during creation
- Updated dashboard agenda links to open the new Appointment Detail route
- Extended canonical status rendering with the completed appointment status

### Generated Files

`src/app/(app)/appointments/{page.tsx,new/page.tsx,[id]/page.tsx}`,
`src/features/appointments/{actions,components,schemas,server,types}/*`; updated
`src/server/repositories/{appointment,conversation}.repository.ts`,
`src/lib/validation/appointment.ts`, `src/lib/status.ts`, and the dashboard
agenda link.

### Verification

- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm format:check` ✅
- `pnpm build --webpack` ✅ (required locally on Android/Termux)
- `git diff --check` ✅

### Known Issues

- Create Appointment requires an existing Customer and active Service; their
  management screens remain separate Spec A prompts.
- Conflict prevention is transaction-scoped application logic. PostgreSQL has no
  exclusion constraint yet, so separate concurrent transactions could still race
  under extreme simultaneous writes; pilot volume makes this acceptable for now.

---

## Prompt 08 — Product Polish Pass (UX/A11y/PWA/Demo)

**Status:** ✅ Complete

### Completed Work

- Full review of every existing screen (auth, onboarding, dashboard,
  conversations, appointments, placeholders) against the design system
- Fixed dashboard quick actions linking to non-existent routes
  (`/services`, `/admin/team` → 404s); now only working destinations
- Loading states for every `(app)` route: layout-matched skeletons via
  shared `page-skeleton.tsx` (PageHeaderSkeleton, ListRowSkeleton,
  LoadingAnnouncement) + per-route `loading.tsx` files
- Error states: new `(app)/error.tsx` route-group boundary that keeps the
  app shell (retry + return-home recovery, Arabic copy, digest display);
  polished root `error.tsx` with icon/Button/role="alert"
- Accessibility: aria-labels on all filter selects (inbox, agenda), proper
  label-control associations in the create-appointment form, message
  thread as `role="log"` keyboard-scrollable region, install banner
  semantic fix (aside, not dialog)
- Consistency: shared `EmptyState` used by inbox/agenda (with clear-filters
  recovery actions), `SearchInput` reuse in inbox, Arabic pluralization
  helper (`src/lib/arabic.ts`) fixing "1 محادثات"-style counts
- Optimistic UI (allowed for replies per ARCHITECTURE): staff reply appends
  instantly with "جارٍ الإرسال" state + rollback; agenda confirm and
  appointment-detail status transitions are optimistic with rollback
- Responsive: inbox filters now 2 rows on mobile (search spans full width,
  selects side-by-side)
- PWA: generated real PNG icon set (192/512 any, 512 maskable, 180 Apple)
  via dependency-free Node script `scripts/generate-pwa-icons.mjs`
  (`pnpm icons`); manifest uses PNGs; `apple-icon.png` file convention;
  SVG favicon declared in metadata; service worker cache bumped to v2
  with PNG precache — fixes Android home-screen icons & splash screens
- Placeholders made honest & guided: customers (directory "قيد الإعداد"
  with link to conversations), sign-up, staff page (quick links to
  conversations/appointments)
- Seed (demo readiness): business-scoped wipe (no longer deletes other
  businesses' rows), timezone-aware "today" (Asia/Riyadh),
  `onboardingCompletedAt` + FAQs on the seeded business (admin login now
  lands on the dashboard, not the onboarding wizard), 2 confirmed + 1
  pending appointment today, 5th conversation (unassigned `NEED_HUMAN`
  reschedule request), copy fix (removed weekday reference)

### Generated Files

`scripts/generate-pwa-icons.mjs`, `public/icons/{icon-192,icon-512,
maskable-512}.png`, `src/app/apple-icon.png`, `src/components/shared/
page-skeleton.tsx`, `src/lib/arabic.ts`, `src/app/(app)/{loading,error}.tsx`,
`src/app/(app)/appointments/{loading,new/loading,[id]/loading}.tsx`,
`src/app/(app)/conversations/{loading,[id]/loading}.tsx`,
`src/app/(app)/customers/loading.tsx`; updated manifest, layout metadata,
sw.js, eslint config, package.json (icons script), quick-actions,
inbox-list, appointment-agenda, conversation-detail, appointment-detail,
create-appointment-form, install-prompt, customers/sign-up/staff pages,
prisma/seed.ts.

### Verification

- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm format:check` ✅
- `pnpm build --webpack` ✅ (required locally on Android/Termux)

### Known Issues

- Staff experience (own Today dashboard, assigned agenda), Customers
  directory, sign-up form, services & team management screens are still
  placeholders — each is a separate Spec A prompt; building them was out
  of scope for this polish-only pass.
- PWA icons are programmatically generated (dark mark + white glyph);
  regenerate with `pnpm icons` if the brand mark changes.
- Seed demo credentials (`admin@flowpilot.app` / `Admin@1234`,
  `staff@flowpilot.app` / `Staff@1234`) are for demo/dev databases only.

---

## Ops 01 — Cross-Platform Run & Reproducibility (DX Only)

**Status:** ✅ Complete

> Developer-experience pass requested by the operator: make the project
> runnable and reproducible on Windows, Linux, macOS, and Termux Android.
> No product features, architecture, schema, or dependency changes.

### Completed Work

- Audit: `docs/PROJECT_AUDIT.md` (status, missing items, risks,
  recommendations) — lockfile verified in sync; Termux pnpm shim breakage and
  env-file convention split identified as top risks
- Bootstrap system: `scripts/bootstrap.sh` (macOS/Linux), `bootstrap.ps1`
  (Windows/winget), `bootstrap-termux.sh` — OS detection, verify node/pnpm/
  git/gh, install only-if-missing (never reinstalls), then `pnpm run setup` +
  `pnpm run doctor`
- Termux pnpm repair: when `pnpm --version` fails, installs a `node` wrapper
  at `$PREFIX/bin/pnpm` (fixes the broken `#!/usr/bin/env node` shim) —
  verified live on-device
- Environment automation: `scripts/setup-env.mjs` — creates `.env.local` from
  `.env.example` with a crypto-random `BETTER_AUTH_SECRET` (mode 600, secret
  never printed, existing files never touched; idempotent)
- Env precedence unified: `prisma.config.ts` and `pnpm db:seed` now load
  `.env.local` before `.env` (matches Next.js precedence; verified with
  dotenv-cli)
- Dev launchers: `scripts/dev.sh`, `dev.ps1`, `dev-termux.sh` — deps → Prisma
  client → env file → best-effort `prisma db push` (skipped on placeholder
  URL, failures never block) → dev server (`--webpack` on Termux)
- Standard commands: `pnpm run setup`, `pnpm run doctor`
  (`scripts/doctor.mjs`: toolchain/env/artifacts, secrets hidden, blocking vs
  warning), `pnpm verify` (`scripts/verify.mjs`: lint → typecheck → format →
  build, auto `--webpack` on Termux); `engines.node >= 20.9.0` declared
- Documentation: `docs/ENVIRONMENT_SETUP.md` (per-OS guide, env conventions,
  safety rules); README Getting Started + Scripts table updated

### Generated Files

`docs/PROJECT_AUDIT.md`, `docs/ENVIRONMENT_SETUP.md`,
`scripts/{bootstrap.sh,bootstrap.ps1,bootstrap-termux.sh,dev.sh,dev.ps1,
dev-termux.sh,setup-env.mjs,doctor.mjs,verify.mjs}`; updated `package.json`,
`prisma.config.ts`, `README.md`, `docs/DECISIONS.md` (#16).

### Verification

- All scripts syntax-checked (`bash -n` / `node --check`) ✅
- `bootstrap-termux.sh` run live on-device: installed missing `gh`, repaired
  broken pnpm shim (bare `pnpm` now works), completed setup, doctor flagged
  the real placeholder `DATABASE_URL` ✅
- `dev-termux.sh` run live on-device: full pipeline, dev server
  "Ready in 2.8s" (Webpack) ✅
- `setup-env.mjs` creation/idempotency/gitignore-safety tested ✅
- `pnpm verify` (lint + typecheck + format:check + build --webpack) ✅

### Known Issues

- `pnpm setup` / `pnpm doctor` without `run` execute pnpm's built-ins — all
  call sites and docs consistently use `pnpm run setup` / `pnpm run doctor`.
- On-device Prisma `migrate`/`db push` may still fail (schema engine
  unsupported on Android); dev scripts treat it as best-effort and the docs
  direct schema sync to desktop/CI.
- This device's `.env` still contains the placeholder `DATABASE_URL` (doctor
  reports it as the only blocking issue).

---

## Ops 02 — Project Health Verification & Commit Safety (DX Only)

**Status:** ✅ Complete

> Operator-requested ops pass: health-verification tooling, quality summary,
> secret scanning, and pre-commit safety. No feature work, no architecture
> changes, no new dependencies.

### Completed Work

- **Doctor** (`scripts/doctor.mjs`, rewritten): checks OS (incl. Android/
  Termux), node, pnpm, git, gh (optional), env vars, dependencies (key
  packages), Prisma (schema + generated client), **live database connection**
  (SELECT 1 via pg, 8s timeout, errors classified: DNS/timeout/auth/db-missing/
  TLS with targeted fixes), and **build readiness** (required CLI bins +
  client). Verdict: `READY` / `NOT READY` with actionable `→ fix:` lines;
  secrets never printed. Fixed: Android platform rejection bug; `.env.local`
  now correctly overrides `.env` in the env merge.
- **Verify** (`scripts/verify.mjs`, enhanced): lint → typecheck → format →
  build with per-step timings and a summary table; non-zero exit on any
  failure; automatic `--webpack` on Termux.
- **Secret scanner** (`scripts/security-check.mjs`, new, `pnpm security`):
  env-file hygiene (gitignored + untracked, both-files warning), secret
  quality (placeholder/short `BETTER_AUTH_SECRET`), forbidden filenames
  (`.env*` except `.env.example`, `*.pem/.p12/.pfx`, `id_rsa*`-style keys,
  service-account/credentials JSON), and content scan (PEM keys, AWS AKIA,
  GitHub ghp_/github_pat_, Stripe sk_live_, sk-… keys, Slack xox, Google AIza,
  credential URLs, keyword assignments) over tracked+untracked or staged
  files. Placeholder/`${VAR}`/`<…>` values exempt; findings show file:line +
  kind, never the value. False-positive on doc placeholder `user:pass@` fixed
  (allow now covers `:password@`/`:pass@`/`:pwd@`, `…`, `${}`).
- **Pre-commit safety**: `.githooks/pre-commit` (POSIX sh) — filename gate
  blocks env/key/credential files even without node; then content scan via
  `security-check.mjs --staged`. Installed through `git config
core.hooksPath .githooks` by `scripts/install-git-hooks.mjs`
  (`pnpm run hooks:install`), auto-installed by `pnpm run setup`. Fixed
  anchor-pattern bug (case-globs don't support `$`) by using substrings.
- **Docs**: `docs/LOCAL_DEVELOPMENT.md` (daily workflow),
  `docs/TROUBLESHOOTING.md` (symptom→fix for setup/env/db/build/git),
  `docs/QUALITY_CHECKS.md` (command map + what each check covers + CI notes);
  README scripts table updated.

### Generated Files

`scripts/{doctor,verify,security-check,install-git-hooks}.mjs` (rewritten/new),
`.githooks/pre-commit`, `docs/{LOCAL_DEVELOPMENT,TROUBLESHOOTING,
QUALITY_CHECKS}.md`; updated `package.json` (security, hooks:install, setup
installs hooks), `README.md`, `docs/DECISIONS.md` (#17).

### Verification

- Detection tests with planted FAKE secrets: GitHub token, Stripe key, AWS
  key, private key header, hardcoded password, real-shaped credential URL —
  all caught; placeholders/`${VAR}`/doc examples pass ✅
- Staged-mode tests: forbidden `.env.accidental` blocked; staged secret file
  blocked; entire clean repo staged → pass (full-repo false-positive check) ✅
- Hook executed directly in all three paths (block file / block content /
  clean pass) ✅
- Doctor: placeholder URL → NOT READY with fixes; unreachable Neon host →
  DNS-classified fix; toolchain checks green on-device ✅
- `pnpm verify` full gate: PASSED (lint 44.5s, typecheck 25.3s, format 26.5s,
  build --webpack 227.7s) ✅

### Known Issues

- Doctor's DB check requires `pg` in `node_modules` (skips with a clear
  message when deps are missing).
- `pnpm doctor` (no `run`) still executes pnpm's built-in — documented
  everywhere relevant.
- Content scanner is shape-based; determined obfuscation is out of scope
  (rotate-first policy documented in TROUBLESHOOTING.md).

---

## Ops 03 — Release Engineering: First GitHub Release Preparation (DX Only)

**Status:** ✅ Prepared (publishing blocked on user actions — by design)

> Operator-requested release pass: git audit, repo preparation, gated
> release automation, release/ops docs, status snapshot. No product work.

### Completed Work

- **Git audit**: `.gitignore` verified via `git check-ignore` (`.env*`,
  `node_modules`, `.next`, `src/generated`, `*.tsbuildinfo`); no env files
  ever tracked (`git log --all` clean); `pnpm security` clean; generated
  files ignored; PWA PNG icons intentionally tracked (DECISIONS #15)
- **Repository preparation**: `main` branch confirmed, clean history
  (1 scaffold commit; 43 pending paths = Spec A + Ops work, no secrets),
  no tags/remotes yet (created at release time)
- **GitHub CLI**: gh 2.98.0 installed (Ops 01); `gh auth status` → NOT
  authenticated → stopped per mission rules with instructions
- **Release gates re-run**: `pnpm verify` ✅ PASSED (lint 54.6s · typecheck
  21.3s · format 24.9s · build --webpack 198.9s); `pnpm security` ✅;
  `pnpm run doctor` ❌ NOT READY (placeholder `DATABASE_URL` — device env,
  user action) → commit/tag/push/release correctly NOT executed
- **Release automation**: `scripts/release.sh` (`pnpm release`) — hard gates
  (gh auth → doctor → verify → security, stop at first failure), then
  idempotent: commit `feat: initial pilot-ready release` → annotated tag
  `v0.1.0` → private repo `flowpilot` + origin → push main + tag →
  GitHub Release "FlowPilot v0.1.0"; verified it refuses safely when
  unauthenticated
- **Docs**: `RELEASE_PROCESS.md` (gates, manual equivalent, versioning,
  rollback), `GITHUB_WORKFLOW.md` (repo settings, commit model, secrets
  rules, future collaboration), `PROJECT_STATUS.md` (spec/status/build/
  release/next), `CURRENT_STATE.md` (evergreen snapshot), `RELEASE_REPORT.md`
  (audit results, gate results, required user actions)

### Generated Files

`scripts/release.sh`, `docs/{RELEASE_PROCESS,GITHUB_WORKFLOW,PROJECT_STATUS,
CURRENT_STATE,RELEASE_REPORT}.md`; updated `package.json` (release script),
`docs/DECISIONS.md` (#18).

### Verification

- `bash -n scripts/release.sh` ✅; live dry-run stops at auth gate with
  instructions and zero side effects ✅
- Gates re-run same day: verify PASSED, security PASSED, doctor NOT READY
  (expected — env is user-provided) ✅
- Git audit commands all clean ✅

### Known Issues

- Publishing v0.1.0 blocked on TWO user actions: `gh auth login` and a real
  `DATABASE_URL` in `.env.local`; afterwards `pnpm release` completes
  everything (repo, commit, tag, push, GitHub Release).
- First migration application against Neon must come from desktop/CI
  (schema engine cannot run on-device).

---

## Ops 04 — Vercel Deployment Readiness (DX Only)

**Status:** ✅ Complete (publishing blocked on user actions — by design)

> Operator-requested deployment pass: audit, Vercel compatibility fixes,
> environment validation, health endpoint, gated deploy commands, config, and
> deployment documentation. No product work, no architecture/schema changes,
> no new dependencies.

### Completed Work

- **Deployment audit**: `docs/VERCEL_AUDIT.md` — per-area findings (Next,
  Prisma, Postgres, Better Auth, PWA, build, env), 2 blockers, 6 risks,
  readiness score 4.5/10 → 8.5/10 after this pass. Root-caused why the
  operator's earlier `prisma generate && next build` fix (commit `299eb08`,
  reverted `d472717`) could not unblock deploys alone: all four env vars are
  required at **build time** (fail-fast `env.ts` runs during prerender), so
  missing Vercel env settings fail the build regardless.
- **Vercel compatibility fixes**: `postinstall: prisma generate` (standard
  Prisma pattern; works on all platforms incl. Termux) + minimal `vercel.json`
  with explicit `buildCommand: pnpm db:generate && pnpm build` (defense in
  depth — the `build` script itself stays untouched per the revert) and
  no-cache headers for `/sw.js` & `/offline.html`.
- **Environment validation**: `scripts/vercel-check.mjs` (`pnpm vercel:check`)
  — validates DATABASE_URL (postgres scheme, placeholder, sslmode warning),
  BETTER_AUTH_SECRET (length/placeholders), BETTER_AUTH_URL and
  NEXT_PUBLIC_APP_URL (http(s), localhost warnings), origin consistency;
  same env precedence as the app; values never printed.
- **Health endpoint**: `/api/health` (force-dynamic, dependency-free) →
  `{"status":"ok","version":"0.1.0","environment":<NODE_ENV>}` with version
  sourced from `package.json`. Found live (via `next start` + curl) that the
  auth `proxy.ts` redirected it to `/sign-in`; added `/api/health` to the
  public-path check so liveness probes work unauthenticated — verified 200
  with the exact JSON on a production server.
- **Deploy commands**: `scripts/deploy.mjs` — `pnpm deploy:check` (env gate →
  full verify gate → readiness verdict), `pnpm deploy:preview` (env + build →
  `vercel deploy`), `pnpm deploy:vercel` (env + full gate →
  `vercel deploy --prod`); Vercel CLI auto-fallback via `pnpm dlx`; unlinked
  project detected with instructions; every failure explains its fix.
- **Documentation**: `docs/VERCEL_DEPLOYMENT.md` (6 sections: project →
  GitHub → env vars → deploy → validate → troubleshooting, incl. no-GitHub
  CLI path), `docs/ENVIRONMENT_VARIABLES.md` (reference for all 4 variables:
  scope, validation layers, generation recipes, per-environment values),
  `docs/DEPLOYMENT_REPORT.md` (automated report).

### Generated Files

`docs/{VERCEL_AUDIT,VERCEL_DEPLOYMENT,ENVIRONMENT_VARIABLES,DEPLOYMENT_REPORT}.md`,
`scripts/{vercel-check,deploy}.mjs`, `src/app/api/health/route.ts`,
`vercel.json`; updated `package.json` (postinstall + vercel:check +
deploy:* scripts), `src/proxy.ts` (public `/api/health`), `README.md`
(deploy commands), `docs/DECISIONS.md` (#19).

### Verification

- `node --check` on both new scripts ✅
- `pnpm vercel:check` live: correctly FAILS on the device's placeholder
  `DATABASE_URL` with per-variable fixes; PASSES with valid temporary values ✅
- `pnpm deploy:check` live: aborts at env gate with clear guidance ✅
- `pnpm verify` full gate: ✅ (lint/typecheck/format/build --webpack)
- `next start` + `curl /api/health`: `{"status":"ok","version":"0.1.0",
"environment":"production"}` ✅

### Known Issues

- Deploying still requires user actions (not code): set the 4 env vars in
  Vercel project settings (Production + Preview), run `pnpm db:deploy`
  against Neon from desktop, push the repo (`pnpm release`), import in Vercel.
- Auth on `*.vercel.app` preview URLs is expected to misbehave
  (`trustedOrigins` covers the production URL only) — test auth on the
  production domain; documented in `VERCEL_DEPLOYMENT.md` Section 6.
- `/api/health` reports the `package.json` version verbatim; bump it with
  releases (already the convention in `RELEASE_PROCESS.md`).

---

## Ops 05 — Demo Readiness (Product Demo Pass)

**Status:** ✅ Complete

> Operator-requested demo pass: make FlowPilot impressive in demos,
> understandable in 2 minutes, and realistic immediately after login. No new
> product modules, no architecture changes, no schema changes — seed data,
> one dashboard empty state, DEMO_MODE hook, and demo/sales documentation.

### Completed Work

- **Demo data strategy**: moved the full dataset out of `seed.ts` into
  `prisma/demo-data.ts` — pure data + deterministic helpers (sha1-based
  stable IDs, Egyptian phone generator, Cairo-aware date math), zero DB
  imports, so the dataset is editable and offline-validatable.
- **Egyptian demo business** (عيادة الابتسامة، كفر الشيخ): replaced the
  Saudi-flavored context with the real target market — Africa/Cairo
  timezone, +20 WhatsApp number, EGP prices in FAQs, Egyptian working hours
  (الجمعة مساءً فقط), Egyptian team names (د. سارة محمود الشريف +
  نورهان السيد) with the SAME demo credentials (DECISIONS #14 unchanged).
- **Demo customers (36)**: Egyptian Arabic names with authentic family
  names, deterministic `+20 (10|11|12|15)` phone numbers (verified unique
  across 200 indexes), realistic notes on ~10 customers.
- **Demo appointments (37)**: all 5 statuses (14 completed · 11 confirmed ·
  9 pending · 2 cancelled · 1 no-show) spread across ±2 weeks, per-day
  conflict-free times, 4 today (3 confirmed + 1 pending) — appointments
  mirror the BOOKED conversations for narrative consistency (e.g. عمر's
  cancelled → urgent-today arc).
- **Demo conversations (22, 73 messages)**: Egyptian-colloquial WhatsApp
  Arabic covering booking requests, rescheduling, emergencies, price/hours/
  insurance/location questions, confirmations, a complaint handled with
  compensation, and dropped-off threads — all 4 statuses (6 BOOKED ·
  5 NEED_HUMAN incl. 2 unassigned · 7 AI_ACTIVE · 4 INCOMPLETE), fresh
  activity today (~11 conversations) so the dashboard is alive immediately
  after login.
- **Dashboard empty states**: new `GettingStarted` onboarding card (3 steps:
  share WhatsApp number with real number display, create first appointment,
  follow conversations) shown ONLY at zero activity; vertical-agnostic copy;
  existing per-list empty states kept.
- **DEMO_MODE support**: `DEMO_MODE=true` (optional, off by default) makes
  `scripts/dev.sh` / `dev.ps1` / `dev-termux.sh` re-seed demo data before
  starting the dev server — best effort, never blocks, requires a real
  DATABASE_URL, never used by production builds. Documented in
  `.env.example` + `ENVIRONMENT_VARIABLES.md`.
- **Documentation**: `docs/DEMO_GUIDE.md` (logins, demo business, sample
  scenarios, 2-minute walkthrough, reset) and `docs/DEMO_SCRIPT.md`
  (timed 5-minute sales flow with Arabic talk track, objection cheat sheet,
  do/don't list). Updated `DATABASE.md` seeding section and README.

### Generated Files

`prisma/demo-data.ts`, `prisma/seed.ts` (rewritten as dataset consumer),
`src/features/dashboard/components/getting-started.tsx`,
`docs/{DEMO_GUIDE,DEMO_SCRIPT}.md`; updated `src/features/dashboard/
components/dashboard.tsx` + `src/app/(app)/page.tsx` (whatsappNumber prop,
isEmpty logic), `scripts/{dev.sh,dev-termux.sh,dev.ps1}` (DEMO_MODE step),
`.env.example`, `docs/{DATABASE,ENVIRONMENT_VARIABLES,DECISIONS}.md`,
`README.md`.

### Verification

- Offline dataset validation (25 checks via temporary tsx harness, then
  removed): counts (36/22/37), phone format+uniqueness, name/ID uniqueness,
  all statuses covered, message chronology, one-thread-per-customer,
  customerIndex bounds, HH:mm validity, **no same-day appointment overlaps**,
  determinism — ALL PASSED ✅ (caught one real gap: whitening missing from
  appointments → added يارا's booking)
- `bash -n` on both modified shell scripts ✅
- `pnpm verify` full gate ✅ (lint/typecheck/format/build --webpack)
- `pnpm security` ✅ (demo passwords are documented demo credentials, not
  secrets — same as DECISIONS #14)

### Known Issues

- The seed run itself could not be executed on this device (placeholder
  `DATABASE_URL`) — dataset verified offline + full typecheck; run
  `pnpm db:seed` from desktop/CI before the first demo.
- Conversations hold realistic static timestamps relative to seed time;
  if seeded days before a demo, "today" stats shift — re-seed before demos
  (`DEMO_MODE=true` automates this).
- Customers directory screen is still a placeholder (Spec A pending) —
  customer data is visible via conversation detail pages only; the demo
  guide/scripts explicitly route around it.

---

## Ops 06 — Pilot Distribution System (Prompt 10.5F, DX Only)

**Status:** ✅ Complete

> Operator-requested distribution pass: transform the project into a **Pilot
> Distribution System** — easy to deploy, share, demo, distribute, and test
> with real prospects. Only deployment/distribution/demo/release workflows;
> no business logic, schema, UI, or architecture changes, no new product
> modules, no new dependencies.

### Completed Work

- **Audit**: `docs/PILOT_DISTRIBUTION_AUDIT.md` — current state, 7 bottlenecks
  (no single `pnpm deploy` entry point; demo data outside the deploy path; no
  URL capture; no auth/link pre-flight; DB not part of the deploy gate;
  liveness-only health; undocumented preview/prod differences), deployment +
  distribution friction, baseline scores (overall 4.8/10 → target 9/10).
- **Pre-deploy gate**: `scripts/pre-deploy.mjs` (`pnpm deploy:check`) —
  environment (reuses `vercel-check.mjs`), Prisma generation (auto-generates),
  database connection (SELECT 1, classified errors) + schema applied
  (information_schema table check → "run pnpm db:deploy" fix), auth
  configuration (secret, URLs, origin consistency), deployment configuration
  (vercel.json buildCommand, postinstall generate, project-link state),
  demo data (`DEMO_MODE=true` → re-seed + verify counts: business, 2 users,
  customers, conversations, appointments), build validation (typecheck +
  `next build`, Termux `--webpack` aware; `--fast` skips). Verdict:
  **READY / NOT READY** with actionable fixes; secrets never printed.
- **Deploy commands** (`scripts/deploy.mjs` rewritten): `pnpm deploy`
  (default → production), `pnpm deploy:production`, `pnpm deploy:preview`,
  `pnpm deploy:check`; legacy `deploy:vercel` kept as alias. Verified that
  `pnpm deploy` runs the script (it shadows pnpm's built-in deploy when
  defined — unlike `setup`/`doctor`). Flow: full pre-deploy gate → Vercel
  auth pre-flight (`whoami`; logged-out detected by exit code AND output,
  instructions printed — never fails silently) → link pre-flight
  (`.vercel/project.json`) → `vercel deploy [--prod]` with live output
  capture → **deployment URL parsed and printed** (✅ Production/Preview line
  first, last `*.vercel.app` fallback) + validation steps + demo guidance;
  preview output warns that auth needs the production URL.
- **Health endpoint v2** (`/api/health`): now returns `status`, `version`,
  `environment`, `timestamp`, `deploymentReady`, `database`
  (connected/unreachable/not-configured — 3s race-timeout probe through the
  app's own Prisma client via dynamic `@/server/db` import; no new
  dependencies, no new types), `missingEnvVars`. Still public via
  `proxy.ts`, still `force-dynamic`, liveness 200 even when DB is down.
- **Demo deployment experience**: `DEMO_MODE=true` now gates **deployments**
  too — every `pnpm deploy:*` re-seeds the demo dataset first (idempotent,
  demo-business-scoped) and verifies counts, so a deployed demo never shows
  empty dashboards; stale "today" timestamps are refreshed per deploy.
- **Distribution docs**:
  - `docs/VERCEL_QUICK_DEPLOY.md` — one-page deploy in < 5 minutes
    (prerequisites, one command, env table incl. `DEMO_MODE`, URL
    chicken-and-egg note, verification).
  - `docs/CLIENT_DEMO.md` — prospect-facing demo package: demo URL, demo
    credentials, 5-minute suggested walkthrough, what to show first, typical
    client questions (AR/EN objection table), recommended sales flow, next
    steps after demo.
  - `docs/DEPLOYMENT_STATUS.md` — deployment/preview/production/demo
    readiness + known issues.
  - `docs/PILOT_DISTRIBUTION_REPORT.md` — final report (files, commands,
    workflows, remaining manual steps, next actions).
- **Doc updates**: README (deploy commands table + quick-deploy/demo-package
  pointers + DEMO_MODE deploy note), `VERCEL_DEPLOYMENT.md` (new commands,
  new health JSON, `deploymentReady:false` troubleshooting row),
  `ENVIRONMENT_VARIABLES.md` (DEMO_MODE deploy semantics + health fields),
  `QUALITY_CHECKS.md` (deploy commands in the command map), `DEMO_GUIDE.md`
  (deploy-time seeding note).

### Generated Files

`scripts/pre-deploy.mjs`, `docs/{PILOT_DISTRIBUTION_AUDIT,VERCEL_QUICK_DEPLOY,
CLIENT_DEMO,DEPLOYMENT_STATUS,PILOT_DISTRIBUTION_REPORT}.md`; rewritten
`scripts/deploy.mjs`; updated `src/app/api/health/route.ts`, `package.json`
(deploy/deploy:production/deploy:check scripts), `README.md`,
`docs/{VERCEL_DEPLOYMENT,ENVIRONMENT_VARIABLES,QUALITY_CHECKS,DEMO_GUIDE}.md`.

### Verification

- `node --check` on both scripts ✅; URL parser + login-detection unit-tested
  against real Vercel CLI output samples (5/5 parser cases, 4/4 auth cases) ✅
- `pnpm deploy:check` live: NOT READY on this device's placeholder
  `DATABASE_URL` with per-check fixes; with valid-shaped env: env/prisma/auth/
  config checks pass, DB unreachable correctly classified (DNS fix), demo +
  build steps informative; `--fast` build skip verified ✅
- `pnpm deploy` / `deploy:preview` / `deploy:production` live: abort at the
  pre-deploy gate with clear next actions; usage message on bad mode ✅
- `pnpm dlx vercel@latest whoami` live: exit 1 + "Logged out" — auth
  pre-flight logic double-covered against real CLI behavior ✅
- `pnpm verify` full gate (lint/typecheck/format/build --webpack) ✅
- `next start` + `curl /api/health`: full readiness JSON with `deploymentReady`
  reflecting the placeholder DB ✅ (see Known Issues)
- `pnpm security` ✅

### Known Issues

- Deploying still requires user actions (by design): `vercel login` +
  `vercel link` (or GitHub import), the four env vars in Vercel project
  settings (Production + Preview), `pnpm db:deploy` against Neon from
  desktop/CI, and a real `DATABASE_URL` locally.
- First-deploy URL chicken-and-egg (URLs must equal the final domain) is
  documented with two resolutions in `VERCEL_QUICK_DEPLOY.md` — not
  automatable without knowing the intended project name.
- Health DB probe may add up to 3s on cold/suspended Neon (race timeout);
  liveness (`status`) is unaffected.

---

## Prompt 09 — Auth & User Management Architecture Alignment

**Status:** ✅ Complete (documentation-only)

> Operator-requested architecture alignment: lock the new authentication /
> user-management model BEFORE any implementation. No application feature
> code, schema, migration, or Better Auth configuration changed in this
> prompt. Binding decision: `DECISIONS.md` #22.

### Completed Work

Documented (nothing implemented in code):

- Invitation-first pilot account creation: Platform Operator provisions
  Business → invites initial ADMIN → ADMIN accepts invitation → sets
  password / activates → completes Business onboarding → Business becomes
  operational → ADMIN invites STAFF → STAFF activates. No approval
  workflow.
- Platform vs Business authorization scope separation: ONE Better Auth
  authentication system for all human users; PLATFORM and BUSINESS are
  authorization scopes, not auth systems; platform access uses an explicit
  platform-level marker (never inferred from `businessId = null`).
- ADMIN/STAFF business roles reaffirmed — no SUPER_ADMIN, SUPERUSER,
  OWNER_ADMIN, MANAGER, RECEPTIONIST, or any other Business role.
- Platform Operator (Founder) is a platform-level identity, NOT a Business
  User and not a `UserRole` value; Founder Side UI remains Spec B.
- Future self-sign-up compatibility: public self-sign-up is not the primary
  pilot flow but must remain architecturally possible after PMF.
- Invitation domain concept (separate from Better Auth) + lifecycle
  (`PENDING → ACCEPTED / EXPIRED / REVOKED`).
- Account lifecycle (`INVITED → ACTIVE → DEACTIVATED`) and Business
  lifecycle (`PROVISIONED → ACTIVE → DEACTIVATED`).
- Tenancy & authorization rules (server-side authorization mandatory; UI
  visibility is not authorization; no RBAC engine; no granular permissions;
  no organizations/membership frameworks).
- Target conceptual account model (PLATFORM USER / BUSINESS ADMIN /
  BUSINESS STAFF) documented in `DATABASE.md` — planned, not implemented.

### Files Changed (docs only)

`docs/DECISIONS.md` (#22), `docs/SPEC_A.md` (login/onboarding wording +
screen list), `docs/ARCHITECTURE.md` (new Authentication & Authorization
Model section), `docs/DATABASE.md` (target model, labeled planned),
`docs/PRODUCT_GLOSSARY.md` (Platform Operator / Invitation / Account
Activation / Business Activation), `docs/AGENT_RULES.md` (strengthened
prompt lifecycle; sign-up superseded note), `docs/
FLOWPILOT_UX_IMPROVEMENTS_14.md` (created — did not exist before; UX plan
with invitation-first framing + P0/P1/P2 priorities), `docs/CURRENT_STATE.md`,
`docs/PROJECT_STATUS.md`, superseded-notes in `docs/
PILOT_DISTRIBUTION_REPORT.md` + `docs/RELEASE_REPORT.md`, this file.

No application feature code changed.

### Verification

- Prettier format check on all changed docs ✅
- `pnpm verify` (lint/typecheck/format/build) ✅ — no source modified; run
  per AGENT_RULES quality gate
- Doc consistency: no doc still names public sign-up as the primary flow or
  next step ✅

### Known Issues

- The previously planned "Prompt 09 — complete Arabic Better Auth sign-up
  flow" is OBSOLETE (superseded by this architecture alignment). The
  `/sign-up` placeholder page still exists in code untouched.
- Nothing of the new model exists in code: no Invitation model, no account
  activation, no Platform Operator identity, no Team invitation UI.

---

## Prompt 10 — Invitation Data Model (Operator Prompt 02)

**Status:** ✅ Complete

> Data-layer only: the Invitation domain foundation per DECISIONS #22.
> No UI, no Better Auth changes, no workflows, no activation. Numbering:
> the operator's FlowPilot prompt series restarted at Prompt 01 (= the
> auth alignment logged above as internal Prompt 09); this is operator
> Prompt 02, logged here as internal Prompt 10 to keep the ledger
> unambiguous.

### Completed Work

- Prisma `Invitation` model (`prisma/schema.prisma`): `id` (UUID),
  `email`, `businessId` (FK → Business, Cascade), `role` (reuses
  `UserRole` — ADMIN/STAFF only, DECISIONS #02), `tokenHash` (unique —
  secure hash only, raw tokens are never stored), `expiresAt`,
  `acceptedAt?`, `revokedAt?`, `invitedById?` (FK → User, SetNull),
  `createdAt`, `updatedAt`.
- `invitedById` is nullable: the minimum safe choice until the Platform
  Operator identity exists (a required relation would block future
  platform-level provisioning; DECISIONS #22).
- Derived lifecycle — NO persisted status enum and NO `deletedAt`:
  pending = acceptedAt/revokedAt null + unexpired; accepted = acceptedAt
  set; revoked = revokedAt set; expired = pending + past expiresAt.
- Indexes: `(businessId)`, `(businessId, email)` (convention: FK +
  per-tenant lookup), unique `token_hash` (efficient + unique lookup).
  No speculative indexes (`expiresAt`, `invitedById` have no query
  patterns yet).
- Migration `20260902120000_invitation_model` — SQL authored on-device
  in Prisma's migration style (the schema-engine binary cannot execute
  on Termux, so `prisma migrate dev`/`diff` cannot run here); apply from
  desktop/CI with `pnpm db:deploy`.
- Zod validation (`src/lib/validation/invitation.ts`):
  `CreateInvitationDto` — repository input contract only (email,
  businessId, role, tokenHash 32–256, `expiresAt: z.date()`,
  optional `invitedById`). No HTTP request DTOs (later prompts).
- `InvitationRepository` (`src/server/repositories/invitation.repository.ts`):
  `create`, `findByTokenHash` (single record, for the future acceptance
  flow), `findByIdWithinBusiness`, `listByBusiness` (tenant-scoped,
  newest first, paginated), and `revoke` / `markAccepted` as guarded
  state-update primitives (only while pending; transaction-scoped
  find-then-update like the appointment conventions). Expiry validation
  intentionally belongs to the future acceptance workflow. NO global
  "list all invitations" method (tenancy, DECISIONS #22).
- Domain type: `Invitation` alias exported from `src/types/domain.ts`.
- Prisma client regenerated (`pnpm db:generate`) — output stays
  gitignored under `src/generated/prisma`.

### Generated Files

`prisma/migrations/20260902120000_invitation_model/migration.sql`,
`src/lib/validation/invitation.ts`,
`src/server/repositories/invitation.repository.ts`; updated
`prisma/schema.prisma` (Invitation model + relations on Business/User),
`src/lib/validation/index.ts`, `src/server/repositories/index.ts`,
`src/types/domain.ts`.

### Verification

- `pnpm db:generate` ✅ (schema valid, client regenerated)
- `pnpm typecheck` ✅ · `pnpm lint` ✅
- `pnpm verify` (full gate: lint/typecheck/format/build --webpack) ✅
- `pnpm security` ✅ (token-related fields scanned — clean)
- Migration NOT applied on-device (Termux schema-engine limitation +
  placeholder `DATABASE_URL`) — apply from desktop/CI: `pnpm db:deploy`.
  Not claimed as applied.

### Known Limitations

- No workflow logic exists yet: token generation/delivery, invitation
  creation workflow, acceptance, account activation, password setup,
  and all UI belong to later prompts.
- No DB-level duplicate-open-invitation constraint (the same email may
  hold several invitations, including across Businesses by design);
  duplicate-open-invitation prevention is the creation workflow's
  responsibility (next prompt).
- `prisma/migrations/` has no `migration_lock.toml` and no init
  migration (pre-existing state, affects the onboarding migration
  equally) — reported as an out-of-scope observation, not fixed here.

---

## PROMPT-03 — Invitation Creation Foundation

**Status:** ✅ Complete

> Server/domain foundation only: secure token creation (hash-only
> persistence), business-scoped listing, and revocation. No UI, no
> invitation acceptance, no account activation, no token delivery, no
> Better Auth changes.

### Completed Work

- Secure token utilities (`src/server/security/invitation-token.ts`):
  256-bit CSPRNG raw token (URL-safe base64url) + deterministic SHA-256
  hex hash; only the hash is ever persistable. The raw token is returned
  from creation exactly once and is never logged (no `console` usage in
  any new module — verified by source scan).
- `InvitationRepository.createIfNoOpenInvitation` — transaction-scoped
  check-then-create (same pattern as
  `AppointmentRepository.createWithConflictCheck`): refuses a second
  OPEN invitation for the same Business + normalized email; expired,
  revoked, and accepted invitations never block creation. No DB
  uniqueness constraint added (the Prompt-10 data-model decision stands).
- Invitation service
  (`src/features/invitations/server/invitation-service.ts`):
  `createInvitation` (validate → normalize email → verify Business via
  the repository → generate token → persist hash only → return metadata
  plus the raw token once), `listInvitations` (business-scoped,
  newest-first, paginated, derived status, hash excluded), and
  `revokeInvitation` (business-scoped; accepted → invalid state;
  already-revoked → idempotent success with no second write; pending —
  including expired-pending — → revoked; acceptance NOT implemented).
- Centralized expiration policy: `INVITATION_EXPIRY_DAYS = 7` +
  `invitationExpiresAt()` (`expiresAt = creation + TTL`) — the only
  place the TTL is defined (DECISIONS #23).
- Derived-lifecycle helper `deriveInvitationStatus` (PENDING / ACCEPTED
  / REVOKED / EXPIRED from timestamps; precedence accepted > revoked >
  expired > pending) — the DATABASE.md lifecycle encoded in one place.
- Email normalization (trim + lowercase) defined once in the invitation
  workflow schema and used for duplicate detection, persistence, and
  listing alike; global email behavior elsewhere untouched.
- Typed results mirroring `ApiResponse` with tightened error codes
  (INVALID_INPUT / BUSINESS_NOT_FOUND / INVITATION_ALREADY_OPEN /
  INVITATION_NOT_FOUND / INVALID_INVITATION_STATE / PERSISTENCE_FAILED),
  Arabic messages, no internals leaked.
- Repository collaborators are injectable on the service (defaulting to
  the app singletons) purely so the workflow logic can be verified
  without a live database.
- Release tooling: minimal per-feature extension of `scripts/release.sh`
  (optional notes-file argument composing "FlowPilot <tag> — <subject>"
  for the annotated tag and GitHub Release; v0.1.0 defaults unchanged) —
  documented in `RELEASE_PROCESS.md`.

### Generated Files

`src/server/security/invitation-token.ts`, `src/features/invitations/
{README.md,types.ts,schemas/invitation-schema.ts,server/invitation-service.ts}`;
updated `src/server/repositories/invitation.repository.ts`,
`scripts/release.sh`, `docs/RELEASE_PROCESS.md`, this file,
`docs/DATABASE.md`, `docs/CURRENT_STATE.md`, `docs/PROJECT_STATUS.md`,
`docs/DECISIONS.md` (#23).

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05
  pattern): **28/28 checks passed** offline with in-memory repository
  stand-ins — token non-empty/URL-safe/unique, hash determinism +
  hex-only, hash-only persistence (raw token never in create payloads
  or stored records), no console logging (source scan), expiry exactly
  +7 days, email normalization, duplicate-OPEN rejection (incl.
  case-variant email), same email allowed across different businesses,
  expired/revoked/accepted invitations all allow re-invitation,
  business-scoped listing (cross-tenant records invisible), list items
  and results exclude `tokenHash`, derived statuses match the model,
  revoke semantics (pending → REVOKED, idempotent re-revoke with no
  extra write, accepted → INVALID_INVITATION_STATE, cross-tenant →
  INVITATION_NOT_FOUND), invalid role/email/businessId rejection.
- `pnpm db:generate` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅
- `pnpm verify` (full gate: lint/typecheck/format/build --webpack) ✅
- `pnpm security` ✅
- NOT verified on-device (environment limits, honestly stated): the
  transactional duplicate-open guard against a real database and actual
  persistence — this device has a placeholder `DATABASE_URL` and cannot
  run the Prisma schema engine; migration `20260902120000` remains
  unapplied on-device (apply from desktop/CI: `pnpm db:deploy`).

### Known Limitations

- No server actions / UI yet — the future Team management prompt wraps
  this service with auth guards + revalidation; role-specific
  authorization decisions belong to that prompt (server-side
  authorization remains mandatory per DECISIONS #22).
- Raw-token delivery (email / WhatsApp link) is out of scope; the
  caller receives the raw token exactly once at creation.
- Duplicate-open prevention is transaction-scoped application logic —
  the same accepted race caveat as appointments (no DB exclusion
  constraint); pilot volume makes this acceptable.

### Release

- Atomic commit `feat(invitations): add invitation creation foundation`
  (the earlier uncommitted auth-alignment docs + invitation data-model
  work from the two preceding prompts was landed first as its own
  attributed commit, keeping this one atomic).
- Annotated tag `v0.2.0` — Invitation Creation Foundation points at the
  PROMPT-03 commit; `main` is pushed to origin. Tag push + GitHub
  Release are blocked by the documented release gate (`pnpm run doctor`
  → NOT READY: placeholder `DATABASE_URL` on this device — user action).
  Publish afterwards with `bash scripts/release.sh flowpilot v0.2.0
<notes-file>` (per-feature notes-file support added in this prompt).
- **Published (PROMPT-05A, 2026-09-03):** tag `v0.2.0` pushed to origin
  and GitHub Release "FlowPilot v0.2.0 — Invitation Creation
  Foundation" created — see the PROMPT-05A section.

---

## PROMPT-04 — Invitation Acceptance Foundation

**Status:** ✅ Complete

> Server/domain foundation only: one-time, atomic, token-based
> invitation acceptance. Raw token → hash → locate → lifecycle
> validation → atomic PENDING→ACCEPTED transition → safe invitation
> context. No account activation, no Better Auth changes, no password,
> no session, no User creation, no delivery, no UI.

### Implemented / Already Implemented / Not Implemented

**IMPLEMENTED (this prompt):**

- Invitation acceptance (`acceptInvitation` service operation +
  `acceptPendingInvitation` repository primitive + acceptance input
  validation)

**ALREADY IMPLEMENTED (reused, untouched):**

- Invitation data model (Prompt 10) — schema, migration, indexes
- Invitation creation foundation (PROMPT-03) — token generation,
  hash-only persistence, centralized 7-day expiry, duplicate-open
  prevention, create/list/revoke service operations
- `findByTokenHash` repository lookup (Prompt 10, built for this)
- Token hashing utility (`hashInvitationToken`), derived lifecycle
  helper (`deriveInvitationStatus`), Arabic typed-error conventions

**NOT IMPLEMENTED (later prompts):**

- Account activation (PROMPT-05 — ADMIN Account Activation Foundation)
- Better Auth integration for the invitation flow / password creation
- Invitation delivery (email/WhatsApp link)
- Acceptance UI (`/invite/[token]` etc.)
- ADMIN onboarding reconnection, STAFF workflow, Founder UI

### Completed Work

- `InvitationRepository.acceptPendingInvitation(tokenHash)` — the
  minimal atomic primitive: a single conditional `updateMany` (pending
  - unrevoked + unexpired) inside a transaction, then a re-read of the
    accepted row. Zero rows updated (concurrent acceptance, revocation,
    or expiry between the workflow's pre-check and the update) returns
    null — the guard lives in the UPDATE's WHERE clause itself, so two
    concurrent acceptances cannot both succeed. Expiry is enforced here
    as the database-level last line of defense (the service enforces it
    as the workflow layer, per DECISIONS #23's centralized policy).
- `acceptInvitation(rawToken input)` service operation:
  validate (Zod) → hash with the EXISTING `hashInvitationToken`
  utility → `findByTokenHash` → lifecycle evaluation via the EXISTING
  `deriveInvitationStatus` → atomic conditional acceptance →
  race-safe failure classification → safe result.
- One-time acceptance: a second attempt (sequential or concurrent)
  fails with `INVITATION_ALREADY_ACCEPTED`; the lifecycle stays
  PENDING → ACCEPTED, never ACCEPTED → ACCEPTED.
- Lifecycle failures map to the existing typed-result conventions
  with new additive codes: `INVITATION_ALREADY_ACCEPTED`,
  `INVITATION_REVOKED`, `INVITATION_EXPIRED` (safe to distinguish
  because the caller presented a valid token); unknown/invalid tokens
  get one generic `INVITATION_NOT_FOUND` whose message does not help
  differentiate token states. No new error framework.
- Token-scoped by design (the caller is not yet authenticated):
  tokenHash is the lookup boundary; the persisted invitation is the
  sole authority for email/businessId/role — the acceptance input
  accepts ONLY the raw token (Zod strips everything else), so callers
  cannot override businessId/email/role/expiration.
- Result excludes the raw token and the tokenHash (safe
  `InvitationView` context for PROMPT-05: id, email, businessId, role,
  acceptedAt); neither value is ever logged (source-scanned).
- Acceptance input schema: token trimmed, non-empty, ≤256 chars,
  base64url charset (the generated format), Arabic messages —
  malformed/oversized input is rejected as `INVALID_INPUT` before any
  hash lookup.
- PostgreSQL/Prisma transaction capabilities only — no distributed
  lock, no Redis, no queues, no new infrastructure; repositories
  remain the only Prisma consumers.

### Generated Files

`src/features/invitations/server/invitation-service.ts` (acceptance
operation + extended deps), `src/features/invitations/
schemas/invitation-schema.ts` (acceptance input),
`src/features/invitations/types.ts` (new codes +
`AcceptInvitationSuccess`), `src/server/repositories/
invitation.repository.ts` (`acceptPendingInvitation`), `src/features/
invitations/README.md`; updated `docs/BUILD_STATE.md`,
`docs/DATABASE.md`, `docs/CURRENT_STATE.md`,
`docs/PROJECT_STATUS.md`.

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05 /
  PROMPT-03 pattern): **22/22 checks passed** offline with in-memory
  repository stand-ins modeling the atomic conditional-update
  semantics — valid pending accepted; acceptedAt set exactly once;
  raw token never returned; tokenHash never in result/view; hash-only
  lookups (64-hex, never the raw token); expired/revoked/already-
  accepted rejected with typed codes and zero writes; unknown token →
  generic not-found with no token material in the message; empty/
  whitespace/malformed/oversized → INVALID_INPUT without repository
  access; 256-char boundary passes validation but is not found;
  second sequential and concurrent (Promise.all) acceptance attempts
  fail as already-accepted with exactly one write; business
  association preserved; businessId/email/role not overridable.
- `pnpm db:generate` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅
- `pnpm verify` (full gate: lint/typecheck/format/build --webpack) ✅
- `pnpm security` ✅
- Source-level security audit ✅: no `console`/logger usage in any
  changed module; raw token never persisted (hash is the only stored
  credential representation); no token values in error messages; no
  SQL/database internals leaked.
- NOT verified on-device (environment limits, honestly stated): the
  real-database atomicity of `acceptPendingInvitation` (two truly
  concurrent Prisma transactions against PostgreSQL) and actual
  persistence — this device has a placeholder `DATABASE_URL` and
  cannot run the Prisma schema engine; migration `20260902120000`
  remains unapplied on-device (apply from desktop/CI:
  `pnpm db:deploy`). The single-statement conditional UPDATE is the
  standard Postgres-safe pattern, and the in-memory harness verifies
  the workflow logic around it.

### Known Limitations

- No HTTP route / server action / UI yet — the future acceptance
  prompt wraps `acceptInvitation` at the route layer (PROMPT-05
  composes it for account activation).
- Acceptance marks the invitation only; it does NOT create a User,
  Better Auth account, password, or session (DECISIONS #22 flow).
- Raw-token delivery remains out of scope; the caller of creation
  received the raw token exactly once.
- The acceptance concurrency guarantee relies on the repository's
  conditional UPDATE (plus the unique `token_hash` lookup); like all
  application-level guards on this stack, a real-DB integration test
  should accompany the first deployment against Neon.

### Release

- Atomic commit `feat(invitations): add invitation acceptance
foundation` (implementation + docs only; schema untouched).
- Annotated tag `v0.3.0` — Invitation Acceptance Foundation points at
  the PROMPT-04 commit; `main` is pushed to origin. Tag push + GitHub
  Release remain blocked by the documented release gate
  (`pnpm run doctor` → NOT READY: placeholder `DATABASE_URL` on this
  device — user action), same as v0.2.0. Publish afterwards with
  `bash scripts/release.sh flowpilot v0.3.0 <notes-file>`.
- **Published (PROMPT-05A, 2026-09-03):** tag `v0.3.0` pushed to origin
  and GitHub Release "FlowPilot v0.3.0 — Invitation Acceptance
  Foundation" created — see the PROMPT-05A section.

---

## PROMPT-05 — ADMIN Account Activation Foundation

**Status:** ✅ Complete

> Server/domain/auth integration only: connects an already-accepted
> ADMIN invitation to a real Better Auth identity and activates the
> Business ADMIN account. Better Auth owns the authentication identity
> (password hash, credential account, sessions); FlowPilot owns the
> Business membership (businessId, role ADMIN, isActive) and the
> invitation lifecycle. No UI, no onboarding changes, no STAFF
> activation, no routes, no delivery.

### ALREADY IMPLEMENTED (reused, untouched in spirit)

- Invitation data model (Prompt 10) — schema, migration, indexes
- Invitation creation foundation (PROMPT-03) — token generation,
  hash-only persistence, centralized 7-day expiry, duplicate-open
  prevention, create/list/revoke service operations
- Invitation acceptance foundation (PROMPT-04) — one-time, atomic,
  token-based acceptance
- Token hashing utility (`hashInvitationToken`), derived lifecycle
  helper (`deriveInvitationStatus`), Arabic typed-error conventions

### IMPLEMENTED IN THIS PROMPT

- **ADMIN account activation** (`activateAdminAccount` service
  operation + `activateInvitedAdmin` repository primitive +
  `activateAdminAccountInputSchema`): eligibility (ADMIN role,
  accepted, unrevoked, unactivated — pending/expired/revoked/STAFF
  rejected with typed Arabic errors) → identity collision handling →
  Better Auth identity creation when none exists → atomic invitation
  activation + Business ADMIN membership → safe result
  (`{invitation, userId, identityCreated}`).
- **Better Auth identity integration**: the installed version's
  official server-side `auth.api.signUpEmail` behind an injectable
  `IdentityCreator` dependency; Better Auth owns the password hash,
  the credential account, and sessions. The prismaAdapter now runs
  with its public `transaction: true` option so the user + credential
  account rows are created atomically inside Better Auth.
- **Business ADMIN membership**: `businessId` + `role ADMIN` +
  `isActive true` derived from the invitation only — callers cannot
  override businessId/role/email (Zod strips every other key).
- **Account activation state**: `Invitation.activatedAt` (nullable
  timestamp, set exactly once) — the minimum schema change that
  guarantees one-time activation; `deriveInvitationStatus` now derives
  ACTIVATED (accepted + activatedAt), and the acceptance classifier
  maps ACTIVATED → INVITATION_ALREADY_ACCEPTED.
- **One-identity-per-email collision handling**: existing identities
  are never duplicated, never password-reset, never silently moved or
  promoted — same-Business ADMIN resumes idempotently,
  never-assigned identities (interrupted activation) are attached,
  other-Business users and same-Business STAFF get `ACCOUNT_CONFLICT`;
  a USER_ALREADY_EXISTS race is re-read and classified the same way.
- **Focused tests**: temporary tsx verification harness — **79/79
  checks passed** offline with in-memory stand-ins modeling the
  transactional semantics (details below); removed after the run.
- **Verification**: full quality gate (details below).

### NOT IMPLEMENTED (later prompts)

- Invitation UI / activation UI (`/invite/[token]`, password form)
- Activation → onboarding integration (PROMPT-06)
- STAFF activation
- Team UI
- Founder/Platform UI (Spec B)
- Public self-sign-up (not the primary pilot model)
- Token delivery (email/WhatsApp link)

The next step is:

PROMPT-06 — ADMIN Activation → Onboarding Integration

Do NOT implement it now.

### Completed Work (details)

- `Invitation.activatedAt DateTime?` + migration
  `20260903120000_invitation_activation` (SQL authored on-device in
  Prisma's migration style — the schema-engine binary cannot execute
  on Termux; apply from desktop/CI with `pnpm db:deploy`). No index
  added (no query pattern yet, consistent with the no-speculative-
  indexes decision).
- `InvitationRepository.activateInvitedAdmin({invitationId, userId,
businessId})`: ONE Prisma transaction — validation reads → one-time
  conditional `activatedAt` guard (concurrent activations serialize;
  the loser reads ALREADY_ACTIVATED) → conditional membership attach
  (`businessId IS NULL` OR same-Business ADMIN; sets businessId, role
  ADMIN, isActive true) → `InvitationActivationConflictError` thrown
  to roll the whole transaction back when the attach guard loses a
  race (e.g., the same email activated for another Business
  concurrently).
- `UserRepository.findByEmail(email)`: minimal identity lookup for the
  collision handling (Better Auth owns email uniqueness).
- `activateAdminAccount` service operation: token-scoped (hash-only
  lookup; the persisted invitation is the sole authority), explicit
  revoked check (defense in depth), derived-lifecycle eligibility
  switch, collision classification helper, identity creation via the
  injectable dependency with APIError mapping (USER_ALREADY_EXISTS →
  re-read + resume/conflict; PASSWORD_TOO_SHORT/LONG → INVALID_INPUT;
  anything else → IDENTITY_CREATION_FAILED without internals),
  repository-outcome mapping to typed Arabic results.
- `activateAdminAccountInputSchema`: token (base64url, same rules as
  acceptance), name (2–120, user-validation conventions), password
  (8–128 — mirroring Better Auth's configured defaults, no invented
  policy); Arabic-first messages.
- New typed result codes (additive): `INVITATION_NOT_ACCEPTED`,
  `ACCOUNT_ALREADY_ACTIVATED`, `ROLE_NOT_ALLOWED`, `ACCOUNT_CONFLICT`,
  `IDENTITY_CREATION_FAILED`; `ActivateAdminAccountSuccess` carries
  only safe data. `InvitationView` now includes `activatedAt`.
- Better Auth server config: `prismaAdapter(db, { provider:
"postgresql", transaction: true })` — the documented public option
  of the installed 1.7.1; no version change, no plugins.
- Decision #22 `accountType` discriminator: NOT added — activation
  creates BUSINESS identities only, nothing infers or grants platform
  access, and the full discriminator (nullable role etc.) is a broader
  authorization change belonging to the future platform-identity
  prompt. Documented in DATABASE.md.

### Generated Files

`prisma/migrations/20260903120000_invitation_activation/migration.sql`;
updated `prisma/schema.prisma` (activatedAt), `src/lib/auth.ts`
(adapter transaction option), `src/server/repositories/
invitation.repository.ts` (activation primitive + conflict error +
outcome type), `src/server/repositories/user.repository.ts`
(findByEmail), `src/features/invitations/server/invitation-service.ts`
(activateAdminAccount + identity creator + lifecycle extension),
`src/features/invitations/schemas/invitation-schema.ts` (activation
input), `src/features/invitations/types.ts` (codes + success shape +
activatedAt), `src/features/invitations/README.md`; updated
`docs/BUILD_STATE.md`, `docs/DATABASE.md`, `docs/CURRENT_STATE.md`,
`docs/PROJECT_STATUS.md`.

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05 /
  PROMPT-03/04 pattern): **79/79 checks passed** offline with
  in-memory repository/identity stand-ins modeling the atomic
  conditional-guard + conditional-attach + rollback semantics —
  valid accepted ADMIN invitation activates (one identity, membership
  attached, activatedAt set); pending/expired/revoked/STAFF/unknown-
  token rejections with typed codes and zero writes; impossible
  accepted+revoked record still never activates; invalid password /
  name / token-charset input rejected before any lookup; businessId /
  role / email not overridable (identity uses the invitation's
  values); exactly one identity per email; repeated activation →
  ACCOUNT_ALREADY_ACTIVATED with no second identity and no password
  reset; existing same-Business ADMIN resumes safely; cross-business
  user rejected and not moved; same-Business STAFF not promoted;
  interrupted activation (identity without membership) resumes and
  attaches; USER_ALREADY_EXISTS race resumes-or-conflicts correctly;
  identity-creation failure leaves no membership writes; concurrent
  activations produce exactly one winner + ACCOUNT_ALREADY_ACTIVATED
  loser + exactly one identity; acceptance of an ACTIVATED invitation
  reports INVITATION_ALREADY_ACCEPTED (regression); derived lifecycle
  statuses unchanged except the new ACTIVATED; result omits raw token
  / tokenHash / password; safe top-level result shape; no stored
  record contains the raw token or password; no console logging in
  any changed module (source scan); membership scoped to the
  invitation's Business only.
- `pnpm db:generate` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅
- `pnpm verify` (full gate: lint/typecheck/format/build --webpack) ✅
- `pnpm security` ✅
- NOT verified on-device (environment limits, honestly stated): the
  real-database behavior of `activateInvitedAdmin` (two truly
  concurrent Prisma transactions against PostgreSQL), the actual
  `auth.api.signUpEmail` call against a live database (this device has
  a placeholder `DATABASE_URL` and cannot run the Prisma schema
  engine), and migration application. Migrations `20260902120000` and
  `20260903120000` remain unapplied on-device (apply from desktop/CI:
  `pnpm db:deploy`). The single-statement conditional-UPDATE guard is
  the standard Postgres-safe pattern, and the in-memory harness
  verifies the workflow logic around it. A real-DB integration test
  should accompany the first deployment against Neon.

### Known Limitations

- No route/server action exposes activation yet — PROMPT-06 / the
  activation UI prompt composes `acceptInvitation` +
  `activateAdminAccount` at the route layer (the service intentionally
  stays a domain operation per the existing architecture).
- `auth.api.signUpEmail` auto-signs-in (creates a session row); the
  session token is discarded by the service and never returned or
  logged. Whether the activation flow reuses that session is a
  route-layer decision for the UI prompt.
- Token delivery remains out of scope; the caller of creation
  received the raw token exactly once.

### Release

- Atomic commit `feat(auth): add ADMIN account activation`
  (`896188a`) — implementation + docs only; no dependency changes.
- Annotated tag `v0.4.0` — ADMIN Account Activation Foundation points
  at the PROMPT-05 commit; `main` is pushed to origin. Tag push +
  GitHub Release are blocked by the documented release gate
  (`pnpm run doctor` → NOT READY: placeholder `DATABASE_URL` on this
  device — user action), same as v0.2.0 and v0.3.0. Publish
  afterwards with `bash scripts/release.sh flowpilot v0.4.0
<notes-file>` (prepared notes: required sections per
  RELEASE_PROCESS.md).
- **Published (PROMPT-05A, 2026-09-03):** tag `v0.4.0` pushed to origin
  and GitHub Release "FlowPilot v0.4.0 — ADMIN Account Activation
  Foundation" created — now the repository's Latest release; see the
  PROMPT-05A section.

---

## PROMPT-05A — GitHub Release Publication Recovery (Ops Only)

**Status:** ✅ Complete (operations-only)

> Reconciled local git release state with GitHub and published the
> existing valid tags/releases. No product code, schema, Better Auth,
> invitation/activation logic, or script changes; no new tag created, no
> existing tag modified/renamed/moved/deleted, no force-push, no history
> rewrite. No doctor / release-script / deployment commands were run —
> GitHub publication was the only goal (the doctor gate remains intact
> and still governs future `pnpm release` runs).

### Completed Work

- **Baseline verified:** clean working tree; branch `main`; HEAD
  `075f562` = `origin/main` (no commit push required); origin =
  `github.com/geekammar/flowpilot` (the expected FlowPilot repository);
  `gh auth status` authenticated (account `geekammar`).
- **Local versions discovered:** `v0.1.0` (lightweight tag → `dba5e40`,
  initial scaffold commit), `v0.2.0` (annotated → `4c80f13`, PROMPT-03
  commit), `v0.3.0` (annotated → `ef012f0`, PROMPT-04 commit), `v0.4.0`
  (annotated → `896188a`, PROMPT-05 commit). Remote previously had only
  `v0.1.0` (at the matching commit — no collision) and one GitHub
  Release (`FlowPilot v0.1.0`, published 2026-08-27).
- **Tags published** (normal push, chronological order): `v0.2.0`,
  `v0.3.0`, `v0.4.0` — verified via `git ls-remote --tags origin`
  (each remote peeled commit matches the intended target).
- **GitHub Releases created** (chronological order, `gh release create
--verify-tag`, titles matching the annotated tag messages):
  "FlowPilot v0.2.0 — Invitation Creation Foundation",
  "FlowPilot v0.3.0 — Invitation Acceptance Foundation",
  "FlowPilot v0.4.0 — ADMIN Account Activation Foundation" (now the
  Latest release). Notes contain only verified scope from
  `BUILD_STATE.md`, the tag commits, and the git log (Added / Fixed /
  Security / Verification / Documentation / tag range).
- **Documentation reconciled:** `PROJECT_STATUS.md` (Release Status),
  `CURRENT_STATE.md` (Release bullet), this file (publication notes on
  the PROMPT-03/04/05 Release subsections + Current State Summary).

### Verification

- `git ls-remote --tags origin`: v0.1.0 → `dba5e40`, v0.2.0 → `4c80f13`,
  v0.3.0 → `ef012f0`, v0.4.0 → `896188a` ✅
- `gh release view` per tag: all four releases exist with correct
  titles, published (not draft, not prerelease) ✅
- `git status --short` clean after the reconciliation commit ✅

### Known Issues / Remaining User Actions

- **Repository visibility:** `geekammar/flowpilot` is currently PUBLIC;
  `GITHUB_WORKFLOW.md` and DECISIONS #18 require PRIVATE during the
  discovery stage (pilot businesses + strategy are confidential — the
  full source is already public on `main`, predating this prompt).
  User action: `gh repo edit geekammar/flowpilot --visibility private`
  (or GitHub → Settings → Danger Zone → Change visibility). NOT changed
  by this prompt — repo settings are outside its authorized scope.
- The device-local doctor gate (placeholder `DATABASE_URL`) is
  untouched and still gates future `pnpm release` runs; it did not
  block this publication per PROMPT-05A rules.

### Next Step (product — unchanged)

PROMPT-06 — ADMIN Activation → Onboarding Integration. Do NOT implement
it in ops prompts.

---

## PROMPT-05B — Context Compression & Documentation Index

**Status:** ✅ Complete (documentation-only)

> Context-efficiency pass: restructure how agents LOAD documentation
> without deleting any project memory. No application code, schema,
> migrations, Better Auth behavior, UI, or product scope changed. No
> canonical source rewritten; no DECISIONS entry added (no new engineering
> decision — the reading policy is procedural and lives in
> `AGENT_RULES.md` / `DOCS_INDEX.md`).

### Audited

- Full `docs/` inventory: 35 existing files (now 37 with the two new
  ones), every file read or skimmed and classified by purpose and
  authority.
- Duplication audit: current-state summaries exist in 4 places
  (`BUILD_STATE.md` Current State Summary = canonical;
  `CURRENT_STATE.md` / `PROJECT_STATUS.md` / `PROJECT_README.md` =
  derived and already reconciled by PROMPT-05A); product identity ×3,
  architecture ×2, deployment/release status ×4. Derived summaries defer
  to canonical files — kept, not merged.
- Stale-reference audit (authority order: DECISIONS → BUILD_STATE →
  CURRENT_STATE/PROJECT_STATUS → other docs → historical reports):
  - `PRODUCT_GLOSSARY.md`: Invitation + Account Activation were marked
    "Planned — not yet implemented" — false since PROMPT-03/04/05
    (service layer). Corrected; Business Activation clarified (wizard
    implemented, formal lifecycle states still planned).
  - `PROJECT_README.md`: build status claimed "Prompts 01–03 complete …
    nothing else exists yet" — false since Prompt 04–08. Corrected to the
    current state; "How to continue" now points to the tiered model.
  - `CONTEXT_RECOVERY.md`: env setup said `cp .env.example .env` —
    corrected to `.env.local` (DECISIONS #16 convention).
  - Old prompt numbering elsewhere is self-consistent (the ledger
    explains the operator-series restart in the Prompt 10 section).

### Created

- `docs/CORE_CONTEXT.md` — compact DERIVED orientation summary (what
  FlowPilot is, strategy, spec, architecture, auth model, constraints,
  state, next step, non-negotiables, canonical-file map). Explicitly
  states it must never override canonical files.
- `docs/DOCS_INDEX.md` — tiered index of all 37 documentation files
  (File / Tier / Purpose / Read When / Authority) + the binding reading
  policy.

### Modified

- `docs/CONTEXT_RECOVERY.md` — recovery flow changed from "read all
  memory files" (10 files) to the tiered process: CORE_CONTEXT →
  BUILD_STATE → DECISIONS → AGENT_RULES → determine task → select
  Tier 1/2 via DOCS_INDEX → read those → implement Next Step.
  Preserves the rule that canonical files remain authoritative and
  CORE_CONTEXT is derived.
- `docs/AGENT_RULES.md` — minimal change: "Before Making Any Changes"
  and the Prompt Lifecycle now use the tiered model (always Tier 0;
  Tier 1/2 by task relevance; never treat CORE_CONTEXT as
  authoritative; never skip BUILD_STATE/DECISIONS; never delete
  documentation merely for context reduction). All engineering rules
  preserved verbatim.
- `docs/PRODUCT_GLOSSARY.md`, `docs/PROJECT_README.md` — stale-claim
  fixes above.
- This file (this section + Current State Summary bullet).

### Deliberately preserved

- All `DECISIONS.md` history (byte-identical — verified via git diff).
- All historical prompt sections in this ledger.
- All Tier 3 audits/reports (PROJECT_AUDIT, VERCEL_AUDIT,
  PILOT_DISTRIBUTION_AUDIT, DEPLOYMENT_REPORT, RELEASE_REPORT,
  PILOT_DISTRIBUTION_REPORT).
- All canonical sources (PROJECT_VISION, PRODUCT_STRATEGY,
  ARCHITECTURE, SPEC_A, ROADMAP, DATABASE, DESIGN_SYSTEM,
  PRODUCT_GLOSSARY content beyond the stale status notes).
- No document deleted or merged.

### Documentation tiers (new model)

- **Tier 0 — always read:** CORE_CONTEXT, BUILD_STATE, DECISIONS,
  AGENT_RULES (+ DOCS_INDEX for navigation).
- **Tier 1 — read when relevant:** vision, strategy, architecture,
  SPEC_A, roadmap, database, design system, glossary, UX plan,
  CONTEXT_RECOVERY procedure, status snapshots (CURRENT_STATE,
  PROJECT_STATUS, PROJECT_README).
- **Tier 2 — operational/specialized:** setup/dev/quality/troubleshooting/
  env-vars/release/GitHub/deploy×3/deployment-status/demo×3.
- **Tier 3 — historical/reference:** the six audits/reports (never
  required session context; never deleted).

### Token-efficiency rationale

Cold-start mandatory reading drops from 10 files (~190 KB) to 4 Tier-0
files (~152 KB including the new ~5 KB CORE_CONTEXT), and ~44 KB of
Tier 1 plus all Tier 2/3 docs become task-dependent loads selected via
DOCS_INDEX. Goal was fewer tokens per session, not fewer files —
canonical detail and history remain intact.

### Verification

- All 37 files referenced in DOCS_INDEX.md exist; every `docs/*.md`
  file is indexed (bijective check) ✅
- CORE_CONTEXT.md contains the derived/no-override disclaimer ✅
- CONTEXT_RECOVERY.md and AGENT_RULES.md agree on the tier model and
  cross-reference each other + DOCS_INDEX ✅
- `git diff` confirms DECISIONS.md untouched (and no application code,
  schema, migration, env, or generated files staged) ✅
- Prettier format on all changed docs ✅
- `pnpm verify` full gate: PASSED (lint 87.0s · typecheck 37.1s ·
  format 50.4s · build --webpack 394.7s) ✅ — no source modified; run
  per the AGENT_RULES quality gate (Prompt 09 precedent)

### Known Limitations / Unresolved Items

- None UNCERTAIN. One observation (not fixed — pre-existing, harmless):
  `FLOWPILOT_UX_IMPROVEMENTS_14.md`'s file-name suffix predates the
  operator prompt-series restart; its content is current.
- Remaining user action unchanged: make the GitHub repository private
  (see PROMPT-05A).

### Release

- One documentation commit: `docs(context): optimize agent documentation
loading`. No tag (documentation-maintenance pass; GITHUB_WORKFLOW
  requires tags for product releases only). `main` pushed to origin.

### Next Step (product — unchanged)

PROMPT-06 — ADMIN Activation → Onboarding Integration. Do NOT implement
it in documentation/ops prompts.

---

## PROMPT-06 — ADMIN Activation → Onboarding Integration

**Status:** ✅ Complete

> Activation UI + route-level composition + onboarding connection only.
> Reuses the existing invitation services (PROMPT-03/04/05) — no second
> activation implementation, no onboarding redesign, no new onboarding
> steps, no schema/Better Auth changes, no new dependencies.

### ALREADY IMPLEMENTED (reused, untouched in spirit)

- Invitation data model (Prompt 10) + creation foundation (PROMPT-03) +
  acceptance foundation (PROMPT-04) + ADMIN account activation
  foundation (PROMPT-05) — all service operations, token security
  utilities, and typed Arabic error conventions
- Existing onboarding wizard (`src/app/(onboarding)/**` + feature
  module) — NOT redesigned, NOT extended
- Better Auth integration (`src/lib/auth.ts`) — untouched
- Session guards (`src/server/auth/guards.ts`) — reused (`requireRole`)
- Sign-in redirect handling (`?redirect=` with safe-internal-path check
  in the login form) — reused for the handoff

### IMPLEMENTED IN THIS PROMPT

- **Public activation route** `src/app/(auth)/invite/[token]/page.tsx`
  (+ `loading.tsx` skeleton): Arabic-first, RTL, mobile-first, centered
  auth card, `noindex` (the token is a credential in the path). The
  page performs a READ-ONLY pre-screen via the new
  `getInvitationByToken` service operation (hash-only lookup, derived
  lifecycle status, inviting-business display name — NO mutation on
  GET) and renders: the activation form (PENDING or
  accepted-but-unactivated — the resume path), or a terminal notice
  (invalid/unknown token, expired, revoked, already-activated with
  sign-in CTA, STAFF-invitation not supported, transient failure).
- **Read-only invitation lookup** `getInvitationByToken` added to the
  EXISTING invitation service (reuses `acceptInvitationInputSchema`,
  `findByTokenHash`, `deriveInvitationStatus`, `businesses.findById`;
  injectable deps unchanged; result excludes token/hash; unknown or
  malformed tokens get one generic not-found error).
- **Route-level activation composition**
  `completeAdminActivation` (`src/features/invitations/server/
admin-activation-flow.ts`, injectable deps): validates with the
  EXISTING `activateAdminAccountInputSchema` → calls the EXISTING
  `acceptInvitation` (tolerating `INVITATION_ALREADY_ACCEPTED` as the
  resume path) → calls the EXISTING `activateAdminAccount` → maps
  typed service errors to safe Arabic UI states. Client input accepts
  ONLY `{token, name, password}`; Zod strips everything else and the
  persisted invitation stays the sole authority for
  businessId/email/role.
- **Server action** `activateInvitedAdminAction`
  (`src/features/invitations/actions/activation-actions.ts`): thin
  `"use server"` wrapper — no lifecycle logic at the route layer.
- **Activation UI components** (invitations feature):
  `activation-form.tsx` (client; hidden token field — the token never
  appears in the visible UI; name + password with visibility toggle;
  inline validation errors; submitting state; success panel; terminal
  notices post-submit) and `activation-notice.tsx` (server+client
  panel per state, design-system tokens, a11y roles/labels).
- **Success → onboarding handoff (DECISIONS #25)**: the activation
  service intentionally discards the auto-created session, so success
  renders a panel linking to `ACTIVATION_SIGNIN_HANDOFF` =
  `/sign-in?redirect=/onboarding`; the activated ADMIN signs in with
  the password they just chose and lands in the EXISTING onboarding
  wizard. No direct session handoff was invented (no session token in
  action payloads, no client-set cookies).
- **Public-path policy extraction** `src/lib/public-paths.ts`
  (`isPublicPath`): moved out of `src/proxy.ts`, which now imports it.
  `/invite/` is public (token-scoped route); `/onboarding` and all app
  routes remain protected (proxy cookie gate, tier 1).
- **Onboarding ADMIN guard**: the `(onboarding)` layout now uses the
  EXISTING `requireRole("ADMIN")` instead of `requireUser` — an
  authenticated STAFF user can no longer open the ADMIN onboarding
  wizard (redirects to `/access-denied`); unauthenticated access was
  and stays blocked by the two-tier model.

### NOT IMPLEMENTED (later prompts — unchanged)

- STAFF activation workflow / staff invitation UX (Team management)
- Token delivery (email/WhatsApp link) — the caller of creation still
  receives the raw token exactly once
- Founder/Platform UI (Spec B), invitation management UI for admins,
  public self-sign-up (not the pilot model)

The next step is:

PROMPT-07 — Customers Directory (Spec A §11). Do NOT implement it now.

### Generated Files

`src/lib/public-paths.ts`, `src/features/invitations/server/
admin-activation-flow.ts`, `src/features/invitations/actions/
activation-actions.ts`, `src/features/invitations/components/
{activation-form,activation-notice}.tsx`, `src/app/(auth)/invite/
[token]/{page,loading}.tsx`; updated `src/proxy.ts` (uses the shared
public-path helper), `src/app/(onboarding)/layout.tsx` (ADMIN guard),
`src/features/invitations/server/invitation-service.ts`
(`getInvitationByToken`), `src/features/invitations/types.ts`
(`GetInvitationByTokenSuccess`, `ACTIVATION_SIGNIN_HANDOFF`,
`ActivationNoticeState`, `ActivationActionResult`),
`src/features/invitations/README.md`; updated `docs/DECISIONS.md`
(#25), `docs/SPEC_A.md`, `docs/ARCHITECTURE.md`,
`docs/CURRENT_STATE.md`, `docs/PROJECT_STATUS.md`, this file.

### Verification

- Temporary tsx verification harness (removed after the run —
  PROMPT-03/04/05 pattern): **58/58 checks passed** offline with
  in-memory repository/identity stand-ins running the REAL service +
  composition code. Coverage of the required categories: valid path →
  SUCCESS with safe result shape + one identity + membership attached
  with the invitation's businessId/ADMIN/active; handoff target is the
  safe sign-in→onboarding redirect; unknown and wrong-but-well-formed
  tokens → INVALID_TOKEN with zero writes; expired → EXPIRED with zero
  writes; revoked → REVOKED with zero writes; already-activated →
  ALREADY_ACTIVATED with no second identity and no password-reset
  attempt; hostile payload carrying `businessId`/`role`/`email`/
  `acceptedAt`/`activatedAt` overrides still activates with the
  INVITATION's authority (identity email, membership business + ADMIN
  role; activate step received only token/name/password);
  `/onboarding` + all steps + app routes NOT public while
  `/invite/<token>`, `/sign-in`, `/api/health`, `/api/auth/*` are;
  STAFF invitation rejected with ROLE_NOT_ALLOWED and the
  `(onboarding)` layout is guarded by `requireRole("ADMIN")`
  (source-level); raw token and hash never appear in any flow/read
  result, stored records contain only the hash, and no new/changed
  module uses console/logging; duplicate prevention (sequential +
  concurrent re-submission → ALREADY_ACTIVATED, exactly one identity);
  page pre-screen states (PENDING/ACCEPTED/ACTIVATED/REVOKED/EXPIRED,
  unknown, malformed charset, persistence failure → honest FAILED,
  STAFF role exposure, soft-deleted business → null name) and the
  read's NO-mutation-on-GET property; edge cases (interrupted
  activation resume, cross-business conflict without moving the user,
  same-business STAFF not promoted, validation errors never reaching
  the services, identity-creation failure leaves no membership write,
  USER_ALREADY_EXISTS race resume, acceptance-of-ACTIVATED
  regression).
- `pnpm lint` ✅ · `pnpm typecheck` ✅ · `pnpm format:check` ✅
- `pnpm exec next build --webpack` ✅ (required locally on
  Android/Termux; `/invite/[token]` compiled as a dynamic route)
- `pnpm security` ✅
- NOT verified on-device (environment limits, honestly stated): the
  real-database behavior of the full page/action path (render with a
  live Neon DB, a real `auth.api.signUpEmail` call, and the proxy
  redirect against a running server) — this device has a placeholder
  `DATABASE_URL` and cannot run the Prisma schema engine; migrations
  `20260902120000` and `20260903120000` remain unapplied on-device
  (apply from desktop/CI: `pnpm db:deploy`). The in-memory harness
  verifies the full workflow logic around the repository primitives.

### Known Limitations

- The activated ADMIN must sign in manually after activation (safe
  handoff by design — DECISIONS #25); there is no auto-login.
- If a never-assigned Better Auth identity already exists for the
  invited email (interrupted activation or legacy account), the
  activation form's password field is effectively ignored — the
  service attaches the existing identity without resetting its
  password (PROMPT-05 semantics). The screen communicates the
  invited email; the edge case is rare and self-heals through the
  typed conflict/resume results.
- Token delivery remains manual: the operator must send
  `https://<app-url>/invite/<rawToken>` to the invitee (raw token is
  returned exactly once from `createInvitation`).
- No page-level `loading.tsx` for other `(auth)` routes (pre-existing;
  only the new invite route gained one).

### Release

- Commit `feat(auth): connect admin activation to onboarding`
  (implementation + docs; `package.json` version bumped to 0.5.0 per
  the documented convention that `/api/health` reports the version).
- Annotated tag `v0.5.0` — ADMIN Activation → Onboarding Integration —
  points at the PROMPT-06 commit. Published through the documented
  GitHub publication workflow (PROMPT-05A pattern: git state → origin
  identity → gh auth → local/remote commits → local/remote tags →
  existing releases → push → `gh release create --verify-tag`); the
  legacy `pnpm release` doctor gate still blocks on this device's
  placeholder `DATABASE_URL` (device-local, user action) and was not
  used, per the operator's prompt instruction.

---

## PROMPT-07 — Onboarding UX Completion

**Status:** ✅ Complete

> Operator prompt: COMPLETE and IMPROVE the existing Business Admin
> onboarding (no rebuild, no unrelated Spec A areas). Restructured the
> six-screen wizard (welcome + business + services + availability +
> knowledge + complete) into the 4-step operational-foundation wizard —
> services/knowledge management are explicitly deferred to later prompts
> per the operator's scope. Note: the earlier ledger "Next Step"
> (Customers Directory) was superseded by the operator choosing this
> onboarding prompt as PROMPT-07; the next product prompt is decided by
> the operator from this updated state.

### ALREADY PRESENT (reused, not rebuilt)

- ADMIN-only `(onboarding)` layout guard (`requireRole("ADMIN")`),
  two-tier auth model, wizard shell, StepHeader, React Hook Form + Zod
  per-step validation with Arabic messages
- Debounced autosave (`use-autosave`) + `SaveIndicator` —
  server-authoritative persistence through server actions
- Transactional Business creation + ADMIN assignment
  (`createForUser`), tenant ownership via the session user (businessId
  never client-controlled)
- Business working-hours JSON model (single open/close period per day),
  `slotDurationMinutes`, `faqs`, `cancellationPolicy`, `about`,
  `onboardingCompletedAt` fields (DECISIONS #13)
- Dashboard-root → onboarding redirect for incomplete accounts

### IMPROVED

- **Wizard restructure to 4 steps** (Step 1/4 بيانات المنشأة → Step 2/4
  ساعات العمل → Step 3/4 إعدادات الحجز الأساسية → Step 4/4 مراجعة
  وتشغيل): progress bar, step counter, and step nav rebuilt for 4 steps;
  completed steps are now clickable links (safe back-navigation);
  steps 2–4 gained explicit رجوع buttons
- **`/onboarding` is now a smart resume redirector**: first step whose
  data is missing/invalid (server-authoritative from the Business
  record), or straight to `/` when onboarding is already completed —
  completed accounts can no longer walk into the wizard uninvited
- **Step-order guards**: hours/booking/review pages redirect back to
  the first invalid step, so no step can be reached with prerequisite
  data missing (direct URL entry included)
- **Review step** now shows a real summary (business info, per-day
  hours, booking settings) with تعديل links per section and a clear
  تشغيل المنشأة completion action — previously a bare confirmation
  card with no summary
- **Completion guard** re-validates the 4-step core data
  server-side (business incl. vertical, working hours, slot duration +
  cancellation policy) — services/knowledge are no longer onboarding
  requirements (they belong to their later Spec A screens); invalid
  data can never complete silently
- `about` moved into step 1 as an OPTIONAL short description (was a
  required knowledge-step field)

### ADDED

- **`Business.vertical`** — the only schema change, genuinely required
  by the operator's STEP A + discovery-metadata requirement: nullable
  `TEXT` column + migration `20260903130000_business_vertical` (SQL
  authored on-device in Prisma's migration style — the schema engine
  cannot execute on Termux; apply from desktop/CI with `pnpm
db:deploy`). Values are stable machine keys validated by a Zod union
  (`VERTICAL_VALUES`/`VERTICAL_LABELS`/`verticalSchema` in
  `src/lib/validation/business.ts`: dental, beauty, coaching, gym,
  education, home_services, other) — no Prisma enum, so extending the
  list (Spec B Vertical Registry) needs no migration. Vertical is
  metadata for Local Vertical Discovery ONLY, never permission for
  vertical-specific UI
- **Step 3 (booking basics)**: slot-duration select + cancellation
  policy + `saveBookingBasics` action
- **`getOnboardingProgress`** (`src/features/onboarding/server/
onboarding-progress.ts`): single source of truth for step validity,
  resume target, and completion gating (used by the redirector, step
  guards, review page, and the completion action)
- **Seed**: demo business now carries `vertical: "dental"`

### NOT IMPLEMENTED (later prompts — per operator scope)

- Services management screen (the wizard no longer manages services;
  Service model/repository untouched and appointments keep working)
- Business knowledge management screen (FAQs remain a Business field,
  seeded and ready; no onboarding UI for them)
- Booking confirmation preferences (NOT in the domain model — the
  operator's "only if already supported" rule applies)
- Multiple working periods per day (the existing model supports a
  single open/close period; preserved as-is)

### Generated / Changed Files

Routes: `src/app/(onboarding)/onboarding/{page,business/page,hours/page,
booking/page,review/page}.tsx`; removed `services/`, `knowledge/`,
`availability/`, `complete/` routes. Feature:
`src/features/onboarding/{actions/onboarding-actions.ts, components/
{onboarding-shell,business-setup-form,working-hours-form,booking-basics-
form,review-card}.tsx, schemas/onboarding-schema.ts, server/
onboarding-progress.ts, types.ts}`; removed `services-form.tsx`,
`knowledge-form.tsx`, `availability-form.tsx`, `completion-card.tsx`.
Data: `prisma/schema.prisma` (+vertical),
`prisma/migrations/20260903130000_business_vertical/migration.sql`,
`prisma/{demo-data,seed}.ts`, `src/lib/validation/business.ts`. Docs:
`SPEC_A.md`, `DATABASE.md`, `CURRENT_STATE.md`, `PROJECT_STATUS.md`,
this file. `package.json` version → 0.6.0.

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05 /
  PROMPT-03..06 pattern): **59/59 checks passed** offline — step-schema
  validation (vertical required with Arabic message, about optional
  incl. null/empty, hours all-closed + close-before-open + missing-day
  - bad-format rejections, booking basics bounds + policy min/max),
    resume/guard resolution for every progress state (no business,
    missing vertical, missing hours, missing policy, all-valid, completed
    → dashboard, seed-like completed business not looped, legacy
    mid-onboarding business recovers at step 1), vertical-constant
    consistency (unique keys, labels exhaustive, "other" present,
    unknown values rejected), and the new route layout on disk
- `pnpm verify` full gate: PASSED ✅ (lint 46.2s · typecheck 43.3s ·
  format 34.4s · build --webpack 265.0s) — the four onboarding routes
  compiled as dynamic routes
- `pnpm security` ✅
- NOT verified on-device (environment limits, honestly stated): live-DB
  behavior of the wizard (this device has a placeholder `DATABASE_URL`
  and cannot run the Prisma schema engine). Migration
  `20260903130000_business_vertical` is authored but NOT applied
  on-device — apply from desktop/CI with `pnpm db:deploy` before using
  the wizard against a real database. The offline harness verifies the
  full progress/validation logic around the repository primitives.

### Known Limitations

- Businesses completing onboarding now land operational WITHOUT
  services (services arrive via their own Spec A screen, per the
  operator's flow: Onboarding → Operational → Services). Until that
  screen exists, a newly onboarded ADMIN cannot add services through
  the UI — appointments (which require a service) become creatable
  after the Services prompt lands.
- Old wizard URLs (`/onboarding/services|knowledge|availability|
complete`) now 404 — no external links reference them (verified by
  source sweep); the wizard is entered via `/onboarding` only.
- Migration + live wizard flow await desktop/CI application against
  Neon (same as the invitation migrations `20260902120000` and
  `20260903120000`).

### Release

- Commit `feat(onboarding): improve business onboarding experience`;
  `package.json` version bumped to 0.6.0 (MINOR — product feature; the
  `/api/health` endpoint reports the version).
- Annotated tag `v0.6.0` — Onboarding UX Completion — points at the
  PROMPT-07 commit. Published through the documented GitHub publication
  workflow (PROMPT-05A/06 pattern: git state → origin identity → gh
  auth → push main → verify tag target → push tag only →
  `gh release create --verify-tag` → verify release published). The
  legacy `pnpm release` doctor gate still blocks on this device's
  placeholder `DATABASE_URL` (device-local, user action) and was not
  used, per the operator's prompt instruction.

---

## PROMPT-08 — Services Management Foundation

**Status:** ✅ Complete

> Operator prompt: SERVICES MANAGEMENT FOUNDATION. List / create / edit /
> activate / deactivate services for the current Business — generic
> (vertical-agnostic), Arabic-first, RTL, mobile-first, ADMIN-only,
> tenant-scoped. Zero schema changes (the existing Service model,
> repository, and validation contract already covered everything).

### ALREADY IMPLEMENTED (reused, untouched)

- `Service` Prisma model (name, description?, durationMinutes, isActive,
  soft delete, businessId + tenant indexes) — no migration needed
- `ServiceRepository` (listByBusiness with includeInactive, create,
  update, setActive, findById with deletedAt filter)
- Shared service validation contract (`@/lib/validation/service.ts`:
  name 2–120, optional description ≤2000, duration 5–480 int, Arabic
  messages)
- Guards (`requireUser` / `requireRole`), AppShell, PageHeader,
  EmptyState, StatusBadge, page-skeleton, Dialog primitive
- Inactive-service exclusion from booking paths (appointment form
  options list active services only; `createAppointment` re-checks
  `isActive`) — pre-existing and verified, not rebuilt

### IMPLEMENTED IN THIS PROMPT

- **Service management workflow**
  (`src/features/services/server/service-service.ts`): list / create /
  update / activate / deactivate with the authorization rules inside —
  ADMIN-only (`resolveBusiness` guard on every operation), tenant
  scoping to the actor's Business, cross-Business service ids rejected
  as not-found, typed Arabic failures without internals. Repository
  collaborators injectable (invitations-feature pattern) so the logic
  is verifiable without a live database.
- **Server actions** (`service-actions.ts`): thin `"use server"`
  wrappers that build the actor from the authenticated session + DB
  user (Business ALWAYS derived server-side; no client-provided
  businessId can override it) and revalidate `/services` +
  `/appointments/new` after mutations.
- **`/services` screen** (`(app)/services/page.tsx` + `loading.tsx`):
  ADMIN-only page guard (`requireRole("ADMIN")` → STAFF redirected),
  session-derived Business, layout-matched loading skeleton with
  Arabic announcement.
- **Services list UI** (`services-screen.tsx`): mobile-first cards
  (name, active/inactive StatusBadge, duration in minutes,
  description when present), Arabic count via `SERVICE_NOUNS`, one
  primary action (إضافة خدمة), optimistic activate/deactivate with
  rollback, actionable EmptyState, inline `role="alert"` errors.
- **Create/edit dialog** (`service-form-dialog.tsx`): the same small
  form for both modes (اسم الخدمة، وصف الخدمة اختياري، مدة الخدمة) —
  prefilled for edit, remounted per open via key (no wizard), RHF +
  Zod with Arabic messages incl. an Arabic message for empty duration
  input, حفظ الخدمة / إلغاء actions.
- **Canonical status registry**: `active` (نشطة) / `inactive` (متوقفة)
  added to `src/lib/status.ts` (same additive-extension pattern as
  BOOKED/INCOMPLETE/COMPLETED) — rendered through the shared
  StatusBadge.
- **Navigation & discoverability**: `الخدمات` added to APP_NAV_ITEMS
  with a `roles: ["ADMIN"]` constraint; `(app)` layout filters nav
  items by session role (visibility only — server guards stay the
  authorization boundary); dashboard quick action "إدارة الخدمات"
  added (dashboard is ADMIN-only — STAFF redirects to `/staff`).

### NOT IMPLEMENTED (later prompts — per Spec A)

- Deletion UI (soft-delete exists in the repository; Spec A §4 needs
  only CRUD + toggle) and any pricing/packages/staff-assignment/
  vertical metadata (explicitly out of scope).

### Generated / Changed Files

`src/features/services/{types.ts,schemas/service-schema.ts,server/
service-service.ts,actions/service-actions.ts,components/
{services-screen,service-form-dialog}.tsx,README.md}`,
`src/app/(app)/services/{page,loading}.tsx`; updated
`src/lib/status.ts` (active/inactive), `src/lib/arabic.ts`
(SERVICE_NOUNS), `src/lib/app-config.ts` (roles-scoped nav item),
`src/components/shared/layout/nav-icons.tsx` (layers icon),
`src/app/(app)/layout.tsx` (role-based nav filtering),
`src/features/dashboard/components/quick-actions.tsx` (services link),
`package.json` (version → 0.7.0). No schema/migration changes.

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05 /
  PROMPT-03..07 pattern): **51/51 checks passed** offline with
  in-memory repository stand-ins running the REAL service workflow +
  schemas, plus source-level checks — schema rejections (NaN duration
  with Arabic message, duration <5/>480/non-integer, short/empty name,
  empty optional description valid, hostile extra keys stripped,
  non-UUID id); STAFF blocked from all four operations with zero
  writes; ADMIN without business rejected; own-business listing
  including inactive, excluding other businesses + soft-deleted;
  create with actor's businessId (client businessId never honored);
  edit updates values + clears description; deactivate/reactivate;
  cross-business edit/toggle rejected with zero writes; unknown +
  soft-deleted ids not-found; persistence failure typed without
  internals; booking-selection paths exclude inactive (appointment
  options, createAppointment isActive check, repository filter);
  page/action guards + revalidation; Arabic labels/empty/loading/
  error states; ADMIN-scoped nav; no physical left/right CSS in the
  new components.
- `pnpm verify` full gate: PASSED ✅ (lint 217.6s · typecheck 62.3s ·
  format 37.1s · build --webpack 238.0s) — `/services` compiled as a
  dynamic route
- `pnpm security` ✅
- NOT verified on-device (environment limits, honestly stated):
  live-database behavior (this device has a placeholder
  `DATABASE_URL`; the workflow runs against injectable repositories,
  and the real-DB path is the existing, already-used repository
  methods). No migration was created or needed, so there is nothing
  to apply from desktop/CI for this prompt.

### Known Limitations

- Deactivate/reactivate is a one-tap explicit action without a
  confirmation dialog — matching the existing appointments status-
  transition convention; it is fully reversible and optimistically
  rolled back on server rejection.
- Service name max-length (120) carries Zod's default (non-Arabic)
  message from the pre-existing shared contract — left untouched
  (changing shared validation was out of scope).
- The list caps at 100 services per page (shared pagination contract)
  — no pagination UI yet; pilot-scale acceptable.

### Release

- Commit `feat(services): add services management foundation`;
  `package.json` version bumped to 0.7.0 (MINOR — new user-facing
  product capability; `/api/health` reports the version).
- Annotated tag `v0.7.0` — Services Management Foundation — points at
  the PROMPT-08 commit. Published through the documented GitHub
  publication workflow (PROMPT-05A/06/07 pattern); the legacy
  `pnpm release` doctor gate still blocks on this device's placeholder
  `DATABASE_URL` (device-local, user action) and was not used, per the
  operator's prompt instruction.

---

## PROMPT-09 — Business Settings Foundation

**Status:** ✅ Complete

> Operator prompt: BUSINESS SETTINGS FOUNDATION. The first real Business
> Settings surface at `/settings` — two small sections (بيانات المنشأة /
> إعدادات الحجز) answering "كيف تعمل المنشأة؟". Arabic-first, RTL,
> mobile-first, ADMIN-only, tenant-scoped. One additive schema field
> (`Business.confirmationMode`) because booking confirmation mode had NO
> safe domain representation yet has an immediate operational consumer
> (initial status of new appointments). Default `manual` preserves the
> pre-existing behavior exactly.

### ALREADY IMPLEMENTED (reused, untouched in spirit)

- Business identity fields (name, vertical — discovery metadata,
  PROMPT-07, city, WhatsApp number, timezone) and booking fields
  (cancellationPolicy, slotDurationMinutes) — all pre-existing on the
  Business record
- `BusinessRepository` (`findById`, `update`) — used as-is
- Guards (`requireRole("ADMIN")`), services-feature workflow pattern
  (service layer with actor + tenant scoping, injectable repositories,
  thin `"use server"` action)
- AppShell role-scoped navigation (`roles: ["ADMIN"]`), design-system
  primitives (PageHeader, SectionHeader, Input/Select/Textarea/Label,
  RadioGroup — added via `shadcn add radio-group`, the established
  primitive pipeline)

### IMPLEMENTED IN THIS PROMPT

- **`Business.confirmationMode`** — the only schema change: NOT NULL
  TEXT default `'manual'` + migration
  `20260903140000_business_confirmation_mode` (SQL authored on-device
  in Prisma's migration style — the schema engine cannot execute on
  Termux; apply from desktop/CI with `pnpm db:deploy`). Stable machine
  keys `manual` / `automatic` validated by a Zod union
  (`CONFIRMATION_MODE_VALUES` in `src/lib/validation/business.ts`) —
  no Prisma enum, so extending needs no migration.
- **`/settings` screen** (`(app)/settings/{page,loading}.tsx` +
  `SettingsScreen`): ADMIN-only page guard (`requireRole("ADMIN")` →
  STAFF redirected to `/access-denied`; no business → `/onboarding`),
  session-derived Business, two clearly separated sections in ONE form
  with ONE primary save action (بيانات المنشأة: name/vertical/city/
  WhatsApp/timezone; إعدادات الحجز: confirmation mode + cancellation
  policy), prefilled current values, RHF + Zod inline Arabic validation,
  visible success (`role="status"`, تم حفظ الإعدادات) and failure
  (`role="alert"`) states, submitting spinner, layout-matched loading
  skeleton, radio-cards for the confirmation mode with plain-Arabic
  hints, logical CSS properties only.
- **Settings workflow** (`src/features/settings/server/
settings-service.ts`): `getBusinessSettings` / `updateBusinessSettings`
  with the authorization rules inside — ADMIN-only, target Business
  ALWAYS the actor's own (derived from the trusted session → user
  record; client input carries no businessId/role/account keys and Zod
  strips all unknown keys), typed Arabic failures without internals.
  Repository collaborators injectable (established pattern).
- **Thin server action** (`settings-actions.ts`): builds the actor from
  the authenticated session + DB user (least-privilege STAFF if the
  user record vanished), runs the update, revalidates `/settings`, `/`,
  `/appointments`.
- **Booking behavior wiring**: `createAppointment` now derives the
  initial appointment status server-side from the Business's
  confirmation mode — `automatic` → `CONFIRMED`, `manual`/default →
  `PENDING` (never client input). `CreateAppointmentDto` gained an
  optional `status` (Zod-enum) that the repository spreads into the
  create; callers other than the derivation pass nothing (legacy shape
  unchanged and verified).
- **Shared validation growth**: `CONFIRMATION_MODE_VALUES/LABELS/
CONFIRMATION_MODES`, `confirmationModeSchema`, and `TIMEZONES`
  promoted from the onboarding feature to `@/lib/validation/business`
  (two features need the same list — documented promotion rule);
  onboarding re-exports TIMEZONES for continuity (verified unchanged).
- **Navigation**: `الإعدادات` added to APP_NAV_ITEMS with
  `roles: ["ADMIN"]` + `SettingsIcon` — desktop sidebar and mobile
  bottom nav render it for ADMINs only; server guards remain the
  authorization boundary. Bottom-nav capacity: 4 items for ADMIN
  (الرئيسية/المواعيد/المحادثات/العملاء + الخدمات + الإعدادات render
  in the grid flow-col pattern — same as the existing 5-item state,
  verified ≤6 items at 360px by the existing auto-cols-fr layout).

### NOT IMPLEMENTED (documented follow-ups — not silently invented)

- **Default appointment duration**: the domain stores per-service
  durations (`Service.durationMinutes`) and slot granularity
  (`Business.slotDurationMinutes`) — neither is "default appointment
  duration"; per the operator's "only if the existing model supports it
  cleanly" rule this is documented, NOT built.
- Working-hours editing in settings (onboarding step 2 owns the wizard
  flow; a settings surface for hours is a follow-up slice).
- Business account activate/deactivate (Spec A §3 — separate action
  with its own guardrails).
- Business knowledge/FAQs screen (`/settings/knowledge`, Spec A §6).
- Automatic confirmation for WhatsApp/AI-created appointments (the AI
  booking agent is a later Spec A slice; today the setting affects the
  existing Create Appointment path).

### Generated / Changed Files

`prisma/migrations/20260903140000_business_confirmation_mode/
migration.sql`; `src/features/settings/{README.md,types.ts,schemas/
settings-schema.ts,server/settings-service.ts,actions/settings-actions.ts,
components/settings-screen.tsx}`; `src/app/(app)/settings/{page,loading}.tsx`;
`src/components/ui/radio-group.tsx` (shadcn-generated primitive); updated
`prisma/schema.prisma` (confirmationMode), `src/lib/validation/business.ts`
(confirmation-mode constants + TIMEZONES promotion), `src/lib/validation/
appointment.ts` (optional create status), `src/features/appointments/actions/
appointment-actions.ts` (server-derived initial status), `src/features/
onboarding/schemas/onboarding-schema.ts` (TIMEZONES re-export),
`src/lib/app-config.ts` + `src/components/shared/layout/nav-icons.tsx`
(ADMIN-scoped nav), `package.json` (version → 0.8.0).

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05 /
  PROMPT-03..08 pattern): **63/63 checks passed** offline with in-memory
  repository stand-ins running the REAL service + schemas, plus
  source-level checks — the 10 required categories: (1) ADMIN read
  returns own-business view; (2) ADMIN update persists name/mode/policy
  through the repository path; (3) STAFF read+write denied with the
  Arabic FORBIDDEN message and ZERO repository writes; (4) cross-business
  read fails gracefully, hostile payload with another tenant's
  businessId/role/isActive still writes ONLY the actor's business and
  the override keys never reach the update, other business untouched;
  (5) client businessId never redirects the write target; (6) invalid
  business data rejected (short name, unknown vertical, short city, bad
  phone, unknown timezone) with Arabic messages; (7) invalid booking
  settings rejected (unknown confirmation mode, empty/short policy,
  missing mode) with Arabic messages, `automatic` accepted; (8) exact
  field set persisted + read-back reflects it; (9) Arabic error states
  incl. no-business and empty-input, constants sanity
  (manual/automatic, TIMEZONES, VERTICALS unchanged); (10) no
  regressions — onboarding businessSetupSchema still valid, TIMEZONES
  re-export works, appointment create DTO accepts the legacy no-status
  shape AND the derived-status shape, invalid statuses rejected.
  Plus: persistence-failure typed without internals; source checks —
  page guarded by `requireRole("ADMIN")`, action is a thin use-server
  wrapper, feature schema exposes no businessId key, one submit button,
  success `role="status"` / failure `role="alert"`, no physical
  left/right CSS, appointment status derived from
  `business.confirmationMode`.
- `pnpm db:generate` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ ·
  `pnpm format:check` ✅
- `pnpm verify` full gate: PASSED ✅ (lint 46.1s · typecheck 22.7s ·
  format 40.3s · build --webpack 288.2s) — `/settings` compiled as a
  dynamic route
- `pnpm security` ✅
- NOT verified on-device (environment limits, honestly stated):
  live-database behavior (placeholder `DATABASE_URL`; the workflow runs
  against injectable repositories; the real-DB path is the existing
  `BusinessRepository.update` already used by onboarding). Migration
  `20260903140000_business_confirmation_mode` is authored but NOT
  applied on-device — apply from desktop/CI: `pnpm db:deploy`.

### Known Limitations

- The confirmation-mode setting affects the existing Create Appointment
  path today; the AI/WhatsApp booking agent (a later Spec A slice) will
  consume the same setting when it lands.
- Settings edits are explicit-save (no autosave) — deliberate: settings
  are low-frequency, high-consequence; the wizard keeps its autosave.
- The timezone list remains the 3-value curated list (Cairo/Riyadh/
  Dubai) shared with onboarding; extending it is a shared-validation
  change only.

### Release

- Commit `feat(settings): add business settings foundation`;
  `package.json` version bumped to 0.8.0 (MINOR — new user-facing
  product capability; `/api/health` reports the version).
- Annotated tag `v0.8.0` — Business Settings Foundation — points at
  the PROMPT-09 commit. Published through the documented GitHub
  publication workflow (PROMPT-05A..08 pattern); the legacy
  `pnpm release` doctor gate still blocks on this device's placeholder
  `DATABASE_URL` (device-local, user action) and was not used, per the
  operator's prompt instruction.

---

## PROMPT-10 — Smart Availability Foundation

**Status:** ✅ Complete

> Operator prompt: SMART AVAILABILITY FOUNDATION. Deterministic,
> business-scoped, service-duration-aware, working-hours-aware,
> timezone-aware, conflict-aware availability domain/service layer that
> can answer: "For this Business, on this date, for this active Service,
> which start times are actually bookable?" Reusable by manual booking
> and the future AI/WhatsApp booking agent. No UI, no AI, no WhatsApp
> transport, no schema changes, no new dependencies.

### PLAN

1. Reuse the existing canonical slot-granularity policy
   (`Business.slotDurationMinutes`, onboarding step 3) — no new setting,
   field, or configurable scheduling system.
2. Add ONE repository read primitive (`listBlockingForDate`) mirroring
   the existing conflict rules exactly.
3. Build the availability calculation in the appointments feature
   (service layer + typed result contract + Zod input), with the actor's
   Business derived server-side only.
4. Expose one thin `"use server"` action as the future-consumer hook
   (PROMPT-11 Smart Create Appointment Foundation).
5. Verify via a temporary offline harness (in-memory repository
   stand-ins running the REAL service code), then the full quality
   gates; update docs; commit/tag/publish.

### TODO Completion

- [x] Read Tier 0 + task-relevant docs (vision, strategy, architecture,
      SPEC_A, roadmap, decisions, build state, design system, glossary,
      UX plan, database, current state, project status, GitHub workflow,
      release process, feature READMEs)
- [x] Inspect business/service/appointment models + repositories,
      working-hours validation, timezone handling, conflict logic,
      create/reschedule logic, status rules, shared utilities
- [x] Confirm a canonical slot interval already exists
      (`Business.slotDurationMinutes`) → REUSED, nothing invented
- [x] `AppointmentRepository.listBlockingForDate` repository primitive
- [x] Availability input schema (`{date, serviceId}` only)
- [x] Availability types + typed result contract (slots / explicit
      no-slots reasons / typed error codes)
- [x] `getAvailability` deterministic calculation service
- [x] `getAvailabilityAction` thin server action (future hook)
- [x] Temporary verification harness (36/36 checks) — created, run,
      removed
- [x] Quality gates: db:generate / lint / typecheck / format:check /
      verify / security
- [x] Docs: BUILD_STATE / CURRENT_STATE / PROJECT_STATUS / DATABASE /
      appointments README
- [x] Release: commit + annotated tag v0.9.0 + push + GitHub Release

### ALREADY PRESENT / REUSED (untouched in spirit)

- `Business.workingHours` JSON week (single open/close interval per
  weekday) — the EXISTING working-hours representation, validated by the
  shared `workingHoursSchema`; not redesigned
- `Business.slotDurationMinutes` — the canonical slot-granularity
  policy (onboarding step 3 "إعدادات الحجز الأساسية"); reused as the
  candidate-step, NO new business setting or scheduling system
- `Business.timezone` — the stored domain timezone; reused (no new
  timezone setting)
- `Service.durationMinutes` / `Service.isActive` / soft-delete — the
  ONLY service duration + activity source (no second duration field)
- Appointment conflict lifecycle: blocking = not soft-deleted +
  `PENDING`/`CONFIRMED` (identical to `hasConflict` /
  `createWithConflictCheck` / `rescheduleWithConflictCheck`)
- Feature conventions: actor + injectable repository deps + typed
  results with Arabic messages (invitations/services pattern);
  repositories remain the ONLY Prisma consumers (no feature-level
  Prisma access)
- `todayInTimezone` wall-clock semantics (appointments store
  business-local "HH:mm" times) — availability speaks the same format

### IMPLEMENTED IN THIS PROMPT

- **`AppointmentRepository.listBlockingForDate(businessId, date)`** —
  the single new repository primitive: tenant-scoped, `deletedAt: null`,
  status `PENDING`/`CONFIRMED`, same-date, ordered by startTime,
  returns plain `{startTime, endTime}` "HH:mm" pairs (epoch `@db.Time`
  → wall-clock conversion, the agenda-serializer convention). No new
  write paths, no schema change.
- **Availability input schema**
  (`schemas/availability-schema.ts`): `{date, serviceId}` ONLY — the
  shared `appointmentDateSchema` + `uuidSchema`; Zod strips everything
  else, so a hostile `businessId`/`role` override never reaches the
  workflow. The Business is ALWAYS the actor's own, derived
  server-side.
- **Availability result contract** (`types.ts`): one small typed shape
  — success carries `{date, timezone, serviceId,
serviceDurationMinutes, slots: [{startTime, endTime}]}` plus an
  explicit `reason` (`BUSINESS_CLOSED` | `SERVICE_TOO_LONG` |
  `FULLY_BOOKED`) present ONLY when slots are empty; errors are typed
  codes (`INVALID_INPUT` | `NO_BUSINESS` | `SERVICE_NOT_FOUND` |
  `SERVICE_INACTIVE`) with Arabic messages. No internal database
  details in the shape.
- **`getAvailability(deps, actor, input)`**
  (`server/availability-service.ts`): the deterministic calculation —
  resolve the actor's Business → resolve the service (cross-Business →
  `SERVICE_NOT_FOUND`, inactive → `SERVICE_INACTIVE`, soft-deleted →
  not found through the repository's `deletedAt` filter) → derive the
  weekday from the calendar date itself (timezone-independent) →
  resolve the working interval (closed/missing/invalid entry →
  `BUSINESS_CLOSED`) → generate candidates stepping by
  `slotDurationMinutes` where the FULL service duration fits before
  close (a 45-min service never starts 17:30 in a 10:00–18:00 day) →
  filter overlaps against blocking appointments → typed result. Pure
  helpers (`generateCandidateSlots`, `filterConflictingSlots`) are
  exported for direct verification. No `Date.now()` in the calculation
  path — deterministic repeated calls. Repository collaborators are
  injectable (established pattern).
- **`getAvailabilityAction`** (`actions/availability-actions.ts`): the
  smallest integration hook — a thin `"use server"` wrapper that builds
  the actor from the authenticated session + DB user (Business always
  derived server-side; least-privilege fallback when the user record is
  gone) and returns the typed result. This is the entry point the
  future PROMPT-11 Smart Create flow consumes. NO UI was added.

### NOT IMPLEMENTED (later prompts — per scope)

- Smart Create Appointment UI / wizard / agenda redesign (PROMPT-11
  consumes this service through `getAvailabilityAction`)
- Availability-aware rescheduling UX, AI slot recommendation,
  WhatsApp transport, reminders — all later Spec A slices
- No changes to existing appointment screens (they remain functional
  and untouched)

### Generated / Changed Files

`src/features/appointments/schemas/availability-schema.ts`,
`src/features/appointments/server/availability-service.ts`,
`src/features/appointments/actions/availability-actions.ts`,
`src/features/appointments/types.ts` (availability contract added),
`src/server/repositories/appointment.repository.ts`
(`listBlockingForDate` + wall-clock helper),
`src/features/appointments/README.md` (availability semantics);
updated docs (`BUILD_STATE.md`, `CURRENT_STATE.md`,
`PROJECT_STATUS.md`, `DATABASE.md`); `package.json` version → 0.9.0.
No schema/migration changes.

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05 /
  PROMPT-03..09 pattern): **36/36 checks passed** offline with
  in-memory repository stand-ins running the REAL service + schemas —
  all 20 required categories: (1) open day → slots returned (10:00–17:00
  starts, 45-min service, 30-min step, correct end times); (2) closed
  day → zero slots with `BUSINESS_CLOSED`; (3) inactive service →
  `SERVICE_INACTIVE`; (4) soft-deleted service → `SERVICE_NOT_FOUND`;
  (5) exact-fit-until-closing slot valid (10:00→18:00 for a 480-min
  service); (6) service longer than the day → `SERVICE_TOO_LONG` +
  the prompt's 17:30-for-45-min example never generated; (7) blocking
  appointment removes overlapping slots; (8) appointment ending at
  12:00 does not block a 12:00 start (no false conflict); (9)
  appointment starting at 12:00 does not block an 11:00→11:45 slot;
  (10) candidate straddling an appointment start → rejected; (11)
  candidate containing a whole appointment → rejected; (12) multiple
  appointments → correct gap windows; (13) business timezone respected
  (result carries the stored timezone; Friday late hours apply; a
  different stored timezone yields the same wall-clock slots); (14)
  requested date respected (other-date appointments never block; date
  echoed verbatim); (15) cross-business appointments never block; (16)
  hostile `businessId`/`role`/`isActive` payload keys ignored — the
  actor's Business is the authority, and another Business's service →
  `SERVICE_NOT_FOUND`; (17) every read flows through the injected
  repository deps (counting wrapper proves business:1 / service:1 /
  blocking:1 calls); (18) result shape exposes no database internals
  (no businessId/customerId/deletedAt/token/Prisma keys; slots match
  `^HH:mm$`); (19) zero slots always carries an explicit reason
  (`FULLY_BOOKED` when the day is fully blocked); (20) deterministic
  repeated calls (deep-equal results; STAFF actor identical slots).
  Plus edge cases: invalid date formats (non-ISO, impossible calendar
  date) / non-UUID serviceId / non-object input → `INVALID_INPUT`
  before any repository access; actor without business →
  `NO_BUSINESS`; unknown UUID → `SERVICE_NOT_FOUND`; missing
  `workingHours` → closed (never 24h); CANCELLED/NO_SHOW/COMPLETED
  never block; soft-deleted blocking appointment never blocks; slot
  step follows `slotDurationMinutes` (15-min step → 15-min spacing,
  17:30 exact fit valid); weekday mapping verified for all 7 weekdays;
  close≤open entry → closed; pure slot generation matches the prompt's
  example exactly; STAFF actor of the same business reads
  availability; extra payload keys stripped without effect.
- `pnpm db:generate` ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅ ·
  `pnpm format:check` ✅
- `pnpm verify` full gate: PASSED ✅ (lint 48.9s · typecheck 25.1s ·
  format 33.8s · build --webpack 238.0s on the re-run after Prettier
  formatting)
- `pnpm security` ✅ (clean)
- NOT verified on-device (environment limits, honestly stated):
  real-database behavior of `listBlockingForDate` (this device has a
  placeholder `DATABASE_URL` and cannot run the Prisma schema engine).
  The real-DB path is the same repository conventions already used by
  every existing appointment read; the workflow logic was verified
  offline with the REAL service code against in-memory stand-ins.

### Known Limitations

- Availability is a READ layer only — it does not reserve slots; two
  concurrent bookings for the same slot still rely on the existing
  transactional conflict check at write time
  (`createWithConflictCheck`), unchanged pilot-scale caveat.
- Unassigned appointments block the whole business day (matching the
  existing `createWithConflictCheck` semantics when no
  `assignedUserId` is set — consistency with the write path was chosen
  over per-staff scoping; staff-assignment-aware availability is a
  later product decision).
- Blocking reads cap at 200 rows/day (pilot volume far below); beyond
  that, availability degrades gracefully by ignoring overflow rows.
- No buffer/lead-time/rounding policies (no product decision exists
  for them — none invented).
- No UI consumes the service yet — by scope; PROMPT-11 (Smart Create
  Appointment Foundation) is the designated consumer via
  `getAvailabilityAction`.

### Database / Migration State

- **NO schema change.** The existing Business (workingHours, timezone,
  slotDurationMinutes), Service (durationMinutes, isActive, deletedAt),
  and Appointment (businessId, date, startTime, endTime, status,
  deletedAt) models fully support availability.
- One repository read primitive added (`listBlockingForDate`) — data
  behavior only, documented in `DATABASE.md`; nothing to migrate.
  Existing unapplied-on-device migrations
  (`20260902120000`, `20260903120000`, `20260903130000`,
  `20260903140000`) remain a desktop/CI `pnpm db:deploy` action,
  unchanged by this prompt.

### Release

- Commit `feat(appointments): add deterministic availability
foundation`; `package.json` version bumped to 0.9.0 (MINOR — new
  product capability; `/api/health` reports the version).
- Annotated tag `v0.9.0` — Smart Availability Foundation — points at
  the PROMPT-10 commit. Published through the documented GitHub
  publication workflow (PROMPT-05A..09 pattern: git state → origin
  identity → gh auth → push main → verify tag target → push tag only →
  `gh release create --verify-tag` → verify release published). The
  legacy `pnpm release` doctor gate still blocks on this device's
  placeholder `DATABASE_URL` (device-local, user action) and was not
  used, per the operator's prompt instruction.
- **Next step (product):** PROMPT-11 — Smart Create Appointment
  Foundation (consumes this availability layer through
  `getAvailabilityAction`). Do NOT implement it in this prompt.

---

## PROMPT-11 — Smart Create Appointment Foundation (Steps 1–3)

**Status:** ✅ Complete

> Operator prompt: SMART CREATE APPOINTMENT — BOOKING FLOW FOUNDATION
> (STEPS 1–3). Replaces the single-form Create Appointment experience
> with the first three steps of the intended 6-step flow (العميل →
> الخدمة → التاريخ → الوقت → المراجعة → التأكيد), entered from the
> existing "Create Appointment" actions. Steps 4–6 are OUT OF SCOPE and
> remain locked in the UI. Zero schema changes; the PROMPT-10
> availability layer is untouched and still unconsumed by UI.

### PLAN

1. Keep the route `/appointments/new` (every existing entry point —
   dashboard quick action, agenda header + empty state, GettingStarted
   card, `?create=true` redirect — keeps working unchanged).
2. One actor-based booking-flow read service (tenant-scoped customer
   search reusing the EXISTING `CustomerRepository.listByBusiness`
   search primitive; active-services list reusing the existing service
   repository filter) + one thin `"use server"` search action
   (availability-actions pattern).
3. A client wizard holding ONLY `{customerId, serviceId, date}` + the
   current screen — no global store, no URL step state; TanStack Query
   (already wired app-wide) for the debounced customer search.
4. A 6-step progress indicator with only steps 1–3 active; completed
   steps clickable for safe back-navigation (onboarding convention).
5. An INTERIM details screen (time + note + create) reusing the existing
   `createAppointment` action so the appointment-creation capability is
   PRESERVED (it must not regress while steps 4–6 do not exist yet);
   PROMPT-12 replaces it with available-slot selection.
6. Verify via a temporary offline harness (in-memory repository
   stand-ins running the REAL service + schemas + source-level checks),
   then the full quality gates; update docs; commit/tag/publish.

### TODO Completion

- [x] Read Tier 0 + task-relevant docs (vision, strategy, architecture,
      SPEC_A, roadmap, decisions, build state, design system, UX plan,
      database, current state, project status)
- [x] Inspect the current create-appointment implementation + the
      PROMPT-10 availability layer (reused, NOT rebuilt)
- [x] Booking-flow types + 6-step constants (`BOOKING_FLOW_STEPS`,
      `BOOKING_FLOW_ACTIVE_STEPS = 3`)
- [x] Booking-flow schemas (customer search `{query}` only; interim
      details form startTime + notes)
- [x] `booking-flow-service.ts` — `searchBookingCustomers` +
      `listBookingServices` (actor + injectable deps, typed Arabic
      results)
- [x] `searchBookingCustomersAction` thin server action
- [x] `use-debounced-value` feature-local hook (onboarding hooks
      pattern)
- [x] Smart-create components: progress indicator, customer step, date
      helpers, service step, date step, interim details step, wizard
      container
- [x] Page rewrite + layout-matched loading skeleton; old
      `create-appointment-form.tsx` + `getAppointmentFormOptions`
      removed (superseded, not reused elsewhere)
- [x] Temporary verification harness (60/60 checks) — created, run,
      removed
- [x] Quality gates: db:generate / verify (lint + typecheck + format +
      build --webpack) / security
- [x] Docs: appointments README / BUILD_STATE / CURRENT_STATE /
      PROJECT_STATUS; version → 0.10.0
- [x] Release: commit + annotated tag v0.10.0 + push + GitHub Release

### ALREADY PRESENT / REUSED (untouched in spirit)

- `CustomerRepository.listByBusiness(businessId, { search })` — the
  existing name-OR-phone contains search (same primitive the
  conversations inbox uses); NO new repository read was needed
- `ServiceRepository.listByBusiness` active-only filter — the same
  rule every booking path enforces (inactive services not selectable)
- `createAppointment` server action (conflict check, tenant checks,
  server-derived initial status from `Business.confirmationMode`) —
  reused VERBATIM by the interim details screen
- Shared `appointmentDateSchema` (format + calendar validity) — reused
  for the date step + the `?date=` param
- `todayInTimezone` business-timezone semantics — reused for today +
  the native date input's `min`
- Guards (`requireUser`), PageHeader, EmptyState, SearchInput,
  StatusBadge-style card patterns, radio-cards (settings pattern),
  onboarding-shell progress-indicator conventions, page-skeleton
- TanStack Query provider (app-wide since Prompt 01) — the customer
  search is its first consumer (debounced query key, cached, retry 1)
- PROMPT-10 availability layer — untouched; NOT consumed by steps 1–3
  (by scope; step 4 in the next prompt consumes it)

### IMPLEMENTED IN THIS PROMPT

- **Booking-flow read service** (`server/booking-flow-service.ts`):
  `searchBookingCustomers(deps, actor, {query})` — Zod-stripped input
  (hostile `businessId`/`role` keys never pass), actor's Business only,
  empty query → most recent customers (page size 20), repository
  failures typed Arabic without internals; `listBookingServices(deps,
actor)` — active services only. ADMIN and STAFF both allowed
  (booking is a business operation, same as availability/create).
  Repository collaborators injectable (established pattern).
- **Search action** (`actions/booking-flow-actions.ts`): thin
  `"use server"` wrapper building the actor from the authenticated
  session + DB user (least-privilege fallback when the user record is
  gone) — the established availability-actions pattern.
- **Smart Create wizard** (`components/smart-create/`):
  - `booking-flow-progress.tsx` — 6-step indicator (العميل، الخدمة،
    التاريخ، الوقت، المراجعة، التأكيد); only 1–3 active, 4–6 locked
    (muted + lock icon + `aria-disabled`); completed steps show a check
    and are clickable for back-navigation (`aria-current="step"` on the
    current step).
  - `customer-step.tsx` — Step 1: debounced search by name or phone
    (SearchInput + `useDebouncedValue` + `useQuery` with
    keepPreviousData, server-preloaded initial page), skeleton loading
    state, actionable empty states (no customers at all → link to
    conversations; no matches → guidance), obvious selected-customer
    state (check + card) with an easy تغيير, Arabic result count via
    new `SEARCH_RESULT_NOUNS`.
  - `service-step.tsx` — Step 2: radio-cards (settings-screen pattern)
    of active services only, name + duration in minutes, selected state
    obvious + changeable; actionable empty state (ADMIN → إدارة
    الخدمات link, STAFF → guidance text).
  - `date-step.tsx` — Step 3: quick-pick strip of the next 14 days
    from business-timezone today (اليوم/غداً + weekday chips, month
    shown on change, horizontally scrollable, 360px safe) + a native
    date input (min = business today) for any other date; validation
    through the shared `appointmentDateSchema`; selected date echoed
    long-form; NO availability calculation.
  - `booking-details-step.tsx` — INTERIM completion screen (NOT one of
    the 6 steps): selections summary (customer/service/date), startTime
    - notes RHF form (Zod, Arabic messages, end-time hint), reusing the
      existing `createAppointment` action; success redirects to the
      appointment detail (existing behavior).
  - `smart-create-appointment.tsx` — wizard container: the ONLY state
    holder (`customerId`, `serviceId`, `date`, screen); back/forward
    never resets selections; per-step continue gating (disabled until
    customer / service / valid date); one primary action per step;
    selections summary above steps 2–3; sr-only step-change
    announcements.
- **Page** (`/appointments/new`): session-guarded, Business derived
  server-side (redirect to onboarding when missing), `?date=` param
  validated with the shared schema, initial customers + services read
  through the booking-flow service, `today` business-local,
  `canManageServices` derived from the session role.
- **Removed (superseded):** `create-appointment-form.tsx` (the
  simplistic single form) and `getAppointmentFormOptions` (its query);
  `AppointmentOption`/`ServiceOption` types replaced by the
  `Booking*Option` types.

### NOT IMPLEMENTED (later prompts — per scope)

- **Steps 4–6**: available-slot selection (consumes
  `getAvailabilityAction`), review, and confirmation — the next prompt
  implements slot selection and REPLACES the interim details screen
- Customers directory / customer creation (Spec A §11 — customers are
  auto-created from WhatsApp; the flow honestly routes to conversations
  when no customers exist)
- Availability-aware rescheduling, AI, WhatsApp transport, reminders
- No changes to the existing agenda/detail screens (functional and
  untouched)

### Generated / Changed Files

`src/features/appointments/{types.ts (booking types + step constants),
schemas/booking-flow-schema.ts, server/booking-flow-service.ts,
actions/booking-flow-actions.ts, hooks/use-debounced-value.ts,
components/smart-create/{smart-create-appointment,booking-flow-progress,
customer-step,service-step,date-step,booking-details-step,date-format}
}`; rewrote `src/app/(app)/appointments/new/{page,loading}.tsx`; removed
`src/features/appointments/components/create-appointment-form.tsx`;
trimmed `src/features/appointments/server/appointment-queries.ts`
(form-options read removed); `src/lib/arabic.ts` (+`SEARCH_RESULT_NOUNS`);
`src/features/appointments/README.md`; `package.json` (version → 0.10.0).
No schema/migration changes.

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05 /
  PROMPT-03..10 pattern): **60/60 checks passed** offline with in-memory
  repository stand-ins running the REAL service + schemas, plus
  source-level checks — customer search by Arabic name partial, phone
  substring, case-insensitive Latin name; empty query → recent list
  (page cap 20, newest first, no search filter passed); whitespace-only
  query trimmed; hostile `{query, businessId, role}` payload stripped
  (repository still called with the ACTOR's businessId; foreign-business
  customers never leak); non-object / non-string / 101-char query →
  typed Arabic rejection with ZERO repository calls; actor without
  business → "أكمل إعداد المنشأة أولاً" with zero calls; STAFF actor
  allowed; result items expose exactly {id, name, phone}; exactly one
  repository call per search; repository throw → typed Arabic message
  without internals; services list active-only (inactive + deleted +
  foreign excluded) with {id, name, durationMinutes} shape; details
  form rejects 25:00/9:00/2001-char notes and accepts 09:00; shared
  date schema rejects 2026-02-30/2026-13-01/malformed; search schema
  strips hostile keys; `BOOKING_FLOW_STEPS` exactly 6 labels in order
  and `BOOKING_FLOW_ACTIVE_STEPS === 3`; source checks — old form +
  form-options removed, no `@/server/db` in new files (repositories
  stay the only Prisma consumers), no console logging, no physical
  left/right CSS, action is a thin use-server wrapper (session + DB
  user), page session-guarded with server-derived Business + validated
  date param, progress indicator renders the 6 steps with current/locked
  semantics, container owns state with per-step continue gating and NO
  selection resets on navigation, customer step wired to the action with
  empty/selected/change states, service step radio-cards, date step
  validates via the shared schema with min=today, NO step component
  references the availability layer, details step reuses
  `createAppointment` with exactly the flow payload.
- `pnpm db:generate` ✅
- `pnpm verify` full gate: PASSED ✅ (lint 42.2s · typecheck 22.1s ·
  format 35.2s · build --webpack 443.2s) — `/appointments/new` compiled
  as a dynamic route
- `pnpm security` ✅ (clean)
- NOT verified on-device (environment limits, honestly stated):
  live-database behavior of the search path and the created wizard
  against a running server (this device has a placeholder
  `DATABASE_URL` and cannot run the Prisma schema engine). The real-DB
  path is the existing `CustomerRepository.listByBusiness` /
  `ServiceRepository.listByBusiness` conventions already used by every
  screen; the workflow logic was verified offline with the REAL service
  code against in-memory stand-ins.

### Known Limitations

- Steps 4–6 are locked placeholders in the indicator — the flow
  currently completes through the interim details screen (manual start
  time + note), NOT slot selection. This is the deliberate bridge that
  preserves the appointment-creation capability until the next prompt.
- The date step's native input enforces `min = business today` as a UX
  guard; the domain (createAppointment action) still accepts past dates
  exactly as before — no server-side domain rule was invented or
  changed.
- Customer search matches stored phone strings by substring (the
  existing repository primitive; seeded phones are stored without
  separators). A query with different separators than stored will not
  match — same semantics as the conversations inbox.
- Search results cap at 20 per page (pilot scale); no pagination UI in
  the step.
- When the actor has zero customers, the flow cannot proceed past Step
  1 (appointments require an existing customer — unchanged from the
  previous form; customer creation belongs to the Customers Directory
  prompt).

### Database / Migration State

- **NO schema change.** Customer, Service, and Appointment models
  fully support the flow. Existing unapplied-on-device migrations
  (`20260902120000`, `20260903120000`, `20260903130000`,
  `20260903140000`) remain a desktop/CI `pnpm db:deploy` action,
  unchanged by this prompt.

### Release

- Commit `feat(appointments): add smart create appointment flow
foundation`; `package.json` version bumped to 0.10.0 (MINOR — new
  user-facing product capability; `/api/health` reports the version).
- Annotated tag `v0.10.0` — Smart Create Appointment Foundation —
  points at the PROMPT-11 commit. Published through the documented
  GitHub publication workflow (PROMPT-05A..10 pattern: git state →
  origin identity → gh auth → push main → verify tag target → push tag
  only → `gh release create --verify-tag` → verify release published).
  The legacy `pnpm release` doctor gate still blocks on this device's
  placeholder `DATABASE_URL` (device-local, user action) and was not
  used, per the operator's prompt instruction.
- **Next step (product):** PROMPT-12 — Smart Create Appointment:
  Available-Slot Selection (Step 4) — consumes the PROMPT-10
  availability layer through `getAvailabilityAction` and REPLACES the
  interim details screen. Do NOT implement it in this prompt.

---

## PROMPT-12 — Smart Create Appointment: Available-Slot Selection (Step 4)

**Status:** ✅ Complete

> Operator prompt: SMART CREATE APPOINTMENT — AVAILABLE SLOT SELECTION
> (STEP 4 ONLY). Replaces the interim manual time-entry details screen
> with real available-slot selection consuming the EXISTING PROMPT-10
> availability layer. The flow is now العميل → الخدمة → التاريخ → الوقت
> with المراجعة/التأكيد locked. Step 4 is SELECTION ONLY — no
> appointment is created from it (review/confirmation are later prompts).
> Zero schema changes; the availability algorithm untouched.

### PLAN

1. Reuse `getAvailabilityAction` verbatim — no second availability
   engine, no scheduling-logic changes (none were needed).
2. Extend the flow constants/types: `BOOKING_FLOW_ACTIVE_STEPS = 4`,
   screen `"slot"` replaces the interim `"details"`, add the typed
   `SelectedSlot` ({startTime, endTime} "HH:mm" — the appointment
   domain's own wall-clock conventions) for PROMPT-13 to consume.
3. Pure presentation helpers (`slot-helpers.ts`): Arabic time
   formatting, morning/afternoon/evening grouping, stale-selection
   membership check, timezone label — display-only; every displayed
   slot comes from the server result.
4. Step 4 component (`slot-step.tsx`) with four distinct states
   (loading / slots / no-slots-with-reason / failure) over TanStack
   Query, keyed by serviceId+date.
5. Wizard container: `selectedSlot` state cleared on service/date
   change; remove the interim details screen + its schema (minimum
   replacement, nothing unrelated).
6. Verify via a temporary offline harness (in-memory stand-ins running
   the REAL availability service + source-level checks), then the full
   quality gates; update docs; commit/tag/publish.

### TODO Completion

- [x] Read Tier 0 + task-relevant docs (vision, strategy, architecture,
      SPEC_A, roadmap, decisions, build state, design system, UX plan,
      database, current state, project status, appointments README)
- [x] Inspect the PROMPT-11 wizard + the PROMPT-10 availability layer
      (reused, NOT rebuilt — algorithm untouched)
- [x] `types.ts`: `BOOKING_FLOW_ACTIVE_STEPS = 4`, screen `"slot"`,
      `SelectedSlot`
- [x] `slot-helpers.ts` pure presentation helpers
- [x] `slot-step.tsx` Step 4 slot-selection UI
- [x] Wizard container: selectedSlot state + invalidation on
      service/date change + step-4 navigation
- [x] Progress indicator: steps 1–4 active, 5–6 locked, slot completion
- [x] Interim details screen + `bookingDetailsFormSchema` removed
- [x] `SLOT_NOUNS` in `src/lib/arabic.ts`
- [x] Temporary verification harness (89/89 checks) — created, run,
      removed
- [x] Quality gates: db:generate / lint / typecheck / format:check /
      verify / security
- [x] Docs: appointments README / BUILD_STATE / CURRENT_STATE /
      PROJECT_STATUS; version → 0.11.0
- [x] Release: commit + annotated tag v0.11.0 + push + GitHub Release

### ALREADY PRESENT / REUSED (untouched in spirit)

- The ENTIRE PROMPT-10 availability layer: `getAvailabilityInputSchema`
  (`{date, serviceId}` only — hostile keys Zod-stripped),
  `getAvailability` (deterministic slots from working hours, stored
  timezone, canonical `slotDurationMinutes` step, service-duration fit,
  the exact write-path conflict rule), `getAvailabilityAction` (thin
  `"use server"` hook building the actor from the session — the
  Business is ALWAYS derived server-side), and the typed result
  contract with explicit no-slots reasons — all consumed verbatim, zero
  algorithm changes
- The PROMPT-11 wizard mechanics: customer/service/date steps, progress
  indicator conventions (locked steps, clickable completed steps),
  container-only state, per-step continue gating, TanStack Query
  provider
- `formatArabicDate` (date-format.ts), `EmptyState`, `Button`,
  `Skeleton`, `arabicCount` + nouns pattern, `appointmentDateSchema`,
  logical-CSS/design-system tokens

### IMPLEMENTED IN THIS PROMPT

- **`SelectedSlot`** — the typed Step 4 output mirroring the appointment
  domain's wall-clock conventions ("HH:mm" start/end); stored in the
  wizard's existing local state model for PROMPT-13 (review) to
  consume. No appointment is created from Step 4 and `createAppointment`
  is never called there.
- **Step 4 — الوقت** (`slot-step.tsx`): real available-slot selection.
  TanStack Query calls `getAvailabilityAction({date, serviceId})` ONLY
  while the step is mounted with a valid date (query key carries both
  inputs, so changing either refetches instead of showing stale times;
  no `keepPreviousData` — a stale slot list can never flash). Four
  states: loading (skeleton + `aria-busy` + sr-only status), slots
  (grouped الصباح/بعد الظهر/المساء chips — pure client-side grouping
  of server-provided slots, chronological order preserved; large
  h-11 touch targets, flex-wrap, 360px-safe; `aria-pressed` selection
  with a check icon; `aria-live` slot count; business-timezone label
  from the result), zero slots (the EXPLICIT reason rendered as clear
  Arabic copy: BUSINESS_CLOSED / SERVICE_TOO_LONG / FULLY_BOOKED, with
  actionable next steps — تغيير التاريخ always, تغيير الخدمة for
  SERVICE_TOO_LONG — never fake or speculative times), and failure
  (`role="alert"` + إعادة المحاولة, plus العودة إلى الخدمات for the
  service-related typed errors SERVICE_NOT_FOUND/SERVICE_INACTIVE).
  The selected date stays visible (long Arabic date + تغيير التاريخ
  quick action). A `role="status"` confirmation panel shows the chosen
  range once a valid selection exists.
- **Stale-selection protection** (two layers): the wizard container
  clears `selectedSlot` whenever the service or the date CHANGES
  (changing the customer does not — availability does not depend on
  it), and `slotExistsIn` membership in the CURRENT result is the
  defensive backstop before treating a slot as selected.
- **Wizard mechanics preserved** (PROMPT-11 rules): customer/service/
  date selections persist across back/forward navigation; Step 4
  becomes active after valid Step 3; Steps 5/6 remain locked; completed
  earlier steps stay navigable; exactly one primary action on the
  active step (the slot selection itself — there is deliberately NO
  continue action past Step 4 while steps 5–6 are locked); no
  accidental wizard reset.
- **Interim bridge removed**: `booking-details-step.tsx` (manual
  start-time entry) and its `bookingDetailsFormSchema` deleted — the
  manual time entry is no longer part of the Smart Create path and no
  competing primary booking path remains. Nothing unrelated was
  touched (`createAppointment` and every other appointment capability
  remain intact for their existing callers).

### NOT IMPLEMENTED (later prompts — per scope)

- Step 5 (review) and Step 6 (confirmation) — PROMPT-13+ consumes the
  preserved `SelectedSlot`; the wizard intentionally ends at slot
  selection for now
- Reminder messages, WhatsApp booking, AI booking, customer creation,
  customers directory, rescheduling UX, cancellation UX, agenda
  redesign, team management, staff activation, new availability
  algorithms — all out of scope

### Generated / Changed Files

`src/features/appointments/components/smart-create/{slot-step,slot-helpers}.tsx`-family
(new `slot-step.tsx`, new `slot-helpers.ts`); updated
`src/features/appointments/components/smart-create/{smart-create-appointment,booking-flow-progress}.tsx`,
`src/features/appointments/types.ts` (ACTIVE_STEPS=4, screen `"slot"`,
`SelectedSlot`), `src/features/appointments/schemas/booking-flow-schema.ts`
(interim form schema removed), `src/lib/arabic.ts` (+`SLOT_NOUNS`),
`src/app/(app)/appointments/new/page.tsx` (copy only); removed
`src/features/appointments/components/smart-create/booking-details-step.tsx`;
`src/features/appointments/README.md`; `package.json` (version →
0.11.0). No schema/migration changes.

### Verification

- Temporary tsx verification harness (removed after the run — Ops 05 /
  PROMPT-03..11 pattern): **89/89 checks passed** offline — in-memory
  repository stand-ins running the REAL availability service + schemas
  (valid result with 15 slots, exact first/last slot boundaries,
  ascending order, HH:mm shape, timezone in result; grouping into
  morning/afternoon/evening preserving every server slot exactly once
  with empty groups omitted; empty result with explicit reason;
  BUSINESS_CLOSED / SERVICE_TOO_LONG / FULLY_BOOKED each reproduced;
  invalid date/UUID/non-object input → INVALID_INPUT, no-business →
  NO_BUSINESS; hostile `businessId`/`role` payload keys stripped with
  the business resolved from the ACTOR only (call-log verified); STAFF
  actor reads the same availability; cross-tenant service →
  SERVICE_NOT_FOUND both directions and foreign blocking appointments
  never affect slots; inactive → SERVICE_INACTIVE, deleted →
  SERVICE_NOT_FOUND; date change (Monday 17:00 slot not offered
  Saturday) and service change (45-min 17:00 slot not offered for a
  90-min service) both invalidate a prior selection via the same
  membership guard the UI uses) + source-level checks (container
  clears the slot on service/date change and ONLY there — navigation
  never resets it; slot lives in container state; smart-create files
  never import the create action while `createAppointment` stays
  intact for its existing callers; screen union exactly the four
  active steps, progress locks > BOOKING_FLOW_ACTIVE_STEPS, no
  review/confirm screens, no continue action on the slot screen;
  interim screen + schema gone; chips flex-wrap with no fixed grid and
  no width > 6rem, h-11 targets, truncation-safe rows; aria-pressed /
  aria-label / aria-live / role=status / role=alert / aria-busy /
  aria-current / aria-disabled all present; no physical left/right
  CSS; no console logging; page derives the Business server-side and
  redirects without one; client availability input carries only
  {date, serviceId}).
- `pnpm db:generate` ✅ · `pnpm lint` ✅ · `pnpm typecheck` ✅ ·
  `pnpm format:check` ✅
- `pnpm verify` full gate: PASSED ✅ (lint 49.5s · typecheck 23.2s ·
  format 33.3s · build --webpack 270.7s) — `/appointments/new` compiled
  as a dynamic route
- `pnpm security` ✅ (clean)
- NOT verified on-device (environment limits, honestly stated):
  live-database behavior of the availability read through the running
  wizard (this device has a placeholder `DATABASE_URL` and cannot run
  the Prisma schema engine). The real-DB path is the existing
  `AppointmentRepository.listBlockingForDate` conventions already used
  by the availability service; the workflow logic was verified offline
  with the REAL service code against in-memory stand-ins.

### Known Limitations

- The Smart Create flow currently ENDS at slot selection: the chosen
  slot is preserved in wizard state, but review (Step 5) and
  confirmation (Step 6) do not exist yet, so no appointment can be
  created from the wizard until PROMPT-13 lands. The confirmation
  panel states this honestly; steps 5–6 stay locked in the indicator.
- Availability is a READ layer (unchanged PROMPT-10 caveat): the slot
  is not reserved; two concurrent bookings for the same slot still
  rely on the transactional conflict check at write time — relevant
  once creation lands.
- Slot chips display the start time only (the full range is in the
  aria-label and the selection panel) — the service duration is shown
  in the step-2 selection summary.
- Returning to Step 4 refetches availability on mount (fresh server
  truth); if a previously selected slot disappeared because someone
  else booked it, the selection clears silently and the count
  re-announces — acceptable at pilot scale.

### Database / Migration State

- **NO schema change.** The existing Business/Service/Appointment
  models fully support slot selection. Existing unapplied-on-device
  migrations (`20260902120000`, `20260903120000`, `20260903130000`,
  `20260903140000`) remain a desktop/CI `pnpm db:deploy` action,
  unchanged by this prompt.

### Release

- Commit `feat(appointments): add available slot selection`;
  `package.json` version bumped to 0.11.0 (MINOR — new user-facing
  product capability; `/api/health` reports the version).
- Annotated tag `v0.11.0` — Smart Create Appointment: Available-Slot
  Selection (Step 4) — points at the PROMPT-12 commit. Published
  through the documented GitHub publication workflow (PROMPT-05A..11
  pattern: git state → origin identity → gh auth → push main → verify
  tag target → push tag only → `gh release create --verify-tag` →
  verify release published). The legacy `pnpm release` doctor gate
  still blocks on this device's placeholder `DATABASE_URL`
  (device-local, user action) and was not used, per the operator's
  prompt instruction.
- **Next step (product):** PROMPT-13 — Smart Create Appointment: Step
  5 Review (consumes the preserved `SelectedSlot` from the wizard
  state; confirmation follows). Do NOT implement it in this prompt.

---

- **Spec A progress:** foundation, onboarding (restructured in PROMPT-07
  to the 4-step operational-foundation wizard: بيانات المنشأة → ساعات
  العمل → إعدادات الحجز الأساسية → مراجعة وتشغيل, with vertical
  capture, smart resume, step guards, and a real review step; services/
  knowledge deferred to their own screens), owner dashboard,
  Conversations, Appointments, a full polish pass (loading/error/
  empty states, a11y, PWA PNG icons, demo-ready seed), Services
  management (PROMPT-08: list/create/edit/activate/deactivate,
  ADMIN-only, tenant-scoped, zero schema changes), and Business
  Settings (PROMPT-09: `/settings` with identity + booking-behavior
  sections, ADMIN-only, tenant-scoped, one additive field
  `Business.confirmationMode` driving the initial status of new
  appointments) are complete. Still placeholders: Customers directory,
  Business knowledge screen, Team management (admin), and the Staff
  area. (The `/sign-up` placeholder page remains in code but is no
  longer a planned deliverable — superseded by the invitation-first
  model; the invitation foundation, acceptance, ADMIN account
  activation, and the ADMIN activation UI → onboarding handoff now
  exist, but invitation creation UI / team management and token
  delivery are still to be built.)
- **Ops 01 (DX pass) complete:** cross-platform bootstrap/dev scripts,
  `pnpm run setup` / `pnpm run doctor` / `pnpm verify`, safe `.env.local`
  automation, unified env precedence, per-OS setup docs — see
  `docs/ENVIRONMENT_SETUP.md` and `docs/PROJECT_AUDIT.md`.
- **Ops 02 (health/safety pass) complete:** READY/NOT-READY doctor with live
  DB connection + build readiness, verify summary table, `pnpm security`
  secret scanner, and `.githooks/pre-commit` commit safety — see
  `docs/QUALITY_CHECKS.md`, `docs/LOCAL_DEVELOPMENT.md`,
  `docs/TROUBLESHOOTING.md`.
- **Ops 03 (release pass) complete:** git audit clean, release automation
  `pnpm release` (gated: gh-auth → doctor → verify → security), release/ops
  docs, status snapshot. **v0.1.0 published 2026-08-27** — see
  `docs/RELEASE_REPORT.md` and `PROJECT_STATUS.md → Release Status`.
- **Ops 04 (Vercel deployment pass) complete:** audit + fixes (postinstall
  Prisma generation, `vercel.json` build command + SW cache headers),
  `pnpm vercel:check` env validation, `/api/health`, gated
  `pnpm deploy:check/preview/vercel`, and full deployment docs — see
  `docs/DEPLOYMENT_REPORT.md`. **Deployment Readiness: READY (code side)** —
  remaining steps are user actions in Vercel/Neon consoles
  (`docs/VERCEL_DEPLOYMENT.md`).
- **Ops 05 (demo pass) complete:** Egyptian demo dataset (عيادة الابتسامة
  بكفر الشيخ: 36 customers, 22 conversations, 37 appointments) in pure
  `prisma/demo-data.ts`, dashboard `GettingStarted` empty state, `DEMO_MODE`
  auto-seed hook in dev launchers, and `docs/DEMO_GUIDE.md` +
  `docs/DEMO_SCRIPT.md`. **Demo Readiness: READY** — re-seed before each
  demo (`pnpm db:seed` or `DEMO_MODE=true`).
- **Ops 06 (Pilot Distribution System, Prompt 10.5F) complete:** `pnpm deploy`
  / `deploy:production` / `deploy:preview` / `deploy:check` gated commands
  with deployment-URL capture and Vercel auth/link pre-flight;
  `scripts/pre-deploy.mjs` readiness gate (env, DB, schema, Prisma, auth,
  demo data, build); `DEMO_MODE=true` now seeds as part of every deploy;
  `/api/health` reports timestamp + DB reachability + deployment readiness;
  distribution docs (`VERCEL_QUICK_DEPLOY.md`, `CLIENT_DEMO.md`,
  `DEPLOYMENT_STATUS.md`, `PILOT_DISTRIBUTION_REPORT.md`). **Pilot
  Distribution: READY (code side)** — remaining steps are user actions
  (vercel login/link, Vercel env vars, `pnpm db:deploy`) — see
  `docs/VERCEL_QUICK_DEPLOY.md`.
- **Auth architecture alignment (Prompt 09) complete:** invitation-first
  pilot account creation, PLATFORM vs BUSINESS authorization scopes,
  ADMIN/STAFF business roles reaffirmed, Platform Operator is not a
  Business role, Invitation + account + Business lifecycles documented as the
  TARGET model (`DECISIONS.md` #22, `ARCHITECTURE.md`, `DATABASE.md`).
- **Invitation data foundation (Prompt 10 / operator Prompt 02)
  complete:** `Invitation` Prisma model + migration + repository +
  validation + domain type implemented. Data primitives only — no token
  generation, no workflows, no UI, no activation, no auth changes.
- **Invitation creation foundation (PROMPT-03) complete:** secure token
  generation + hash-only persistence, centralized 7-day expiry,
  duplicate-open-invitation prevention (transactional), business-scoped
  list/revoke service operations with typed results, and the minimal
  per-feature release-tooling extension. No UI, no delivery.
- **Invitation acceptance foundation (PROMPT-04) complete:** one-time,
  atomic, token-based acceptance — raw token hashed with the existing
  utility, hash-only lookup, lifecycle enforcement (expired/revoked/
  already-accepted rejected; expiry enforced at the workflow layer),
  single conditional-update repository primitive (concurrent
  acceptance cannot succeed twice), typed Arabic errors with a generic
  not-found for unknown tokens, and a safe invitation context result
  (no raw token, no hash). No account activation, no Better Auth
  changes, no UI.
- **ADMIN account activation foundation (PROMPT-05) complete:** an
  accepted ADMIN invitation becomes a real Better Auth identity with
  Business ADMIN membership — one-time activation via the
  `activatedAt` guard, one identity per email (no duplicates, no
  password resets, no silent role changes), collision-safe
  (cross-Business / STAFF conflicts typed), race-safe (concurrent
  activations and USER_ALREADY_EXISTS handled), and atomic at the
  domain layer (invitation mark + membership attach in one
  transaction; full rollback on conflict). Better Auth owns
  credentials (signUpEmail + adapter transaction option); FlowPilot
  owns the invitation lifecycle and Business membership.
- **ADMIN activation → onboarding integration (PROMPT-06) complete:**
  public activation route `/invite/[token]` (read-only pre-screen via
  `getInvitationByToken`, no GET-time mutation), Arabic/RTL activation
  form + terminal notices, one server action composing the existing
  accept + activate services with Zod-stripped `{token, name,
password}` input and typed Arabic error mapping, safe sign-in →
  onboarding handoff after success (DECISIONS #25 — no invented
  session shortcut), public-path policy extracted to
  `@/lib/public-paths`, and the `(onboarding)` layout guarded with
  `requireRole("ADMIN")` (STAFF blocked). No onboarding redesign, no
  schema/auth changes. Still missing on this path: invitation
  creation/delivery UX (Team management prompt) and the STAFF
  activation workflow.
- **Release publication recovery (PROMPT-05A, ops-only) complete:**
  tags v0.2.0 / v0.3.0 / v0.4.0 pushed to origin and their GitHub
  Releases created (2026-09-03) — all four versions are now published
  and local/remote `main` are in sync. Remaining user action: make the
  GitHub repository private (it is currently public; see the
  PROMPT-05A section).
- **Documentation tier model (PROMPT-05B, docs-only) complete:** agent
  context loading is now tiered — Tier 0 always (CORE_CONTEXT →
  BUILD_STATE → DECISIONS → AGENT_RULES), Tier 1/2 by task relevance via
  `docs/DOCS_INDEX.md`, Tier 3 historical preserved. No product code or
  canonical documentation content changed; stale status claims in
  PRODUCT_GLOSSARY / PROJECT_README corrected.
- **Services management foundation (PROMPT-08) complete:** `/services`
  screen with list/create/edit/activate/deactivate (small create/edit
  dialog, Arabic-first/RTL/mobile-first cards, active/inactive status
  badges, empty/loading/error states), ADMIN-only with tenant scoping
  enforced in the service layer, session-derived Business on every
  operation, and role-scoped navigation. Zero schema changes — the
  existing Service model/repository/validation were sufficient.
- **Business settings foundation (PROMPT-09) complete:** `/settings`
  screen with two sections (بيانات المنشأة: name/vertical/city/
  WhatsApp/timezone; إعدادات الحجز: confirmation mode + cancellation
  policy), one primary save action, inline Arabic validation, visible
  success/failure states, ADMIN-only with tenant scoping enforced in
  the settings service layer, session-derived Business on every
  operation, role-scoped navigation, and `Business.confirmationMode`
  (manual/automatic, default manual) driving the server-derived initial
  status of new appointments. One additive migration
  (`20260903140000`, authored, not applied on-device). Follow-ups
  documented: default appointment duration (no clean domain
  representation — not invented), working-hours editing in settings,
  account activate/deactivate, knowledge screen.
- **Smart availability foundation (PROMPT-10) complete:** deterministic
  availability domain/service layer in the appointments feature —
  `getAvailability` answers "which start times are actually bookable?"
  from the Business's working hours + stored timezone + canonical
  `slotDurationMinutes` step + `Service.durationMinutes` fit + the same
  PENDING/CONFIRMED conflict rule the write path enforces
  (`AppointmentRepository.listBlockingForDate`, the only new repository
  primitive). Typed result contract with explicit no-slots reasons
  (BUSINESS_CLOSED/SERVICE_TOO_LONG/FULLY_BOOKED) and typed Arabic
  error codes; `getAvailabilityAction` is the thin server-action hook,
  consumed by Smart Create Step 4 (PROMPT-12). Zero schema changes,
  no UI of its own, verified offline 36/36 with in-memory stand-ins
  running the real service code.
- **Smart create appointment foundation (PROMPT-11) complete:** the first
  three steps of the Smart Create flow at `/appointments/new` — العميل
  (debounced name/phone search through the existing customer repository
  primitive, tenant-scoped server action, empty/selected/change states),
  الخدمة (active services only, radio-cards, actionable empty state),
  التاريخ (14-day quick-pick strip from business-timezone today + native
  date input with shared-schema validation, NO availability calculation) —
  inside a 6-step progress indicator where only steps 1–3 are active and
  completed steps are clickable for safe back-navigation. Wizard state is
  `{customerId, serviceId, date}` in one client container (no global
  store; TanStack Query for the search — its first consumer). Zero
  schema changes; PROMPT-10 availability layer untouched; verified offline
  60/60 with in-memory stand-ins running the real service code. (The
  interim manual-time details screen this prompt shipped was REPLACED by
  PROMPT-12 Step 4.)
- **Smart create step 4 — available-slot selection (PROMPT-12) complete:**
  الوقت is now real available-slot selection consuming the PROMPT-10
  availability layer through `getAvailabilityAction` verbatim (no second
  engine, zero algorithm changes). Four UI states (loading / grouped
  morning-afternoon-evening chips / zero-slots with the explicit reason
  as clear Arabic copy + actionable next steps / failure with retry),
  360px-safe flex-wrap chips with aria-pressed selection and aria-live
  counts, business-timezone label, and the selected date always visible.
  The typed `SelectedSlot` lives in the wizard's container state and is
  cleared when the service or date changes (membership-in-current-result
  backstop); customer changes do not clear it. Step 4 is SELECTION ONLY —
  no appointment is created from it — and the interim manual time-entry
  screen was removed, so the flow deliberately ends at slot selection
  until PROMPT-13 (review) consumes the preserved slot. Steps 5–6 remain
  locked. Zero schema changes; verified offline 89/89 with in-memory
  stand-ins running the real service code + source-level checks.
- **Next Step:** PROMPT-13 — Smart Create Appointment: Step 5 Review —
  consumes the preserved `SelectedSlot` from the wizard state (then Step
  6 confirmation). Do NOT combine unrelated areas. After that, the
  remaining Spec A placeholders (customers directory, business knowledge
  screen, team, staff area) proceed per the operator's choice.
- After each prompt: update this file and `DECISIONS.md`.
