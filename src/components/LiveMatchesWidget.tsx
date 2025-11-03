"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
      setData([]);
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

  const isActive = data.length > 0;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${
        isActive ? "shadow-[0_0_20px_rgba(0,200,255,0.18)]" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Matchs en direct</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLive}
            className="px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
          >
            🔄 Refresh
          </button>
          <Link
            href="/matches/live"
            className="text-sm px-2 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/20"
          >
            Voir tout ↗
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="opacity-70">Chargement…</div>
      ) : data.length === 0 ? (
        <div className="opacity-70">Aucun match en cours.</div>
      ) : (
        // aperçu compact des premiers matchs
        <div className="space-y-2">
          {data.slice(0, 1).map((m) => (
            <div key={m.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs opacity-70 mb-2">
                Début&nbsp;: {new Date(m.startedAt).toLocaleTimeString("fr-FR")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {m.teams.map((t, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="text-sm font-medium mb-2">{t.name}</div>
                    <div className="flex flex-wrap gap-1">
                      {t.players.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-0.5"
                          title={p.role}
                        >
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-5 h-5 rounded-full border border-white/20"
                          />
                          <span className="text-xs">{p.name}</span>
                        </div>
                      ))}
                      {t.players.length > 3 && (
                        <span className="text-xs opacity-70">+{t.players.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {data.length > 1 && (
            <div className="text-xs opacity-70">
              + {data.length - 1} autre(s) match(s)…{" "}
              <Link href="/matches/live" className="underline hover:opacity-100">
                voir tout
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
