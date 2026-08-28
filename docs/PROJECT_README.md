# FlowPilot — Project README (Executive Overview)

> The 5-minute brief for a new developer or agent. Then follow
> `CONTEXT_RECOVERY.md` before touching code.

## What the product does

FlowPilot is a **WhatsApp Appointment Conversion System** ("Book more, chase
less"). It answers inbound WhatsApp messages for small appointment-based
businesses, converts chats into booked appointments, and gives owners one calm
Arabic-first dashboard. AI does the repetitive work; humans stay in the loop.

## Current stage

**Local Vertical Discovery Strategy** in **Kafr El Sheikh**: run the identical
generic engine across several appointment-based verticals and pick the winner
by evidence — paid pilots, renewals, willingness to pay, measurable ROI.
Signups/demos/feature-requests do NOT count as success.

The product is deliberately **vertical-agnostic** and **Arabic-first, RTL by
default**, mobile-first with a desktop right sidebar / mobile bottom nav.

## Architecture (1 paragraph)

Next.js 16 App Router + TypeScript strict, deployed on Vercel with Neon
PostgreSQL via Prisma 7 (driver adapter). Auth: Better Auth. Styling:
Tailwind v4 + shadcn/ui tokens in `globals.css`. Server data: TanStack Query;
forms: React Hook Form + Zod. Pattern: **feature-based modular monolith** —
isolated `src/features/*`, repositories in `src/server/repositories` are the
only Prisma consumers, validation DTOs in `src/lib/validation`. PWA: manifest +
service worker + install prompt. Full detail: `ARCHITECTURE.md`.

## Roadmap

| Spec   | Focus                                                    | Status          |
| ------ | -------------------------------------------------------- | --------------- |
| Spec A | Discovery Foundation + Booking Core                      | **in progress** |
| Spec B | Evidence Layer: pilot tracking, ROI, vertical registry   | planned         |
| Spec C | Vertical Discovery Engine: scoring, WTP, decision center | planned         |

Frozen scope of current work: `SPEC_A.md`. Excluded forever-ish: billing,
payments, CRM, marketplace, public API.

## Build status

Prompts 01–03 complete: repository foundation (stack, tooling, auth wiring,
env validation), design system + RTL + responsive shells + PWA, and the full
database layer (schema, validation/DTOs, six repositories, Arabic seed).
Nothing else exists yet — no feature screens beyond placeholders.

Authoritative ledger: `BUILD_STATE.md`.

## How to continue development

1. Read `AGENT_RULES.md` — it is binding.
2. Read the memory files listed there (vision → strategy → architecture →
   spec → roadmap → decisions → build state).
3. Follow `CONTEXT_RECOVERY.md` to set up your environment.
4. Implement exactly `BUILD_STATE.md → Next Step`.
5. Verify (`pnpm lint && pnpm typecheck && pnpm format:check && pnpm build`),
   then update `BUILD_STATE.md` (+ `DECISIONS.md`, append-only).

## Quick commands

```bash
pnpm dev            # dev server
pnpm build          # production build (use --webpack on Android/Termux)
pnpm db:generate    # regenerate Prisma client
pnpm db:migrate     # apply schema migrations (needs real DATABASE_URL)
pnpm db:seed        # Arabic demo data (عيادة الابتسامة)
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
```
