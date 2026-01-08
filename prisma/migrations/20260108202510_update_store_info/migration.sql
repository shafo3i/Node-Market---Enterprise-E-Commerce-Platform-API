/*
  Warnings:

  - You are about to drop the column `currency` on the `store_settings` table. All the data in the column will be lost.
  - You are about to drop the column `storeAddress` on the `store_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "store_settings" DROP COLUMN "currency",
DROP COLUMN "storeAddress",
ADD COLUMN     "addressCity" TEXT,
ADD COLUMN     "addressCountry" TEXT,
ADD COLUMN     "addressPostal" TEXT,
ADD COLUMN     "addressState" TEXT,
ADD COLUMN     "addressStreet" TEXT,
ADD COLUMN     "businessHours" TEXT,
ADD COLUMN     "storeLogo" TEXT,
ADD COLUMN     "storeWebsite" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC';
