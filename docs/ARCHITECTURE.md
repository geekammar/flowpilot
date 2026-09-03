# FlowPilot — Architecture

> Technical architecture reference. Read together with `SPEC_A.md` and
> `BUILD_STATE.md`. Last updated: PROMPT-06 (activation → onboarding
> integration).

## Stack

| Layer      | Choice                                  | Notes                                                                                                                                                                                                                                             |
| ---------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | **Next.js 16 (App Router)**             | Latest stable at project start; supersedes the "Next.js 15" plan. Uses Next 16 conventions: async `params`/`searchParams`, `proxy.ts` (not middleware), error boundaries with `{ error, retry }`. Docs bundled in `node_modules/next/dist/docs/`. |
| Language   | TypeScript (strict)                     | `noUncheckedIndexedAccess`, no implicit any                                                                                                                                                                                                       |
| Database   | PostgreSQL (Neon)                       | Single shared database for all pilot tenants                                                                                                                                                                                                      |
| ORM        | Prisma 7                                | Driver-adapter client (`@prisma/adapter-pg`), generated to `src/generated/prisma`                                                                                                                                                                 |
| Auth       | Better Auth                             | Email+password; owns the shared `users` table identity fields                                                                                                                                                                                     |
| Styling    | Tailwind CSS v4                         | CSS-first tokens in `globals.css`                                                                                                                                                                                                                 |
| UI         | shadcn/ui (`radix-vega`) + Lucide icons | Primitives in `src/components/ui`                                                                                                                                                                                                                 |
| State      | TanStack Query                          | Server state only; no global client store                                                                                                                                                                                                         |
| Forms      | React Hook Form + Zod                   | Zod schemas are the validation source                                                                                                                                                                                                             |
| Charts     | Recharts                                | Installed, unused until dashboards                                                                                                                                                                                                                |
| Deployment | Vercel                                  | Turbopack builds on CI/desktop                                                                                                                                                                                                                    |
| PWA        | Manifest + service worker               | See "PWA Philosophy"                                                                                                                                                                                                                              |

## Architecture Pattern

**Feature-Based Modular Monolith.**

One deployable Next.js app. Domain logic lives in isolated feature modules.
No microservices, no message brokers, no external state stores.

### Folder Structure

```
src/
├── app/                    # Routing layer only (thin) — route groups:
│   ├── (auth)/             #   sign-in / sign-up
│   ├── (app)/              #   authenticated app shell (sidebar/bottom nav)
│   ├── (admin)/            #   admin area
│   ├── (staff)/            #   staff area
│   └── api/auth/[...all]/  #   Better Auth handler
├── features/               # Domain modules — isolated from each other
│   ├── auth/ onboarding/ services/ appointments/
│   ├── conversations/ customers/ staff/
├── components/
│   ├── ui/                 # shadcn/ui primitives (generated)
│   └── shared/             # cross-feature components (AppShell, DataTable,
│                           #   StatusBadge, PageHeader, EmptyState, StatCard,
│                           #   SearchInput, PWA components)
├── hooks/                  # cross-feature client hooks
├── lib/
│   ├── auth.ts / auth-client.ts   # Better Auth instances
│   ├── env.ts              # Zod-validated environment (fail fast)
│   ├── status.ts           # canonical status system
│   ├── app-config.ts       # app name, RTL direction, nav definitions
│   └── validation/         # Zod schemas + DTOs per entity
├── server/
│   ├── db/                 # Prisma client singleton (pg adapter)
│   └── repositories/       # the ONLY layer touching Prisma directly
├── types/                  # domain type aliases over generated client
└── generated/prisma/       # generated client (gitignored)
docs/                       # project memory system + DATABASE.md
prisma/                     # schema.prisma + seed.ts
```

## Dependency Rules (enforced by convention)

1. Routes (`app/**`) render feature components — no business logic there.
2. Features import from: `@/components/ui`, `@/components/shared`, `@/lib/*`,
   `@/server/repositories`, `@/types`, and themselves.
3. Features NEVER import from other features. Composition happens in routes.
4. Only `src/server/repositories/*` may import the `db` singleton.
5. No circular dependencies. Shared logic is promoted to `@/lib` or
   `@/server` deliberately and stays small.
6. No giant barrels or mega-utils.

## Authentication & Authorization Model

> Locked in Prompt 09 (Auth & User Management Architecture Alignment).
> Binding decision: `DECISIONS.md` #22. Implementation lands
> prompt-by-prompt: the invitation foundation, ADMIN account
> activation, and the activation UI → onboarding handoff (PROMPT-06,
> DECISIONS #25) exist; platform identity, invitation creation UI, and
> the STAFF activation workflow are pending.

**One authentication system.** Better Auth is the single authentication
layer for ALL human users — Platform Operators, Business ADMINs, and
Business STAFF. Authentication answers "Who are you?"; authorization answers
"What are you allowed to access?". There is no separate authentication
system for platform users, business users, or staff, and no second auth
provider.

**Two authorization scopes.**

1. **PLATFORM** — platform-level access (Platform Operator / Founder).
2. **BUSINESS** — access scoped to one Business tenant.

Platform-level access is NOT a Business role. The Platform Operator
(Founder / Super User) is a platform-level identity, NOT a Business User,
and MUST NOT be represented by `UserRole.ADMIN` or `UserRole.STAFF`. The
Founder Side UI remains outside Spec A and belongs conceptually to the
future Spec B Founder Side.

**Business roles remain `ADMIN` and `STAFF` only** (DECISIONS #02):

- `ADMIN` — controls Business settings, services, knowledge, team,
  conversations, appointments, customers. Invites STAFF.
- `STAFF` — works operationally inside the Business: handles
  assigned/allowed conversations, works appointments; does not manage
  Business settings or team.

**Invitation-first account creation (current pilot stage).** The primary
account-creation flow is:

```
Platform Operator
  → provision Business
  → invite initial ADMIN
  → ADMIN accepts invitation
  → ADMIN sets password / activates account
  → ADMIN completes Business onboarding
  → Business becomes operational
  → ADMIN invites STAFF
  → STAFF accepts + activates
```

There is NO approval workflow — the Platform Operator already decided by
provisioning the Business/Pilot. **Invitation is a FlowPilot domain
concept** (own model and lifecycle, documented in `DATABASE.md`) — it is NOT
a replacement for Better Auth and NOT part of its configuration. Public
self-sign-up is NOT the primary flow for the current pilot stage, but the
architecture must not prevent enabling it later as a separate
acquisition/provisioning mode after PMF.

**Tenancy & authorization rules (non-negotiable):**

1. Business data remains tenant-scoped by `businessId`.
2. Business ADMIN/STAFF may access only their Business.
3. UI visibility is NOT an authorization mechanism.
4. Server-side authorization is mandatory.
5. Repositories remain the only Prisma consumers.
6. Platform access must never be inferred simply from `businessId = null`.
7. Platform access must use an explicit platform-level authorization marker.
8. Do NOT introduce a general-purpose RBAC engine.
9. Do NOT introduce granular permissions in Spec A.
10. Do NOT introduce organizations/membership frameworks unless later
    evidence requires them.

Conceptual account model, Invitation model, and lifecycles:
`DATABASE.md → Target Authorization / Invitation Model`. Implementation
status: the Invitation model, creation, acceptance, and ADMIN account
activation (Better Auth identity + Business ADMIN membership) are
implemented at the service layer, and the ADMIN activation UI
(`/invite/[token]`, composing acceptance + activation with a safe
sign-in → onboarding handoff) is implemented (PROMPT-06); the Platform
Operator identity / platform-level marker (`accountType`
discriminator), invitation creation UI, token delivery, and the STAFF
activation workflow remain planned.

## Database Philosophy

- **Single shared Postgres**, tenant isolation via `businessId` on every
  domain row — sufficient for pilot scale; no RLS/multi-schema yet.
- UUID primary keys everywhere; `createdAt`/`updatedAt` on every table.
- Soft deletes (`deletedAt`) where history matters; repositories always filter
  `deletedAt: null`. Details: `docs/DATABASE.md`.
- Schema changes only via Prisma migrations (`pnpm db:migrate`), never
  `db push` against shared environments without notice.

## State Management Philosophy

- Server data belongs to **TanStack Query** (cache, retries, invalidation).
- Local form state belongs to React Hook Form.
- **No Redux/Zustand/global stores.** If two distant components share state,
  lift it to the route or a query key — not to a global store.
- Optimistic updates allowed later for conversation replies only.

## PWA Philosophy

- Installable, Arabic-first (`dir: rtl` manifest), standalone display.
- Service worker caches immutable static assets (cache-first) and falls back
  to an offline page for navigations; API traffic is never cached.
- Offline-first booking flows are a future consideration, not current scope.

## Design System

Documented separately in `DESIGN_SYSTEM.md`; implemented via tokens in
`src/app/globals.css` (colors, radii, shadows, z-index scale, animation
scale, status colors).

## Future Scalability Notes

When pilot volume justifies it (not before):

1. Per-vertical copy/template packs loaded from the vertical registry (Spec B)
2. Read replicas or Neon branching for analytics queries (Spec C)
3. WhatsApp provider abstraction behind one interface if provider changes
4. Job queue for reminders — start with Vercel Cron, not Kafka

These are notes, not commitments. Do not pre-build them.

## Forbidden Architectural Changes

Without explicit human approval recorded in `DECISIONS.md`:

- ❌ Microservices / service splitting
- ❌ Event bus / Kafka / RabbitMQ / external queues
- ❌ Additional databases, ORMs, or query engines
- ❌ GraphQL / tRPC / additional API layers (server actions + route handlers suffice)
- ❌ Global client state libraries (Redux, Zustand, MobX)
- ❌ CSS frameworks beyond Tailwind / component libs beyond shadcn/ui
- ❌ Replacing Better Auth or Prisma
- ❌ Any infrastructure (containers, k8s, self-hosting) beyond Vercel + Neon
- ❌ Premature optimization: caching layers, CDNs beyond Vercel defaults,
  rate limiting services — until real load demands it

Rationale: speed of iteration beats theoretical scalability during discovery.
