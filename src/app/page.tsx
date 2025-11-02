"use client";

import Link from "next/link";
import { useRef } from "react";
import LiveMatchesWidget from "@/components/LiveMatchesWidget";
import { TwitchWidget } from "@/components/TwitchWidget";
import UpcomingInhousesWidget from "@/components/UpcomingInhousesWidget";
import Hero from "@/components/Hero";

/* -------- Carte avec vidéo qui ne joue qu’au hover ---------- */
function HoverVideoCard({
  href,
  title,
  subtitle,
  videoSrc,
  poster,
  className = "",
  titleTop = false,
}: {
  href: string;
  title: string;
  subtitle?: string;
  videoSrc: string; // mp4/gifv/mp4 tenor
  poster: string;   // image affichée hors-hover (première frame)
  className?: string;
  titleTop?: boolean; // met le titre en haut à gauche
}) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <Link
      href={href}
      className={`group relative block rounded-2xl border border-white/10 overflow-hidden ${className}`}
      onMouseEnter={() => {
        if (ref.current) {
          ref.current.currentTime = 0;
          ref.current.play().catch(() => {});
        }
      }}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      }}
      aria-label={title}
    >
      {/* Vidéo de preview (muette, pas de controls) */}
      <video
        ref={ref}
        className="h-[220px] w-full object-cover"
        muted
        playsInline
        preload="metadata"
        // affiche le poster (image) quand on n’est pas en hover
        poster={poster}
      >
        {/* mp4 préférable. Pour Tenor/Tumblr, l’URL .mp4 marche en général */}
        <source src={videoSrc} type="video/mp4" />
        {/* fallback : au cas où le mp4 ne back, on affiche quand même le poster */}
      </video>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-90" />

      <div
        className={`absolute ${
          titleTop ? "top-0 left-0 p-4" : "bottom-0 left-0 p-4 pb-3"
        }`}
      >
        <h3 className="text-lg font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,.7)]">
          {title}
        </h3>
        {subtitle ? (
          <p className="opacity-90 text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,.7)]">
            {subtitle}
          </p>
        ) : null}
      </div>

      {/* petite icône ↗ en haut à droite */}
      <div className="absolute right-3 top-3 text-white/80">↗</div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero plein écran (fond + overlays + bannière) */}
      <Hero />

      {/* Widgets (sous le fold) */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* LIVE matches (widget natif) */}
          <Link
            href="/matches"
            className="block group rounded-2xl border border-white/10 overflow-hidden"
            aria-label="Voir les matchs en direct et l'historique"
          >
            <div className="bg-white/5 group-hover:bg-white/10 transition">
              <LiveMatchesWidget />
            </div>
          </Link>

          {/* Twitch */}
          <Link
            href="/twitch"
            className="block group rounded-2xl border border-white/10 overflow-hidden"
            aria-label="Voir le live Twitch"
          >
            <div className="bg-white/5 group-hover:bg-white/10 transition">
              <TwitchWidget />
            </div>
          </Link>

          {/* Inhouses à venir */}
          <Link
            href="/schedule"
            className="block group rounded-2xl border border-white/10 overflow-hidden"
            aria-label="Voir les inhouses à venir"
          >
            <div className="bg-white/5 group-hover:bg-white/10 transition">
              <UpcomingInhousesWidget />
            </div>
          </Link>

          {/* Profils — apercu vidéo au hover (titre en haut) */}
          <HoverVideoCard
            href="/profiles"
            title="Profils"
            subtitle="Cliquer pour voir les profils"
            // GIF Tenor demandé → on utilise la version mp4 pour que la vidéo lise au hover
            videoSrc="https://media1.tenor.com/m/Nqq1zS-HEG8AAAAd/kaamelott-pere.mp4"
            // hors-hover : on montre la première frame (le GIF sert de poster statique)
            poster="https://media1.tenor.com/m/Nqq1zS-HEG8AAAAd/kaamelott-pere.gif"
            titleTop
          />

          {/* Matchs — apercu vidéo au hover */}
          <HoverVideoCard
            href="/matches"
            title="Matchs"
            subtitle="Clique pour l'historique"
            // ton lien Tumblr .gifv possède généralement une variante mp4 :
            videoSrc="https://64.media.tumblr.com/8827e7a4c30b0ad2b3ecb39c61215b16/tumblr_o0jq7oBNJ31tn3qhvo2_540.mp4"
            poster="https://64.media.tumblr.com/8827e7a4c30b0ad2b3ecb39c61215b16/tumblr_o0jq7oBNJ31tn3qhvo2_640.gifv"
          />

          {/* Guide (image statique – ton “bro code”) */}
          <Link
            href="/guide"
            className="relative rounded-2xl border border-white/10 overflow-hidden group"
            aria-label="Ouvrir la page guide"
          >
            <div className="absolute inset-0 bg-[url('/assets/code-removebg-preview.png')] bg-cover bg-center opacity-90 group-hover:opacity-100 transition" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />
            <div className="relative p-4 md:p-5">
              <h3 className="text-lg font-semibold mb-1">Guide</h3>
              <p className="opacity-90 text-sm">Conseils & ressources MYG</p>
            </div>
            <div className="absolute right-3 top-3 text-white/80">↗</div>
          </Link>

          {/* FAQ (image manga) */}
          <Link
            href="/faq"
            className="relative rounded-2xl border border-white/10 overflow-hidden group"
            aria-label="Ouvrir la FAQ"
          >
            <div className="absolute inset-0 bg-[url('/assets/Perfect_body_001.webp')] bg-cover bg-center grayscale group-hover:grayscale-0 transition" />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition" />
            <div className="relative p-4 md:p-5">
              <h3 className="text-lg font-semibold mb-1">FAQ</h3>
              <p className="opacity-90 text-sm">Questions fréquentes</p>
            </div>
            <div className="absolute right-3 top-3 text-white/80">↗</div>
          </Link>

          {/* Règles (tu peux garder l’image manga si tu veux) */}
          <Link
            href="/rules"
            className="relative rounded-2xl border border-white/10 overflow-hidden group"
            aria-label="Ouvrir la page des règles"
          >
            <div className="absolute inset-0 bg-[url('/assets/rules-widget.jpg')] bg-cover bg-center opacity-80 group-hover:opacity-90 transition" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition" />
            <div className="relative p-4 md:p-5">
              <h3 className="text-lg font-semibold mb-1">Règles</h3>
              <p className="opacity-90 text-sm">Clique pour voir les règles</p>
            </div>
            <div className="absolute right-3 top-3 text-white/80">↗</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
