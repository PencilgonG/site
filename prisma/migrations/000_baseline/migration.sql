-- CreateEnum
CREATE TYPE "Elo" AS ENUM ('IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER');

-- CreateEnum
CREATE TYPE "LobbyFormat" AS ENUM ('BO1', 'BO3', 'BO5', 'RR1', 'RR2', 'RR3');

-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('WAITING', 'BUILDER', 'CLOSED');

-- CreateEnum
CREATE TYPE "MatchState" AS ENUM ('PENDING', 'RUNNING', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TOP', 'JGL', 'MID', 'ADC', 'SUPP', 'SUB');

-- CreateTable
CREATE TABLE "Lobby" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teams" INTEGER NOT NULL,
    "status" "LobbyStatus" NOT NULL DEFAULT 'WAITING',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "format" "LobbyFormat",

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LobbyParticipant" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "discordId" TEXT,
    "display" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isFake" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LobbyParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "teamAId" TEXT NOT NULL,
    "teamBId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "state" "MatchState" NOT NULL DEFAULT 'PENDING',
    "draftRoomId" TEXT,
    "blueUrl" TEXT,
    "redUrl" TEXT,
    "specUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "winnerTeamId" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MvpVote" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "voterDiscordId" TEXT NOT NULL,
    "votedDiscordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MvpVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsLedger" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "captainId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "lobbyParticipantId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "discordId" TEXT NOT NULL,
    "summonerName" TEXT,
    "elo" "Elo",
    "mainRole" "Role",
    "secondaryRole" "Role",
    "opggUrl" TEXT,
    "dpmUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("discordId")
);

-- CreateTable
CREATE TABLE "InhouseEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "mode" TEXT,
    "maxPlayers" INTEGER,
    "description" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InhouseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LobbyParticipant_lobbyId_role_idx" ON "LobbyParticipant"("lobbyId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "LobbyParticipant_lobbyId_discordId_key" ON "LobbyParticipant"("lobbyId", "discordId");

-- CreateIndex
CREATE INDEX "Match_lobbyId_round_idx" ON "Match"("lobbyId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "MatchResult_matchId_key" ON "MatchResult"("matchId");

-- CreateIndex
CREATE INDEX "MvpVote_lobbyId_idx" ON "MvpVote"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "MvpVote_matchId_teamId_voterDiscordId_key" ON "MvpVote"("matchId", "teamId", "voterDiscordId");

-- CreateIndex
CREATE INDEX "PointsLedger_discordId_idx" ON "PointsLedger"("discordId");

-- CreateIndex
CREATE INDEX "PointsLedger_matchId_idx" ON "PointsLedger"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_lobbyParticipantId_key" ON "TeamMember"("lobbyParticipantId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_lobbyParticipantId_key" ON "TeamMember"("teamId", "lobbyParticipantId");

-- CreateIndex
CREATE INDEX "InhouseEvent_startAt_idx" ON "InhouseEvent"("startAt");

-- AddForeignKey
ALTER TABLE "LobbyParticipant" ADD CONSTRAINT "LobbyParticipant_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerTeamId_fkey" FOREIGN KEY ("winnerTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_lobbyParticipantId_fkey" FOREIGN KEY ("lobbyParticipantId") REFERENCES "LobbyParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

