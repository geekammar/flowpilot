# FlowPilot — Context Recovery

> Exact procedure for any agent resuming work with zero prior context.
> Follow the steps literally, in order. Tiered model since PROMPT-05B;
> full doc map: `DOCS_INDEX.md`.

## Recovery Process (tiered)

1. **Read `docs/CORE_CONTEXT.md`** — compact orientation: what FlowPilot
   is, strategy, spec, architecture, auth model, state, next step.
2. **Read `docs/BUILD_STATE.md`** — the authoritative implementation
   ledger. The "Current State Summary" (end of file) and the latest
   prompt sections carry the current position; everything listed there
   EXISTS — verify only if you doubt it (`ls`, quick grep), never rebuild.
3. **Read `docs/DECISIONS.md`** — accepted decisions, binding,
   append-only. Reversals require a new entry, never an edit.
4. **Read `docs/AGENT_RULES.md`** — binding agent behavior and reading
   policy.
5. **Determine the task.** What is the current prompt asking for?
6. **Use `docs/DOCS_INDEX.md`** to identify ONLY the Tier 1/2 files the
   task actually needs (e.g., DB work → `DATABASE.md`; UI work →
   `SPEC_A.md` + `DESIGN_SYSTEM.md` + `FLOWPILOT_UX_IMPROVEMENTS_14.md`;
   deployment → the Vercel/deployment docs). Do not open every file.
7. **Read those files.**
8. **Implement exactly `BUILD_STATE.md` → Next Step** (or the current
   prompt's scope if the operator instructed otherwise). Do not rebuild
   completed work; do not redesign architecture (fixed in
   `ARCHITECTURE.md`). If a task appears to contradict a decision, stop
   and escalate instead of violating it.

> **Authority rule:** canonical detailed files remain authoritative.
> `CORE_CONTEXT.md` is derived and must never override them. When docs
> conflict, the order is: latest accepted `DECISIONS.md` →
> `BUILD_STATE.md` → `CURRENT_STATE.md` / `PROJECT_STATUS.md` → other
> documentation → historical reports. Older docs may contain obsolete
> instructions (e.g., public self-sign-up — superseded by the
> invitation-first model, DECISIONS #22).

## Environment Setup (fresh machine)

```bash
pnpm install
cp .env.example .env.local   # fill DATABASE_URL, BETTER_AUTH_SECRET, URLs
                             # (.env.local is the preferred env file —
                             # DECISIONS #16; .env.local > .env precedence)
pnpm db:generate             # regenerate Prisma client into src/generated
pnpm lint && pnpm typecheck && pnpm build   # confirm healthy baseline
```

Full per-OS bootstrap (Windows/Linux/macOS/Termux): `ENVIRONMENT_SETUP.md`.
If migrations are missing on a new database: `pnpm db:migrate` then
`pnpm db:seed` (from desktop/CI — the Prisma schema engine cannot run on
Termux).

## Sanity Checks After Recovery

- `src/lib/env.ts` throws with Arabic-labeled errors if env is wrong → fix
  env before anything else.
- Route groups exist under `src/app/(auth|app|admin|staff)`.
- Repositories in `src/server/repositories/` compile against
  `src/generated/prisma` — if types fail, run `pnpm db:generate`.

## When Finished

Update `BUILD_STATE.md` (+ `DECISIONS.md` if applicable) so the NEXT
recovery is as easy as this one. See `AGENT_RULES.md → Prompt Lifecycle
Process`.
