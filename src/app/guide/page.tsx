"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

/* Tes images sont dans /public/assets/widgets/guide/ */
const IMG_BASE = "/assets/widgets/guide/";

type Step = {
  id: string;
  n: number;
  title: string;
  img: string; // relatif à IMG_BASE
  alt: string;
  body: React.ReactNode;
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs uppercase tracking-wide opacity-80">
      {children}
    </span>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
      💡 {children}
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
      ⚠️ {children}
    </div>
  );
}

export default function GuidePage() {
  const steps: Step[] = useMemo(
    () => [
      // ========= NEW: step 0 (profil obligatoire) =========
      {
        id: "step-0",
        n: 0,
        title: "Créer ton profil (obligatoire avant l’inscription)",
        img: "step-00-profile.png", // place ici ton visuel #1 (screenshot du salon #profile-set)
        alt: "Création du profil avec la commande /profile set",
        body: (
          <>
            Avant toute inscription, tu dois <b>obligatoirement</b> créer ton profil MYG
            dans le salon <b>#profile-set</b>.
            <br />
            <br />
            Entre la commande&nbsp;:
            <pre className="mt-2 rounded-lg bg-black/40 p-3 text-sm">
{`/profile set pseudo_lol:<ton pseudo LoL> elo:<ton rang> main_role:<ton rôle> secondary_role:<ton second rôle> opgg_url:<ton lien OPGG> dpm_url:<ton lien DPM>`}
            </pre>
            <div className="mt-2 text-sm opacity-90">
              <b>Exemple</b> :
              <pre className="mt-1 rounded-lg bg-black/40 p-3 text-sm">
{`/profile set pseudo_lol:Aram fétichiste elo:Emerald main_role:Mid secondary_role:Supp opgg_url:https://op.gg/... dpm_url:https://dpm.gg/...`}
              </pre>
              Le bot génère un <b>profil</b> (pseudo, élo, rôles, liens, avatar). Ce
              profil sera utilisé par le bot et le site. Sans profil, tu ne peux pas
              t’inscrire.
            </div>
            <Tip>
              Assure-toi que tous les champs sont remplis. Tu peux mettre à jour ton
              profil plus tard avec la même commande.
            </Tip>
          </>
        ),
      },

      // ========= Steps existants 1 → 9 (inchangés) =========
      {
        id: "step-1",
        n: 1,
        title: "Repérer le lobby d'inscription",
        img: "step-01.png",
        alt: "Lobby d'inscription avec boutons de rôle",
        body: (
          <>
            Le soir d’inhouse, un <b>lobby</b> apparaît dans <b>#inscription-et-team</b>.
            Choisis ton <b>rôle</b> : <em>Top · Jgl · Mid · Adc · Supp</em>.{" "}
            <b className="text-amber-200">Ne clique jamais sur “Test”.</b>{" "}
            Après ton clic, tu es inscrit en file d’attente.
          </>
        ),
      },
      {
        id: "step-2",
        n: 2,
        title: 'Activer "Montrer tous les salons"',
        img: "step-03.png",
        alt: "Paramètre Discord pour montrer tous les salons",
        body: (
          <>
            Ouvre le menu du serveur et coche <b>“Montrer tous les salons”</b> pour
            voir les <b>salons temporaires d’équipe</b> quand ils seront créés.
          </>
        ),
      },
      {
        id: "step-3",
        n: 3,
        title: "Attendre calmement le Team Builder",
        img: "step-04.png",
        alt: "Aperçu du lobby d'attente",
        body: (
          <>
            Une fois inscrit, <b>n’appuie plus sur rien</b>. Attends que tout le monde
            s’inscrive. Le staff (<b>Respo</b>) lance ensuite le <b>Team Builder</b>.
          </>
        ),
      },
      {
        id: "step-4",
        n: 4,
        title: "Le Team Builder apparaît (ne rien toucher)",
        img: "step-05.png",
        alt: "Embed Team Builder du staff",
        body: (
          <>
            Seuls les <b>Respos</b> interagissent ici (composition des équipes, capitaines,
            format, validation). Les joueurs <b>n’ont rien à cliquer</b>.
          </>
        ),
      },
      {
        id: "step-5",
        n: 5,
        title: "Des salons d’équipe sont créés automatiquement",
        img: "step-06.png",
        alt: "Salons d'équipe temporaires créés",
        body: (
          <>
            Deux salons par équipe : <b>texte-xxx</b> et <b>voice-xxx</b>.
            Ils sont <b>éphémères</b> et disparaîtront en fin de session.
          </>
        ),
      },
      {
        id: "step-6",
        n: 6,
        title: "Ton lien de draft t’attend dans ton salon d’équipe",
        img: "step-07.png",
        alt: "Lien LoLProDraft dans le salon d'équipe",
        body: (
          <>
            Après validation des équipes, ton <b>lien de draft</b> est posté.
            <b> Le capitaine</b> clique dessus. Quand vous êtes prêts en vocal,
            confirmez pour démarrer la draft.
          </>
        ),
      },
      {
        id: "step-7",
        n: 7,
        title: "Lien spectateur pour la communauté",
        img: "step-10.png",
        alt: "Embed match avec lien spectateur",
        body: (
          <>
            Dans <b>#matchs</b>, chaque match affiche un <b>lien spectateur</b>.
            Il est destiné aux <b>8 joueurs du match qui ne sont pas capitaines</b>
            (ainsi qu’aux rôles autorisés comme les streamers/staff).
          </>
        ),
      },
      {
        id: "step-8",
        n: 8,
        title: "Line-up récap dans #line-up",
        img: "step-08.png",
        alt: "Embed line-up des équipes",
        body: (
          <>
            Un embed <b>Line-up</b> récapitule la composition des équipes.
            Pratique pour vérifier rôles et participants.
          </>
        ),
      },
      {
        id: "step-9",
        n: 9,
        title: "Nouveaux rounds = nouveaux liens (auto)",
        img: "step-09.png",
        alt: "Validation et lancement des rounds suivants",
        body: (
          <>
            À la fin d’un round, le <b>Respo valide</b> les matchs. Le bot
            lance les suivants et poste <b>de nouveaux liens de draft</b> dans
            vos salons d’équipe (+ nouveau lien spectateur dans <b>#matchs</b>).
          </>
        ),
      },

      // ========= NEW: step 10 (résultat de match) =========
      {
        id: "step-10",
        n: 10,
        title: "Poster le résultat du match (capitaine gagnant)",
        img: "step-12-result.png", // place ici ton visuel #3/#4 (screenshot scoreboard + exemple message)
        alt: "Publication du résultat avec le screenshot du tableau de fin de game",
        body: (
          <>
            À la fin de chaque game, <b>le capitaine de l’équipe gagnante</b> poste
            dans <b>#résultat</b> :
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Le <b>screen du tableau de fin de game</b> (scores complets).</li>
              <li>Un message avec le <b>format obligatoire</b> :</li>
            </ul>
            <pre className="mt-2 rounded-lg bg-black/40 p-3 text-sm">
{`Round X, match X, team A vs team B, gagnant = team A`}
            </pre>
            <div className="text-sm opacity-90">
              <b>Exemple</b> :
              <pre className="mt-1 rounded-lg bg-black/40 p-3 text-sm">
{`Round 1, match 1, team A vs team B, gagnant = team A`}
              </pre>
              Le screenshot doit montrer clairement les <b>pseudos</b> et les{" "}
              <b>statistiques</b> des deux équipes (vérification du staff).
            </div>
            <Warn>
              Sans ce message + screen, le match peut ne pas être validé pour le
              classement/points.
            </Warn>
          </>
        ),
      },

      // ========= ancien step 10 → devient step 11 =========
      {
        id: "step-11",
        n: 11,
        title: "Vote MVP en fin de session",
        img: "step-11.png",
        alt: "Embed pour voter MVP",
        body: (
          <>
            Dans <b>#votes</b>, chacun a <b>4 votes</b> (un par équipe). Tu peux
            voter pour toi, mais reste <b>fair-play</b> 😉{" "}
            <br />
            <br />
            <b>Important :</b> les votes MVP attribuent des <b>points</b> qui, combinés aux
            <b> résultats des matchs (win/lose)</b>, sont <b>reversés à chaque joueur</b>{" "}
            une fois la session <b>clôturée</b>. Ces points servent au suivi et au classement MYG.
          </>
        ),
      },
    ],
    []
  );

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-[calc(var(--header-height,56px)+16px)] text-white">
      {/* Header */}
      <header className="mb-8 space-y-3">
        <Pill>MYG Inhouses</Pill>
        <h1 className="text-4xl font-bold">Guide rapide — Utiliser le bot</h1>
        <p className="max-w-3xl text-lg opacity-90">
          Tout ce qu’il faut savoir pour créer ton profil, t’inscrire, laisser le staff créer les équipes,
          lancer la draft, suivre les matchs, publier les résultats et voter les MVPs. <b>Scroll en douceur.</b>
        </p>
      </header>

      {/* Tips row */}
      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Tip>Lis une fois du haut vers le bas (2&nbsp;min).</Tip>
        <Tip>Active <b>“Montrer tous les salons”</b> pour voir les salons d’équipe.</Tip>
        <Warn>Ne clique jamais sur <b>“Test”</b> dans le lobby.</Warn>
      </div>

      {/* TOC MOBILE */}
      <nav className="mb-6 block lg:hidden">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 font-semibold opacity-90">Sommaire</div>
          <div className="flex flex-wrap gap-2">
            {steps.map((s) => (
              <Link
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm hover:bg-white/10"
              >
                {s.n}. {s.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Layout desktop avec TOC STICKY */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px,1fr]">
        {/* TOC DESKTOP */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height,56px)+12px)]">
            <nav className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="mb-2 font-semibold opacity-90">Sommaire</div>
              <ul className="space-y-1">
                {steps.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`#${s.id}`}
                      className="block rounded px-2 py-1 hover:bg-white/10"
                    >
                      {s.n}. {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Contenu */}
        <div className="space-y-10">
          {steps.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-[calc(var(--header-height,56px)+16px)] space-y-3"
            >
              <h2 className="flex items-center gap-3 text-2xl font-semibold">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm">
                  {s.n}
                </span>
                {s.title}
              </h2>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="prose prose-invert max-w-none">
                  <div className="text-base leading-relaxed opacity-90">{s.body}</div>
                </div>

                {/* IMAGE : taille maîtrisée */}
                <figure className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <div className="w-full">
                    <Image
                      src={`${IMG_BASE}${s.img}`}
                      alt={s.alt}
                      width={1600}
                      height={900}
                      className="h-auto w-full max-h-[300px] object-contain bg-black/40 md:max-h-[420px] lg:max-h-[560px]"
                      priority={s.n <= 1} // précharge 0 et 1
                    />
                  </div>
                </figure>
              </div>
            </section>
          ))}

          {/* Mini-FAQ */}
          <section className="mt-12 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-xl font-semibold">Mini-FAQ</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Je ne vois pas les salons d’équipe ?</h4>
                <p className="opacity-90">
                  Active <b>“Montrer tous les salons”</b>. Attends la création des équipes
                  par un Respo. Vérifie aussi tes permissions.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Qui lance la draft ?</h4>
                <p className="opacity-90">
                  <b>Le capitaine</b>. Le lien est dans ton salon d’équipe. Lance dès que
                  tout le monde est prêt en vocal.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Je peux streamer ?</h4>
                <p className="opacity-90">
                  Oui. Utilise le <b>lien spectateur</b> du salon <b>#matchs</b>.
                  Évite le ghosting (pas d’info en direct aux joueurs).
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Les salons disparaissent ?</h4>
                <p className="opacity-90">
                  Oui, ils sont <b>éphémères</b> et s’auto-nettoient en fin de session.
                  Pour discuter après, basculez dans les salons permanents.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
