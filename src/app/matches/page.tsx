"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import MatchModal from "@/components/MatchModal";

type Match = {
  id: string;
  date: string;
  teams: string[];
  winner: string;
  round?: number;
};

export default function MatchesPage() {
  const [recent, setRecent] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/matches/recent", { cache: "no-store" });
      const data = await res.json();
      setRecent(data.matches ?? []);
    } catch (err) {
      console.error("Erreur chargement matchs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[calc(var(--header-height)+16px)] mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Matchs</h1>
          <button
            onClick={fetchMatches}
            className="px-3 py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="opacity-70">Chargement…</div>
        ) : recent.length === 0 ? (
          <div className="opacity-70">Aucun match terminé.</div>
        ) : (
          <div className="space-y-3">
            {recent.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className="w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition"
              >
                <div className="text-sm opacity-70">
                  {new Date(m.date).toLocaleString("fr-FR")}
                  {typeof m.round !== "undefined" && (
                    <span className="ml-2">• Round {m.round}</span>
                  )}
                </div>
                <div className="text-base">
                  {m.teams.join(" vs ")} —{" "}
                  <span className="opacity-80">Vainqueur: {m.winner}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal détail du match */}
      <MatchModal matchId={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
