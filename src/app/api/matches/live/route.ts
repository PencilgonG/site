import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UiRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";
const toUiRole = (db: "TOP" | "JGL" | "MID" | "ADC" | "SUPP" | "SUB"): UiRole =>
  db === "JGL" ? "JUNGLE" : db === "SUPP" ? "SUPPORT" : (db as UiRole);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Fenêtre large pour capter les sessions en cours (6h) */
const MAX_CREATED_HOURS = 6;

export async function GET() {
  try {
    const createdAfter = new Date(Date.now() - MAX_CREATED_HOURS * 60 * 60 * 1000);

    // 1) Récupère les matchs récents "live" (RUNNING ou PENDING).
    //    On récupère aussi le round pour pouvoir ne garder que le round courant par lobby.
    const rows = await prisma.match.findMany({
      where: {
        createdAt: { gte: createdAfter },
        state: { in: ["RUNNING", "PENDING"] as any },
      },
      orderBy: [{ lobbyId: "asc" }, { round: "asc" }, { createdAt: "asc" }],
      take: 200,
      select: {
        id: true,
        lobbyId: true,
        teamAId: true,
        teamBId: true,
        round: true,
        state: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { live: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // 2) Calcule, pour chaque lobby, le "round courant" = plus petit round
    //    présent dans rows (donc RUNNING/PENDING uniquement).
    const currentRoundByLobby = new Map<string, number>();
    for (const m of rows) {
      const prev = currentRoundByLobby.get(m.lobbyId);
      if (prev == null || m.round < prev) currentRoundByLobby.set(m.lobbyId, m.round);
    }

    // 3) Filtre : garde uniquement les matchs du round courant de leur lobby.
    const filtered = rows.filter((m) => m.round === currentRoundByLobby.get(m.lobbyId));

    if (filtered.length === 0) {
      return NextResponse.json(
        { live: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // 4) Charge les équipes en un batch (sans dépendre de noms de relations sur Match).
    const teamIds = Array.from(new Set(filtered.flatMap((m) => [m.teamAId, m.teamBId])));

    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: {
        id: true,
        name: true,
        // Schéma unifié : Team.members -> TeamMember.participant
        members: {
          select: {
            participant: {
              select: { discordId: true, display: true, role: true },
            },
          },
        },
      },
    });

    const teamById = new Map(teams.map((t) => [t.id, t]));

    // 5) Dé-duplication par paire d’équipes dans un lobby (sécurité).
    const seen = new Set<string>();
    const uniques = filtered.filter((m) => {
      const a = m.teamAId;
      const b = m.teamBId;
      const key = m.lobbyId + ":" + (a < b ? `${a}:${b}` : `${b}:${a}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const mapTeam = (t: any) => ({
      name: t?.name ?? `TEAM ${t?.id ?? ""}`,
      players:
        (t?.members ?? [])
          .map((m: any) => m?.participant)
          .filter(Boolean)
          .map((p: any) => {
            const role = toUiRole((p.role ?? "SUB") as any);

            // Pas de littéral 5n → BigInt(5) (compat TS plus anciennes)
            let idx = 0;
            try {
              const did = p.discordId ?? "0";
              idx = Number(BigInt(did) % BigInt(5)); // 0..4
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
          }) ?? [],
    });

    const live = uniques.map((m) => {
      const ta = teamById.get(m.teamAId);
      const tb = teamById.get(m.teamBId);
      return {
        id: m.id,
        lobbyId: m.lobbyId,
        round: m.round,
        startedAt: m.createdAt.toISOString(),
        lastUpdate: m.updatedAt.toISOString(),
        teams: [mapTeam(ta), mapTeam(tb)],
      };
    });

    return NextResponse.json(
      { live },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[/api/matches/live] error:", err);
    return NextResponse.json(
      { error: "Failed to load live matches" },
      { status: 500 }
    );
  }
}
