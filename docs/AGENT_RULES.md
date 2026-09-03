# FlowPilot — Agent Rules (Mandatory)

> Binding rules for every AI agent (and human contributor) working on
> FlowPilot. Ignorance of these rules is not an excuse; they exist so that any
> agent can continue the project safely after all context is lost.
> Last updated: PROMPT-05B (tiered context-loading model).

## Before Making Any Changes

Load the Tier 0 context (always, in order — full procedure:
`CONTEXT_RECOVERY.md`, doc map: `DOCS_INDEX.md`):

1. `docs/CORE_CONTEXT.md` — compact orientation (derived, never overrides
   canonical files)
2. `docs/BUILD_STATE.md` — what exists and what is next (ledger)
3. `docs/DECISIONS.md` — accepted decisions (binding)
4. `docs/AGENT_RULES.md` — this file

Then load Tier 1/2 files **only as the task requires**, selected via
`docs/DOCS_INDEX.md` (e.g., product work → `SPEC_A.md`; any code →
`ARCHITECTURE.md`; DB work → `DATABASE.md`; UI work → `DESIGN_SYSTEM.md`;
deployment → Vercel/deployment docs). Never skip `BUILD_STATE.md` or
`DECISIONS.md`; never treat `CORE_CONTEXT.md` as authoritative; never
delete documentation merely for context reduction.

Then read `docs/BUILD_STATE.md → Next Step` and do exactly that. Caution:
older docs may contain obsolete instructions (e.g., building public
self-sign-up — superseded in Prompt 09 by the invitation-first model,
DECISIONS #22). `DECISIONS.md` and `BUILD_STATE.md` win over any older
wording; if a conflict is unclear, escalate instead of guessing.

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

1. **Read the Tier 0 context first** (see "Before Making Any Changes"),
   then the Tier 1/2 files the current task needs (via `DOCS_INDEX.md`).
2. **Inspect the current implementation** before changing anything.
3. **Plan** against `BUILD_STATE.md → Next Step`; never rebuild completed
   work. Produce a concise plan and a TODO list before editing.
4. **Implement** ONLY the current prompt's scope, following
   `ARCHITECTURE.md` dependency rules.
5. **Verify** with the full quality gate command list.
6. **Update the docs** — `BUILD_STATE.md` always (new prompt section +
   refreshed "Next Step"); `DECISIONS.md` when a decision was made (append
   only, never overwrite historical decisions).
7. **Report the final status honestly** — distinguish what was BUILT in
   code from what was only DOCUMENTED or NOT built.
8. Leave the repository in a state where the next agent can continue by
   reading the Tier 0 context alone.

## Escalation Path

If a task seems to require something marked ❌ above or outside `SPEC_A.md`,
STOP. Record the request as a candidate decision in your response to the
human operator and wait for approval. Approved changes get a `DECISIONS.md`
entry before implementation begins.
