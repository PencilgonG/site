import { NextResponse } from "next/server";
import { resolveAvatarUrl } from "@/lib/discord";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const userId = params.id;
  try {
    const url = await resolveAvatarUrl(userId);
    return new NextResponse(JSON.stringify({ url }), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control":
          "public, s-maxage=86400, max-age=86400, stale-while-revalidate=86400",
      },
    });
  } catch {
    let idx = 0;
    try { idx = Number(BigInt(userId) % 6n); } catch {}
    const url = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    return NextResponse.json({ url }, { status: 200 });
  }
}
