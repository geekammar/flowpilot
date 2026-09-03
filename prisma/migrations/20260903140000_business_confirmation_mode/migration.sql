-- PROMPT-09: Business.confirmationMode — booking behavior setting for the
-- Business Settings Foundation. Controls how new appointments enter the
-- agenda: "manual" (PENDING until the team confirms — the pre-existing
-- behavior and the default) or "automatic" (CONFIRMED on creation).
-- NOT NULL with DEFAULT so existing rows keep current behavior unchanged.
-- Stable machine key validated at the boundary by a Zod union
-- (lib/validation/business.ts) — no Prisma enum so future modes need no
-- migration. Apply from desktop/CI: pnpm db:deploy (Termux cannot run the
-- Prisma schema engine).

ALTER TABLE "businesses"
  ADD COLUMN "confirmation_mode" TEXT NOT NULL DEFAULT 'manual';
