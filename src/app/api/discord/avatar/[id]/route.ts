import { NextResponse } from "next/server";
import { resolveAvatarUrl } from "@/lib/discord";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const userId = params.id;
  try {
    const url = await resolveAvatarUrl(userId);
    return new NextResponse(JSON.stringify({ url }), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        // ⬇️ IMPORTANT: pas de cache CDN/navigateur (on garde le mini-cache mémoire interne)
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
      },
    });
  } catch {
    let idx = 0;
    try { idx = Number(BigInt(userId) % 6n); } catch {}
    const url = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    return NextResponse.json({ url }, {
      status: 200,
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
      }
    });
  }
}
