-- CreateTable
CREATE TABLE "RevenueLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "paymentId" TEXT,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RevenueLedger_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RevenueLedger_organizationId_idx" ON "RevenueLedger"("organizationId");

-- CreateIndex
CREATE INDEX "RevenueLedger_organizationId_recordedAt_idx" ON "RevenueLedger"("organizationId", "recordedAt");
