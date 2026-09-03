-- AlterTable
-- One-time account activation marker (PROMPT-05): null until the
-- invited identity exists and the Business membership is attached.
-- Derived lifecycle: accepted + activatedAt set => activated.
ALTER TABLE "invitations" ADD COLUMN "activated_at" TIMESTAMP(3);
