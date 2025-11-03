"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  description?: string | null;
  startAt?: string;   // API actuelle
  startsAt?: string;  // compat
  mode?: string | null; // "announcement" | undefined
  createdBy?: string | null;
};

function getWhen(e: Event) {
  const iso = e.startsAt ?? e.startAt ?? "";
  const d = iso ? new Date(iso) : null;
  return d ? d.toLocaleString("fr-FR") : "";
}

export default function UpcomingInhousesWidget() {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events?limit=4", { cache: "no-store" });
      const data = await res.json();
      const events: Event[] = data.events ?? [];
      // Afficher uniquement les VRAIES inhouses (pas les annonces)
      setItems(events.filter((e) => (e.mode ?? "") !== "announcement"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Inhouses à venir</h3>
        <button onClick={load} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-sm hover:bg-white/10">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-sm opacity-70">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="text-sm opacity-70">Aucun évènement programmé.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((e) => (
            <li key={e.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-sm opacity-70">{getWhen(e)}</div>
              <div className="font-medium">{e.title}</div>
              {e.description ? <div className="line-clamp-2 text-sm opacity-80">{e.description}</div> : null}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 text-right">
        <Link href="/schedule" className="text-sm underline opacity-80 hover:opacity-100">
          Gérer les évènements
        </Link>
      </div>
    </div>
  );
}
