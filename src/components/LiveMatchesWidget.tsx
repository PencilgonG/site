"use client";

import { useEffect, useState, useRef } from "react";

type UiRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";
type LivePlayer = { id: string; discordId: string; name: string; role: UiRole; avatar: string };
type LiveTeam = { name: string; players: LivePlayer[] };
type LiveMatch = { id: string; startedAt: string; teams: LiveTeam[] };

export default function LiveMatchesWidget() {
  const [data, setData] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const fetchLive = async () => {
    try {
      const res = await fetch("/api/matches/live", { cache: "no-store" });
      const json = await res.json();
      setData(json.live ?? []);
    } catch (e) {
      console.error("live fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    timer.current = setInterval(fetchLive, 8000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Matchs en direct</h3>
        <button
          onClick={fetchLive}
          className="px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="opacity-70">Chargement…</div>
      ) : data.length === 0 ? (
        <div className="opacity-70">Aucun match en cours.</div>
      ) : (
        <div className="space-y-3">
          {data.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs opacity-70 mb-2">
                Début: {new Date(m.startedAt).toLocaleTimeString("fr-FR")}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {m.teams.map((t, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-sm font-medium mb-2">{t.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {t.players.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-2 py-1"
                          title={`${p.role}`}
                        >
                          {/* on reste en <img> simple pour éviter la config Next Image */}
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-6 h-6 rounded-full border border-white/20"
                          />
                          <span className="text-sm">{p.name}</span>
                          <span className="text-[10px] opacity-70">({p.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
