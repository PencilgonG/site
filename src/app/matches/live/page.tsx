"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

type UiRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";
type LivePlayer = { id: string; discordId: string; name: string; role: UiRole; avatar: string };
type LiveTeam = { name: string; players: LivePlayer[] };
type LiveMatch = { id: string; startedAt: string; teams: LiveTeam[] };

export default function LiveMatchesPage() {
  const [data, setData] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const fetchLive = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/matches/live", { cache: "no-store" });
      const json = await res.json();
      setData(json.live ?? []);
      setUpdatedAt(new Date());
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

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[calc(var(--header-height)+16px)] mx-auto max-w-5xl px-4 pb-16">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold">Matchs en direct</h1>
          <div className="flex items-center gap-2">
            {updatedAt ? (
              <span className="text-xs opacity-70">
                MAJ: {updatedAt.toLocaleTimeString("fr-FR")}
              </span>
            ) : null}
            <button
              onClick={fetchLive}
              className="px-3 py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="opacity-70">Chargement…</div>
        ) : data.length === 0 ? (
          <div className="opacity-80">
            Aucun match en cours pour le moment.
            <div className="mt-3">
              <Link
                href="/matches"
                className="text-sm underline opacity-80 hover:opacity-100"
              >
                Retour à l’historique des matchs
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((m) => (
              <article
                key={m.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm opacity-80">
                    Début&nbsp;:{" "}
                    <strong>{new Date(m.startedAt).toLocaleTimeString("fr-FR")}</strong>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    En cours
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {m.teams.map((t, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <div className="text-sm font-medium mb-2">{t.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {t.players.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1"
                            title={p.role}
                          >
                            <img
                              src={p.avatar}
                              alt={p.name}
                              className="w-7 h-7 rounded-full border border-white/20"
                            />
                            <span className="text-sm">{p.name}</span>
                            <span className="text-[10px] opacity-70">({p.role})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
