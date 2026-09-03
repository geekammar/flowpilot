-- PROMPT-07: Business.vertical — discovery metadata for Local Vertical
-- Discovery (operator prompt: STEP A captures the vertical; §7 requires
-- structured setup metadata). Nullable TEXT: existing rows keep NULL until
-- the ADMIN sets it in onboarding step 1. Values are stable machine keys
-- validated at the boundary by a Zod union (lib/validation/business.ts) —
-- no Prisma enum so future verticals (Spec B Vertical Registry) need no
-- migration. Apply from desktop/CI: pnpm db:deploy (Termux cannot run the
-- Prisma schema engine).

ALTER TABLE "businesses" ADD COLUMN "vertical" TEXT;
