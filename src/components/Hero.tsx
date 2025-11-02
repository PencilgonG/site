"use client";

import Image from "next/image";

const HEADER_H = 56; // doit matcher la navbar

export default function Hero() {
  return (
    <section
      className="relative w-full select-none"
      style={{ height: `calc(100vh - ${HEADER_H}px)` }}
      aria-label="Accueil MYG Inhouses"
    >
      {/* Fond plein écran */}
      <Image
        src="/bg.webp"
        alt="Fond MYG"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Contraste / halo centrale */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 hero-vignette-strong" />
        <div className="absolute inset-0 hero-spot-strong" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
      </div>

      {/* === Brume animée (profondeur) === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* couche lointaine, très douce */}
        <div className="fog fog-back" aria-hidden />
        {/* couche médiane */}
        <div className="fog fog-mid" aria-hidden />
        {/* couche proche du sol */}
        <div className="fog fog-front" aria-hidden />
      </div>

      {/* Bannière centrée */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* léger glow sous la bannière pour la faire ressortir */}
        <div className="hero-banner-glow" aria-hidden />

        <Image
          src="/banner.png"
          alt="MYG Inhouses"
          width={1200}
          height={400}
          priority
          className="
            w-[28vw] max-w-[520px] min-w-[220px]
            translate-y-[-6%]
            opacity-95
            drop-shadow-[0_12px_35px_rgba(0,0,0,0.75)]
            hero-banner-smooth
          "
        />
      </div>
    </section>
  );
}
