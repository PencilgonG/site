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

      {/* Contraste / halo central */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 hero-vignette-strong" />
        <div className="absolute inset-0 hero-spot-strong" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
      </div>

      {/* Brume animée */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="fog fog-back" aria-hidden />
        <div className="fog fog-mid" aria-hidden />
        <div className="fog fog-front" aria-hidden />
      </div>

      {/* Bannière centrée */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="hero-banner-glow" aria-hidden />
        <Image
          src="/banner.png"
          alt="MYG Inhouses"
          width={1200}
          height={400}
          priority
          className="
            w-[28vw] max-w-[520px] min-w-[220px]
            -translate-y-[6%]
            opacity-95
            drop-shadow-[0_12px_35px_rgba(0,0,0,0.75)]
            hero-banner-smooth
          "
        />
      </div>

      {/* Flèche de scroll très discrète sous la bannière */}
      <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="animate-bounce-slow text-2xl leading-none text-white/80">↓</span>
        <span className="sr-only">Faites défiler pour voir les widgets</span>
      </div>

      {/* Haze bas pour adoucir la jonction avec la section widgets */}
      <div className="haze-bottom" aria-hidden />
    </section>
  );
}
