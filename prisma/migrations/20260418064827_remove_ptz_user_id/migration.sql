/*
  Warnings:

  - You are about to drop the column `userId` on the `ptz_simulations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."ptz_simulations_userId_idx";

-- AlterTable
ALTER TABLE "public"."ptz_simulations" DROP COLUMN "userId";
