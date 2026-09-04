# Feature: knowledge

Business Knowledge (Spec A §6, PROMPT-18): the plain-text
question/answer entries the future AI assistant will use when replying
to customers (prices, policies, preparation instructions, recurring
questions). Content management for the business — NOT an AI system, no
RAG, no vector DB, no embeddings. Vertical-agnostic: categories are
copy guidance only, never data fields.

## Isolation rules

- Everything feature-specific lives in this folder: components,
  schemas, server actions, and the workflow.
- This feature may import from `@/components/ui`,
  `@/components/shared`, `@/lib/*`, `@/server/repositories`,
  `@/types`, and its own files — never from another feature folder.
- Cross-feature composition happens at the route layer (`src/app`),
  not here.
- No circular dependencies. Shared logic is promoted to `@/lib` or
  `@/server` deliberately (the FAQ entry contract was already
  `@/lib/validation`'s `faqEntrySchema`; PROMPT-18 only exported it).

## Structure

- `schemas/knowledge-schema.ts` — form-level Zod input reusing the
  shared `faqEntrySchema` contract (Arabic messages; question 1–500,
  answer 1–2000 chars, both trimmed); update/remove are addressed by
  the entry's CURRENT question. The client NEVER sends a
  `businessId`, a role, or any tenant field — Zod strips unknown keys.
- `server/knowledge-service.ts` — list/create/update/remove workflow
  over the canonical `Business.faqs` JSON field (DECISIONS #13 — one
  knowledge storage, no second system) with the authorization rules
  inside: ADMIN-only, tenant-scoped to the actor's own Business (the
  trusted session → user record). Repository collaborators are
  injectable so the logic is verifiable without a live database.
- `actions/knowledge-actions.ts` — thin `"use server"` wrappers: build
  the actor from the authenticated session + DB user, run the
  operation, revalidate `/settings/knowledge`.
- `components/knowledge-screen.tsx` — the list screen: one primary
  action (إضافة معلومة), entry cards (question + answer preview,
  تعديل / حذف), honest empty state, count line, calm success
  confirmation; server-confirmed results replace the whole list.
- `components/knowledge-form-dialog.tsx` — small create/edit dialog
  (question + answer, prefilled for edit, Arabic inline validation).
- `components/knowledge-remove-dialog.tsx` — explicit remove
  confirmation (destructive action, never a silent delete).

## Semantics

- **Storage:** `Business.faqs` JSON (`[{ question, answer }]`),
  migration `20260826120000_onboarding_fields`; ZERO schema changes
  in PROMPT-18. Entries are read/written whole through
  `businessRepository.update` — repository-only Prisma access, and
  the write target is always the actor's own businessId.
- **Natural key:** the trimmed question. The workflow enforces one
  entry per distinct question (duplicate → typed Arabic error) and a
  50-entry cap (mirrors the shared `faqs` schema bound). Edit/remove
  address entries by their current question; a stale/removed key
  fails honestly (المعلومة دي مش موجودة) instead of editing the
  wrong entry.
- **No per-entry id/active-state/timestamps:** the JSON entry shape
  is question/answer only (DECISIONS #13); removal is the supported
  state change. `isActive` per entry would be invented metadata.
- **Malformed stored JSON fails honestly** (تعذر قراءة معلومات
  المنشأة) — entries are never silently dropped or rewritten.
- No categories, tags, sources, embeddings, or vertical-specific
  fields — Spec A scope.
