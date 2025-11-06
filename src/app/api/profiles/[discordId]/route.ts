import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sanitizeString,
  sanitizeUrl,
  sanitizeRoleDb,
  sanitizeElo,
} from "@/lib/validate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PutBody = {
  summonerName?: unknown;
  elo?: unknown;
  mainRole?: unknown;
  secondaryRole?: unknown;
  opggUrl?: unknown;
  dpmUrl?: unknown;
};

type Ctx = { params: { discordId: string } };

function isValidSnowflake(id?: string) {
  if (!id) return false;
  return /^\d{5,30}$/.test(id);
}

function withHeaders(json: any, status = 200) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      pragma: "no-cache",
      expires: "0",
      "x-route-version": "profiles-put-v3-partial",
    },
  });
}

// Helper: ajoute une clé **seulement si** elle est présente dans le body
function maybeSet<T extends object, K extends keyof T>(
  target: T,
  body: Record<string, unknown>,
  key: K,
  value: unknown
) {
  if (Object.prototype.hasOwnProperty.call(body, key as string)) {
    // @ts-expect-error - assign checked at runtime
    target[key] = value as T[K];
  }
}

// --- GET (profil individuel) ---
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
    opggUrl: sanitizeUrl(body.opggUrl, 200),
    dpmUrl: sanitizeUrl(body.dpmUrl, 200),
  };

  const createData: any = { discordId: id };
  const updateData: any = {};

  maybeSet(createData, body, "summonerName", sanitized.summonerName);
  maybeSet(createData, body, "elo", sanitized.elo);
  maybeSet(createData, body, "mainRole", sanitized.mainRole);
  maybeSet(createData, body, "secondaryRole", sanitized.secondaryRole);
  maybeSet(createData, body, "opggUrl", sanitized.opggUrl);
  maybeSet(createData, body, "dpmUrl", sanitized.dpmUrl);

  maybeSet(updateData, body, "summonerName", sanitized.summonerName);
  maybeSet(updateData, body, "elo", sanitized.elo);
  maybeSet(updateData, body, "mainRole", sanitized.mainRole);
  maybeSet(updateData, body, "secondaryRole", sanitized.secondaryRole);
  maybeSet(updateData, body, "opggUrl", sanitized.opggUrl);
  maybeSet(updateData, body, "dpmUrl", sanitized.dpmUrl);

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
