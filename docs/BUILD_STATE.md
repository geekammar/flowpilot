# FlowPilot — Build State

> ⚠️ CRITICAL: the authoritative progress ledger. Every agent MUST update
> this file after finishing a prompt. Read it before starting any work.
> Last updated: Ops 03.

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

## Current State Summary

- **Spec A progress:** foundation, onboarding, owner dashboard,
  Conversations, Appointments, and a full polish pass (loading/error/
  empty states, a11y, PWA PNG icons, demo-ready seed) are complete.
  Still placeholders: auth sign-up, Customers directory, Services
  management, Business settings/knowledge screens, Team management
  (admin), and the Staff area.
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
- **Next Step:** Prompt 09 — complete the Arabic Better Auth sign-up
  flow, then continue with the next requested Spec A operational screen
  (recommended order: Customers directory → Staff area → Services →
  Settings → Team).
- After each prompt: update this file and `DECISIONS.md`.
