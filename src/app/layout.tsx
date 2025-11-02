// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Myg Inhouse",
  description: "Inhouses & outils MYG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      {/* On définit la hauteur de la navbar en variable CSS et on pousse le contenu */}
      <body
        style={{ ["--header-height" as any]: "56px" }}
        className="bg-black text-white min-h-screen pt-[var(--header-height,56px)]"
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
