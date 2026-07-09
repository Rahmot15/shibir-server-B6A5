/*
  Warnings:

  - You are about to drop the column `DeletedAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "DeletedAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3);
