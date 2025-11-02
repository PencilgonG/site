"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  description?: string | null;
  startsAt: string; // ISO date
  createdBy?: string | null;
};

export default function UpcomingInhousesWidget() {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events?limit=4", { cache: "no-store" });
      const data = await res.json();
      setItems(data.events ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Inhouses à venir</h3>
        <button
          onClick={load}
          className="px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="opacity-70 text-sm">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="opacity-70 text-sm">Aucun évènement programmé.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="text-sm opacity-70">
                {new Date(e.startsAt).toLocaleString("fr-FR")}
              </div>
              <div className="font-medium">{e.title}</div>
              {e.description ? (
                <div className="text-sm opacity-80 line-clamp-2">
                  {e.description}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 text-right">
        <Link
          href="/admin/events"
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          Gérer les évènements
        </Link>
      </div>
    </div>
  );
}
