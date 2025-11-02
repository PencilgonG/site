import { Navbar } from "@/components/Navbar";
export default function GuidePage(){
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[calc(var(--header-height)+16px)] mx-auto max-w-3xl px-4 pb-16 prose prose-invert">
        <h1>Guide d’utilisation</h1>
        <p>Cette page affichera un guide Markdown (Phase 2).</p>
      </div>
    </main>
  );
}
