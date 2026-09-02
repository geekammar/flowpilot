# FlowPilot — UX Improvements Plan

> UX improvement plan and priorities. Created in Prompt 09 (Auth & User
> Management Architecture Alignment) — this file did not exist before that
> prompt; it records the agreed UX framing and priorities after the auth
> architecture change. Keep the plan **vertical-agnostic** (see
> `PROJECT_VISION.md`). Binding auth decision: `DECISIONS.md` #22.

## Current Pilot Flow (Authentication Framing)

The current pilot account flow is **invitation-first**:

```
Login (sign-in)
  ↓
Invitation / account activation
  ↓
Business onboarding
  ↓
Dashboard
```

- Public self-sign-up is NOT the primary pilot flow (DECISIONS #22).
- The Platform Operator provisions the Business and invites the initial
  ADMIN; the ADMIN accepts, activates the account, completes onboarding,
  and later invites STAFF.
- Future self-sign-up may return as a separate self-serve acquisition mode
  after PMF; the architecture must not prevent it.

## Scope Clarifications

- The **Onboarding implementation already exists** (six-screen wizard,
  Prompt 04). Future work is to **refine/reconnect it** with the
  invitation-based lifecycle — NOT to build it from zero.
- **Onboarding UX improvements remain in scope.**
- **Smart Agenda / Create Appointment improvements remain planned.**
- **Settings / Team / Customers remain planned.** Team management will
  eventually include the STAFF invitation UX (after the invitation
  foundation exists).
- No UX was implemented by the documentation-alignment prompt itself.

## Priorities

Priorities reflect reality: nothing already completed is listed as "build
from zero". Intended order after the auth architecture alignment:

### P0

1. Account / Invitation foundation (activation UX: accept invitation, set
   password, activate account)
2. Onboarding refinement (reconnect the existing wizard with the
   invitation-based lifecycle)
3. Smart Agenda
4. Create Appointment

### P1

1. Business Settings
2. Team
3. Customers
4. Needs Attention

### P2

1. Dashboard refinement
2. Mobile polish
3. Accessibility / states / micro-interactions

## Rules

- Arabic-first, RTL-first (DECISIONS #07); use the Arabic column of
  `PRODUCT_GLOSSARY.md` for UI copy.
- Follow the design system (`DESIGN_SYSTEM.md`); no new UI frameworks.
- Human-in-the-loop defaults stay visible in every conversational surface
  (DECISIONS #03).
