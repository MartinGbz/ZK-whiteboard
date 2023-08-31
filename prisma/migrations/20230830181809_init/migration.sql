/*
  Warnings:

  - You are about to drop the column `userVaultId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Whiteboard` table. All the data in the column will be lost.
  - You are about to drop the column `userVaultId` on the `Whiteboard` table. All the data in the column will be lost.
  - Added the required column `authorVaultId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorVaultId` to the `Whiteboard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userVaultId_fkey";

-- DropForeignKey
ALTER TABLE "Whiteboard" DROP CONSTRAINT "Whiteboard_userVaultId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "userVaultId",
ADD COLUMN     "authorVaultId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Whiteboard" DROP COLUMN "groupId",
DROP COLUMN "userVaultId",
ADD COLUMN     "authorVaultId" TEXT NOT NULL,
ADD COLUMN     "groupIds" TEXT[];

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorVaultId_fkey" FOREIGN KEY ("authorVaultId") REFERENCES "User"("vaultId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_authorVaultId_fkey" FOREIGN KEY ("authorVaultId") REFERENCES "User"("vaultId") ON DELETE RESTRICT ON UPDATE CASCADE;
