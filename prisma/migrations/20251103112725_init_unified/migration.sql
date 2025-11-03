/*
  Warnings:

  - A unique constraint covering the columns `[lobbyId,round,teamAId,teamBId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "announcedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_lobbyId_round_state_idx" ON "Match"("lobbyId", "round", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Match_lobbyId_round_teamAId_teamBId_key" ON "Match"("lobbyId", "round", "teamAId", "teamBId");
