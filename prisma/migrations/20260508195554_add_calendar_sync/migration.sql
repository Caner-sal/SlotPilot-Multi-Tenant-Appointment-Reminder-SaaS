-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "calendarEventId" TEXT;

-- CreateTable
CREATE TABLE "CalendarConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "staffId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'GOOGLE',
    "accessTokenEncrypted" TEXT NOT NULL,
    "refreshTokenEncrypted" TEXT,
    "expiresAt" DATETIME,
    "calendarId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CalendarConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CalendarConnection_organizationId_idx" ON "CalendarConnection"("organizationId");

-- CreateIndex
CREATE INDEX "CalendarConnection_staffId_idx" ON "CalendarConnection"("staffId");
