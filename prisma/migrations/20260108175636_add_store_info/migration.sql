-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeDescription" TEXT,
    "storeEmail" TEXT,
    "storePhone" TEXT,
    "storeAddress" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
