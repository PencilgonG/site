"use client";

import { useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  startAt?: string;   // API actuelle
  startsAt?: string;  // compat
  mode?: string | null; // "announcement" | undefined
  isOpen?: boolean | null;
};

function whenStr(e: EventItem) {
  const iso = e.startsAt ?? e.startAt ?? "";
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.valueOf()) ? "" : d.toLocaleString("fr-FR");
}

export default function SchedulePage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin éphémère
  const [token, setToken] = useState("");
  const [adminOn, setAdminOn] = useState(false);
  const isAdmin = useMemo(() => adminOn && !!token, [adminOn, token]);

  async function refresh() {
    setLoading(true);
    try {
      const r = await fetch("/api/events?all=1&includeClosed=1&limit=30", { cache: "no-store" });
      const j = await r.json();
      setItems(Array.isArray(j.events) ? j.events : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function adminOff() {
    setAdminOn(false);
    setToken(""); // on efface le token
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-[calc(var(--header-height,56px)+16px)] text-white">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-3xl font-semibold">Inhouses & annonces</h1>
        <button onClick={refresh} className="ml-2 rounded border border-white/15 px-2 py-1 text-sm hover:bg-white/10">
          Refresh
        </button>

        <div className="ml-auto flex items-center gap-2">
          {!isAdmin ? (
            <>
              <input
                type="password"
                className="rounded border border-white/15 bg-black/40 px-3 py-2 text-sm"
                placeholder="ADMIN_TOKEN"
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
              />
              <button
                onClick={() => {
                  if (!token) return alert("Entre un token admin");
                  setAdminOn(true);
                }}
                className="rounded border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-sm text-emerald-300 hover:bg-emerald-500/10"
              >
                Admin ON
              </button>
            </>
          ) : (
            <button
              onClick={adminOff}
              className="rounded border border-red-400/40 bg-red-400/10 px-2 py-1 text-sm text-red-300 hover:bg-red-400/20"
            >
              Admin OFF
            </button>
          )}
        </div>
      </div>

      {/* Création */}
      {isAdmin && <CreateEventForm adminToken={token} onCreated={refresh} />}

      {/* Liste */}
      {loading ? (
        <div className="opacity-70">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="opacity-70">Aucun élément.</div>
      ) : (
        <ul className="space-y-3">
          {items
            .sort((a, b) => {
              const ad = new Date(a.startsAt ?? a.startAt ?? 0).valueOf();
              const bd = new Date(b.startsAt ?? b.startAt ?? 0).valueOf();
              return ad - bd;
            })
            .map((e) => (
              <EventRow key={e.id} item={e} isAdmin={isAdmin} adminToken={token} onChanged={refresh} />
            ))}
        </ul>
      )}
    </main>
  );
}

function CreateEventForm({ adminToken, onCreated }: { adminToken: string; onCreated: () => void }) {
  const [type, setType] = useState<"inhouses" | "announcement">("inhouses");
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title) return alert("Titre requis");
    if (type === "inhouses" && !when) return alert("Date/heure requise");

    setBusy(true);
    try {
      const payload: any = {
        title,
        description: desc || undefined,
        isOpen: true,
        mode: type === "announcement" ? "announcement" : undefined,
        // Sans migration : on enregistre quand même un startAt pour l'API existante.
        startAt: type === "announcement" ? new Date().toISOString() : new Date(when).toISOString(),
      };

      const r = await fetch("/api/events", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert("Erreur création: " + (e.error || r.status));
        return;
      }
      setTitle("");
      setWhen("");
      setDesc("");
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
      <div className="font-medium text-emerald-200">Créer un élément</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <select
          className="rounded border border-white/15 bg-black/40 px-2 py-2 text-white"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="inhouses">Inhouse planifiée</option>
          <option value="announcement">Annonce MYG</option>
        </select>
        <input
          className="rounded border border-white/15 bg-black/40 px-3 py-2 text-white md:col-span-2"
          placeholder="Titre…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          type="datetime-local"
          className="rounded border border-white/15 bg-black/40 px-3 py-2 text-white disabled:opacity-40"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          disabled={type === "announcement"}
        />
        <textarea
          className="min-h-[44px] w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white"
          placeholder="Description (optionnel)…"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={busy}
          onClick={submit}
          className="ml-auto rounded border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-60"
        >
          Publier
        </button>
      </div>
    </div>
  );
}

function EventRow({
  item,
  isAdmin,
  adminToken,
  onChanged,
}: {
  item: EventItem;
  isAdmin: boolean;
  adminToken: string;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [desc, setDesc] = useState(item.description ?? "");
  const [type, setType] = useState<"inhouses" | "announcement">(
    (item.mode ?? "") === "announcement" ? "announcement" : "inhouses"
  );
  const [when, setWhen] = useState(() => {
    const iso = item.startsAt ?? item.startAt ?? "";
    return iso ? new Date(iso).toISOString().slice(0, 16) : "";
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const payload: any = {
        title,
        description: desc || null,
        mode: type === "announcement" ? "announcement" : null,
        startAt: type === "announcement" ? new Date().toISOString() : new Date(when).toISOString(),
      };
      const r = await fetch(`/api/events/${item.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert("Erreur édition: " + (e.error || r.status));
        return;
      }
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Supprimer cet élément ?")) return;
    const r = await fetch(`/api/events/${item.id}`, {
      method: "DELETE",
      headers: { "x-admin-token": adminToken },
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      alert("Erreur suppression: " + (e.error || r.status));
      return;
    }
    onChanged();
  }

  if (!editing)
    return (
      <li className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium">
              {title} {type === "announcement" ? <span className="text-xs opacity-70">• Annonce</span> : null}
            </div>
            <div className="text-xs opacity-70">{whenStr(item)}</div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10">
                Éditer
              </button>
              <button
                onClick={remove}
                className="rounded border border-red-400/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
        {item.description ? <div className="mt-2 whitespace-pre-wrap text-sm opacity-90">{item.description}</div> : null}
      </li>
    );

  return (
    <li className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
      <div className="mb-2 flex items-center gap-3">
        <select
          className="rounded border border-white/15 bg-black/40 px-2 py-1 text-white"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="inhouses">Inhouse planifiée</option>
          <option value="announcement">Annonce MYG</option>
        </select>
        <input
          className="flex-1 rounded border border-white/15 bg-black/40 px-3 py-2 text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          type="datetime-local"
          className="rounded border border-white/15 bg-black/40 px-3 py-2 text-white disabled:opacity-40"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          disabled={type === "announcement"}
        />
        <textarea
          className="min-h-[44px] w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={save}
          className="rounded border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-60"
        >
          Enregistrer
        </button>
        <button onClick={() => setEditing(false)} className="rounded border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10">
          Annuler
        </button>
      </div>
    </li>
  );
}
