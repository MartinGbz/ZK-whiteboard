/*
  Warnings:

  - You are about to drop the `_favoriteWhiteboards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_joinedWhiteboards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorVaultId_fkey";

-- DropForeignKey
ALTER TABLE "_favoriteWhiteboards" DROP CONSTRAINT "_favoriteWhiteboards_A_fkey";

-- DropForeignKey
ALTER TABLE "_favoriteWhiteboards" DROP CONSTRAINT "_favoriteWhiteboards_B_fkey";

-- DropForeignKey
ALTER TABLE "_joinedWhiteboards" DROP CONSTRAINT "_joinedWhiteboards_A_fkey";

-- DropForeignKey
ALTER TABLE "_joinedWhiteboards" DROP CONSTRAINT "_joinedWhiteboards_B_fkey";

-- DropTable
DROP TABLE "_favoriteWhiteboards";

-- DropTable
DROP TABLE "_joinedWhiteboards";
