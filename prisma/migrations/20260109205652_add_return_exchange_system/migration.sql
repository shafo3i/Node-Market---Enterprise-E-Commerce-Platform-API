-- CreateEnum
CREATE TYPE "ReturnExchangeType" AS ENUM ('RETURN', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "ReturnExchangeStatus" AS ENUM ('REQUESTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'RETURN_SHIPPED', 'RECEIVED', 'INSPECTING', 'REFUND_PENDING', 'REFUNDED', 'EXCHANGE_PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "return_exchange" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "ReturnExchangeType" NOT NULL,
    "status" "ReturnExchangeStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "customerComments" TEXT,
    "adminNotes" TEXT,
    "images" TEXT[],
    "refundAmount" DECIMAL(65,30),
    "refundMethod" TEXT,
    "refundedAt" TIMESTAMP(3),
    "exchangeOrderId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "returnTrackingNumber" TEXT,
    "returnCarrier" TEXT,
    "receivedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_exchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_exchange_items" (
    "id" TEXT NOT NULL,
    "returnExchangeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "condition" TEXT,
    "exchangeProductId" TEXT,
    "exchangeProductName" TEXT,
    "exchangeProductSku" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_exchange_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "return_exchange_returnNumber_key" ON "return_exchange"("returnNumber");

-- CreateIndex
CREATE INDEX "return_exchange_orderId_idx" ON "return_exchange"("orderId");

-- CreateIndex
CREATE INDEX "return_exchange_returnNumber_idx" ON "return_exchange"("returnNumber");

-- CreateIndex
CREATE INDEX "return_exchange_status_idx" ON "return_exchange"("status");

-- CreateIndex
CREATE INDEX "return_exchange_type_idx" ON "return_exchange"("type");

-- CreateIndex
CREATE INDEX "return_exchange_items_returnExchangeId_idx" ON "return_exchange_items"("returnExchangeId");

-- AddForeignKey
ALTER TABLE "return_exchange" ADD CONSTRAINT "return_exchange_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_exchange_items" ADD CONSTRAINT "return_exchange_items_returnExchangeId_fkey" FOREIGN KEY ("returnExchangeId") REFERENCES "return_exchange"("id") ON DELETE CASCADE ON UPDATE CASCADE;
