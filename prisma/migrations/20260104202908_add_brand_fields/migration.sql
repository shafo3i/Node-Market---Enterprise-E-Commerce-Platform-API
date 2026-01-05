/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `brands` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `brands` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `brands` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the columns as nullable
ALTER TABLE "brands" ADD COLUMN "description" TEXT;
ALTER TABLE "brands" ADD COLUMN "logo" TEXT;
ALTER TABLE "brands" ADD COLUMN "slug" TEXT;
ALTER TABLE "brands" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Update existing rows with slugs generated from names and set updatedAt
UPDATE "brands" 
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')),
    "updatedAt" = NOW()
WHERE "slug" IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE "brands" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "brands" ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_slug_idx" ON "brands"("slug");

