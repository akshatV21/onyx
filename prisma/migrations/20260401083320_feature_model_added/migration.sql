/*
  Warnings:

  - The values [in_progress,in_review,deployed] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `priority` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Task` table. All the data in the column will be lost.
  - Added the required column `featureId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeatureStatus" AS ENUM ('planned', 'in_progress', 'in_review', 'completed', 'deployed');

-- CreateEnum
CREATE TYPE "FeaturePriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('todo', 'completed');
ALTER TABLE "public"."Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "public"."TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'todo';
COMMIT;

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";

-- DropIndex
DROP INDEX "Task_userId_projectId_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "priority",
DROP COLUMN "userId",
ADD COLUMN     "featureId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TaskPriority";

-- CreateTable
CREATE TABLE "ProjectStats" (
    "id" TEXT NOT NULL,
    "ftotal" INTEGER NOT NULL DEFAULT 0,
    "fplanned" INTEGER NOT NULL DEFAULT 0,
    "fin_progress" INTEGER NOT NULL DEFAULT 0,
    "fin_review" INTEGER NOT NULL DEFAULT 0,
    "fcompleted" INTEGER NOT NULL DEFAULT 0,
    "fdeployed" INTEGER NOT NULL DEFAULT 0,
    "ttotal" INTEGER NOT NULL DEFAULT 0,
    "ttodo" INTEGER NOT NULL DEFAULT 0,
    "tcompleted" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "FeatureStatus" NOT NULL DEFAULT 'planned',
    "priority" "FeaturePriority" NOT NULL DEFAULT 'medium',
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureStats" (
    "id" TEXT NOT NULL,
    "ttotal" INTEGER NOT NULL DEFAULT 0,
    "ttodo" INTEGER NOT NULL DEFAULT 0,
    "tcompleted" INTEGER NOT NULL DEFAULT 0,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "FeatureStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStats_projectId_key" ON "ProjectStats"("projectId");

-- CreateIndex
CREATE INDEX "Feature_projectId_status_priority_updatedAt_idx" ON "Feature"("projectId", "status", "priority" DESC, "updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureStats_featureId_key" ON "FeatureStats"("featureId");

-- CreateIndex
CREATE INDEX "Task_featureId_projectId_idx" ON "Task"("featureId", "projectId");

-- AddForeignKey
ALTER TABLE "ProjectStats" ADD CONSTRAINT "ProjectStats_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureStats" ADD CONSTRAINT "FeatureStats_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
