ALTER TABLE "businesses"
ADD COLUMN "slot_duration_minutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN "faqs" JSONB,
ADD COLUMN "onboarding_completed_at" TIMESTAMP(3);
