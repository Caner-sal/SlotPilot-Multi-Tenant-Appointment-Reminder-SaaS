-- Add locale preference fields for notification fallback
ALTER TABLE "User" ADD COLUMN "preferredLocale" TEXT;
ALTER TABLE "Organization" ADD COLUMN "defaultLocale" TEXT NOT NULL DEFAULT 'tr';
ALTER TABLE "Customer" ADD COLUMN "preferredLocale" TEXT;
