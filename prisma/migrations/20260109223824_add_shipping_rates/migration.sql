-- CreateEnum
CREATE TYPE "ShippingRateType" AS ENUM ('FLAT', 'API');

-- AlterTable
ALTER TABLE "carriers" ADD COLUMN     "apiAccountId" TEXT,
ADD COLUMN     "apiEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "apiProvider" TEXT,
ADD COLUMN     "flatRate" DECIMAL(10,2),
ADD COLUMN     "freeThreshold" DECIMAL(10,2),
ADD COLUMN     "rateType" "ShippingRateType" NOT NULL DEFAULT 'FLAT';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "carrierId" TEXT,
ADD COLUMN     "shippingCost" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "carriers_rateType_idx" ON "carriers"("rateType");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
