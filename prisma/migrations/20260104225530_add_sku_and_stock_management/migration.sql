/*
  Warnings:

  - You are about to drop the column `parentId` on the `categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `brands` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parentId_fkey";

-- DropIndex
DROP INDEX "categories_parentId_idx";

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "parentId",
ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "brands_code_key" ON "brands"("code");

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");
