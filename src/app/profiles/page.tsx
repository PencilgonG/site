"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProfileBubble } from "@/components/ProfileBubble";
import ProfileModal from "@/components/ProfileModal";

type DbRole = "TOP" | "JGL" | "MID" | "ADC" | "SUPP" | "SUB";
type UiRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";
const toUiRole = (r?: DbRole | null): UiRole =>
  r === "JGL" ? "JUNGLE" : r === "SUPP" ? "SUPPORT" : ((r as UiRole) || "SUB");

type ProfileDto = {
  discordId: string;
  summonerName?: string | null;
  elo?: string | null;
  mainRole?: DbRole | null;
  secondaryRole?: DbRole | null;
  opggUrl?: string | null;
  dpmUrl?: string | null;
  updatedAt: string;
  avatar: string;
  points?: number;
};

const ROLES: UiRole[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT", "SUB"];

export default function ProfilesPage() {
  const [items, setItems] = useState<ProfileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profiles", { cache: "no-store" });
      const data = await res.json();
      setItems(data.profiles ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<UiRole, ProfileDto[]> = {
      TOP: [],
      JUNGLE: [],
      MID: [],
      ADC: [],
      SUPPORT: [],
      SUB: [],
    };
    for (const p of items) g[toUiRole(p.mainRole)].push(p);
    for (const r of ROLES) {
      g[r].sort((a, b) =>
        (a.summonerName || a.discordId).localeCompare(
          b.summonerName || b.discordId
        )
      );
    }
    return g;
  }, [items]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[calc(var(--header-height)+16px)] mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Profils joueurs</h1>
          <button
            onClick={load}
            className="px-3 py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            🔄 Refresh profils
          </button>
        </div>

        {loading ? (
          <div className="opacity-70">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="opacity-70">
            Aucun profil trouvé. Utilise <code>/profil set</code> sur le bot.
          </div>
        ) : (
          <div className="space-y-8">
            {ROLES.map((role) => (
              <section key={role}>
                <h2 className="text-lg font-semibold mb-3">{role}</h2>
                {grouped[role].length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {grouped[role].map((p) => {
                      const name =
                        p.summonerName || `#${p.discordId.slice(-4)}`;
                      return (
                        <ProfileBubble
                          key={p.discordId}
                          name={name}
                          role={toUiRole(p.mainRole)}
                          avatar={p.avatar}
                          points={p.points ?? 0}
                          onClick={() =>
                            setSelected({
                              ...p,
                              name,
                              avatar: p.avatar,
                            })
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="opacity-60 text-sm">Aucun joueur.</div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      <ProfileModal
        profile={selected}
        onClose={() => setSelected(null)}
        onSaved={() => {
          setSelected(null);
          load();
        }}
      />
    </main>
  );
}
