-- CreateTable
CREATE TABLE "CountryConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "defaultLocale" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL,
    "addressFormat" TEXT,
    "phoneCountryCode" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "marketplaceEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NormalizedAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "countryCode" TEXT,
    "countryName" TEXT,
    "adminLevel1" TEXT,
    "adminLevel2" TEXT,
    "adminLevel3" TEXT,
    "locality" TEXT,
    "subLocality" TEXT,
    "postalCode" TEXT,
    "street" TEXT,
    "streetNumber" TEXT,
    "formattedAddress" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "provider" TEXT NOT NULL,
    "providerPlaceId" TEXT NOT NULL,
    "rawProviderPayloadSafe" JSONB,
    "language" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NormalizedAddress_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AddressProviderLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "provider" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "countryCode" TEXT,
    "status" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AddressProviderLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryConfig_countryCode_key" ON "CountryConfig"("countryCode");

-- CreateIndex
CREATE INDEX "NormalizedAddress_organizationId_idx" ON "NormalizedAddress"("organizationId");

-- CreateIndex
CREATE INDEX "NormalizedAddress_ownerType_ownerId_idx" ON "NormalizedAddress"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "NormalizedAddress_countryCode_idx" ON "NormalizedAddress"("countryCode");

-- CreateIndex
CREATE INDEX "NormalizedAddress_provider_providerPlaceId_idx" ON "NormalizedAddress"("provider", "providerPlaceId");

-- CreateIndex
CREATE INDEX "AddressProviderLog_organizationId_idx" ON "AddressProviderLog"("organizationId");

-- CreateIndex
CREATE INDEX "AddressProviderLog_provider_idx" ON "AddressProviderLog"("provider");

-- CreateIndex
CREATE INDEX "AddressProviderLog_createdAt_idx" ON "AddressProviderLog"("createdAt");

