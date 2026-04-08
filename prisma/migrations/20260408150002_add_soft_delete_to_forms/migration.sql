-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "forms_workspaceId_deletedAt_idx" ON "forms"("workspaceId", "deletedAt");
