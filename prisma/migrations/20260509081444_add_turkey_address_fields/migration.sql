-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "district" TEXT;
ALTER TABLE "Customer" ADD COLUMN "province" TEXT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN "district" TEXT;
ALTER TABLE "Location" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Location" ADD COLUMN "province" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "district" TEXT;
ALTER TABLE "Organization" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Organization" ADD COLUMN "province" TEXT;
