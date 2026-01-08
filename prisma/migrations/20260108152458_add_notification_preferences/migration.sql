-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailNewsletter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailOrderUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailPromotions" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushFlashSales" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushOrderUpdates" BOOLEAN NOT NULL DEFAULT true;
