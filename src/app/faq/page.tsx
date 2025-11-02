"use client";

import { useEffect, useMemo, useState } from "react";

type FaqItem = {
  id: string;
  order: number;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
};

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  // Admin
  const [adminToken, setAdminToken] = useState<string>("");
  const isAdmin = useMemo(() => !!adminToken, [adminToken]);

  useEffect(() => {
    const t = localStorage.getItem("myg_admin_token") || "";
    setAdminToken(t);
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/faq", { cache: "no-store" });
      const j = await r.json();
      setItems(j.items || []);
    })();
  }, []);

  async function saveNew(q: string, a: string) {
    const r = await fetch("/api/faq", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-token": adminToken,
      },
      body: JSON.stringify({ question: q, answer: a }),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      alert("Erreur création: " + (e.error || r.status));
      return;
    }
    const j = await r.json();
    setItems((prev) => [...prev, j.item].sort(byOrder));
  }

  async function saveEdit(id: string, patch: Partial<FaqItem>) {
    const r = await fetch(`/api/faq/${id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-admin-token": adminToken,
      },
      body: JSON.stringify(patch),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      alert("Erreur édition: " + (e.error || r.status));
      return;
    }
    const j = await r.json();
    setItems((prev) => prev.map((it) => (it.id === id ? j.item : it)).sort(byOrder));
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette entrée ?")) return;
    const r = await fetch(`/api/faq/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": adminToken },
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      alert("Erreur suppression: " + (e.error || r.status));
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-white">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-semibold">FAQ</h1>
        {/* Admin token */}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="password"
            className="px-3 py-2 rounded bg-black/40 border border-white/15 text-sm"
            placeholder="ADMIN_TOKEN"
            defaultValue={adminToken}
            onChange={(e) => {
              const v = e.target.value.trim();
              setAdminToken(v);
              localStorage.setItem("myg_admin_token", v);
            }}
          />
          <span className="text-xs opacity-70">{isAdmin ? "Admin ON" : "Admin OFF"}</span>
        </div>
      </div>

      {/* Accordéon */}
      <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
        {items.sort(byOrder).map((it) => (
          <ItemRow
            key={it.id}
            item={it}
            open={openId === it.id}
            onToggle={() => setOpenId(openId === it.id ? null : it.id)}
            isAdmin={isAdmin}
            onEdit={saveEdit}
            onRemove={remove}
          />
        ))}
      </div>

      {/* Ajout admin */}
      {isAdmin && <CreateRow onCreate={saveNew} />}
    </main>
  );
}

function byOrder(a: FaqItem, b: FaqItem) {
  if (a.order !== b.order) return a.order - b.order;
  return a.createdAt.localeCompare(b.createdAt);
}

function ItemRow({
  item,
  open,
  onToggle,
  isAdmin,
  onEdit,
  onRemove,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  onEdit: (id: string, patch: Partial<FaqItem>) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState(item.question);
  const [a, setA] = useState(item.answer);
  const [ord, setOrd] = useState(item.order.toString());

  useEffect(() => {
    if (!editing) {
      setQ(item.question);
      setA(item.answer);
      setOrd(String(item.order));
    }
  }, [editing, item]);

  return (
    <div className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-white/5 flex items-start gap-3"
        aria-expanded={open}
      >
        <span className="mt-1 select-none">{open ? "▾" : "▸"}</span>
        <span className="font-medium">{item.question}</span>
        {isAdmin && !editing && (
          <span className="ml-auto flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="text-xs rounded px-2 py-1 border border-white/15 hover:bg-white/10"
            >
              Éditer
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="text-xs rounded px-2 py-1 border border-red-400/40 text-red-300 hover:bg-red-500/10"
            >
              Supprimer
            </button>
          </span>
        )}
      </button>

      {/* Contenu déroulant */}
      <div
        className="px-5 pb-4 transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? 1000 : 0 }}
      >
        {!editing ? (
          <div className="opacity-90 leading-relaxed whitespace-pre-wrap">{item.answer}</div>
        ) : (
          <div className="space-y-3">
            <input
              className="w-full px-3 py-2 rounded bg-black/40 border border-white/15"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <textarea
              className="w-full px-3 py-2 rounded bg-black/40 border border-white/15 min-h-[120px]"
              value={a}
              onChange={(e) => setA(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="opacity-70 text-sm">Ordre</label>
              <input
                className="w-20 px-2 py-1 rounded bg-black/40 border border-white/15 text-sm"
                value={ord}
                onChange={(e) => setOrd(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await onEdit(item.id, {
                    question: q,
                    answer: a,
                    order: Number(ord),
                  } as any);
                  setEditing(false);
                }}
                className="px-3 py-1.5 rounded border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10 text-sm"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded border border-white/15 hover:bg-white/10 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateRow({ onCreate }: { onCreate: (q: string, a: string) => void }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  return (
    <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
      <div className="font-medium mb-1">Ajouter une question</div>
      <input
        className="w-full px-3 py-2 rounded bg-black/40 border border-white/15"
        placeholder="Question…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <textarea
        className="w-full px-3 py-2 rounded bg-black/40 border border-white/15 min-h-[120px]"
        placeholder="Réponse…"
        value={a}
        onChange={(e) => setA(e.target.value)}
      />
      <button
        onClick={() => {
          if (!q.trim() || !a.trim()) return;
          onCreate(q.trim(), a.trim());
          setQ("");
          setA("");
        }}
        className="px-3 py-1.5 rounded border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10 text-sm"
      >
        Ajouter
      </button>
    </div>
  );
}
