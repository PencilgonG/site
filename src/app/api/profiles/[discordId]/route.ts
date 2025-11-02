import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sanitizeString,
  sanitizeUrl,
  sanitizeRoleDb,
  sanitizeElo,
} from "@/lib/validate";

type PutBody = {
  summonerName?: unknown;
  elo?: unknown;
  mainRole?: unknown;
  secondaryRole?: unknown;
  opggUrl?: unknown;
  dpmUrl?: unknown;
};

// Next 16: params est un Promise
type Ctx = { params: Promise<{ discordId: string }> };

// --- Utils ---
function isValidSnowflake(idRaw?: string | null): idRaw is string {
  if (!idRaw) return false;
  const id = idRaw.trim();
  try {
    const n = BigInt(id);
    if (n > 0n) return true;
  } catch {}
  return /^\d{5,30}$/.test(id);
}

function withHeaders(json: any, status = 200) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-route-version": "profiles-put-v3-partial",
    },
  });
}

// Helper: ajoute une clé **seulement si** elle est présente dans le body
function maybeSet<T extends object, K extends keyof T>(
  target: T,
  body: Record<string, unknown>,
  key: K,
  value: T[K]
) {
  if (Object.prototype.hasOwnProperty.call(body, key)) {
    // la clé était dans le JSON -> on applique (même si value = null)
    target[key] = value;
  }
}

// --- GET (optionnel) ---
export async function GET(_req: Request, ctx: Ctx) {
  const { discordId: raw } = await ctx.params;
  const id = raw?.trim();

  if (!isValidSnowflake(id)) {
    return withHeaders({ error: "invalid_discord_id", raw }, 400);
  }
  try {
    const p = await prisma.userProfile.findUnique({ where: { discordId: id } });
    if (!p) return withHeaders({ error: "not_found" }, 404);
    return withHeaders(p, 200);
  } catch (e) {
    console.error("[GET /api/profiles/:id]", e);
    return withHeaders({ error: "server_error" }, 500);
  }
}

// --- PUT (partial + sanitized) ---
export async function PUT(req: Request, ctx: Ctx) {
  const { discordId: raw } = await ctx.params;
  const id = raw?.trim();

  if (!isValidSnowflake(id)) {
    return withHeaders({ error: "invalid_discord_id", raw }, 400);
  }

  let body: PutBody;
  try {
    body = await req.json();
  } catch {
    return withHeaders({ error: "invalid_json" }, 400);
  }

  // Sanitize (mais on n’applique que si la clé existe dans body)
  const sanitized = {
    summonerName: sanitizeString(body.summonerName, 32),
    elo: sanitizeElo(body.elo),
    mainRole: sanitizeRoleDb(body.mainRole),
    secondaryRole: sanitizeRoleDb(body.secondaryRole),
    opggUrl: sanitizeUrl(body.opggUrl),
    dpmUrl: sanitizeUrl(body.dpmUrl),
  };

  // Données pour UPDATE (partial): n’ajoute que les clés présentes
  const updateData: any = { updatedAt: new Date() };
  maybeSet(updateData, body as any, "summonerName", sanitized.summonerName);
  maybeSet(updateData, body as any, "elo", sanitized.elo);
  maybeSet(updateData, body as any, "mainRole", sanitized.mainRole);
  maybeSet(updateData, body as any, "secondaryRole", sanitized.secondaryRole);
  maybeSet(updateData, body as any, "opggUrl", sanitized.opggUrl);
  maybeSet(updateData, body as any, "dpmUrl", sanitized.dpmUrl);

  // Données pour CREATE (complètes)
  const createData = {
    discordId: id,
    summonerName: sanitized.summonerName ?? null,
    elo: sanitized.elo ?? null,
    mainRole: sanitized.mainRole ?? null,
    secondaryRole: sanitized.secondaryRole ?? null,
    opggUrl: sanitized.opggUrl ?? null,
    dpmUrl: sanitized.dpmUrl ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const saved = await prisma.userProfile.upsert({
      where: { discordId: id },
      create: createData,
      update: updateData, // <= n’écrase que ce qui est explicitement présent
      select: { discordId: true },
    });
    return withHeaders({ ok: true, profile: saved }, 200);
  } catch (e) {
    console.error("[PUT /api/profiles/:id]", e);
    return withHeaders({ error: "server_error" }, 500);
  }
}
