-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "marketplaceEnabled" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "city" TEXT,
    "coverImageUrl" TEXT,
    "aiChatbotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "faqText" TEXT,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Organization" ("address", "bookingEnabled", "category", "city", "coverImageUrl", "createdAt", "description", "email", "id", "logoUrl", "marketplaceEnabled", "name", "phone", "slug", "smsEnabled", "suspended", "timezone", "updatedAt", "whatsappEnabled") SELECT "address", "bookingEnabled", "category", "city", "coverImageUrl", "createdAt", "description", "email", "id", "logoUrl", "marketplaceEnabled", "name", "phone", "slug", "smsEnabled", "suspended", "timezone", "updatedAt", "whatsappEnabled" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
