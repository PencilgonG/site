"use client";

import Link from "next/link";
import { useRef } from "react";
import Hero from "@/components/Hero";
import LiveMatchesWidget from "@/components/LiveMatchesWidget";
import { TwitchWidget } from "@/components/TwitchWidget";
import UpcomingInhousesWidget from "@/components/UpcomingInhousesWidget";

/* --------- Tuile vidéo (lecture au hover) --------- */
function HoverVideoCard({
  href,
  title,
  subtitle,
  videoSrc,
  poster,
  titleTop = false,
  contain = false, // true => on voit TOUT le gif (letterbox)
}: {
  href: string;
  title: string;
  subtitle?: string;
  videoSrc: string; // mp4
  poster: string;   // image hors-hover
  titleTop?: boolean;
  contain?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-white/10"
      prefetch={false}
      aria-label={title}
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
    >
      <div className="h-[260px] w-full bg-black">
        <video
          ref={ref}
          className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`}
          muted
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-90" />
      <div className={`absolute ${titleTop ? "top-0 left-0 p-4" : "bottom-0 left-0 p-4 pb-3"}`}>
        <h3 className="text-lg font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,.7)]">{title}</h3>
        {subtitle ? (
          <p className="text-sm opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,.7)]">{subtitle}</p>
        ) : null}
      </div>
      <div className="absolute right-3 top-3 text-white/80">↗</div>
    </Link>
  );
}

/* --------- Tuile image (plein fond) --------- */
function ImageCard({
  href,
  title,
  subtitle,
  src,
}: {
  href: string;
  title: string;
  subtitle?: string;
  src: string; // image ou gif (local/externe)
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-white/10"
      prefetch={false}
      aria-label={title}
      style={{
        backgroundImage: `url('${src}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="h-[260px] w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 pb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle ? <p className="text-sm opacity-90">{subtitle}</p> : null}
      </div>
      <div className="absolute right-3 top-3 text-white/80">↗</div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />

      {/* Fade doux entre hero et grille (supprime la coupure nette) */}
      <div className="pointer-events-none mx-auto -mt-10 h-20 w-full max-w-6xl px-4" aria-hidden>
        <div className="h-full w-full rounded-t-[1.25rem] bg-gradient-to-b from-transparent to-black/30" />
      </div>

      {/* Grille widgets : hauteur unifiée h-[260px] */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* PROFILS — voir le GIF ENTIER */}
          <HoverVideoCard
            href="/profiles"
            title="Profils"
            subtitle="Clique pour voir les profils"
            videoSrc="https://media1.tenor.com/m/Nqq1zS-HEG8AAAAd/kaamelott-pere.mp4"
            poster="https://media1.tenor.com/m/Nqq1zS-HEG8AAAAd/kaamelott-pere.gif"
            titleTop
            contain
          />

          {/* MATCHS — ton GIF Tenor */}
          <ImageCard
            href="/matches"
            title="Matchs"
            subtitle="Historique & résultats"
            src="https://media1.tenor.com/images/d0b6bd8ce90a8105ae9dd2e76525cab7/tenor.gif?itemid=12852106"
          />

          {/* GUIDE — /public/assets/widgets/guide.png */}
          <ImageCard
            href="/guide"
            title="Guide"
            subtitle="Conseils & ressources MYG"
            src="/assets/widgets/guide.png"
          />

          {/* RÈGLES — /public/assets/widgets/rules.jpg */}
          <ImageCard
            href="/rules"
            title="Règles"
            subtitle="Clique pour voir les règles"
            src="/assets/widgets/rules.jpg"
          />

          {/* FAQ — /public/assets/widgets/faq.webp */}
          <ImageCard
            href="/faq"
            title="FAQ"
            subtitle="Questions fréquentes"
            src="/assets/widgets/faq.webp"
          />

          {/* LIVE matches */}
          <Link
            href="/matches"
            className="group relative block overflow-hidden rounded-2xl border border-white/10"
            aria-label="Voir les matchs en direct et l'historique"
            prefetch={false}
          >
            <div className="h-[260px] w-full bg-white/5 transition group-hover:bg-white/10">
              <LiveMatchesWidget />
            </div>
            <div className="absolute right-3 top-3 text-white/80">↗</div>
          </Link>

          {/* Twitch — preview (noir si offline) */}
          <Link
            href="/twitch"
            className="group relative block overflow-hidden rounded-2xl border border-white/10"
            aria-label="Voir le live Twitch"
            prefetch={false}
          >
            <div className="h-[260px] w-full bg-black">
              <TwitchWidget mode="preview" />
            </div>
            <div className="absolute right-3 top-3 text-white/80">↗</div>
          </Link>

          {/* Inhouses à venir */}
          <Link
            href="/schedule"
            className="group relative block overflow-hidden rounded-2xl border border-white/10"
            aria-label="Voir les inhouses à venir"
            prefetch={false}
          >
            <div className="h-[260px] w-full bg-white/5 transition group-hover:bg-white/10">
              <UpcomingInhousesWidget />
            </div>
            <div className="absolute right-3 top-3 text-white/80">↗</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
