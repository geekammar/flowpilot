# FlowPilot — Decision Context Index

> Derived navigation aid from `DECISIONS.md`. `DECISIONS.md` remains the
> authoritative, append-only decision record; this file must NEVER override
> it. If this index and `DECISIONS.md` ever disagree, `DECISIONS.md` wins.
> Purpose: decide which decisions are relevant BEFORE opening the full
> record. Created by PROMPT-13.6.

## How to use

- Cold start: read this index (Tier 0) — not the full `DECISIONS.md`.
- Open `docs/DECISIONS.md` only when the current task touches a decision,
  this index is insufficient, a conflict must be investigated, or
  authoritative historical detail is required.
- Entry numbers map to the `#` column of `DECISIONS.md` (01–26; no
  reversals to date — see `DECISIONS.md → Reversals`).

## Product & UX

- #01 — Agenda View — Appointments render as an agenda list by day/range,
  not calendar grids.
- #03 — Human-in-the-loop — AI must hand off (`NEED_HUMAN`) on ambiguity,
  high-stakes intent, or customer request; staff resolve inside the app.
- #07 — Arabic-first / RTL — `dir="rtl" lang="ar"`, IBM Plex Sans Arabic,
  logical CSS properties everywhere.
- #08 — Responsive shell — One `AppShell`: desktop right sidebar / mobile
  bottom navigation.
- #09 — Visual direction — Premium-calm (refined indigo, deep-neutral dark,
  soft shadows); explicitly no neon/gradients/AI gimmicks.

## Roles & Authentication

- #02 — Role model — Only ADMIN and STAFF business roles; no additional
  roles or granular permissions in Spec A.
- #22 — Auth architecture — ONE Better Auth system; PLATFORM vs BUSINESS
  authorization scopes (Platform Operator is NOT a Business role);
  invitation-first account creation (no public self-sign-up as the pilot
  flow); tenancy via `businessId`; server-side authorization mandatory; no
  RBAC engine.
- #23 — Invitation token security — 256-bit CSPRNG URL-safe token persisted
  ONLY as a SHA-256 hash, returned exactly once; 7-day expiry
  (`INVITATION_EXPIRY_DAYS`); duplicate-OPEN prevention per Business +
  normalized email at the workflow layer (no DB uniqueness constraint).
- #24 — ADMIN activation consistency — Two sequential atomic phases (Better
  Auth identity, then invitation mark + membership in ONE transaction);
  interruption is recoverable and idempotent; one identity per email
  enforced at the workflow layer; applies to the STAFF analog unchanged.
- #25 — Activation handoff — Activation completes via normal sign-in →
  onboarding (`/sign-in?redirect=/onboarding`); no session shortcut; the
  public `/invite/[token]` route is a read-only pre-screen; onboarding is
  ADMIN-only.

## Architecture & Stack

- #04 — Next.js 16.x — use its current conventions (async request APIs,
  `proxy.ts`, `{ error, retry }` boundaries), not older habits.
- #05 — Prisma 7 driver-adapter client (`@prisma/adapter-pg`), generated to
  `src/generated/prisma`.
- #06 — Feature-based modular monolith — strict feature isolation;
  repository layer as the only Prisma consumer.

## Data Model & Tenancy

- #10 — Single shared Postgres database; tenancy via `businessId` columns;
  no RLS/multi-schema yet.
- #11 — Soft deletes (`deletedAt`) on Business, Service, Customer,
  Conversation, Appointment; Message immutable; User deactivated via
  `isActive`.
- #12 — Repositories are the only Prisma consumer; features depend on
  repositories + Zod DTOs.
- #13 — Onboarding progress persists on the Business record: integer slot
  duration, plain-JSON FAQs, explicit completion timestamp.

## Demo & Seed Data

- #14 — Seed provisions demo-only Better Auth credential accounts
  (`admin@flowpilot.app` / `staff@flowpilot.app`, fixed passwords) with a
  business-scoped wipe.
- #20 — Egyptian demo dataset (عيادة الابتسامة) isolated as pure data in
  `prisma/demo-data.ts`; `DEMO_MODE=true` re-seeds (dev + deploy); UI copy
  stays vertical-agnostic.

## Ops (DX, Release, Deployment)

- #15 — PWA icons are generated PNGs via the dependency-free script
  (`pnpm icons`); manifest references PNGs only.
- #16 — Cross-platform run system — per-OS bootstrap/dev scripts; standard
  commands `pnpm run setup` / `pnpm run doctor` / `pnpm verify`;
  `.env.local` preferred; Termux builds use `--webpack`.
- #17 — Commit safety via repo-managed git hooks (`.githooks/pre-commit`
  through `core.hooksPath`); no husky/lefthook or new dependencies.
- #18 — Release model — private GitHub repo, single `main`, annotated
  `vX.Y.Z` tags, gated `pnpm release`; CI and branch protection deferred
  until a second contributor.
- #26 — Two release paths — `pnpm ship patch/minor` = lightweight routine
  operator shipping after a verified prompt (no gate re-run, no deploy, no
  DB); `pnpm release` stays the full gated path.
- #19 — Vercel readiness — `postinstall: prisma generate` + explicit
  `buildCommand` in `vercel.json`; gated deploy commands; dependency-free
  `/api/health`; the `build` script itself stays untouched.
- #21 — Pilot distribution — single gated `pnpm deploy` entry point;
  `pnpm deploy:check` readiness gate; `DEMO_MODE=true` extends to every
  deploy; `/api/health` v2 with DB probe.
