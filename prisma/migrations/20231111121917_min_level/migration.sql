/*
  Warnings:

  - You are about to drop the column `maxMessagesPerLevel` on the `Whiteboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Whiteboard" DROP COLUMN "maxMessagesPerLevel",
ADD COLUMN     "minLevel" INTEGER;
