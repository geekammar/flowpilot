# FlowPilot — Core Context

> ⚠️ DERIVED summary — created by PROMPT-05B. This file is NOT a source of
> truth and must never override the canonical files it links. It exists only
> so a new agent can orient quickly. Last updated: PROMPT-05B.

## 1. What FlowPilot Is

**WhatsApp Appointment Conversion System** — turns inbound WhatsApp
conversations into confirmed, attended appointments for small
appointment-based businesses. "Book more, chase less." Arabic-first, RTL,
mobile-first, vertical-agnostic, human-in-the-loop. It is NOT a CRM, ERP,
POS, marketing platform, marketplace, or general chatbot builder.
Detail: `PROJECT_VISION.md`.

## 2. Current Product Strategy

**Local Vertical Discovery** (Kafr El Sheikh, Egypt): deploy one identical
generic engine across several appointment-driven verticals and pick the
winner by evidence — paid pilots, renewals, willingness to pay, ROI.
Success is NOT signups/demos/feature requests. Detail:
`PRODUCT_STRATEGY.md`.

## 3. Current Spec

**Spec A — Discovery Foundation + Booking Core** (frozen): login,
onboarding, business setup, services, availability, business knowledge,
dashboard, conversations, appointments, team, customers. Everything not
listed there is out of scope. Specs B (Evidence Layer) and C (Vertical
Discovery Engine) are planned, not started. Detail: `SPEC_A.md`,
`ROADMAP.md`.

## 4. Architecture (high level)

Next.js 16 App Router + TypeScript strict · PostgreSQL (Neon) via Prisma 7
(driver adapter) · Better Auth · Tailwind v4 + shadcn/ui · TanStack Query ·
React Hook Form + Zod · Vercel. Pattern: **feature-based modular monolith**;
`src/server/repositories` is the ONLY Prisma consumer; features never
import each other. PWA installable. Detail: `ARCHITECTURE.md`.

## 5. Auth / Business-User Model (DECISIONS #22–24)

- ONE Better Auth system for all humans; authorization has two scopes:
  PLATFORM (Founder — NOT a Business role, no code yet) and BUSINESS.
- Business roles: `ADMIN` and `STAFF` only.
- **Invitation-first** account creation (no public self-sign-up as the
  pilot flow): Operator provisions Business → invites ADMIN → ADMIN accepts
  → activates (password) → completes onboarding → invites STAFF.
- Implemented at the SERVICE layer (no UI): Invitation model, creation
  (hash-only token storage, 7-day expiry), one-time acceptance, ADMIN
  account activation (Better Auth identity + Business ADMIN membership).
- Tenancy: `businessId` scoping; server-side authorization mandatory;
  no RBAC engine; no granular permissions.

## 6. Major Accepted Constraints (do not violate)

- Spec A scope frozen; log feature requests, don't build them.
- No microservices / event buses / queues / new databases / extra API
  layers / global client stores / new UI frameworks.
- Vercel + Neon only. No premature optimization.
- Never modify or delete `DECISIONS.md` history (append-only).
- Never rewrite completed work listed in `BUILD_STATE.md`.
- Full constraint lists: `ARCHITECTURE.md` (Forbidden Architectural
  Changes), `SPEC_A.md` (Excluded).

## 7. Implementation State (summary)

- **Done (product):** foundation, design system/RTL/PWA, database layer,
  onboarding wizard, admin dashboard, conversations inbox + detail,
  appointments agenda (all verified per prompt; see ledger).
- **Done (service layer, no UI):** invitation creation / acceptance /
  ADMIN account activation.
- **Placeholders remaining:** customers, services, business
  settings/knowledge, team management, staff area; `/sign-up` page is
  superseded (invitation-first) but still in code.
- **Ops complete:** bootstrap/dev scripts, doctor/verify/security tooling,
  release automation, Vercel deployment, demo dataset, pilot distribution
  (`pnpm deploy` toolchain). Releases v0.1.0–v0.4.0 published on GitHub.

## 8. Current Next Step

**PROMPT-06 — ADMIN Activation → Onboarding Integration** (connect the
activated ADMIN into the existing onboarding wizard). Then customers →
staff → services → settings → team. Do NOT implement without reading the
authoritative detail in `BUILD_STATE.md → Current State Summary`.

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

| Topic                 | Canonical file                         |
| --------------------- | -------------------------------------- |
| Implementation ledger | `BUILD_STATE.md`                       |
| Accepted decisions    | `DECISIONS.md` (append-only)           |
| Agent behavior rules  | `AGENT_RULES.md`                       |
| Product identity      | `PROJECT_VISION.md`                    |
| Strategy              | `PRODUCT_STRATEGY.md`                  |
| Scope                 | `SPEC_A.md`                            |
| Architecture          | `ARCHITECTURE.md`                      |
| Database              | `DATABASE.md`                          |
| Design                | `DESIGN_SYSTEM.md`                     |
| Terminology           | `PRODUCT_GLOSSARY.md`                  |
| Which docs to read    | `DOCS_INDEX.md` (tiered context model) |

Quality/deploy/demo/release procedures: see `DOCS_INDEX.md` → Tier 2.
