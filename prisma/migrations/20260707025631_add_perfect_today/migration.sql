-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lastPerfectDate" TIMESTAMP(3),
ADD COLUMN     "perfectToday" INTEGER NOT NULL DEFAULT 0;
