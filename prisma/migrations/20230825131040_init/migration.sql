/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "Messages" (
    "vaultId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "order" SERIAL NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("vaultId")
);
