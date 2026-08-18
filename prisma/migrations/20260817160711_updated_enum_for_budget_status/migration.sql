/*
  Warnings:

  - The values [closed] on the enum `BudgetStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BudgetStatus_new" AS ENUM ('draft', 'active', 'allocated');
ALTER TABLE "public"."Budget" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Budget" ALTER COLUMN "status" TYPE "BudgetStatus_new" USING ("status"::text::"BudgetStatus_new");
ALTER TYPE "BudgetStatus" RENAME TO "BudgetStatus_old";
ALTER TYPE "BudgetStatus_new" RENAME TO "BudgetStatus";
DROP TYPE "public"."BudgetStatus_old";
ALTER TABLE "Budget" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;
