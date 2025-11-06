"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mutate as swrMutate } from "swr";

type RoleDb = "TOP" | "JGL" | "MID" | "ADC" | "SUPP" | "SUB";
type RoleUi = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";

const toUiRole = (r?: RoleDb | null): RoleUi =>
  r === "JGL" ? "JUNGLE" : r === "SUPP" ? "SUPPORT" : ((r as RoleUi) || "SUB");

type Profile = {
  discordId: string;
  summonerName?: string | null;
  elo?: string | null;
  mainRole?: RoleDb | null;
  secondaryRole?: RoleDb | null;
  opggUrl?: string | null;
  dpmUrl?: string | null;
  updatedAt: string;
  name: string;    // affichage
  avatar: string;  // affichage
  points?: number; // NEW
};

export default function ProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: Profile | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    summonerName: "",
    elo: "",
    mainRole: "" as RoleDb | "",
    secondaryRole: "" as RoleDb | "",
    opggUrl: "",
    dpmUrl: "",
  });

  useEffect(() => {
    if (!profile) return;
    setEditing(false);
    setForm({
      summonerName: profile.summonerName || "",
      elo: profile.elo || "",
      mainRole: (profile.mainRole || "") as any,
      secondaryRole: (profile.secondaryRole || "") as any,
      opggUrl: profile.opggUrl || "",
      dpmUrl: profile.dpmUrl || "",
    });
  }, [profile]);

  if (!profile) return null;

  const save = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/profiles/${profile.discordId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        // Par sécurité côté Next 14/16 (selon conf), on peut aussi indiquer:
        // next: { revalidate: 0 }
        body: JSON.stringify({
          summonerName: form.summonerName || null,
          elo: form.elo || null,
          mainRole: form.mainRole || null,
          secondaryRole: form.secondaryRole || null,
          opggUrl: form.opggUrl || null,
          dpmUrl: form.dpmUrl || null,
        }),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || json?.error) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }

      // 1) Re-fetch immédiat de la liste des profils (SWR)
      await swrMutate("/api/profiles");

      // 2) Refresh App Router (au cas où la page utilise des Server Components)
      router.refresh();

      setEditing(false);
      onSaved?.();
    } catch (e: any) {
      alert("Save error: " + (e.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black/90 text-white rounded-2xl border border-white/10 w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          aria-label="Fermer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-16 h-16 rounded-full border border-white/20"
          />
          <div>
            <div className="text-xl font-semibold">{profile.name}</div>
            <div className="text-sm opacity-70">
              Dernière maj: {new Date(profile.updatedAt).toLocaleString("fr-FR")}
            </div>
          </div>
          <div className="ml-auto">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 rounded border border-white/15 hover:bg-white/10 text-sm"
              >
                ✏️ Éditer
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  onClick={save}
                  className="px-3 py-1.5 rounded border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10 text-sm disabled:opacity-60"
                >
                  {saving ? "Sauvegarde..." : "💾 Enregistrer"}
                </button>
                <button
                  disabled={saving}
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded border border-white/15 hover:bg-white/10 text-sm disabled:opacity-60"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Infos */}
        {!editing ? (
          <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
            <Info label="Elo" value={profile.elo || "—"} />
            <Info label="Rôle principal" value={toUiRole(profile.mainRole)} />
            <Info
              label="Rôle secondaire"
              value={profile.secondaryRole ? toUiRole(profile.secondaryRole) : "—"}
            />
            <Info label="Discord ID" value={profile.discordId} />
            <Info
              label="OPGG"
              value={
                profile.opggUrl ? (
                  <a className="underline" href={profile.opggUrl} target="_blank" rel="noreferrer">
                    Ouvrir
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Info
              label="DPM"
              value={
                profile.dpmUrl ? (
                  <a className="underline" href={profile.dpmUrl} target="_blank" rel="noreferrer">
                    Ouvrir
                  </a>
                ) : (
                  "—"
                )
              }
            />
            {/* NEW — Points */}
            <Info label="Points" value={(profile.points ?? 0).toString()} />
          </div>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
            <Field label="Summoner name">
              <input
                className="w-full px-3 py-2 rounded bg-black/40 border border-white/15"
                value={form.summonerName}
                onChange={(e) => setForm((f) => ({ ...f, summonerName: e.target.value }))}
              />
            </Field>

            <Field label="Elo">
              <select
                className="w-full px-3 py-2 rounded bg-black/40 border border-white/15"
                value={form.elo}
                onChange={(e) => setForm((f) => ({ ...f, elo: e.target.value }))}
              >
                <option value="">—</option>
                {[
                  "IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD",
                  "DIAMOND","MASTER","GRANDMASTER","CHALLENGER",
                ].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Rôle principal">
              <select
                className="w-full px-3 py-2 rounded bg-black/40 border border-white/15"
                value={form.mainRole}
                onChange={(e) => setForm((f) => ({ ...f, mainRole: e.target.value as any }))}
              >
                <option value="">—</option>
                {["TOP","JGL","MID","ADC","SUPP","SUB"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Rôle secondaire">
              <select
                className="w-full px-3 py-2 rounded bg-black/40 border border-white/15"
                value={form.secondaryRole}
                onChange={(e) => setForm((f) => ({ ...f, secondaryRole: e.target.value as any }))}
              >
                <option value="">—</option>
                {["TOP","JGL","MID","ADC","SUPP","SUB"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="OPGG URL">
              <input
                className="w-full px-3 py-2 rounded bg-black/40 border border-white/15"
                placeholder="https://www.op.gg/summoners/euw/..."
                value={form.opggUrl}
                onChange={(e) => setForm((f) => ({ ...f, opggUrl: e.target.value }))}
              />
            </Field>

            <Field label="DPM URL">
              <input
                className="w-full px-3 py-2 rounded bg-black/40 border border-white/15"
                placeholder="https://dpm.gg/..."
                value={form.dpmUrl}
                onChange={(e) => setForm((f) => ({ ...f, dpmUrl: e.target.value }))}
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="opacity-70">{label}</div>
      <div className="text-base">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="opacity-70 mb-1">{label}</div>
      {children}
    </label>
  );
}
