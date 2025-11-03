import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveAvatarUrl } from "@/lib/discord";

/** Force le mode dynamique & pas de cache côté Vercel/Next */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  };
}

/**
 * GET /api/profiles
 * Renvoie tous les profils enrichis :
 * - avatar (via DISCORD_TOKEN si dispo, sinon fallback)
 * - points (somme de PointsLedger)
 */
export async function GET() {
  try {
    // 1) Récupère tous les profils (les plus récents d’abord)
    const profiles = await prisma.userProfile.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // 2) Points en une requête (groupBy)
    const grouped = await prisma.pointsLedger.groupBy({
      by: ["discordId"],
      _sum: { points: true },
    });
    const pointsMap = new Map<string, number>(
      grouped.map((r) => [r.discordId, r._sum.points ?? 0]),
    );

    // 3) Résout les avatars en parallèle (avec fallback)
    const items = await Promise.all(
      profiles.map(async (p) => {
        let avatar = "";
        try {
          avatar = await resolveAvatarUrl(p.discordId);
        } catch {
          // Fallback déterministe (avatars Discord 0..4)
          try {
            const idx = Number(BigInt(p.discordId) % BigInt(5)); // 0..4
            avatar = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
          } catch {
            avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
          }
        }

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
      }),
    );

    return NextResponse.json({ profiles: items }, { headers: noStoreHeaders() });
  } catch (e) {
    console.error("[GET /api/profiles] server_error:", e);
    return NextResponse.json(
      { error: "server_error" },
      { status: 500, headers: noStoreHeaders() },
    );
  }
}
