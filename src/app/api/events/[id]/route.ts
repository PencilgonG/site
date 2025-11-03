import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/* ---------- Validation ---------- */

const patchSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  // ISO avec offset OU "YYYY-MM-DDTHH:mm"
  startAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional(),
  mode: z.string().max(50).optional(),
  maxPlayers: z.number().int().positive().max(1000).optional(),
  description: z.string().max(5000).nullable().optional(),
  isOpen: z.boolean().optional(),
});

/* ---------- Helpers ---------- */

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function badRequest(payload: any) {
  return NextResponse.json(payload, { status: 400 });
}

/* =========================================================
   PATCH /api/events/[id]
   ========================================================= */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // ⟵ params est une Promise
) {
  try {
    const { id } = await ctx.params; // ⟵ on "await" ici
    if (!id) return badRequest({ error: "missing_id" });

    const token = req.headers.get("x-admin-token");
    if (!token || token !== (process.env.ADMIN_TOKEN || "").trim()) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest({ error: "invalid_body", details: parsed.error.flatten() });
    }

    const d = parsed.data;
    const patch: any = {};

    if (typeof d.title !== "undefined") {
      const t = d.title.trim();
      if (!t) return badRequest({ error: "invalid_title" });
      patch.title = t;
    }
    if (typeof d.mode !== "undefined") patch.mode = d.mode.trim() || null;
    if (typeof d.maxPlayers !== "undefined") patch.maxPlayers = d.maxPlayers;
    if (typeof d.description !== "undefined") patch.description = d.description ?? null;
    if (typeof d.isOpen !== "undefined") patch.isOpen = d.isOpen;

    if (typeof d.startAt !== "undefined") {
      const raw = String(d.startAt).trim();
      if (raw) {
        const date = new Date(raw);
        if (isNaN(date.valueOf())) {
          return badRequest({
            error: "invalid_startAt",
            message: "startAt doit être une date valide (ISO ou YYYY-MM-DDTHH:mm)",
          });
        }
        patch.startAt = date;
      }
    }

    if (Object.keys(patch).length === 0) {
      return badRequest({ error: "empty_patch", message: "Aucun champ valide à mettre à jour." });
    }

    const updated = await prisma.inhouseEvent.update({
      where: { id },
      data: patch,
    });

    return NextResponse.json({ event: updated });
  } catch (err) {
    console.error("[PATCH /api/events/[id]]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/* =========================================================
   DELETE /api/events/[id]
   ========================================================= */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // ⟵ idem, on reçoit une Promise
) {
  try {
    const { id } = await ctx.params; // ⟵ on "await" ici
    if (!id) return badRequest({ error: "missing_id" });

    const token = req.headers.get("x-admin-token");
    if (!token || token !== (process.env.ADMIN_TOKEN || "").trim()) return unauthorized();

    await prisma.inhouseEvent.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/events/[id]]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
