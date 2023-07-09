/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `vaultId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
DROP COLUMN "userId",
ADD COLUMN     "vaultId" TEXT NOT NULL,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("vaultId");
