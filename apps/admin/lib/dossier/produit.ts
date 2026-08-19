/**
 * Part one of the dossier: what REMI is, read out of Morgane's own documents.
 *
 * Quoted rather than paraphrased wherever a sentence of hers already says it
 * better — the page's authority rests entirely on being her material handed
 * back, not on a reading of it.
 */

import type { FactRow, Item, PageHeader } from "@/lib/dossier/shared";

export const produit = {
  header: {
    eyebrow: "Partie une — ce que REMI est, dans vos mots",
    title: "Le produit",
    lead: "Cette page ne propose rien. Elle restitue ce que vos 40 documents disent du produit, pour que tout le reste du dossier repose sur une base que vous reconnaissez : le positionnement, les trois principes de la V2, son périmètre exact, et les chiffres par lesquels vous pilotez.",
  } satisfies PageHeader,

  positioning: {
    quote:
      "REMI se positionne comme le « dernier kilomètre » entre le praticien et le quotidien du patient. Là où la majorité des outils s'arrêtent à la consultation, au plan alimentaire ou au suivi de données, REMI accompagne la mise en pratique réelle des recommandations.",
    source: "braindump — vision-strategy/positioning.md",
  },

  gap: {
    title: "Le problème que REMI résout",
    body: [
      "REMI n'est pas une application de nutrition. C'est le dernier kilomètre entre un praticien de santé et la vie quotidienne d'un patient : le praticien recommande, et REMI transforme ces recommandations en petites actions concrètes que la personne peut réellement faire. Tout le produit existe pour refermer un seul écart — celui entre « je sais ce que je devrais faire » et « je le fais ».",
      "C'est aussi ce que disent vos tests terrain, et c'est ce qui rend l'argument défendable devant n'importe quel jury : les patients de FunMedDev n'ont pas manqué d'informations nutritionnelles. Ce qui les a fait décrocher, c'est l'adhérence, la fatigue décisionnelle, les habitudes et la charge mentale. Le problème est comportemental, pas informationnel.",
    ],
  },

  principles: {
    title: "Les trois principes qui définissent la V2",
    lead: "Tous les trois sortent de leçons apprises à la dure avec la V1, et tous les trois viennent de vos documents.",
    items: [
      {
        title: "Le praticien est au centre de tout",
        body: "REMI a commencé comme une application vendue directement aux patients. Le pivot est fait : les praticiens — nutritionnistes, diététiciens, médecins fonctionnels — sont désormais les clients, les prescripteurs et le canal d'acquisition. Ils paient un abonnement mensuel ; leurs patients arrivent par eux, via un QR code ou une invitation, à un coût d'acquisition quasi nul. Les patients ont une version gratuite, avec un premium plus tard.",
        tag: { label: "pivot B2C vers B2B2C", intent: "info" },
      },
      {
        title: "Plus de plans alimentaires rigides",
        body: "La V1 imposait des plans et demandait un journal alimentaire de sept jours avant de rendre quoi que ce soit. Les gens abandonnaient. La V2 inverse le modèle : la personne dit ce qu'elle s'apprête à manger, et REMI propose immédiatement une amélioration réaliste — adaptée aux recommandations de son praticien, à ses goûts, son budget, son temps et sa vie de famille — puis explique le pourquoi. Votre règle pour la V2 : de la valeur en moins de 60 secondes.",
        tag: { label: "valeur en 60 secondes", intent: "info" },
      },
      {
        title: "Des petits pas, pas des transformations",
        body: "L'unité de progrès est la micro-action : quelque chose de faisable en quelques minutes — « demain matin, remplace ton pain habituel par du pain de sarrasin » — avec le raisonnement attaché. L'adhérence avant l'ambition.",
        tag: { label: "micro-actions", intent: "info" },
      },
    ] satisfies readonly Item[],
  },

  patient: {
    title: "Ce que la V2 doit contenir — côté patient",
    lead: "Le braindump est précis là-dessus, et c'est ce périmètre exact qui a été gelé dans le nouveau plan.",
    items: [
      {
        title: "Un onboarding ultra-simplifié",
        body: "Le journal alimentaire de sept jours est explicitement supprimé. À la place : un parcours rapide fondé sur les aliments les plus fréquents, avec génération immédiate d'une première micro-action.",
      },
      {
        title: "« Améliore mon assiette »",
        body: "La fonctionnalité centrale de la V2. La personne indique ce qu'elle va manger ; REMI analyse le repas, le compare aux recommandations du praticien, propose une amélioration concrète, explique le pourquoi, et fait évoluer les habitudes progressivement.",
      },
      {
        title: "Le hub du jour",
        body: "L'accompagnement quotidien qui remplace le plan alimentaire rigide, avec des recettes sur mesure plutôt qu'un menu imposé.",
      },
      {
        title: "Le mode « je mange autre chose »",
        body: "La soupape de la vraie vie : la personne indique ce qui est réellement disponible chez elle, et REMI génère instantanément une alternative compatible avec ses recommandations.",
      },
      {
        title: "Un journal de compléments intelligent",
        body: "Rappels adaptés, meilleure observance, et une standardisation qui tient quand plusieurs praticiens interviennent.",
      },
      {
        title: "Des micro-actions, et leur pourquoi",
        body: "Chaque recommandation est accompagnée d'une explication claire — pour renforcer la compréhension, créer l'adhésion, et rendre la personne autonome plutôt que dépendante de l'application.",
      },
    ] satisfies readonly Item[],
  },

  practitioner: {
    title: "Ce que la V2 doit contenir — côté praticien",
    lead: "Vous l'appelez vous-même le chantier le plus stratégique de REMI. C'est aussi ce qui fait qu'un praticien s'abonne.",
    items: [
      {
        title: "Le dashboard praticien",
        body: "Une vue d'ensemble de tous les patients, l'adhérence en un coup d'œil, et l'identification rapide de ceux qui décrochent.",
      },
      {
        title: "La vue détaillée d'un patient",
        body: "Les actions réalisées, les difficultés rencontrées, les habitudes alimentaires et les retours de la personne.",
      },
      {
        title: "La modification des recommandations à distance",
        body: "Le praticien ajuste les règles et regénère le plan d'accompagnement sans attendre la consultation suivante.",
      },
      {
        title: "Le feedback rapide et les messages de groupe",
        body: "Encouragements, emojis, messages courts pour maintenir le lien motivationnel — et des conseils ou contenus envoyés à plusieurs patients à la fois.",
      },
      {
        title: "Le parser de recommandations",
        body: "La pièce technique maîtresse : REMI lit le PDF ou le compte rendu de consultation du praticien et le transforme automatiquement en règles structurées qu'il peut appliquer. C'est aussi la meilleure pièce à conviction « technologie propriétaire » pour le Startup Boost.",
        tag: { label: "cœur propriétaire", intent: "success" },
      },
    ] satisfies readonly Item[],
  },

  numbers: {
    title: "Les chiffres que vous pilotez",
    description:
      "Tirés de vos objectifs et de votre document de pricing, avec une note d'état honnête en face de chacun.",
    columns: ["Quoi", "Cible, selon vos documents", "Note d'état"],
    statusColumn: "État",
    rows: [
      {
        cells: [
          "Lancement de la V2",
          "mi-2026",
          "Nous sommes en août et la V2 n'est pas lancée. Cela mérite d'être acté ensemble et redaté, pas contourné.",
        ],
        tag: { label: "glissé", intent: "warning" },
      },
      {
        cells: [
          "Pilote bêta",
          "~15 praticiens fondateurs, retours toutes les deux semaines",
          "C'est de là que vient le chiffre de 15 praticiens qui circulait partout : une cible de recrutement, pas des contrats signés.",
        ],
        tag: { label: "prévu", intent: "info" },
      },
      {
        cells: [
          "Adoption la première année",
          "10 à 30 praticiens actifs, 100 à 300 utilisateurs actifs",
          "Devant nous. Le socle en construction porte cet ordre de grandeur sans question d'échelle.",
        ],
        tag: { label: "devant nous", intent: "neutral" },
      },
      {
        cells: [
          "Premiers revenus",
          "2 000 à 5 000 € de revenu récurrent mensuel, rétention supérieure à 50 % à 3 mois",
          "Devant nous. Aucun revenu à ce jour, et c'est la phase F du plan.",
        ],
        tag: { label: "devant nous", intent: "neutral" },
      },
      {
        cells: [
          "Tarification",
          "Praticiens : 39 € / 79 € / 199 € par mois (Starter, Growth, Clinic). Patients : gratuit, premium ~9,99 €",
          "Ce sont vos réflexions, pas des prix arrêtés. Elles remplacent le chiffre de 24,50 € qui circulait dans le code — ce nombre n'a jamais été réel.",
        ],
        tag: { label: "à arrêter", intent: "warning" },
      },
      {
        cells: [
          "Budget",
          "Autofinancé, V2 volontairement plafonnée autour de 10 000 €",
          "C'est la contrainte qui décide de tout le reste : le périmètre doit être taillé pour ce montant, pas l'inverse.",
        ],
        tag: { label: "contrainte", intent: "warning" },
      },
    ] satisfies readonly FactRow[],
    note: "Aucun de ces chiffres n'a été inventé ni arrondi : ils sont repris de business/pricing.md, business/kpi.md et vision-strategy/objectifs.md.",
  },

  tests: {
    title: "Ce que les tests FunMedDev ont réellement appris",
    body: [
      "Le MVP a été testé auprès de patients de la clinique FunMedDev, et les quatre enseignements que vous en tirez sont exactement les arguments qui tiennent devant un jury de financement : le problème est réel — les utilisateurs ont confirmé leurs difficultés à appliquer les recommandations et leur perte de motivation ; les utilisateurs veulent un résultat immédiat — attendre plusieurs jours avant d'obtenir de la valeur crée l'abandon ; la simplicité est essentielle ; et le problème principal est comportemental.",
      "C'est votre avantage réel, et il est rare : vous savez pourquoi les applications de santé perdent leurs utilisateurs, parce que vous l'avez observé sur de vraies personnes. Ce n'est pas une hypothèse de marché, c'est du terrain — et cela se défend en une phrase.",
    ],
  },

  footer:
    "Sources : braindump — vision-strategy/positioning.md, vision-strategy/objectifs.md, roadmap/court-term.md, roadmap/features.md, developpement-produit/ai.md, developpement-produit/tests.md, business/pricing.md, business/kpi.md, journal-du-createur/pivots.md.",
} as const;
