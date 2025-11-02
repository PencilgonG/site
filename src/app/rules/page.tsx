export default function RulesPage() {
  const updated = new Date().toLocaleDateString("fr-FR");
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-semibold mb-2">Règles MYG Inhouse</h1>
      <p className="opacity-70 mb-8">Dernière mise à jour : {updated}</p>

      <Section title="1) Savoir-être">
        <ul className="list-disc pl-6 space-y-1">
          <li>Respect entre les joueurs, le staff et les adversaires.</li>
          <li>
            Pas de Trash talk / Taunt / Soft Taunt / Discrimination / Humiliation / Harcèlement.
          </li>
          <li>
            Si tu as un problème avec une game, un joueur, etc. → envoie un message à quelqu’un
            avec le rôle{" "}
            <span style={{ color: "#a91556", fontWeight: 600 }}>@Respo</span> après l’inhouse
            en détaillant ton problème.
          </li>
        </ul>
      </Section>

      <Section title="2) Horaires et empêchements">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Être à l’heure pour l’inhouse (ne pas lancer une game 10–15 min avant le début).
          </li>
          <li>Si tu es en game à l’heure du début, tu seras remplacé.</li>
          <li>
            Si tu as un empêchement ou que tu dois partir pendant l’inhouse :
            désinscris-toi du lobby en cours si c’est encore possible.  
            Si l’inhouse a déjà commencé, envoie un MP avec ton motif à un{" "}
            <span style={{ color: "#a91556", fontWeight: 600 }}>Respo</span>.  
            Si ton motif est légitime → pas de souci.  
            Si ton motif est du foutage de gueule → ban.
          </li>
        </ul>
      </Section>

      <Section title="3) Comportement in-game">
        <ul className="list-disc pl-6 space-y-1">
          <li>Jouer pour win, pas de grief, pas de run down (courir sous tour pour se suicider).</li>
          <li>Pas de spam vote FF.</li>
        </ul>
      </Section>

      <Section title="4) Stream et pause">
        <ul className="list-disc pl-6 space-y-1">
          <li>Tu peux stream tes games.</li>
          <li>Toute tentative de stream-hack d’une personne résultera en son ban.</li>
          <li>
            Les pauses sont autorisées : une pause par match et par équipe (avec un motif valable,
            ex. restart PC, crash, Vanguard, etc.).
          </li>
        </ul>
      </Section>

      <Section title="5) Sanctions">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Toute sanction concernant un joueur dépendra du contexte du problème le concernant.
            Elle sera discutée entre les{" "}
            <span style={{ color: "#a91556", fontWeight: 600 }}>Respos</span> et peut aller d’une
            interdiction d’inhouse temporaire ou pour un nombre défini, jusqu’au ban serveur.
          </li>
          <li>
            Ce n’est pas le but — soyez là pour kiffer et faire des games propres.
          </li>
        </ul>
      </Section>

      <Section title="6) Contact Staff">
        <p>
          Pour signaler un incident :{" "}
          <span style={{ color: "#a91556", fontWeight: 600 }}>
            @Respo / Staff MYG
          </span>{" "}
          sur Discord.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-medium mb-3">{title}</h2>
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
