# Feature: conversations

WhatsApp conversation threads and message templates for appointment conversion.

## Conversation Engine (PROMPT-19)

The canonical inbound loop lives in `server/conversation-engine.ts`
(`receiveInboundMessage`):

```
inbound WhatsApp-style message (POST /api/conversations/inbound)
  → validate (Zod — authority keys stripped, business resolved by the
    receiving WhatsApp number, never by payload)
  → find-or-create customer (upsertByPhone) / conversation (latest thread)
  → persist the CUSTOMER message (addMessage — the single write path,
    transport-owned receivedAt preserved)
  → typed AI turn (only on unassigned AI_ACTIVE threads)
  → safe reply OR NEED_HUMAN handoff (existing status system)
  → persist the AI reply → deliver through the transport boundary
```

Boundaries (provider-neutral — real vendors are future operator
decisions, see `docs/DECISIONS.md` #29):

- `server/conversation-ai.ts` — `ConversationAi` interface + the
  deterministic Arabic assistant (keyword/FAQ-match classifier; NO LLM).
  FAQ answers are verbatim `Business.faqs` entries; anything unsafe
  (ambiguity, sensitive language, no matching knowledge, human request,
  booking-related intents) hands off to staff via NEED_HUMAN.
- `server/conversation-transport.ts` — `MessageTransport` interface +
  the offline logging adapter (NOT live WhatsApp).
- `schemas/conversation-schema.ts` — `inboundMessageSchema`, the
  canonical inbound contract (`to`/`from`/`text`/`receivedAt`, optional
  `externalId`). The payload can never carry `businessId`, roles, or
  internal ids.
- The webhook route (`src/app/api/conversations/inbound/route.ts`) is
  thin: token gate (`INBOUND_WEBHOOK_TOKEN` env; disabled/503 while
  unset) → engine → revalidate the existing conversation surfaces.

The engine never creates appointments — booking intents hand off to
staff, who complete bookings through the existing Smart Create flow.

## Isolation rules

- Everything feature-specific lives in this folder: components, hooks,
  schemas, server actions/queries, and API clients.
- This feature may import from `@/components/ui`, `@/lib/*`,
  `@/server/repositories`, `@/types`, and its own files — never from
  another feature folder.
- Cross-feature composition happens at the route layer (`src/app`), not
  here.
- No circular dependencies. If two features need shared logic, promote
  it to `@/lib` or `@/server` deliberately.
- Keep files small and single-purpose; no giant shared barrels.
