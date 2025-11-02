import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveAvatarUrl } from "@/lib/discord";

/**
 * GET /api/profiles
 * Renvoie tous les profils enrichis :
 * - avatar (via DISCORD_TOKEN si dispo, sinon fallback)
 * - points (somme de PointsLedger)
 */
export async function GET() {
  try {
    // 1) Récupère tous les profils
    const profiles = await prisma.userProfile.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // 2) Récupère les points en 1 requête (groupBy)
    const grouped = await prisma.pointsLedger.groupBy({
      by: ["discordId"],
      _sum: { points: true },
    });
    const pointsMap = new Map<string, number>(
      grouped.map((r) => [r.discordId, r._sum.points ?? 0])
    );

    // 3) Résout les avatars en parallèle (avec cache dans lib/discord.ts)
    const items = await Promise.all(
      profiles.map(async (p) => {
        const avatar = await resolveAvatarUrl(p.discordId);
        return {
          discordId: p.discordId,
          summonerName: p.summonerName,
          elo: p.elo,
          mainRole: p.mainRole,
          secondaryRole: p.secondaryRole,
          opggUrl: p.opggUrl,
          dpmUrl: p.dpmUrl,
          updatedAt: p.updatedAt.toISOString(),
          avatar,
          points: pointsMap.get(p.discordId) ?? 0,
        };
      })
    );

    return NextResponse.json({ profiles: items });
  } catch (e) {
    console.error("[GET /api/profiles]", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
