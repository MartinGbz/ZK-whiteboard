/*
  Warnings:

  - Made the column `whiteboardId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_whiteboardId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "whiteboardId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
