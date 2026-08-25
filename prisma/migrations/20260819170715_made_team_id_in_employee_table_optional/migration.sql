/*
  Warnings:

  - You are about to drop the column `department` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "department",
DROP COLUMN "managerId",
ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
