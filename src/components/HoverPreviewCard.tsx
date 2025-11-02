"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Carte cliquable avec aperçu au survol :
 * - si gifSrc est fourni : on affiche stillSrc par défaut, puis on bascule sur gifSrc au hover
 * - sinon : simple carte image avec léger zoom au hover
 *
 * Tips :
 *  - `aspect` contrôle le ratio visuel (ex: "aspect-[16/9]" ou "aspect-[4/3]" ou "aspect-square")
 */
export default function HoverPreviewCard({
  href,
  title,
  subtitle,
  stillSrc,
  gifSrc,
  aspect = "aspect-[16/9]",
  className = "",
}: {
  href: string;
  title: string;
  subtitle?: string;
  stillSrc: string;   // image d'aperçu (affichée quand pas survolé)
  gifSrc?: string;    // gif joué au hover (optionnel)
  aspect?: string;    // util classes tailwind aspect-*
  className?: string;
}) {
  const [active, setActive] = useState(false);

  // si pas de gif, on reste toujours sur stillSrc
  const shownSrc = gifSrc && active ? gifSrc : stillSrc;

  return (
    <Link
      href={href}
      className={`relative block rounded-2xl border border-white/10 overflow-hidden bg-white/5 hover:bg-white/10 transition ${className}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      aria-label={title}
    >
      {/* Media */}
      <div className={`w-full ${aspect} relative`}>
        {/* On reste volontairement en <img> pour éviter la conf Next/Image + domaines externes */}
        <img
          src={shownSrc}
          alt={title}
          className={`absolute inset-0 h-full w-full object-cover ${gifSrc ? "transition-transform duration-300 group-hover:scale-[1.02]" : "group-hover:scale-[1.02]"}`}
          loading="lazy"
        />
        {/* Overlay lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Légende */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-sm opacity-85">{subtitle}</p>}
      </div>

      {/* Petit coin ↗ */}
      <div className="absolute right-3 top-3 text-white/80">↗</div>
    </Link>
  );
}
