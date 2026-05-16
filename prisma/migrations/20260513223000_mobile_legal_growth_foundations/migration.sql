-- Mobile auth refresh tokens
CREATE TABLE "MobileRefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "deviceId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "replacedByJti" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MobileRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MobileRefreshToken_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MobileRefreshToken_tokenHash_key" ON "MobileRefreshToken"("tokenHash");
CREATE UNIQUE INDEX "MobileRefreshToken_jti_key" ON "MobileRefreshToken"("jti");
CREATE INDEX "MobileRefreshToken_userId_organizationId_idx" ON "MobileRefreshToken"("userId", "organizationId");
CREATE INDEX "MobileRefreshToken_organizationId_revokedAt_idx" ON "MobileRefreshToken"("organizationId", "revokedAt");
CREATE INDEX "MobileRefreshToken_expiresAt_idx" ON "MobileRefreshToken"("expiresAt");

-- Mobile push notification token registry
CREATE TABLE "MobilePushToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "expoPushToken" TEXT NOT NULL,
    "platform" TEXT,
    "appVersion" TEXT,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MobilePushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MobilePushToken_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MobilePushToken_organizationId_expoPushToken_key" ON "MobilePushToken"("organizationId", "expoPushToken");
CREATE INDEX "MobilePushToken_userId_organizationId_idx" ON "MobilePushToken"("userId", "organizationId");
CREATE INDEX "MobilePushToken_organizationId_isActive_idx" ON "MobilePushToken"("organizationId", "isActive");

-- GDPR export lifecycle
CREATE TABLE "DataExportRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "format" TEXT NOT NULL DEFAULT 'json',
    "downloadUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DataExportRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "DataExportRequest_organizationId_idx" ON "DataExportRequest"("organizationId");
CREATE INDEX "DataExportRequest_status_idx" ON "DataExportRequest"("status");

-- Growth product events
CREATE TABLE "ProductEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "payloadSafe" JSON,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ProductEvent_eventName_createdAt_idx" ON "ProductEvent"("eventName", "createdAt");
CREATE INDEX "ProductEvent_organizationId_createdAt_idx" ON "ProductEvent"("organizationId", "createdAt");
