/*
  Warnings:

  - A unique constraint covering the columns `[roleId,permissionId,userId]` on the table `RolePermissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `RolePermissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RolePermissions_roleId_permissionId_key";

-- AlterTable
ALTER TABLE "RolePermissions" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RolePermissions_roleId_permissionId_userId_key" ON "RolePermissions"("roleId", "permissionId", "userId");

-- AddForeignKey
ALTER TABLE "RolePermissions" ADD CONSTRAINT "RolePermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
