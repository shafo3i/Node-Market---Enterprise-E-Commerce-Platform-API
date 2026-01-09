-- AlterTable
ALTER TABLE "backup_history" ADD COLUMN     "s3Key" TEXT;

-- AlterTable
ALTER TABLE "backup_settings" ADD COLUMN     "s3AccessKey" TEXT,
ADD COLUMN     "s3Bucket" TEXT,
ADD COLUMN     "s3Endpoint" TEXT,
ADD COLUMN     "s3Provider" TEXT,
ADD COLUMN     "s3Region" TEXT,
ADD COLUMN     "s3SecretKey" TEXT;
