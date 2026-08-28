# FlowPilot — Roadmap

> Sequential spec plan. Each spec is frozen before the next begins.
> Last updated: Prompt 03.

## Spec A — Discovery Foundation + Booking Core (CURRENT)

**Goal:** a pilot-ready generic engine that proves daily usefulness for one
business at a time.

**Contents:** Login · Onboarding · Business Setup · Services · Availability ·
Business Knowledge · Dashboard · Conversations · Appointments · Team ·
Customers.

Full screen list: `SPEC_A.md`. Status tracking: `BUILD_STATE.md`.

**Exit criteria:**

- A real business can be onboarded in < 1 day using the app alone.
- A conversation can flow: customer message → AI/staff reply → booked,
  confirmed appointment.
- Owner can see today's agenda and act on `NEED_HUMAN` threads.

---

## Spec B — Evidence Layer + Founder Side

**Goal:** turn pilot operations into structured, comparable evidence.

### Contents

1. **Pilot Tracking**
   - Pilot registry: business, vertical, start date, plan price, status
     (trial/paid/churned)
   - Weekly check-in log per pilot

2. **ROI Tracking**
   - Baseline vs. current metrics: recovered bookings, response time,
     no-show rate
   - Simple monthly ROI statement per pilot

3. **Vertical Registry**
   - First-class "vertical" records (dental, beauty, coach, gym, education,
     services) attached to pilots/businesses
   - Vertical-scoped copy/template packs (still no vertical UI forks)

4. **Evidence Logging**
   - Structured event log: onboarding steps completed, objections raised,
     feature requests, churn reasons
   - Exportable evidence timeline per vertical

5. **Founder Side**
   - Cross-pilot founder dashboard (read-only over the same database)
   - Founder-only route group; no new infrastructure

**Explicitly still excluded:** billing automation, payments, public API.

**Exit criteria:** the founder can answer "which vertical is winning and why?"
from the product, not from memory.

---

## Spec C — Vertical Discovery Engine

**Goal:** make the vertical decision data-driven and repeatable.

### Contents

1. **Vertical Scoring**
   - Composite score per vertical from Decision Criteria in
     `PRODUCT_STRATEGY.md` (paid pilots, renewal, ROI, onboarding repeatability)

2. **WTP Tracking**
   - Willingness-to-pay signals: accepted/rejected prices, discount pressure,
     renewal friction per vertical

3. **Feature Clustering**
   - Group logged feature requests/objections by vertical to reveal
     vertical-specific needs worth productizing after the verdict

4. **Decision Center**
   - Guided comparison of verticals against Decision Criteria
   - Recommendation output: double-down / iterate / drop, with evidence links

**Exit criteria:** a documented, evidence-backed choice of the winning
vertical, ready for the verticalization plan in `PRODUCT_STRATEGY.md`.

---

## Beyond Spec C (unplanned, do not start)

- Geographic expansion playbook
- Vertical-specific deepening (e.g., dental recall cycles)
- Automated reminders / notifications
- Public API — only if a paying partner demands it

Nothing here may be built without a scope decision recorded in
`DECISIONS.md`.
