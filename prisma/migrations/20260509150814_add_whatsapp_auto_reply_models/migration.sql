-- CreateTable
CREATE TABLE "WhatsAppAutoReplySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'FAKE',
    "phoneNumberId" TEXT,
    "replyMode" TEXT NOT NULL DEFAULT 'ALWAYS',
    "cooldownHours" INTEGER NOT NULL DEFAULT 24,
    "triggerKeywords" TEXT NOT NULL DEFAULT '[]',
    "messageTemplate" TEXT NOT NULL DEFAULT 'Merhaba 👋
Randevu almak için linkimizi kullanabilirsiniz:
{{bookingUrl}}

Bu linkten hizmet seçebilir, uygun saatleri görebilir ve randevunuzu oluşturabilirsiniz.
İnsan desteği için bu mesaja yazmaya devam edebilirsiniz.',
    "includeBookingLink" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WhatsAppAutoReplySettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhatsAppInboundMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "providerMessageId" TEXT NOT NULL,
    "fromPhone" TEXT NOT NULL,
    "toPhone" TEXT NOT NULL,
    "messageText" TEXT,
    "rawPayload" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppInboundMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhatsAppAutoReplyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inboundMessageId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "replyText" TEXT,
    "bookingUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppAutoReplyLog_inboundMessageId_fkey" FOREIGN KEY ("inboundMessageId") REFERENCES "WhatsAppInboundMessage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WhatsAppAutoReplyLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhatsAppContactPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "lastAutoReplyAt" DATETIME,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "appointmentNotificationConsent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WhatsAppContactPreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAutoReplySettings_organizationId_key" ON "WhatsAppAutoReplySettings"("organizationId");

-- CreateIndex
CREATE INDEX "WhatsAppAutoReplySettings_organizationId_idx" ON "WhatsAppAutoReplySettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppInboundMessage_providerMessageId_key" ON "WhatsAppInboundMessage"("providerMessageId");

-- CreateIndex
CREATE INDEX "WhatsAppInboundMessage_organizationId_idx" ON "WhatsAppInboundMessage"("organizationId");

-- CreateIndex
CREATE INDEX "WhatsAppInboundMessage_organizationId_fromPhone_idx" ON "WhatsAppInboundMessage"("organizationId", "fromPhone");

-- CreateIndex
CREATE INDEX "WhatsAppInboundMessage_providerMessageId_idx" ON "WhatsAppInboundMessage"("providerMessageId");

-- CreateIndex
CREATE INDEX "WhatsAppAutoReplyLog_organizationId_idx" ON "WhatsAppAutoReplyLog"("organizationId");

-- CreateIndex
CREATE INDEX "WhatsAppAutoReplyLog_inboundMessageId_idx" ON "WhatsAppAutoReplyLog"("inboundMessageId");

-- CreateIndex
CREATE INDEX "WhatsAppAutoReplyLog_organizationId_customerPhone_idx" ON "WhatsAppAutoReplyLog"("organizationId", "customerPhone");

-- CreateIndex
CREATE INDEX "WhatsAppContactPreference_organizationId_idx" ON "WhatsAppContactPreference"("organizationId");

-- CreateIndex
CREATE INDEX "WhatsAppContactPreference_organizationId_phone_idx" ON "WhatsAppContactPreference"("organizationId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppContactPreference_organizationId_phone_key" ON "WhatsAppContactPreference"("organizationId", "phone");
