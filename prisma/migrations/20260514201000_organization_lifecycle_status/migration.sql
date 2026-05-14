-- SAP-5: add organization lifecycle status with suspended compatibility
ALTER TABLE "Organization" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Organization" ADD COLUMN "suspendedAt" DATETIME;
ALTER TABLE "Organization" ADD COLUMN "suspendedReason" TEXT;
ALTER TABLE "Organization" ADD COLUMN "suspendedByUserId" TEXT;

UPDATE "Organization"
SET "status" = CASE WHEN "suspended" = 1 THEN 'SUSPENDED' ELSE 'ACTIVE' END;

CREATE INDEX IF NOT EXISTS "Organization_status_idx" ON "Organization"("status");