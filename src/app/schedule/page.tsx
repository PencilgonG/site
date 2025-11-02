import { Navbar } from "@/components/Navbar";
export default function SchedulePage(){
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[calc(var(--header-height)+16px)] mx-auto max-w-3xl px-4 pb-16 prose prose-invert">
        <h1>Inhouses à venir</h1>
        <p>Liste éditable (restreinte aux responsables via OAuth Discord) — Phase 2.</p>
      </div>
    </main>
  );
}
