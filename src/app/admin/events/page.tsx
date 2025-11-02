"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/Navbar";

type Event = {
  id?: string;
  title: string;
  startsAt: string; // ISO
  description?: string | null;
  createdBy?: string | null;
};

export default function AdminEventsPage() {
  const [list, setList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Event>({
    title: "",
    startsAt: new Date(Date.now() + 3600_000).toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    description: "",
    createdBy: "",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/events?limit=50", { cache: "no-store" });
    const data = await res.json();
    setList(data.events ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async () => {
    try {
      setSaving(true);
      await fetch("/api/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: form.id ?? undefined,
          title: form.title,
          startsAt: new Date(form.startsAt).toISOString(),
          description: form.description,
          createdBy: form.createdBy || undefined,
        }),
      });
      setForm({
        title: "",
        startsAt: new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
        description: "",
        createdBy: "",
      });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (e: Event) => {
    setForm({
      id: e.id,
      title: e.title,
      startsAt: new Date(e.startsAt).toISOString().slice(0, 16),
      description: e.description ?? "",
      createdBy: e.createdBy ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Supprimer cet évènement ?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    await load();
  };

  const md = useMemo(() => form.description ?? "", [form.description]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[calc(var(--header-height)+16px)] mx-auto max-w-5xl px-4 pb-16">
        <h1 className="text-2xl font-semibold mb-6">Gestion des évènements</h1>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm opacity-80 mb-3">
              {form.id ? "Modifier l’évènement" : "Créer un évènement"}
            </div>

            <label className="block text-sm mb-1">Titre</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 mb-3"
              placeholder="Inhouse du dimanche soir"
            />

            <label className="block text-sm mb-1">Date & heure</label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 mb-3"
            />

            <label className="block text-sm mb-1">Créé par (Discord ID ou nom – optionnel)</label>
            <input
              value={form.createdBy ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, createdBy: e.target.value }))}
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 mb-3"
              placeholder="138774569646306102"
            />

            <label className="block text-sm mb-1">Description (Markdown)</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={8}
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 mb-4"
              placeholder="**Format**: BO1\n- Arrivez 5 minutes avant\n- Respect & fair-play"
            />

            <div className="flex gap-2">
              <button
                disabled={saving || !form.title || !form.startsAt}
                onClick={onSubmit}
                className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 border border-white/15 disabled:opacity-50"
              >
                {form.id ? "Enregistrer" : "Créer"}
              </button>
              {form.id && (
                <button
                  onClick={() =>
                    setForm({
                      title: "",
                      startsAt: new Date(Date.now() + 3600_000)
                        .toISOString()
                        .slice(0, 16),
                      description: "",
                      createdBy: "",
                    })
                  }
                  className="px-3 py-2 rounded bg-white/5 hover:bg-white/10 border border-white/15"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* Preview Markdown */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm opacity-80 mb-3">Prévisualisation</div>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{md || "_(aucune description)_"}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Prochains évènements</h2>
            <button
              onClick={load}
              className="px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="opacity-70">Chargement…</div>
          ) : list.length === 0 ? (
            <div className="opacity-70">Aucun évènement.</div>
          ) : (
            <ul className="space-y-2">
              {list.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div>
                    <div className="text-sm opacity-70">
                      {new Date(e.startsAt).toLocaleString("fr-FR")}
                    </div>
                    <div className="font-medium">{e.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(e)}
                      className="px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="px-2 py-1 rounded border border-red-400/30 text-red-300 bg-red-500/10 hover:bg-red-500/20 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
