import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

function isAdmin(req: Request) {
  const token = req.headers.get("x-admin-token") || "";
  return token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

// PUT /api/faq/[id] -> modifier (admin)
export async function PUT(req: Request, ctx: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const data: any = {};
  if (Object.prototype.hasOwnProperty.call(body, "question"))
    data.question = sanitizeString(body.question, 500);
  if (Object.prototype.hasOwnProperty.call(body, "answer"))
    data.answer = sanitizeString(body.answer, 5000);
  if (Object.prototype.hasOwnProperty.call(body, "order")) {
    const n = Number(body.order);
    if (Number.isFinite(n)) data.order = Math.max(0, Math.floor(n));
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }

  const saved = await prisma.faqItem.update({ where: { id }, data });
  return NextResponse.json({ ok: true, item: saved });
}

// DELETE /api/faq/[id] -> supprimer (admin)
export async function DELETE(req: Request, ctx: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  await prisma.faqItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
