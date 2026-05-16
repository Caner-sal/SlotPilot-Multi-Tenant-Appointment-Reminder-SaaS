-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "countryCode" TEXT NOT NULL DEFAULT 'TR';
ALTER TABLE "Organization" ADD COLUMN "locality" TEXT;
ALTER TABLE "Organization" ADD COLUMN "formattedAddress" TEXT;
ALTER TABLE "Organization" ADD COLUMN "latitude" REAL;
ALTER TABLE "Organization" ADD COLUMN "longitude" REAL;

-- Backfill
UPDATE "Organization"
SET "countryCode" = 'TR'
WHERE "countryCode" IS NULL OR "countryCode" = '';

UPDATE "Organization"
SET "formattedAddress" = COALESCE("formattedAddress", "address")
WHERE "formattedAddress" IS NULL;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN "countryCode" TEXT NOT NULL DEFAULT 'TR';
ALTER TABLE "Location" ADD COLUMN "locality" TEXT;
ALTER TABLE "Location" ADD COLUMN "formattedAddress" TEXT;
ALTER TABLE "Location" ADD COLUMN "latitude" REAL;
ALTER TABLE "Location" ADD COLUMN "longitude" REAL;

-- Backfill
UPDATE "Location"
SET "countryCode" = 'TR'
WHERE "countryCode" IS NULL OR "countryCode" = '';

UPDATE "Location"
SET "formattedAddress" = COALESCE("formattedAddress", "address")
WHERE "formattedAddress" IS NULL;

-- CreateIndex
CREATE INDEX "Organization_countryCode_idx" ON "Organization"("countryCode");

-- CreateIndex
CREATE INDEX "Location_countryCode_idx" ON "Location"("countryCode");

-- Backfill organization normalized addresses for marketplace locality/country filters.
INSERT INTO "NormalizedAddress" (
  "id",
  "organizationId",
  "ownerType",
  "ownerId",
  "countryCode",
  "countryName",
  "adminLevel1",
  "adminLevel2",
  "locality",
  "postalCode",
  "formattedAddress",
  "provider",
  "providerPlaceId",
  "language",
  "createdAt",
  "updatedAt"
)
SELECT
  LOWER(HEX(RANDOMBLOB(12))),
  o."id",
  'ORGANIZATION',
  o."id",
  COALESCE(NULLIF(o."countryCode", ''), 'TR'),
  NULL,
  o."province",
  o."city",
  COALESCE(NULLIF(o."locality", ''), o."city"),
  o."postalCode",
  COALESCE(o."formattedAddress", o."address", COALESCE(o."city", '') || CASE WHEN o."province" IS NOT NULL THEN ', ' || o."province" ELSE '' END),
  'manual',
  'organization:' || o."id",
  o."defaultLocale",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Organization" o
WHERE NOT EXISTS (
  SELECT 1
  FROM "NormalizedAddress" na
  WHERE na."ownerType" = 'ORGANIZATION'
    AND na."ownerId" = o."id"
);
