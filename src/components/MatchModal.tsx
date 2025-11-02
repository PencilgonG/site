"use client";

import { useEffect, useState } from "react";

interface MatchModalProps {
  matchId: string | null;
  onClose: () => void;
}

export default function MatchModal({ matchId, onClose }: MatchModalProps) {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    setErrorText(null);
    setMatch(null);

    fetch(`/api/matches/${matchId}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setMatch(d.match))
      .catch((e) => setErrorText(e.message || "Erreur"))
      .finally(() => setLoading(false));
  }, [matchId]);

  if (!matchId) return null;

  const renderTeam = (t: any) => {
    const hasPlayers = (t?.players?.length ?? 0) > 0;
    return (
      <div className="rounded-lg border border-white/10 p-4">
        <h3 className="font-medium mb-3">{t?.name ?? "TEAM ?"}</h3>

        {hasPlayers ? (
          <div className="space-y-2">
            {t.players.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-8 h-8 rounded-full border border-white/10"
                />
                <div>
                  <div className="text-sm">{p.name}</div>
                  <div className="text-xs opacity-70">{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm opacity-70 italic">
            Aucun joueur en base pour cette équipe
            <span className="not-italic"> — (match de test/bot ou données incomplètes)</span>.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 border border-white/10 rounded-2xl w-[90%] max-w-3xl p-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          aria-label="Fermer"
        >
          ✕
        </button>

        {loading ? (
          <p>Chargement…</p>
        ) : errorText ? (
          <p className="text-red-300">Erreur: {errorText}</p>
        ) : !match ? (
          <p>Aucune donnée.</p>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-2">
              {match.teams?.[0]?.name ?? "TEAM A"} vs{" "}
              {match.teams?.[1]?.name ?? "TEAM B"}
            </h2>

            <p className="text-sm opacity-70 mb-2">
              {new Date(match.date).toLocaleString("fr-FR")}
              {match.round ? <> • Round {match.round}</> : null} • {match.state}
            </p>

            {match.winnerName && (
              <div className="mb-4 flex flex-wrap gap-3">
                <span className="px-2 py-1 rounded bg-green-500/15 text-green-300 border border-green-500/30 text-sm">
                  ✅ Vainqueur : <strong>{match.winnerName}</strong>
                </span>
                {match.loserName && (
                  <span className="px-2 py-1 rounded bg-red-500/15 text-red-300 border border-red-500/30 text-sm">
                    ❌ Perdant : <strong>{match.loserName}</strong>
                  </span>
                )}
              </div>
            )}

            {match.partial && (
              <div className="mb-4 text-sm bg-yellow-400/10 text-yellow-200 border border-yellow-400/30 rounded-lg p-2">
                Données partielles détectées (match de test/bot ?).<br />
                Les équipes sont connues mais aucun joueur lié n’a été trouvé en base.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTeam(match.teams?.[0])}
              {renderTeam(match.teams?.[1])}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
