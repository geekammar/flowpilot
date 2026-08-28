# FlowPilot — Context Recovery

> Exact procedure for any agent resuming work with zero prior context.
> Follow the steps literally, in order. Last updated: Prompt 03.

## Recovery Process

1. **Read all memory files** in `docs/`:
   `PROJECT_VISION.md`, `PRODUCT_STRATEGY.md`, `ARCHITECTURE.md`,
   `DESIGN_SYSTEM.md`, `SPEC_A.md`, `ROADMAP.md`, `DECISIONS.md`,
   `BUILD_STATE.md`, `AGENT_RULES.md`, `PRODUCT_GLOSSARY.md`.
2. **Read `BUILD_STATE.md` carefully.** It lists every completed prompt and
   its generated files. Everything listed there EXISTS — verify only if you
   doubt it (`ls`, quick grep), never rebuild.
3. **Find the unfinished roadmap item:** check `BUILD_STATE.md → Next Step`
   and cross-reference with `ROADMAP.md` / `SPEC_A.md` for scope.
4. **Continue from the next prompt.** Implement only that item.
5. **Do not rebuild completed work.** Existing components, tokens,
   repositories, and configs are assets — extend them.
6. **Do not redesign architecture.** The stack, patterns, and forbidden
   changes are fixed in `ARCHITECTURE.md`.
7. **Preserve all accepted decisions** in `DECISIONS.md`. If a task appears
   to contradict one, stop and escalate instead of violating it.

## Environment Setup (fresh machine)

```bash
pnpm install
cp .env.example .env      # fill DATABASE_URL, BETTER_AUTH_SECRET, URLs
pnpm db:generate          # regenerate Prisma client into src/generated
pnpm lint && pnpm typecheck && pnpm build   # confirm healthy baseline
```

If migrations are missing on a new database:
`pnpm db:migrate` then `pnpm db:seed`.

## Sanity Checks After Recovery

- `src/lib/env.ts` throws with Arabic-labeled errors if `.env` is wrong → fix
  env before anything else.
- Route groups exist under `src/app/(auth|app|admin|staff)`.
- Repositories in `src/server/repositories/` compile against
  `src/generated/prisma` — if types fail, run `pnpm db:generate`.

## When Finished

Update `BUILD_STATE.md` (+ `DECISIONS.md` if applicable) so the NEXT recovery
is as easy as this one. See `AGENT_RULES.md → Prompt Lifecycle Process`.
