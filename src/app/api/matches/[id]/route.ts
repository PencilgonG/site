import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UiRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";
const toUiRole = (db?: "TOP" | "JGL" | "MID" | "ADC" | "SUPP" | "SUB"): UiRole =>
  db === "JGL" ? "JUNGLE" : db === "SUPP" ? "SUPPORT" : ((db as UiRole) || "SUB");

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id?: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing match id" }, { status: 400 });

    const match = await prisma.match.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        round: true,
        state: true,
        winnerTeamId: true,
        // si l'introspection a généré une relation gagnante :
        Team_Match_winnerTeamIdToTeam: { select: { id: true, name: true } },

        Team_Match_teamAIdToTeam: {
          select: {
            id: true,
            name: true,
            TeamMember: {
              select: {
                LobbyParticipant: {
                  select: { discordId: true, display: true, role: true },
                },
              },
            },
          },
        },
        Team_Match_teamBIdToTeam: {
          select: {
            id: true,
            name: true,
            TeamMember: {
              select: {
                LobbyParticipant: {
                  select: { discordId: true, display: true, role: true },
                },
              },
            },
          },
        },
      },
    });

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const mapTeam = (t: any) => {
      const name = t?.name ?? `TEAM ${t?.id ?? "?"}`;
      const members = Array.isArray(t?.TeamMember) ? t.TeamMember : [];
      const players = members
        .map((tm: any) => tm?.LobbyParticipant ?? null)
        .filter(Boolean)
        .map((p: any, idx: number) => {
          const role = toUiRole(p?.role);
          let avatarIdx = 0;
          if (p?.discordId) {
            try { avatarIdx = Number(BigInt(p.discordId) % 5n); } catch {/* noop */}
          }
          const avatar = `https://cdn.discordapp.com/embed/avatars/${avatarIdx}.png`;
          const display =
            p?.display || (p?.discordId ? `#${p.discordId}` : `Joueur ${idx + 1}`);

          return {
            id: p?.discordId || `unknown-${idx}`,
            discordId: p?.discordId || null,
            name: display,
            role,
            avatar,
          };
        });

      return { id: t?.id ?? null, name, players };
    };

    const teamA = mapTeam(match.Team_Match_teamAIdToTeam);
    const teamB = mapTeam(match.Team_Match_teamBIdToTeam);

    const winnerId =
      match.winnerTeamId ?? match.Team_Match_winnerTeamIdToTeam?.id ?? null;

    const winnerName =
      winnerId && winnerId === teamA.id ? teamA.name :
      winnerId && winnerId === teamB.id ? teamB.name : null;

    const loserName =
      winnerName
        ? (winnerName === teamA.name ? teamB.name : teamA.name)
        : null;

    const res = {
      id: match.id,
      date: match.createdAt.toISOString(),
      round: match.round ?? null,
      state: match.state,
      teams: [teamA, teamB],
      winnerTeamId: winnerId,
      winnerName,
      loserName,
      partial:
        (teamA.players?.length ?? 0) === 0 && (teamB.players?.length ?? 0) === 0,
    };

    return NextResponse.json({ match: res });
  } catch (err) {
    console.error("[/api/matches/[id]] error:", err);
    return NextResponse.json({ error: "Failed to load match" }, { status: 500 });
  }
}
