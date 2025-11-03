import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // 1) Derniers matchs terminés
    const rows = await prisma.match.findMany({
      where: { state: "FINISHED" as any },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        round: true,
        winnerTeamId: true,
        teamAId: true,
        teamBId: true,
        lobbyId: true,
      },
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { matches: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // 2) Charge les équipes en un seul batch (schéma unifié)
    const teamIds = Array.from(
      new Set(rows.flatMap((m) => [m.teamAId, m.teamBId]))
    );

    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, name: true },
    });

    const teamById = new Map(teams.map((t) => [t.id, t.name ?? `TEAM ${t.id}`]));

    // 3) Mise en forme
    const matches = rows.map((m) => {
      const teamAName = teamById.get(m.teamAId) ?? "TEAM A";
      const teamBName = teamById.get(m.teamBId) ?? "TEAM B";

      let winnerName = "—";
      if (m.winnerTeamId) {
        if (m.winnerTeamId === m.teamAId) winnerName = teamAName;
        else if (m.winnerTeamId === m.teamBId) winnerName = teamBName;
      }

      return {
        id: m.id,
        date: (m.updatedAt ?? m.createdAt).toISOString(),
        round: m.round,
        teams: [teamAName, teamBName],
        winner: winnerName,
        lobbyId: m.lobbyId,
      };
    });

    return NextResponse.json(
      { matches },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[/api/matches/recent] error:", err);
    return NextResponse.json(
      { error: "Failed to load recent matches" },
      { status: 500 }
    );
  }
}
