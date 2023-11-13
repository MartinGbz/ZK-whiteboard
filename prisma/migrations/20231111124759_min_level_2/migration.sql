/*
  Warnings:

  - Made the column `minLevel` on table `Whiteboard` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Whiteboard" ALTER COLUMN "minLevel" SET NOT NULL,
ALTER COLUMN "minLevel" SET DEFAULT 0;
