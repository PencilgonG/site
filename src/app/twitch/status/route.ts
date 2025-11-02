import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const login = process.env.TWITCH_USER_LOGIN;
  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = process.env.TWITCH_APP_ACCESS_TOKEN;

  // host courant pour param=parent du player
  const host = new URL(req.url).host;

  if (!login || !clientId || !token) {
    // Pas configuré : renvoyer un état "offline" explicite
    return NextResponse.json({
      live: false,
      reason: "missing_env",
      embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(
        login || "unknown"
      )}&parent=${host}`,
    });
  }

  try {
    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(
        login
      )}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${token}`,
        },
        // important en vercel/next
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { live: false, reason: `twitch_http_${res.status}`, details: text },
        { status: 200 }
      );
    }

    const data = await res.json();
    const item = Array.isArray(data?.data) ? data.data[0] : null;
    const live = !!item;

    return NextResponse.json({
      live,
      title: live ? item.title : null,
      viewer_count: live ? item.viewer_count : null,
      started_at: live ? item.started_at : null,
      thumbnail_url: live ? item.thumbnail_url : null,
      embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(
        login
      )}&parent=${host}&muted=true`,
      channel: login,
    });
  } catch (err) {
    console.error("[/api/twitch/status] error:", err);
    return NextResponse.json(
      { live: false, reason: "fetch_error" },
      { status: 200 }
    );
  }
}
