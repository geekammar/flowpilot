# FlowPilot — Documentation Index

> Navigation map ONLY (not a source of truth). Use it to decide which docs a
> task actually needs — do NOT open every file. Authority: `canonical` =
> source of truth · `derived` = summary of canonical files · `operational` = > procedure. Historical prompt reports are NOT in docs/ — they live in Git
> history only. Created by PROMPT-05B; reset by PROMPT-13.5.

## Tier 0 — ALWAYS read (cold start)

| File            | Purpose                          | Authority |
| --------------- | -------------------------------- | --------- |
| CORE_CONTEXT.md | Compact orientation (derived)    | derived   |
| BUILD_STATE.md  | Current-state ledger + next step | canonical |
| DECISIONS.md    | Accepted decisions (append-only) | canonical |
| AGENT_RULES.md  | Binding agent behavior           | canonical |
| DOCS_INDEX.md   | This file — doc navigation       | derived   |

## Tier 1 — read ONLY when task-relevant

| Task                       | Read                                              |
| -------------------------- | ------------------------------------------------- |
| Scope / product decisions  | `SPEC_A.md` (incl. spec sequence + exit criteria) |
| Any code work              | `ARCHITECTURE.md`                                 |
| DB / schema / repositories | `DATABASE.md`                                     |
| UI / UX work               | `UX.md`, `PRODUCT_GLOSSARY.md`                    |
| Strategy / prioritization  | `PRODUCT_STRATEGY.md`, `PROJECT_VISION.md`        |

## Tier 2 — OPERATIONS only (never cold-start context)

| Task                  | Read                                                |
| --------------------- | --------------------------------------------------- |
| Environment bootstrap | `ENVIRONMENT_SETUP.md`                              |
| Daily dev workflow    | `LOCAL_DEVELOPMENT.md`                              |
| Quality commands      | `QUALITY_CHECKS.md`                                 |
| Something broken      | `TROUBLESHOOTING.md`                                |
| Env var configuration | `ENVIRONMENT_VARIABLES.md`                          |
| Making a release      | `RELEASE_PROCESS.md`, `GITHUB_WORKFLOW.md`          |
| Deployment            | `VERCEL_DEPLOYMENT.md` (§0 = quick path)            |
| Running a demo        | `DEMO_GUIDE.md`, `DEMO_SCRIPT.md`, `CLIENT_DEMO.md` |

## Do NOT load during normal cold start

- Tier 1/2 files not relevant to the current task.
- Historical prompt reports, audits, and status snapshots — deleted from
  docs/ in the PROMPT-13.5 reset; recover via Git history
  (`git log --oneline`, `git show <sha>:docs/<file>.md`) if ever needed.
- Historical sections of `BUILD_STATE.md` no longer exist — the ledger holds
  current state only; Git history holds the per-prompt detail.

## Reading policy (binding — see `AGENT_RULES.md`)

1. Always load Tier 0 (all five files, CORE_CONTEXT first).
2. Load Tier 1/2 only when the task requires them (use this index).
3. Canonical files override derived summaries (`CORE_CONTEXT`, this file).
4. Never skip `BUILD_STATE.md` or `DECISIONS.md`.
5. Never delete or merge documentation for context reduction without an
   audit (the PROMPT-13.5 audit is the precedent).
6. Do not recreate duplicate current-state/status documents —
   `BUILD_STATE.md` is the only one.
