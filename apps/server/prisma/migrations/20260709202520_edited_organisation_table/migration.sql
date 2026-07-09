/*
  Warnings:

  - You are about to drop the column `phone` on the `Organisation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "phone",
ALTER COLUMN "address" DROP NOT NULL;
