/*
  Warnings:

  - You are about to drop the column `rejectionReason` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "rejectionReason",
ADD COLUMN     "reason" TEXT;
