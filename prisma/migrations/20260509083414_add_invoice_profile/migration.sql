-- CreateTable
CREATE TABLE "InvoiceProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "invoiceType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "companyTitle" TEXT,
    "taxOffice" TEXT,
    "taxNumber" TEXT,
    "identityNumber" TEXT,
    "invoiceProvince" TEXT,
    "invoiceDistrict" TEXT,
    "invoiceAddressLine" TEXT,
    "invoiceEmail" TEXT,
    "invoicePhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvoiceProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceProfile_organizationId_key" ON "InvoiceProfile"("organizationId");
