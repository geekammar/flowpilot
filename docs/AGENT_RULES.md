# FlowPilot — Agent Rules (Mandatory)

> Binding rules for every AI agent (and human contributor) working on
> FlowPilot. Ignorance of these rules is not an excuse; they exist so that any
> agent can continue the project safely after all context is lost.
> Last updated: Prompt 03.

## Before Making Any Changes

Read, in order:

1. `docs/PROJECT_VISION.md` — what FlowPilot is and is not
2. `docs/PRODUCT_STRATEGY.md` — current market strategy and success metrics
3. `docs/ARCHITECTURE.md` — stack, patterns, forbidden changes
4. `docs/SPEC_A.md` — the frozen scope
5. `docs/ROADMAP.md` — what spec comes next
6. `docs/DECISIONS.md` — accepted decisions (binding)
7. `docs/BUILD_STATE.md` — what exists and what is next

Then read `docs/BUILD_STATE.md → Next Step` and do exactly that.

## NEVER

- ❌ Add features outside `SPEC_A.md` scope (log requests in Spec B evidence
  later instead of building them)
- ❌ Redesign architecture or change stack choices recorded in
  `ARCHITECTURE.md` / `DECISIONS.md`
- ❌ Introduce complexity: no microservices, event buses, queues, global
  stores, new ORMs, extra API layers, new UI frameworks
- ❌ Add infrastructure not approved in `ARCHITECTURE.md` (Vercel + Neon only)
- ❌ Modify or delete historical entries in `DECISIONS.md`
- ❌ Rewrite completed work listed in `BUILD_STATE.md` ("if it works, leave it")
- ❌ Break RTL/Arabic-first behavior or accessibility guarantees
- ❌ Commit secrets or real credentials; `.env` stays local
- ❌ Skip verification: `pnpm lint && pnpm typecheck && pnpm format:check &&
pnpm build` must pass before finishing a prompt

## ALWAYS

- ✅ Update `BUILD_STATE.md` after every prompt: status, completed work,
  generated files, known issues, next step
- ✅ Update `DECISIONS.md` when a new decision is made (append-only)
- ✅ Preserve strategy: when in conflict, vision > strategy > scope >
  implementation detail
- ✅ Keep feature isolation, repository-only DB access, Zod-validated DTOs
- ✅ Write Arabic-first, vertical-agnostic UI copy
- ✅ Ask/escalate instead of guessing when scope is ambiguous

## Prompt Lifecycle Process

Every future prompt/session MUST follow this lightweight process:

1. **Read memory files first** (the 7 files listed above).
2. **Plan** against `BUILD_STATE.md → Next Step`; never rebuild completed work.
3. **Implement** within scope, following `ARCHITECTURE.md` dependency rules.
4. **Verify** with the full quality gate command list.
5. **Update `BUILD_STATE.md`** (new prompt section + refreshed "Next Step").
6. **Update `DECISIONS.md`** if any decision was made — append only, never
   overwrite historical decisions.
7. Leave the repository in a state where the next agent can continue by
   reading memory files alone.

## Escalation Path

If a task seems to require something marked ❌ above or outside `SPEC_A.md`,
STOP. Record the request as a candidate decision in your response to the
human operator and wait for approval. Approved changes get a `DECISIONS.md`
entry before implementation begins.
