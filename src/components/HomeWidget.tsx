"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = {
  title: string;
  href: string;
  imageSrc: string; // peut être local (/...) ou externe (http)
  alt?: string;
};

export default function HomeWidget({ title, href, imageSrc, alt }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={href}
      className="group relative block w-full h-full overflow-hidden rounded-2xl ring-1 ring-white/10 transition-transform hover:scale-[1.01]"
      prefetch={false}
    >
      {/* Image/GIF pleine surface */}
      {/* Si externe → on passe par balise <img> pour GIF animés Tenor */}
      {imageSrc.startsWith("http") ? (
        <img
          src={imageSrc}
          alt={alt ?? title}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt ?? title}
          fill
          className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoadingComplete={() => setLoaded(true)}
          priority={false}
        />
      )}

      {/* Overlay gradient pour lisibilité du titre */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Titre */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="inline-flex items-center rounded-lg bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm ring-1 ring-white/10">
          {title}
          <span className="ml-2 opacity-70 transition-opacity group-hover:opacity-100">↗</span>
        </div>
      </div>
    </Link>
  );
}
