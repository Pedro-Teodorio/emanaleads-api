/*
  Warnings:

  - You are about to drop the `ProjectAdmin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `adminId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ProjectAdmin" DROP CONSTRAINT "ProjectAdmin_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectAdmin" DROP CONSTRAINT "ProjectAdmin_userId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "adminId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."ProjectAdmin";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
