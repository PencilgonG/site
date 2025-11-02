import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/validate";

function isAdmin(req: Request) {
  const token = req.headers.get("x-admin-token") || "";
  return token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

// GET /api/faq  -> liste triée
export async function GET() {
  const items = await prisma.faqItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ items });
}

// POST /api/faq  -> créer (admin)
export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const question = sanitizeString(body?.question, 500);
  const answer = sanitizeString(body?.answer, 5000);

  if (!question || !answer) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // place à la fin
  const last = await prisma.faqItem.findFirst({ orderBy: { order: "desc" } });
  const order = (last?.order ?? 0) + 1;

  const created = await prisma.faqItem.create({
    data: { question, answer, order },
  });
  return NextResponse.json({ ok: true, item: created });
}
