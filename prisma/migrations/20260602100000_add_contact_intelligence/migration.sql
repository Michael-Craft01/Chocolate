ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "contactStatus" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "contactPages" JSONB;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "socialProfiles" JSONB;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "decisionMakers" JSONB;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "bestContactChannel" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "contactConfidence" INTEGER;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "contactEvidence" JSONB;

CREATE INDEX IF NOT EXISTS "Business_contactStatus_idx" ON "Business"("contactStatus");
