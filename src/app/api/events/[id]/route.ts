import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  startAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional(),
  mode: z.string().max(50).optional(),
  maxPlayers: z.number().int().positive().max(1000).optional(),
  description: z.string().max(5000).optional(),
  isOpen: z.boolean().optional(),
});

// PATCH /api/events/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body", details: parsed.error.flatten() }, { status: 400 });
    }

    const patch = parsed.data as Record<string, unknown>;
    if (patch.startAt) patch.startAt = new Date(patch.startAt as string);

    const updated = await prisma.inhouseEvent.update({
      where: { id: params.id },
      data: patch,
    });

    return NextResponse.json({ event: updated });
  } catch (err) {
    console.error("[PATCH /api/events/[id]]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// DELETE /api/events/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await prisma.inhouseEvent.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/events/[id]]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
