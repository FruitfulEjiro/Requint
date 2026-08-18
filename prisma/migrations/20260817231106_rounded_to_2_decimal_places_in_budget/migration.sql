/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Budget` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `allocatedAmount` on the `Budget` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `remainingAmount` on the `Budget` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "allocatedAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "remainingAmount" SET DATA TYPE DECIMAL(12,2);

-- DropEnum
DROP TYPE "OrganizationStatus";
