import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await prisma.match.findMany({
      where: { state: "FINISHED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        round: true,
        winnerTeamId: true,
        Team_Match_teamAIdToTeam: { select: { id: true, name: true } },
        Team_Match_teamBIdToTeam: { select: { id: true, name: true } },
        Team_Match_winnerTeamIdToTeam: { select: { id: true, name: true } },
      },
    });

    const matches = rows.map((m) => {
      const a = m.Team_Match_teamAIdToTeam;
      const b = m.Team_Match_teamBIdToTeam;
      const w = m.Team_Match_winnerTeamIdToTeam;
      const teamAName = a?.name ?? "TEAM A";
      const teamBName = b?.name ?? "TEAM B";
      const winnerName =
        w?.name ??
        (m.winnerTeamId && m.winnerTeamId === a?.id ? teamAName :
         m.winnerTeamId && m.winnerTeamId === b?.id ? teamBName : "—");

      return {
        id: m.id,
        date: m.createdAt.toISOString(),
        teams: [teamAName, teamBName],
        winner: winnerName,
        round: m.round,
      };
    });

    return NextResponse.json({ matches }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/matches/recent] error:", err);
    return NextResponse.json({ error: "Failed to load recent matches" }, { status: 500 });
  }
}
