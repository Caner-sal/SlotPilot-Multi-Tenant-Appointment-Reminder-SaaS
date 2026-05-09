-- CreateTable
CREATE TABLE "BusinessClosedDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT,
    "isHolidayOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessClosedDay_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BusinessClosedDay_organizationId_idx" ON "BusinessClosedDay"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessClosedDay_organizationId_date_key" ON "BusinessClosedDay"("organizationId", "date");
