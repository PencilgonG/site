import { Navbar } from "@/components/Navbar";
export default function ShopPage(){
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[calc(var(--header-height)+16px)] mx-auto max-w-3xl px-4 pb-16 prose prose-invert">
        <h1>Boutique</h1>
        <p>Rôles spéciaux achetables avec des points (validation via le bot) — Phase 2.</p>
      </div>
    </main>
  );
}
