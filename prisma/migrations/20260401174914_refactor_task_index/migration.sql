-- DropIndex
DROP INDEX "Task_featureId_projectId_idx";

-- CreateIndex
CREATE INDEX "Task_featureId_status_updatedAt_idx" ON "Task"("featureId", "status" ASC, "updatedAt" DESC);
