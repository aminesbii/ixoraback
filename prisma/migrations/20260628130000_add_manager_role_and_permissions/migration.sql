-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "permissions" TEXT NOT NULL DEFAULT '[]';
