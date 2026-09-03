# FlowPilot — Build State

> ⚠️ CRITICAL: the authoritative progress ledger. Every agent MUST update
> this file after finishing a prompt. Read it before starting any work.
> Last updated: PROMPT-04 (Invitation Acceptance Foundation).

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

---

## Current State Summary

- **Spec A progress:** foundation, onboarding, owner dashboard,
  Conversations, Appointments, and a full polish pass (loading/error/
  empty states, a11y, PWA PNG icons, demo-ready seed) are complete.
  Still placeholders: Customers directory, Services management, Business
  settings/knowledge screens, Team management (admin), and the Staff area.
  (The `/sign-up` placeholder page remains in code but is no longer a
  planned deliverable — superseded by the invitation-first model; the
  invitation data foundation now exists, but the invitation workflow and
  account activation are not yet implemented.)
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
  docs, status snapshot. **v0.1.0 prepared but NOT published** — blocked on
  `gh auth login` + real `DATABASE_URL`, then `pnpm release` finishes — see
  `docs/RELEASE_REPORT.md`.
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
- **Next Step:** PROMPT-05 — ADMIN Account Activation Foundation
  (compose `acceptInvitation`'s result to activate the invited ADMIN:
  password setup via Better Auth, account activation; keep it small).
  Do NOT combine with the Team management UI — that lands afterwards
  and composes the existing services. Then customers → staff →
  services → settings → team.
- After each prompt: update this file and `DECISIONS.md`.
