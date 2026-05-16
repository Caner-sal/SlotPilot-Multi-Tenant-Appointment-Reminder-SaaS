-- Add provider-agnostic payment metadata
ALTER TABLE "Payment" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'STRIPE';
ALTER TABLE "Payment" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'APPOINTMENT_DEPOSIT';
ALTER TABLE "Payment" ADD COLUMN "providerEventId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "externalReference" TEXT;
ALTER TABLE "Payment" ADD COLUMN "metadata" JSON;
ALTER TABLE "Payment" ADD COLUMN "confirmedAt" DATETIME;
ALTER TABLE "Payment" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add supporting indexes for payment queries
CREATE INDEX "Payment_organizationId_status_createdAt_idx" ON "Payment"("organizationId", "status", "createdAt");
CREATE INDEX "Payment_provider_providerEventId_idx" ON "Payment"("provider", "providerEventId");
CREATE INDEX "Payment_externalReference_idx" ON "Payment"("externalReference");

-- Add payment attempts table
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "providerReference" TEXT,
    "requestId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "rawSafe" JSON,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PaymentAttempt_paymentId_idx" ON "PaymentAttempt"("paymentId");
CREATE INDEX "PaymentAttempt_provider_status_idx" ON "PaymentAttempt"("provider", "status");
CREATE INDEX "PaymentAttempt_idempotencyKey_idx" ON "PaymentAttempt"("idempotencyKey");

-- Add webhook events table
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "organizationId" TEXT,
    "payloadSafe" JSON,
    "signatureValid" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key" ON "WebhookEvent"("provider", "eventId");
CREATE INDEX "WebhookEvent_organizationId_idx" ON "WebhookEvent"("organizationId");
CREATE INDEX "WebhookEvent_status_createdAt_idx" ON "WebhookEvent"("status", "createdAt");

