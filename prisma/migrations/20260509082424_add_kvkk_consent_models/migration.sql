-- CreateTable
CREATE TABLE "ConsentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT,
    "privacyNoticeAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "explicitConsentGiven" BOOLEAN NOT NULL DEFAULT false,
    "appointmentNotificationConsent" BOOLEAN NOT NULL DEFAULT true,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT NOT NULL,
    "consentIp" TEXT,
    "consentUserAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsentLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataDeletionRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DataDeletionRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ConsentLog_organizationId_idx" ON "ConsentLog"("organizationId");

-- CreateIndex
CREATE INDEX "ConsentLog_organizationId_customerId_idx" ON "ConsentLog"("organizationId", "customerId");

-- CreateIndex
CREATE INDEX "DataDeletionRequest_organizationId_idx" ON "DataDeletionRequest"("organizationId");

-- CreateIndex
CREATE INDEX "DataDeletionRequest_status_idx" ON "DataDeletionRequest"("status");
