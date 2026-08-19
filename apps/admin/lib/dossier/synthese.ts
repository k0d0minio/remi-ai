/**
 * The dossier's opening page, as data.
 *
 * Everything on it is a pointer: what changed, the four answers, and an agenda
 * for the call. Nothing is argued here — the four pages behind it do that, and
 * a summary that argues is a summary that disagrees with its own pages sooner
 * or later.
 */

import type { Item, PageHeader } from "@/lib/dossier/shared";

export const synthese = {
  header: {
    eyebrow: "À lire avant l'appel",
    title: "Synthèse",
    lead: "Vos quatre questions répondues en une ligne chacune, ce qui a changé dans le projet cette semaine, et un ordre du jour pour l'appel. Quatre pages derrière celle-ci ; celle-ci se lit en une minute.",
  } satisfies PageHeader,

  minute: {
    title: "En une minute",
    body: [
      "Vos documents sont devenus la référence du projet : quand un document plus ancien les contredit, ce sont eux qui l'emportent. Concrètement, l'ancien plan de travail — bâti sur des suppositions — a été retiré, et le nouveau est tiré ligne à ligne de ce que vous avez écrit.",
      "Ce qui les remplace : six phases, A à F, découpées en 27 tickets — simplicité radicale d'abord, valeur en moins de 60 secondes, dashboard praticien comme chantier le plus stratégique, parser des recommandations comme cœur propriétaire. C'est une proposition, pas une décision : elle attend votre relecture.",
      "Et une correction qui compte, parce qu'elle circulait dans nos documents internes : le « pilote signé de 15 praticiens à 24,50 € par mois, facturé à partir du 1er septembre » n'a jamais existé. C'étaient des données de démonstration de cette console, prises pour un contrat par un audit antérieur. Les ~15 praticiens sont une cible de recrutement bêta : il n'y a ni date de facturation ni revenu.",
    ],
  },

  answers: {
    title: "Vos quatre questions, répondues en une ligne",
    lead: "Le détail — et surtout la manière de le défendre — est sur la page indiquée à droite de chaque réponse.",
    items: [
      {
        title:
          "La V2 de REMI peut-elle correspondre aux critères du Startup Boost ?",
        body: "Oui, et cela vaut la peine — sous réserve d'un seul fait : le siège d'exploitation doit être en Région wallonne. Deux critères solides (besoin sectoriel avéré, scalabilité du modèle praticien), un conditionnel (IA souveraine — une posture que nous pouvons engager, pas un acquis à montrer), un faible (deeptech et propriété intellectuelle), un à ne pas revendiquer du tout (cybersécurité).",
        tag: { label: "Startup Boost", intent: "info" },
      },
      {
        title: "Quels arguments mettre en avant devant le jury ?",
        body: "Cinq, dans l'ordre où les dire : le problème est prouvé et comportemental ; nous occupons un espace vide, le dernier kilomètre ; le praticien est notre distribution ; la technologie en développement est réellement nôtre ; la souveraineté est un choix de conception démontrable. Plus les deux questions dures du jury et leurs réponses honnêtes.",
        tag: { label: "Startup Boost", intent: "info" },
      },
      {
        title: "Où en est notre stack, et que coûte-t-elle ?",
        body: "Surprise : trois des quatre outils que vous citez — DigitalOcean, Mistral, Euria — n'apparaissent nulle part, ni dans le code, ni dans vos propres documents. Le quatrième, Supabase, est bien la base de la V2 mais n'est pas encore branché. En face, les comptes de la V1 sont peut-être encore facturés chaque mois pour un produit qui ne tourne plus. Aucun chiffre inventé : la vision claire des coûts se construit avec les factures ou les accès.",
        tag: { label: "Outils", intent: "info" },
      },
      {
        title: "Sommes-nous sur la même longueur d'onde ?",
        body: "Maintenant oui, et le plan est le prix de cette phrase. Il dit ce qui se reporte (les fondations techniques, la forme générale, Supabase) et ce qui ne se reporte pas (l'ancien backlog, et probablement une partie des six sites déployés). Rien n'y est enjolivé.",
        tag: { label: "Plan V2", intent: "info" },
      },
    ] satisfies readonly Item[],
  },

  changed: {
    title: "Ce qui a changé dans le projet cette semaine",
    lead: "Des changements déjà effectués, pas des intentions — chacun est visible dans le dépôt.",
    items: [
      {
        title: "L'ancien backlog a été retiré",
        body: "33 tickets supprimés en une fois, récupérables dans l'historique. Les six tickets déjà terminés sont conservés : ce travail-là était réel et reste valable — faille de confidentialité fermée, formulaire de contact branché, protections de relecture de code activées.",
        tag: { label: "fait", intent: "success" },
      },
      {
        title: "Un nouveau plan, en six phases",
        body: "27 tickets tirés de vos priorités, chacun portant explicitement ses questions ouvertes pour qu'aucune ne soit tranchée par accident dans le code.",
        tag: { label: "à valider", intent: "warning" },
      },
      {
        title: "Le pilote signé a été corrigé partout",
        body: "Les affirmations fausses ont été barrées dans les anciens rapports plutôt que discrètement effacées, pour que la correction reste visible et ne se ré-invente pas dans six mois.",
        tag: { label: "fait", intent: "success" },
      },
      {
        title: "La question de la base de données est close",
        body: "Vos documents nomment Supabase pour la V2. Cela tranche un débat interne qui traînait entre Neon et Supabase, et le socle avait justement été construit pour recevoir l'un ou l'autre sans réécriture.",
        tag: { label: "décidé", intent: "success" },
      },
    ] satisfies readonly Item[],
  },

  agenda: {
    title: "Ordre du jour proposé pour l'appel",
    lead: "Une heure suffit si nous prenons les décisions dans cet ordre : ce qui a une échéance d'abord, ce qui engage de l'argent ensuite, le rythme de travail à la fin.",
    items: [
      {
        title: "Startup Boost : go ou no-go",
        body: "Le siège d'exploitation est-il en Wallonie, et quelle est la date de constitution ? Ces deux réponses décident à elles seules si nous engageons septembre dans un dossier. L'appel clôture le 15 septembre 2026.",
        tag: { label: "10 min", intent: "neutral" },
      },
      {
        title: "Les outils et leurs coûts",
        body: "DigitalOcean, Mistral, Euria : ce que c'est, qui détient le compte, si cela facture. Et le sort du projet Supabase de la V1 — contient-il encore de vraies données patients des tests FunMedDev ?",
        tag: { label: "10 min", intent: "neutral" },
      },
      {
        title: "Le plan V2 : valider les six phases",
        body: "L'ordre proposé vous convient-il, et le budget d'environ 10 000 € tient-il encore la comparaison avec ce périmètre ? C'est la conversation la plus structurante de l'appel.",
        tag: { label: "15 min", intent: "neutral" },
      },
      {
        title: "Le périmètre : six sites, faut-il tous les garder ?",
        body: "Votre priorité numéro un est la simplicité radicale, et six applications déployées ne va pas naturellement avec. Recommandation à discuter : produit patient, espace praticien, une page marketing — et le reste en pause.",
        tag: { label: "10 min", intent: "neutral" },
      },
      {
        title: "Les données de santé et le socle légal",
        body: "Avant le premier compte réel : hébergement européen, contrats de sous-traitance, durées de conservation, et l'entité qui assume le rôle de responsable de traitement. Non négociable, et cela conditionne la phase B.",
        tag: { label: "10 min", intent: "neutral" },
      },
      {
        title: "Le rythme de travail",
        body: "Slack est créé — il ne manque que l'invitation. Un point hebdomadaire de trente minutes pour les arbitrages, le reste en asynchrone : est-ce le bon rythme pour vous deux ?",
        tag: { label: "5 min", intent: "neutral" },
      },
    ] satisfies readonly Item[],
  },

  index: {
    title: "Le reste du dossier",
    lead: "Quatre pages. Chacune se lit seule, dans l'ordre ou à picorer.",
  },

  closing: {
    title: "Comment répondre",
    body: [
      "Dans l'ordre qui vous arrange et sous la forme qui vous arrange — un message, une note, un appel. La page « Décisions » rassemble tout ce qui ne dépend que de vous, dont deux points qui décident du Startup Boost à eux seuls.",
      "Tout le reste du plan peut avancer sans attendre ces réponses. C'est volontaire : rien dans ce dossier ne vous met en position de bloquer le travail en prenant le temps de réfléchir.",
    ],
  },
} as const;
