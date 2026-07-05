-- CreateTable
CREATE TABLE "PlacementSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetLevelOrder" INTEGER NOT NULL,
    "questionWordIds" JSONB NOT NULL,
    "answeredAt" TIMESTAMP(3),
    "score" INTEGER,
    "passed" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlacementSession_userId_idx" ON "PlacementSession"("userId");

-- AddForeignKey
ALTER TABLE "PlacementSession" ADD CONSTRAINT "PlacementSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
