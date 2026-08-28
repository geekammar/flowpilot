# FlowPilot — Product Glossary

> Canonical project terminology. Use these terms (and their Arabic labels) in
> code, UI copy, and documentation. Do not invent synonyms.
> Last updated: Prompt 03.

| Term             | Arabic              | Definition                                                                                                                                                                                     |
| ---------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Business**     | المنشأة             | A tenant of FlowPilot: one appointment-based company with its own services, team, customers, conversations, and appointments. Identified by `businessId` on every domain row.                  |
| **Customer**     | العميل              | An end customer of a Business — the person whose WhatsApp messages become bookings. Unique within a Business by phone number.                                                                  |
| **Conversation** | المحادثة            | The WhatsApp thread between a Business and one Customer inside FlowPilot. Carries exactly one status (see below).                                                                              |
| **Message**      | الرسالة             | One immutable entry in a Conversation. Sender is `CUSTOMER`, `AI`, or `STAFF`. Messages are never edited or deleted.                                                                           |
| **Appointment**  | الموعد              | A booking linking one Customer to one Service at a date/time, optionally assigned to staff. Follows the status lifecycle `PENDING → CONFIRMED → COMPLETED` with `CANCELLED` / `NO_SHOW` exits. |
| **Service**      | الخدمة              | A bookable offering of a Business (name + duration in minutes). Only active services can be booked.                                                                                            |
| **Admin**        | مدير                | Business owner-level user (`ADMIN`). Full control: business setup, services, knowledge, team management, all conversations.                                                                    |
| **Staff**        | موظف                | Employee-level user (`STAFF`). Works their own agenda and assigned conversations. No business settings or team management.                                                                     |
| **Need Human**   | يحتاج تدخلاً بشرياً | Conversation status (`NEED_HUMAN`) meaning the AI paused and requires a staff member to take over. Mandatory hand-off path — see DECISIONS.md #03.                                             |
| **AI Active**    | المساعد الذكي نشط   | Conversation status (`AI_ACTIVE`) meaning the assistant is managing the thread autonomously within policy.                                                                                     |
| **Booked**       | محجوز               | Conversation status (`BOOKED`) meaning the conversation produced a confirmed appointment. Thread stays for context/history.                                                                    |
| **Incomplete**   | غير مكتملة          | Conversation status (`INCOMPLETE`) meaning intent existed but booking was not completed (customer dropped off or data missing).                                                                |
| **No-show**      | لم يحضر             | Appointment status (`NO_SHOW`): customer confirmed but did not attend. Tracked as ROI evidence.                                                                                                |
| **Completed**    | مكتمل               | Appointment status (`COMPLETED`): service delivered successfully.                                                                                                                              |

## Related System Terms

| Term                 | Definition                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Spec A**           | Current frozen scope: Discovery Foundation + Booking Core. See `SPEC_A.md`.                                                                             |
| **Vertical**         | A category of appointment-based business (dental, beauty, coach, gym, education, service). FlowPilot itself remains vertical-agnostic during discovery. |
| **Pilot**            | A real Business using FlowPilot under the discovery strategy; success evidence source.                                                                  |
| **Need Human queue** | Dashboard surface listing all `NEED_HUMAN` conversations awaiting staff action.                                                                         |

Language rule: UI copy uses the Arabic column; code identifiers use the
English term (e.g., enum `NEED_HUMAN`, model `Appointment`).
