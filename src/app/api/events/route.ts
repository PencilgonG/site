import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation création
const createSchema = z.object({
  title: z.string().min(2).max(120),
  startAt: z.string().min(1), // on parse et valide à la main pour accepter 'YYYY-MM-DDTHH:mm'
  mode: z.string().max(50).optional(),
  maxPlayers: z.number().int().positive().max(1000).optional(),
  description: z.string().max(5000).optional(),
  isOpen: z.boolean().optional(),
});

// GET /api/events
// Query params :
//   - all=1             -> ignorer la fenêtre temporelle
//   - includeClosed=1   -> inclure isOpen=false
//   - limit=10          -> nombre max d'items (1..50), défaut 12 (si !all)
//   - from=ISO          -> borne min (incluse) pour startAt
//   - to=ISO            -> borne max (incluse) pour startAt
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";
    const includeClosed = url.searchParams.get("includeClosed") === "1";
    const limitParam = Number(url.searchParams.get("limit") ?? (all ? "0" : "12"));
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(limitParam, 50))
      : all
      ? undefined
      : 12;

    const fromStr = url.searchParams.get("from");
    const toStr = url.searchParams.get("to");

    const where: any = {};
    // Fenêtre temporelle
    if (!all || fromStr || toStr) {
      const now = new Date();
      where.startAt = {
        gte: fromStr ? new Date(fromStr) : now,
        lte: toStr ? new Date(toStr) : undefined,
      };
    }
    // Ouverture/fermeture
    if (!includeClosed) {
      where.isOpen = true;
    }

    const items = await prisma.inhouseEvent.findMany({
      where,
      orderBy: { startAt: "asc" },
      take: limit,
    });

    return NextResponse.json({ events: items });
  } catch (err) {
    console.error("[GET /api/events]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/events  (admin)
// Header: x-admin-token: <ADMIN_TOKEN>
export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Parse/valide la date
    const startAt = new Date(data.startAt);
    if (isNaN(startAt.valueOf())) {
      return NextResponse.json(
        { error: "invalid_startAt", message: "startAt doit être une date valide (ISO ou YYYY-MM-DDTHH:mm)" },
        { status: 400 }
      );
    }

    const created = await prisma.inhouseEvent.create({
      data: {
        title: data.title,
        startAt,
        mode: data.mode,
        maxPlayers: data.maxPlayers,
        description: data.description,
        isOpen: data.isOpen ?? true,
      },
    });

    return NextResponse.json({ event: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
