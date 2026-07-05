-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN     "accuracy" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;
