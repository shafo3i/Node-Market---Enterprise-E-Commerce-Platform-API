-- CreateEnum
CREATE TYPE "ShippingCarrier" AS ENUM ('ROYAL_MAIL', 'YODEL', 'DPD', 'HERMES', 'UPS', 'DHL', 'OTHER');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingCarrier" "ShippingCarrier",
ADD COLUMN     "trackingNumber" TEXT;
