-- CreateIndex
CREATE UNIQUE INDEX "Lesson_unitId_order_key" ON "Lesson"("unitId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_levelId_order_key" ON "Unit"("levelId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Word_lessonId_term_key" ON "Word"("lessonId", "term");

