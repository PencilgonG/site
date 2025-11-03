"use client";

import { useEffect, useState } from "react";

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
  const [adminToken, setAdminToken] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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

  // Déconnexion complète (efface token)
  function handleAdminOff() {
    setAdminToken("");
    setIsAdmin(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-white">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-3xl font-semibold">FAQ</h1>

        <div className="ml-auto flex items-center gap-2">
          {!isAdmin ? (
            <>
              <input
                type="password"
                className="rounded border border-white/15 bg-black/40 px-3 py-2 text-sm"
                placeholder="ADMIN_TOKEN"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value.trim())}
              />
              <button
                onClick={() => {
                  if (!adminToken) return alert("Entrez un token admin");
                  setIsAdmin(true);
                }}
                className="rounded border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-sm text-emerald-300 hover:bg-emerald-500/10"
              >
                Admin ON
              </button>
            </>
          ) : (
            <button
              onClick={handleAdminOff}
              className="rounded border border-red-400/40 bg-red-400/10 px-2 py-1 text-sm text-red-300 hover:bg-red-400/20"
            >
              Admin OFF
            </button>
          )}
        </div>
      </div>

      {/* Liste FAQ */}
      <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
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
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-white/5"
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
              className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
            >
              Éditer
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="rounded border border-red-400/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
            >
              Supprimer
            </button>
          </span>
        )}
      </button>

      <div
        className={`transition-[max-height,opacity,padding] duration-300 ease-in-out ${
          open ? "opacity-100 px-5 pb-4" : "max-h-0 overflow-hidden px-5 pb-0 opacity-0"
        }`}
        style={{ maxHeight: open ? 1000 : 0 }}
        aria-hidden={!open}
      >
        {!editing ? (
          <div className="whitespace-pre-wrap leading-relaxed opacity-90">{item.answer}</div>
        ) : (
          <div className="space-y-3">
            <input
              className="w-full rounded border border-white/15 bg-black/40 px-3 py-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <textarea
              className="min-h-[120px] w-full rounded border border-white/15 bg-black/40 px-3 py-2"
              value={a}
              onChange={(e) => setA(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="text-sm opacity-70">Ordre</label>
              <input
                className="w-20 rounded border border-white/15 bg-black/40 px-2 py-1 text-sm"
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
                className="rounded border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/10"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
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
    <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-1 font-medium">Ajouter une question</div>
      <input
        className="w-full rounded border border-white/15 bg-black/40 px-3 py-2"
        placeholder="Question…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <textarea
        className="min-h-[120px] w-full rounded border border-white/15 bg-black/40 px-3 py-2"
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
        className="rounded border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/10"
      >
        Ajouter
      </button>
    </div>
  );
}
