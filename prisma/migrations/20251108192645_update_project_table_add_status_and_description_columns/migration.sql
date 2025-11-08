-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANING', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'PLANING';
