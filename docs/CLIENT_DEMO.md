# FlowPilot — Client Demo Package

> Everything needed to demo FlowPilot to a prospect: the URL, the credentials,
> what to show, and what to say. Setup how-to for the operator:
> `VERCEL_DEPLOYMENT.md` (Section 0 — deploy in < 5 min) · detailed walkthrough
> for the operator's own practice: `DEMO_GUIDE.md` · timed sales talk track:
> `DEMO_SCRIPT.md`.

## SECTION 1 — Demo URL

| Environment | URL                                                             | Use for                                                                                        |
| ----------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Production  | `https://<your-app>.vercel.app` _(fill in after `pnpm deploy`)_ | **All prospect demos — always this one**                                                       |
| Preview     | `https://<preview-hash>.<your-app>.vercel.app`                  | Internal checks only — **auth may not work** (session cookies are bound to the production URL) |

Before every demo, confirm the deployment is alive:

```
https://<your-app>.vercel.app/api/health
→ { "status": "ok", "deploymentReady": true, "database": "connected", … }
```

`deploymentReady: false` = fix before the demo (most often: Neon database
suspended — wake it in the Neon console, then re-check).

## SECTION 2 — Demo Credentials

| Role              | Email                 | Password     | Who they are (demo business عيادة الابتسامة، كفر الشيخ) |
| ----------------- | --------------------- | ------------ | ------------------------------------------------------- |
| Admin (owner)     | `admin@flowpilot.app` | `Admin@1234` | د. سارة محمود الشريف — طبيبة الأسنان المالكة            |
| Staff (reception) | `staff@flowpilot.app` | `Staff@1234` | نورهان السيد — موظفة الاستقبال                          |

> Demo accounts live only on databases seeded with the demo dataset
> (`DEMO_MODE="true"`, or `pnpm db:seed`). Never use them on a real pilot's
> production database.

## SECTION 3 — Suggested Walkthrough (5 minutes)

1. **Sign in** as admin (`/sign-in`) — the interface is fully Arabic, RTL,
   mobile-first. Open it on the prospect's phone for maximum effect.
2. **Dashboard (30s)** — read the four numbers out loud: today's
   conversations, threads needing a human decision (`تحتاج تدخلاً`), pending
   appointments, today's agenda. That's "your day in one screen".
3. **Conversations (2 min)** — open المحادثات:
   - AI answering alone (فاطمة — price question, status AI_ACTIVE)
   - Human handoff (نورهان — reschedule request, status NEED_HUMAN, unassigned):
     press "تكفّل بالمحادثة" and reply as staff — the reply lands instantly
   - Emergency handled (عمر — toothache at 8pm urgent slot)
4. **Appointments (1 min)** — open المواعيد: today's agenda of 4 appointments;
   confirm the pending one with a single tap (optimistic update).
5. **Back to the dashboard (30s)** — the numbers you just acted on have
   changed. "This is 3 minutes of work from your phone."
6. _(Optional)_ Show that a staff login exists — one sentence, don't switch
   accounts live.

## SECTION 4 — What To Show First

**The dashboard stat cards, before any explanation.** The line that sells:

> "عندك ٥ محادثات محتاجة قرار منك، و٤ مواعيد النهاردة — كله من غير ما تفتح واتساب."

(The demo dataset guarantees the dashboard is alive: ~11 conversations today,
5 NEED_HUMAN, 4 appointments today.) Never start with settings, screens that
are "coming", or architecture talk. Outcome first, product second.

## SECTION 5 — Typical Client Questions

| Question (AR)                       | Answer                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| "الـ AI هيتكلم غلط باسمي؟"          | الحساس بيتحوّل ليك تلقائيًا (يحتاج تدخلاً) — انت بتاع القرار، والمساعد بيرد بس على الأسئلة اللي انت حاطط إجاباتها. |
| "أنا مش بعرف أستخدم برامج"          | شفت الرحلة كلها في ٥ دقايق — البرنامج عربي، من الموبايل، ومش محتاج تدريب.                                          |
| "عميلي بيفضل الكلام معايا"          | وهيكمصل معاك — المساعد بيسأل ويحجز ويلخّص، وأي حاجة حساسة بتوصلك فورًا.                                            |
| "بيحصل تعارض في المواعيد؟"          | النظام بيمنع حجز موعد فوق موعد — لو فيه تعارض هيقلك فورًا.                                                         |
| "هينفع لصالون/مركز/عيادة؟"          | نفس النظام بيشتغل لأي نشاط بيعتمد على مواعيد — البيانات اللي شفتها عيادة أسنان، لكن النظام نفسه عام.               |
| "هو ده رد آلي؟" (about AI messages) | أيوه — رد مظبوط من معلومات منشأتك أنت اللي دخلتها.                                                                 |
| "الدوايت والبيانات بتاعتي فين؟"     | على قاعدة بيانات خاصة بيك — تقدر تطلب نسخة من عملائك في أي وقت.                                                    |
| "هو بيشتغل على الواتساب بتاعي؟"     | أيوه — بنفعّله على رقم الواتساب الخاص بالشغل خلال يوم واحد.                                                        |

## SECTION 6 — Recommended Sales Flow

1. **Before the meeting:** `pnpm deploy:check` → READY · `/api/health` →
   `deploymentReady: true` · demo data seeded fresh (`DEMO_MODE=true` keeps
   "today" activity current) · session already signed in on your device.
2. **Open on their phone** (PWA installs in ~30 seconds) — the product feels
   like _their_ app immediately.
3. Run the walkthrough (Section 3). Talk outcomes, not features.
4. Handle objections with Section 5. Don't apologize for AI messages — they're
   the product.
5. **Close with the value line:**
   > "كل رسالة واتساب بتتحول لحجز مؤكد، واللي محتاجك بيوصللك فورًا — انت
   > بتحوّل رسايل ضايعة لمواعيد، وبتربح وقت الرد اليدوي."
6. Ask for the pilot right there (Section 7).

## SECTION 7 — Next Steps After Demo

1. **Ask for the work WhatsApp number** — "لو عندك رقم واتساب خاص بالشغل،
   نقدر نفعّل النظام عليه خلال يوم."
2. **Offer a 30-day paid pilot** (manual invoicing — no billing inside the
   product yet). Agree a start date on the spot.
3. **Log the evidence** (pilot registry comes in Spec B — for now: who, which
   vertical, objections, price reaction).
4. **Within 24h:** re-seed the demo dataset if you'll demo to another
   prospect (`DEMO_MODE=true` + `pnpm deploy:check`, or `pnpm db:seed`), so
   "today" numbers stay realistic.
5. **Do NOT** start customizing features per prospect during discovery — log
   requests instead (`PRODUCT_STRATEGY.md`).
