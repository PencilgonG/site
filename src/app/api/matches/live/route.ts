import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UiRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";
const toUiRole = (db: "TOP" | "JGL" | "MID" | "ADC" | "SUPP" | "SUB"): UiRole =>
  db === "JGL" ? "JUNGLE" : db === "SUPP" ? "SUPPORT" : (db as UiRole);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Fenêtres de sécurité :
 * - On n’affiche que des RUNNING créés il y a moins de 3h
 * - Et mis à jour il y a moins de 60 min (évite les vieux RUNNING bloqués)
 */
const MAX_CREATED_HOURS = 3;
const MAX_STALE_MINUTES = 60;

export async function GET() {
  try {
    const createdAfter = new Date(Date.now() - MAX_CREATED_HOURS * 60 * 60 * 1000);
    const updatedAfter = new Date(Date.now() - MAX_STALE_MINUTES * 60 * 1000);

    // 1) On ne prend que les matchs VRAIMENT en cours et récents
    const rows = await prisma.match.findMany({
      where: {
        state: "RUNNING",
        createdAt: { gte: createdAfter },
        updatedAt: { gte: updatedAfter },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // large pour couvrir plusieurs lobbys simultanés
      select: {
        id: true,
        lobbyId: true,
        teamAId: true,
        teamBId: true,
        createdAt: true,
        updatedAt: true,
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

    // 2) Dé-duplication : un seul match par (lobbyId, paire d’équipes)
    // Normalisation de la paire: minId:maxId
    const seen = new Set<string>();
    const uniques = rows.filter((m) => {
      const a = m.teamAId;
      const b = m.teamBId;
      const key = m.lobbyId + ":" + (a < b ? `${a}:${b}` : `${b}:${a}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 3) Mapping UI
    const mapTeam = (t: any) => ({
      name: t?.name ?? `TEAM ${t?.id ?? ""}`,
      players: (t?.TeamMember ?? [])
        .map((tm: any) => tm?.LobbyParticipant)
        .filter(Boolean)
        .map((p: any) => {
          const role = toUiRole((p.role ?? "SUB") as any);
          let idx = 0;
          try {
            idx = Number(BigInt(p.discordId) % 5n);
          } catch {
            idx = 0;
          }
          const avatar = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
          return {
            id: p.discordId,
            discordId: p.discordId,
            name: p.display ?? p.discordId,
            role,
            avatar,
          };
        }),
    });

    const live = uniques.map((m) => ({
      id: m.id,
      lobbyId: m.lobbyId,
      startedAt: m.createdAt.toISOString(),
      lastUpdate: m.updatedAt.toISOString(),
      teams: [
        mapTeam(m.Team_Match_teamAIdToTeam),
        mapTeam(m.Team_Match_teamBIdToTeam),
      ],
    }));

    return NextResponse.json({ live }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/matches/live] error:", err);
    return NextResponse.json({ error: "Failed to load live matches" }, { status: 500 });
  }
}
