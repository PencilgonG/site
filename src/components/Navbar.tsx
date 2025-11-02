"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/profiles", label: "Profils" },
  { href: "/matches", label: "Matchs" },
  { href: "/twitch", label: "Twitch" },
  { href: "/guide", label: "Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/rules", label: "Rules" },
  { href: "/schedule", label: "Inhouses à venir" },
  { href: "/shop", label: "Boutique" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 inset-x-0 h-[var(--header-height)] z-50 border-b border-white/10 bg-black/60 backdrop-blur"
      // Valeur par défaut au cas où la variable n'est pas définie globalement
      style={{ ["--header-height" as any]: "56px" }}
    >
      <div className="mx-auto max-w-7xl h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/assets/logo.png" alt="MYG" width={32} height={32} />
          <span className="font-semibold tracking-wide">Myg Inhouse</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2 py-1 rounded ${
                pathname === l.href ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
