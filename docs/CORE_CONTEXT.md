# FlowPilot — Core Context

> DERIVED orientation summary — NOT a source of truth. Canonical documents
> always override this file. Exists only so a new agent can orient quickly.
> Last updated: PROMPT-13.5.

## 1. What FlowPilot Is

**WhatsApp Appointment Conversion System** — turns inbound WhatsApp
conversations into confirmed, attended appointments for small
appointment-based businesses. "Book more, chase less." Arabic-first, RTL,
mobile-first, vertical-agnostic, human-in-the-loop. NOT a CRM, ERP, POS,
marketing platform, marketplace, or chatbot builder. Detail:
`PROJECT_VISION.md`.

## 2. Product Strategy

**Local Vertical Discovery** (Kafr El Sheikh, Egypt): deploy one identical
generic engine across several appointment-driven verticals and pick the
winner by evidence — paid pilots, renewals, willingness to pay, ROI, onboarding
repeatability. Success is NOT signups/demos/feature requests. The shared core
tests verticals; NO vertical-specific architecture, Dashboard, Discovery
Engine, or Vertical Scoring exists (Spec B/C concepts, out of scope).
Detail: `PRODUCT_STRATEGY.md`.

## 3. Spec

**Spec A — Discovery Foundation + Booking Core** (frozen): login
(invitation-first), onboarding, business setup, services, availability,
business knowledge, dashboard, conversations, appointments, team, customers.
Everything not listed is out of scope. Spec B (Evidence Layer + Founder
Side) and Spec C (Vertical Discovery Engine) are planned, not started.
Detail + exit criteria: `SPEC_A.md`.

## 4. Architecture (high level)

Next.js 16 App Router + TypeScript strict · PostgreSQL (Neon) via Prisma 7
(driver adapter) · Better Auth · Tailwind v4 + shadcn/ui · TanStack Query ·
React Hook Form + Zod · Vercel. Pattern: **feature-based modular monolith**;
`src/server/repositories` is the ONLY Prisma consumer; features never import
each other. PWA installable. Detail: `ARCHITECTURE.md`.

## 5. Auth / Business-User Model (DECISIONS #22–25)

- ONE Better Auth authentication system for all humans; authorization has
  two scopes: PLATFORM (Founder — NOT a Business role, no code yet) and
  BUSINESS. Business roles: `ADMIN` and `STAFF` only.
- **Invitation-first** account creation (no public self-sign-up as the pilot
  flow): Operator provisions Business → invites ADMIN → ADMIN accepts →
  activates (password) → completes onboarding → invites STAFF.
- Implemented end-to-end for ADMIN: Invitation model (hash-only tokens,
  derived lifecycle), creation/acceptance/activation services, public
  activation route `/invite/[token]`, safe sign-in → onboarding handoff.
- Tenancy: `businessId` scoping; server-side authorization mandatory; UI
  visibility is not authorization; no RBAC engine; no granular permissions.

## 6. Major Accepted Constraints (do not violate)

- Spec A scope frozen; log feature requests, don't build them.
- No microservices / event buses / queues / new databases / extra API
  layers / global client stores / new UI frameworks.
- Vercel + Neon only. No premature optimization.
- Never modify or delete `DECISIONS.md` history (append-only).
- Never redo completed work recorded in `BUILD_STATE.md`.
- Full constraint lists: `ARCHITECTURE.md` (Forbidden Architectural
  Changes), `SPEC_A.md` (Excluded).

## 7. Implementation State (summary)

- **Done (product):** foundation, design system/RTL/PWA, database layer,
  onboarding wizard (4-step), admin dashboard, conversations inbox + detail,
  appointments agenda/detail/create, polish pass, invitation-first auth
  lifecycle (ADMIN end-to-end), services management, business settings,
  deterministic availability, Smart Create steps 1–5 (customer → service →
  date → slot → review; Step 6 locked).
- **Placeholders remaining:** Smart Create Step 6 (next), customers,
  business knowledge screen, team management (incl. STAFF activation),
  staff area; `/sign-up` page is superseded (invitation-first) but still in
  code.
- **Ops complete:** bootstrap/dev scripts, doctor/verify/security tooling,
  release automation, Vercel deployment, demo dataset, pilot distribution.
  Releases v0.1.0–v0.12.0 published on GitHub.
- Detail + known limitations: `BUILD_STATE.md`.

## 8. Current Next Step

**PROMPT-14 — Smart Create Appointment: Step 6 Confirmation / Appointment
Creation** (the review's verified state is the hand-off point; the untouched
`createAppointment` write path is the designated consumer). Do NOT implement
without reading `BUILD_STATE.md → Next Step`.

## 9. Critical Non-Negotiable Rules

1. Arabic-first, RTL-first (`dir="rtl" lang="ar"`, logical CSS properties).
2. Human-in-the-loop: AI hands off (`NEED_HUMAN`) on ambiguity/high stakes.
3. Vertical-agnostic UI, domain, and copy until a winner is chosen.
4. Repositories are the only Prisma consumers; Zod DTOs everywhere.
5. Business data stays tenant-scoped; UI visibility is not authorization.
6. Quality gate before finishing any prompt:
   `pnpm lint && pnpm typecheck && pnpm format:check && pnpm build`.
7. Never commit secrets; `.env*` files stay local (pre-commit hook active).
8. Escalate instead of guessing when scope is ambiguous.

## 10. Where the Canonical Detail Lives

| Topic                 | Canonical file                               |
| --------------------- | -------------------------------------------- |
| Implementation ledger | `BUILD_STATE.md` (the ONE current-state doc) |
| Accepted decisions    | `DECISIONS.md` (append-only)                 |
| Agent behavior rules  | `AGENT_RULES.md`                             |
| Product identity      | `PROJECT_VISION.md`                          |
| Strategy              | `PRODUCT_STRATEGY.md`                        |
| Scope + spec sequence | `SPEC_A.md`                                  |
| Architecture          | `ARCHITECTURE.md`                            |
| Database              | `DATABASE.md`                                |
| UX / design rules     | `UX.md`                                      |
| Terminology           | `PRODUCT_GLOSSARY.md`                        |
| Which docs to read    | `DOCS_INDEX.md` (tiered context model)       |

Quality/deploy/demo/release procedures: `DOCS_INDEX.md` → Tier 2.
Historical prompt reports and deleted documents: Git history only.
