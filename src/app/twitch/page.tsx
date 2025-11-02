import { Navbar } from "@/components/Navbar";

export default function TwitchPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[calc(var(--header-height)+16px)] mx-auto max-w-6xl px-4 pb-16">
        <h1 className="text-2xl font-semibold mb-6">Twitch</h1>
        <div className="rounded-xl overflow-hidden aspect-video border border-white/10 bg-white/5">
          <div className="w-full h-full flex items-center justify-center opacity-70">
            Intégration Twitch à venir (aperçu live si en ligne).
          </div>
        </div>
      </div>
    </main>
  );
}
