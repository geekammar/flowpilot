# FlowPilot — Architecture

> Technical architecture reference. Read together with `SPEC_A.md` and
> `BUILD_STATE.md`. Last updated: Prompt 03.

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
