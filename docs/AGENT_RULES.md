# FlowPilot — Agent Rules (Mandatory)

> Binding rules for every AI agent (and human contributor) working on
> FlowPilot. Ignorance of these rules is not an excuse; they exist so that any
> agent can continue the project safely after all context is lost.
> Last updated: PROMPT-13.5 (tiered doc-loading model, minimal-ledger rule).

## Before Making Any Changes

Load the Tier 0 context (always, in order — navigation map:
`DOCS_INDEX.md`):

1. `docs/CORE_CONTEXT.md` — compact orientation (derived; canonical files
   always override it)
2. `docs/BUILD_STATE.md` — the ONE current-state document + next step
3. `docs/DECISIONS.md` — accepted decisions (binding, append-only)
4. `docs/AGENT_RULES.md` — this file

Then load Tier 1 files ONLY when the task touches their topic, and Tier 2
files ONLY for operational tasks, selected via `docs/DOCS_INDEX.md`
(e.g., product work → `SPEC_A.md`; any code → `ARCHITECTURE.md`; DB work →
`DATABASE.md`; UI work → `UX.md`; deployment → `VERCEL_DEPLOYMENT.md`).
Never skip `BUILD_STATE.md` or `DECISIONS.md`; never treat
`CORE_CONTEXT.md` or `DOCS_INDEX.md` as authoritative; do not read
historical prompt reports automatically — they live in Git history only.

Then read `docs/BUILD_STATE.md → Next Step` and do exactly that. Caution:
older wording anywhere may be obsolete; `DECISIONS.md` and `BUILD_STATE.md`
win over any other file. If a conflict is unclear, escalate instead of
guessing.

## NEVER

- ❌ Add features outside `SPEC_A.md` scope (log requests in Spec B evidence
  later instead of building them)
- ❌ Redesign architecture or change stack choices recorded in
  `ARCHITECTURE.md` / `DECISIONS.md`
- ❌ Introduce complexity: no microservices, event buses, queues, global
  stores, new ORMs, extra API layers, new UI frameworks
- ❌ Add infrastructure not approved in `ARCHITECTURE.md` (Vercel + Neon only)
- ❌ Modify or delete historical entries in `DECISIONS.md`
- ❌ Redo or reimplement completed work recorded in `BUILD_STATE.md`
  ("if it works, leave it")
- ❌ Break RTL/Arabic-first behavior or accessibility guarantees
- ❌ Commit secrets or real credentials; `.env` stays local
- ❌ Skip verification: `pnpm lint && pnpm typecheck && pnpm format:check &&
pnpm build` must pass before finishing a prompt
- ❌ Delete or merge documentation for context reduction without an audit
  (PROMPT-13.5 is the precedent — audit first, then consolidate)
- ❌ Recreate duplicate documentation: no second current-state/status doc
  (`BUILD_STATE.md` is the only one), no new per-prompt reports, no
  competing summaries of canonical files

## ALWAYS

- ✅ Update `BUILD_STATE.md` after every prompt — MINIMALLY: status,
  completed work (one entry), known issues, next step. It is a ledger, not
  a diary; historical implementation detail belongs to Git history
- ✅ Update `DECISIONS.md` when a new decision is made (append-only)
- ✅ Create a new markdown document ONLY when there is a real long-term
  need and no canonical file covers the topic
- ✅ Preserve strategy: when in conflict, vision > strategy > scope >
  implementation detail
- ✅ Keep feature isolation, repository-only DB access, Zod-validated DTOs
- ✅ Write Arabic-first, vertical-agnostic UI copy (rules: `UX.md`)
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
6. **Update the docs** — `BUILD_STATE.md` always (minimal update: new
   completed-work entry + known issues + refreshed Next Step);
   `DECISIONS.md` when a decision was made (append only, never overwrite
   historical decisions).
7. **Report the final status honestly** — distinguish what was BUILT in
   code from what was only DOCUMENTED or NOT built.
8. Leave the repository in a state where the next agent can continue by
   reading the Tier 0 context alone.

## Escalation Path

If a task seems to require something marked ❌ above or outside `SPEC_A.md`,
STOP. Record the request as a candidate decision in your response to the
human operator and wait for approval. Approved changes get a `DECISIONS.md`
entry before implementation begins.
