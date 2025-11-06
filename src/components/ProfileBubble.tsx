"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

type UiRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";

export function ProfileBubble({
  name,
  role,
  avatar,
  discordId,
  points = 0,
  onClick,
}: {
  name: string;
  role: UiRole;
  avatar?: string;
  discordId?: string;
  points?: number;
  onClick?: () => void;
}) {
  const fallbackFromId = (id?: string) => {
    if (!id) return "/default-avatar.png";
    try {
      const idx = Number(BigInt(id) % 6n);
      return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    } catch {
      return "/default-avatar.png";
    }
  };

  const [imgSrc, setImgSrc] = useState<string>(avatar || fallbackFromId(discordId));

  // Si pas d'avatar fourni mais discordId dispo, on tente la route locale
  useEffect(() => {
    if (avatar) {
      setImgSrc(avatar);
      return;
    }
    if (!discordId) return;

    let aborted = false;
    (async () => {
      try {
        // ⬇️ IMPORTANT: ne pas forcer le cache (CDN/browser),
        // on veut refléter les updates immédiatement
        const r = await fetch(`/api/discord/avatar/${discordId}`, { cache: "no-store" });
        const j = await r.json();
        if (!aborted && j?.url) setImgSrc(j.url);
      } catch {
        if (!aborted) setImgSrc(fallbackFromId(discordId));
      }
    })();

    return () => { aborted = true; };
  }, [avatar, discordId]);

  const roleColors: Record<UiRole, string> = {
    TOP: "bg-rose-500/20 border-rose-400/30 text-rose-100",
    JUNGLE: "bg-emerald-500/20 border-emerald-400/30 text-emerald-100",
    MID: "bg-indigo-500/20 border-indigo-400/30 text-indigo-100",
    ADC: "bg-amber-500/20 border-amber-400/30 text-amber-100",
    SUPPORT: "bg-cyan-500/20 border-cyan-400/30 text-cyan-100",
    SUB: "bg-zinc-500/20 border-zinc-400/30 text-zinc-100",
  };

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
      title={name}
    >
      <div className="relative w-16 h-16">
        <Image
          src={imgSrc}
          alt={name}
          fill
          sizes="80px"
          className="rounded-full object-cover border border-white/20"
          onError={() => setImgSrc(fallbackFromId(discordId))}
        />
        {typeof points === "number" && points !== 0 && (
          <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 border border-white/20">
            {points} pts
          </span>
        )}
      </div>

      <div className="text-xs opacity-90 text-center line-clamp-2">{name}</div>

      <span
        className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${roleColors[role]}`}
      >
        {role}
      </span>
    </button>
  );
}
