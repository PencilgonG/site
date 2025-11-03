"use client";

import { useEffect, useState } from "react";

type TwitchStatus = {
  live: boolean;
  title?: string | null;
  viewer_count?: number | null;
  embedUrl: string;
  channel?: string;
  reason?: string;
  login?: string; // si ton /api/twitch/status renvoie le login
};

export function TwitchWidget({ mode = "full" }: { mode?: "full" | "preview" }) {
  const [st, setSt] = useState<TwitchStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/twitch/status", { cache: "no-store" });
      const data = (await res.json()) as TwitchStatus;
      setSt(data);
    } catch (e) {
      setSt({ live: false, embedUrl: "", reason: "client_error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  if (mode === "preview") {
    const login =
      st?.channel || st?.login || (st?.embedUrl ? new URL(st.embedUrl).searchParams.get("channel") || "" : "");
    const W = 1280;
    const H = 720;
    const preview = login
      ? `https://static-cdn.jtvnw.net/previews-ttv/live_user_${login}-${W}x${H}.jpg`
      : "";

    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex h-full items-center justify-center text-white/60">Chargement…</div>
        ) : st?.live && preview ? (
          <img
            src={preview}
            alt="Twitch preview"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-black text-white/60">Offline</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-3">
          <div className="rounded bg-black/60 px-2 py-1 text-xs">{st?.title ?? "Twitch"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Twitch</h3>
        <button onClick={load} className="rounded border border-white/15 px-2 py-1 text-sm hover:bg-white/10">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="opacity-70">Chargement…</div>
      ) : !st ? (
        <div className="opacity-70">Statut inconnu.</div>
      ) : st.live ? (
        <div className="space-y-2">
          <div className="text-sm opacity-80">
            <span className="mr-2 rounded border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-red-300">
              ● LIVE
            </span>
            {st.title}
            {typeof st.viewer_count === "number" && <span className="ml-2 opacity-70">• {st.viewer_count} viewers</span>}
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            <iframe src={st.embedUrl} allowFullScreen frameBorder="0" className="h-full w-full" />
          </div>
        </div>
      ) : (
        <div className="text-sm opacity-80">
          <div className="mb-2">
            <span className="rounded border border-white/15 bg-white/10 px-2 py-0.5">Hors-ligne</span>
            {st.channel ? <span className="ml-2">@{st.channel}</span> : null}
          </div>
          <p className="opacity-70">Le stream est actuellement hors-ligne.</p>
        </div>
      )}
    </div>
  );
}
