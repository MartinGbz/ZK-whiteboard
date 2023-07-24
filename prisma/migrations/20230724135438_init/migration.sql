/*
  Warnings:

  - Added the required column `color` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "order" SERIAL NOT NULL;
