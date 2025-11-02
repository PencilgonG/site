"use client";

import { useEffect, useState } from "react";

type TwitchStatus = {
  live: boolean;
  title?: string | null;
  viewer_count?: number | null;
  embedUrl: string;
  channel?: string;
  reason?: string;
};

export function TwitchWidget() {
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
    // petit refresh toutes les 60s
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Twitch</h3>
        <button
          onClick={load}
          className="text-sm px-2 py-1 rounded border border-white/15 hover:bg-white/10"
        >
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
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 mr-2">
              ● LIVE
            </span>
            {st.title}
            {typeof st.viewer_count === "number" && (
              <span className="ml-2 opacity-70">
                • {st.viewer_count} viewers
              </span>
            )}
          </div>
          {/* Twitch nécessite le paramètre ?parent=<host> déjà fourni par l'API */}
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            <iframe
              src={st.embedUrl}
              allowFullScreen
              frameBorder="0"
              className="w-full h-full"
            />
          </div>
        </div>
      ) : (
        <div className="text-sm opacity-80">
          <div className="mb-2">
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15">
              Hors-ligne
            </span>
            {st.channel ? <span className="ml-2">@{st.channel}</span> : null}
          </div>
          <p className="opacity-70">
            Le stream est actuellement hors-ligne.
          </p>
        </div>
      )}
    </div>
  );
}
