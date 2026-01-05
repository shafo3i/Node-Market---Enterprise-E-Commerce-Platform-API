-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'PRODUCT', 'ORDER', 'PAYMENT', 'CART', 'REVIEW', 'BRAND', 'CATEGORY');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'MERCHANT', 'ADMIN', 'SYSTEM');

-- CreateTable
CREATE TABLE "auditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditLog_pkey" PRIMARY KEY ("id")
);
