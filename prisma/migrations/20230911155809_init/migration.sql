/*
  Warnings:

  - Added the required column `appId` to the `Whiteboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Whiteboard" ADD COLUMN     "appId" TEXT NOT NULL;
