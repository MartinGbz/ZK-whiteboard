/*
  Warnings:

  - Added the required column `positionX` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionY` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "positionX" INTEGER NOT NULL,
ADD COLUMN     "positionY" INTEGER NOT NULL;
