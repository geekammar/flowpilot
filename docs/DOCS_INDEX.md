# FlowPilot — Documentation Index

> Context-loading map (created by PROMPT-05B). Use this file to decide
> which documentation a task actually needs — do NOT open every file.
> Tier model: **0** always read · **1** read when the task touches the
> topic · **2** operational/specialized (read only for that task type) ·
> **3** historical/reference (never required for engineering sessions;
> preserved, not deleted). Authority: `canonical` = source of truth ·
> `derived` = summary of canonical files · `operational` = procedure ·
> `historical` = point-in-time record.

## Tier 0 — Always Read

| File            | Purpose                           | Read When            | Authority |
| --------------- | --------------------------------- | -------------------- | --------- |
| CORE_CONTEXT.md | Compact orientation summary       | Every session, first | derived   |
| BUILD_STATE.md  | Implementation ledger + next step | Every session        | canonical |
| DECISIONS.md    | Accepted decisions (append-only)  | Every session        | canonical |
| AGENT_RULES.md  | Binding agent behavior            | Every session        | canonical |
| DOCS_INDEX.md   | This file — doc navigation        | When selecting docs  | derived   |

## Tier 1 — Read When Relevant

| File                            | Purpose                                        | Read When                     | Authority             |
| ------------------------------- | ---------------------------------------------- | ----------------------------- | --------------------- |
| PROJECT_VISION.md               | Product identity, what NOT to build            | Any scope/product decision    | canonical             |
| PRODUCT_STRATEGY.md             | Market strategy, success metrics               | Strategy/prioritization work  | canonical             |
| ARCHITECTURE.md                 | Stack, patterns, auth model, forbidden changes | Any code work                 | canonical             |
| SPEC_A.md                       | Frozen current scope                           | Any product feature work      | canonical             |
| ROADMAP.md                      | Spec sequence + exit criteria                  | Planning / next-spec work     | canonical             |
| DATABASE.md                     | Data model, lifecycles, repositories, seeding  | DB/schema/repository work     | canonical             |
| DESIGN_SYSTEM.md                | Design rules, tokens, a11y                     | UI work                       | canonical             |
| PRODUCT_GLOSSARY.md             | Canonical terms + Arabic labels                | Writing copy/code identifiers | canonical             |
| FLOWPILOT_UX_IMPROVEMENTS_14.md | UX plan + P0/P1/P2 priorities                  | UX/UI feature work            | operational           |
| CONTEXT_RECOVERY.md             | Detailed cold-start procedure                  | Resuming with zero context    | canonical (procedure) |
| CURRENT_STATE.md                | Evergreen 30-second snapshot                   | Quick orientation (derived)   | derived               |
| PROJECT_STATUS.md               | Point-in-time status snapshot                  | Status review (derived)       | derived               |
| PROJECT_README.md               | Executive overview for newcomers               | Onboarding a new dev/agent    | derived               |

## Tier 2 — Operational / Specialized

| File                     | Purpose                               | Read When                    | Authority   |
| ------------------------ | ------------------------------------- | ---------------------------- | ----------- |
| ENVIRONMENT_SETUP.md     | First-run setup (all OS incl. Termux) | Environment bootstrap        | operational |
| LOCAL_DEVELOPMENT.md     | Daily dev workflow                    | Day-to-day development       | operational |
| QUALITY_CHECKS.md        | Verification command map              | Before finishing any work    | operational |
| TROUBLESHOOTING.md       | Symptom → fix                         | When something breaks        | operational |
| ENVIRONMENT_VARIABLES.md | Env var reference                     | Env configuration            | operational |
| RELEASE_PROCESS.md       | Tagged-release steps                  | Making a release             | operational |
| GITHUB_WORKFLOW.md       | GitHub repo conventions               | Releases / collaboration     | operational |
| VERCEL_DEPLOYMENT.md     | Full deployment guide                 | Deployment work              | operational |
| VERCEL_QUICK_DEPLOY.md   | Deploy in < 5 minutes                 | Deployment work              | operational |
| DEPLOYMENT_STATUS.md     | Deployment readiness snapshot         | Deployment status check      | operational |
| DEMO_GUIDE.md            | Demo logins + scenarios               | Running a demo               | operational |
| DEMO_SCRIPT.md           | Timed 5-minute sales script           | Prospect demos               | operational |
| CLIENT_DEMO.md           | Prospect-facing demo package          | Sharing a demo with a client | operational |

## Tier 3 — Historical / Reference (preserved; not session context)

| File                         | Purpose                           | Origin             | Authority  |
| ---------------------------- | --------------------------------- | ------------------ | ---------- |
| PROJECT_AUDIT.md             | Run/reproducibility audit         | Ops 01, 2026-08-27 | historical |
| VERCEL_AUDIT.md              | Vercel readiness audit            | Ops 04, 2026-08-28 | historical |
| DEPLOYMENT_REPORT.md         | Deployment-readiness report       | Ops 04, 2026-08-28 | historical |
| PILOT_DISTRIBUTION_AUDIT.md  | Distribution pre-change audit     | Ops 06, 2026-08-29 | historical |
| PILOT_DISTRIBUTION_REPORT.md | Distribution final report         | Ops 06, 2026-08-29 | historical |
| RELEASE_REPORT.md            | v0.1.0 release-engineering report | Ops 03, 2026-08-27 | historical |

Historical sections of `BUILD_STATE.md` (per-prompt records) and all
`DECISIONS.md` entries are equally historical — read the tail sections for
current state, not the whole ledger, when only orientation is needed.

## Reading Policy (binding — see AGENT_RULES.md)

1. Always load Tier 0.
2. Load Tier 1/2 files only when the task requires them (use this index).
3. `CORE_CONTEXT.md` is derived and must never override canonical files.
4. Never skip `BUILD_STATE.md` or `DECISIONS.md`.
5. Never delete documentation merely for context reduction.
