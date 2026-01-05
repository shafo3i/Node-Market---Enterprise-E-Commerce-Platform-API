-- CreateEnum
CREATE TYPE "UserIdType" AS ENUM ('ID_CARD', 'PASSPORT', 'DRIVER_LICENSE', 'OTHER');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "idExpiryDate" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "idType" "UserIdType",
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "postalCode" TEXT;
