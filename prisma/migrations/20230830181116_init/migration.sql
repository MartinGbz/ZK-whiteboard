/*
  Warnings:

  - You are about to drop the `Messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Messages";

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "order" SERIAL NOT NULL,
    "color" TEXT NOT NULL,
    "whiteboardId" INTEGER,
    "userVaultId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Whiteboard" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "groupId" TEXT[],
    "curated" BOOLEAN NOT NULL,
    "userVaultId" TEXT NOT NULL,

    CONSTRAINT "Whiteboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "vaultId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("vaultId")
);

-- CreateTable
CREATE TABLE "_joinedWhiteboards" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_favoriteWhiteboards" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_joinedWhiteboards_AB_unique" ON "_joinedWhiteboards"("A", "B");

-- CreateIndex
CREATE INDEX "_joinedWhiteboards_B_index" ON "_joinedWhiteboards"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_favoriteWhiteboards_AB_unique" ON "_favoriteWhiteboards"("A", "B");

-- CreateIndex
CREATE INDEX "_favoriteWhiteboards_B_index" ON "_favoriteWhiteboards"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userVaultId_fkey" FOREIGN KEY ("userVaultId") REFERENCES "User"("vaultId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_userVaultId_fkey" FOREIGN KEY ("userVaultId") REFERENCES "User"("vaultId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_joinedWhiteboards" ADD CONSTRAINT "_joinedWhiteboards_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("vaultId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_joinedWhiteboards" ADD CONSTRAINT "_joinedWhiteboards_B_fkey" FOREIGN KEY ("B") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favoriteWhiteboards" ADD CONSTRAINT "_favoriteWhiteboards_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("vaultId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favoriteWhiteboards" ADD CONSTRAINT "_favoriteWhiteboards_B_fkey" FOREIGN KEY ("B") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
