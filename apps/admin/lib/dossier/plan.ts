/**
 * The plan, as data — presented as the plan, not as the successor to anything.
 *
 * Six phases in dependency order. The track at the top carries the sequence so
 * the six detail cards can be read as detail rather than as a wall; the frame
 * table carries the numbers the periphery of each phase is cut to fit.
 *
 * Proposed, not decided: nothing here is opened as a ticket before Morgane and
 * Arnaud have read it.
 */

import type { TrackStep } from "@/components/company/phase-track";
import type { FactRow, Item, PageHeader } from "@/lib/dossier/shared";

export const plan = {
  header: {
    eyebrow: "Le plan proposé",
    title: "Plan V2",
    lead: "Six phases, dans l'ordre où elles doivent tomber : la simplicité d'abord, le dashboard praticien comme centre stratégique, de la valeur en moins de 60 secondes, et la discipline des 10 000 €. Découpées en 27 tickets, qui ne seront ouverts qu'après votre relecture.",
  } satisfies PageHeader,

  track: {
    title: "Les six phases",
    description:
      "Chacune dépend de la précédente. Les phases C, D et E sont le produit lui-même ; A et B sont ce qui doit être réglé pour pouvoir les construire sans se tromper.",
    steps: [
      {
        letter: "A",
        label: "Décider",
        note: "Quelques jours. Des arbitrages, pas du code.",
      },
      {
        letter: "B",
        label: "Fondations",
        note: "1 à 2 semaines. Comptes, données, socle légal.",
      },
      {
        letter: "C",
        label: "Boucle patient",
        note: "Le cœur de la V2. Valeur en 60 secondes.",
      },
      {
        letter: "D",
        label: "Dashboard praticien",
        note: "Ce qui fait qu'un praticien s'abonne.",
      },
      {
        letter: "E",
        label: "Parser",
        note: "Le cœur propriétaire.",
      },
      {
        letter: "F",
        label: "Argent et bêta",
        note: "Premiers revenus, praticiens fondateurs.",
      },
    ] satisfies readonly TrackStep[],
  },

  foundations: {
    title: "Ce qui est déjà en place",
    lead: "Le point de départ des phases ci-dessous — construit, en service, et sans travail à refaire.",
    items: [
      {
        title: "Les fondations techniques",
        body: "Structure propre, conventions écrites et appliquées automatiquement, envoi d'emails qui fonctionne, relecture de code protégée. Le genre de socle qui coûte cher à rattraper plus tard.",
        tag: { label: "en service", intent: "success" },
      },
      {
        title: "La place de Supabase est prête",
        body: "Le code est construit pour que la base de données et l'authentification se branchent sans réécriture. Supabase est ce branchement : c'est la phase B, et il n'y a rien à défaire d'ici là.",
        tag: { label: "à brancher", intent: "warning" },
      },
      {
        title: "Les trois surfaces existent",
        body: "Une application patient, un espace praticien, une console d'administration : l'architecture est en place. Ce sont les écrans qui restent à construire, pas leur cadre.",
        tag: { label: "en service", intent: "success" },
      },
    ] satisfies readonly Item[],
  },

  frame: {
    title: "Le cadre : vos chiffres, et la contrainte",
    description:
      "Vos objectifs, avec une note d'état honnête en face de chacun. C'est ce tableau qui décide du périmètre des six phases, pas l'inverse.",
    columns: ["Quoi", "Cible", "Note d'état"],
    statusColumn: "État",
    rows: [
      {
        cells: [
          "Lancement de la V2",
          "mi-2026",
          "Nous sommes en août et la V2 n'est pas lancée. À acter ensemble et redater, pas à contourner.",
        ],
        tag: { label: "glissé", intent: "warning" },
      },
      {
        cells: [
          "Pilote bêta",
          "~15 praticiens fondateurs, retours toutes les deux semaines",
          "Une cible de recrutement — c'est la phase F. Personne n'a signé à ce jour.",
        ],
        tag: { label: "prévu", intent: "info" },
      },
      {
        cells: [
          "Adoption la première année",
          "10 à 30 praticiens actifs, 100 à 300 utilisateurs actifs",
          "Devant nous. Le socle porte cet ordre de grandeur sans question d'échelle.",
        ],
        tag: { label: "devant nous", intent: "neutral" },
      },
      {
        cells: [
          "Premiers revenus",
          "2 000 à 5 000 € de revenu récurrent mensuel, rétention supérieure à 50 % à 3 mois",
          "Aucun revenu à ce jour. C'est la phase F.",
        ],
        tag: { label: "devant nous", intent: "neutral" },
      },
      {
        cells: [
          "Tarification",
          "Praticiens : 39 € / 79 € / 199 € par mois (Starter, Growth, Clinic). Patients : gratuit, premium ~9,99 €",
          "Des réflexions, pas des prix arrêtés. À trancher avant la phase F.",
        ],
        tag: { label: "à arrêter", intent: "warning" },
      },
      {
        cells: [
          "Budget",
          "Autofinancé, V2 volontairement plafonnée autour de 10 000 €",
          "La contrainte qui décide de tout le reste : le périmètre se taille pour ce montant.",
        ],
        tag: { label: "contrainte", intent: "warning" },
      },
    ] satisfies readonly FactRow[],
  },

  phaseA: {
    title: "Phase A · Décider et déblayer le terrain",
    lead: "Quelques jours. Des décisions, pas du développement — et chacune évite de construire la mauvaise chose ensuite.",
    items: [
      {
        title: "Adopter Supabase officiellement",
        body: "Base de données, authentification et stockage de la V2. Le code est prêt à le recevoir ; il ne manque que la décision.",
        tag: { label: "décision", intent: "info" },
      },
      {
        title: "Geler le périmètre de la V2",
        body: "Améliore mon assiette, hub du jour, « je mange autre chose », journal de compléments, micro-actions et leur pourquoi, dashboard praticien, parser. Rien d'autre n'entre dans la V2.",
        tag: { label: "décision", intent: "info" },
      },
      {
        title: "Décider ce qui survit des six sites",
        body: "L'installation actuelle fait tourner six applications déployées, ce qui ne va pas naturellement avec votre priorité de simplicité radicale. Recommandation : produit patient, espace praticien et une page marketing pour l'instant ; le reste en pause plutôt que supprimé.",
        tag: { label: "à décider ensemble", intent: "warning" },
      },
      {
        title: "Trancher le Startup Boost",
        body: "Répondre aux deux verrous d'éligibilité — siège wallon, date de constitution — et décider go ou no-go, avant que le dossier ne consomme septembre.",
        tag: { label: "échéance 15 septembre", intent: "error" },
      },
      {
        title: "Régler le sort de la V1",
        body: "Vérifier si le Supabase de la V1 contient de vraies données patients, puis fermer ou reprendre les comptes fournisseurs. Les données d'abord, les comptes ensuite — jamais l'inverse.",
        tag: { label: "urgent", intent: "error" },
      },
      {
        title: "Construire le registre des outils et des coûts",
        body: "Le tableau partagé de la page « Outils » : outil, détenteur du compte, usage, facturation, montant mensuel.",
        tag: { label: "une demi-heure", intent: "neutral" },
      },
    ] satisfies readonly Item[],
  },

  phaseB: {
    title: "Phase B · Les fondations",
    lead: "Une à deux semaines. De vrais comptes, de vraies données, et les filets de sécurité — avant le premier enregistrement réel, jamais après le premier incident.",
    items: [
      {
        title: "Brancher Supabase",
        body: "Base de données et authentification : comptes praticiens, comptes patients, et le lien d'invitation ou QR code entre les deux.",
      },
      {
        title: "Modéliser la boucle de la V2",
        body: "Profil patient, praticien, recommandation, règle, micro-action, retour — les six objets du schéma de la Synthèse, et rien de plus.",
      },
      {
        title:
          "Le socle de protection des données, avant le premier enregistrement réel",
        body: "Hébergement européen, contrats de sous-traitance, durées de conservation. Ce sont des données de santé : ce point n'est pas négociable et ne se rattrape pas après coup.",
        tag: { label: "non négociable", intent: "error" },
      },
      {
        title: "Tests et remontée d'erreurs",
        body: "Une couverture de tests de base et le suivi des plantages, pour que la bêta ne se débogue pas à travers les praticiens.",
      },
    ] satisfies readonly Item[],
  },

  phaseC: {
    title: "Phase C · La boucle patient — le cœur de la V2",
    lead: "De la valeur en moins de 60 secondes. C'est la phase qui décide si le produit est utilisé quotidiennement ou pas du tout.",
    items: [
      {
        title: "L'onboarding ultra-simplifié",
        body: "Fondé sur les aliments les plus fréquents, avec une première micro-action générée immédiatement.",
      },
      {
        title: "« Améliore mon assiette »",
        body: "La personne dit ce qu'elle va manger, REMI analyse le repas au regard des recommandations de son praticien, propose une amélioration concrète, et explique le pourquoi.",
      },
      {
        title: "Le hub du jour et le mode « je mange autre chose »",
        body: "L'accompagnement quotidien, et la soupape qui fonctionne avec ce qu'il y a réellement dans le frigo.",
      },
      {
        title: "Le journal de compléments et le suivi des micro-actions",
        body: "Avec des rappels, et un suivi qui alimente directement la vue du praticien — c'est ce qui relie les deux moitiés du produit.",
      },
      {
        title: "La discipline des coûts d'IA dès le premier jour",
        body: "Appels ciblés, suivi du coût par génération, gestion des erreurs et des reprises. Ce sont vos priorités déclarées, pas une prudence rajoutée.",
        tag: { label: "votre priorité", intent: "info" },
      },
    ] satisfies readonly Item[],
  },

  phaseD: {
    title: "Phase D · Le dashboard praticien — le chantier stratégique",
    lead: "Ce qui fait qu'un praticien s'abonne, et ce que vous décrivez vous-même comme le chantier le plus stratégique de REMI.",
    items: [
      {
        title: "La vue de cohorte",
        body: "Tous les patients, l'adhérence en un coup d'œil, et qui est en difficulté.",
      },
      {
        title: "Le détail par patient",
        body: "Actions réalisées, difficultés, habitudes alimentaires, retours.",
      },
      {
        title: "L'ajustement des recommandations à distance",
        body: "Modifier les règles et regénérer l'accompagnement du patient sans attendre la consultation suivante.",
      },
      {
        title: "Le feedback rapide et les messages de groupe",
        body: "Encouragements, emojis, messages courts, et l'envoi à plusieurs patients à la fois.",
      },
      {
        title: "L'entrée des patients par QR code ou lien d'invitation",
        body: "Ce n'est pas une commodité : c'est le mécanisme d'acquisition lui-même, celui qui rend le coût d'acquisition quasi nul.",
        tag: { label: "le mécanisme d'acquisition", intent: "info" },
      },
    ] satisfies readonly Item[],
  },

  phaseE: {
    title: "Phase E · Le parser — le cœur propriétaire",
    lead: "Les documents du praticien deviennent des règles structurées, automatiquement.",
    items: [
      {
        title: "Collecter les formats réels",
        body: "Récupérer les PDF et comptes rendus que vos praticiens bêta produisent réellement, avant d'écrire une ligne de parser. Commencer étroit sur ces formats-là, élargir ensuite.",
      },
      {
        title: "Le parser lui-même",
        body: "PDF ou notes de consultation → extraction des recommandations → règles alimentaires structurées → alimentation automatique de la boucle patient.",
      },
      {
        title: "Ce que cela sert en plus",
        body: "C'est la meilleure pièce à conviction « technologie propriétaire » pour le Startup Boost. La construire tôt sert le produit et le dossier en même temps.",
        tag: { label: "sert aussi le dossier", intent: "success" },
      },
    ] satisfies readonly Item[],
  },

  phaseF: {
    title: "Phase F · L'argent et la bêta — la validation",
    lead: "Premiers revenus, usage réel, et les indicateurs de votre propre liste.",
    items: [
      {
        title: "Les paiements",
        body: "Abonnements praticiens aux paliers Starter, Growth et Clinic ; le premium patient plus tard.",
      },
      {
        title: "Recruter et embarquer les ~15 praticiens fondateurs",
        body: "Avec des cycles de retours toutes les deux semaines, comme votre méthode de travail le décrit.",
      },
      {
        title: "Instrumenter les indicateurs",
        body: "Actifs quotidiens et mensuels, taux d'adhérence, rétention à J+7, J+30 et J+90, usage praticien — votre propre liste de KPI, pas une autre.",
      },
    ] satisfies readonly Item[],
  },

  boost: {
    title: "Comment le Startup Boost s'insère",
    body: [
      "Si la candidature se fait, elle tourne en parallèle des phases A et B. C'est du travail de rédaction et de projection financière — vous, votre comptable, et moi pour les annexes techniques — pas du développement, donc elle ne retarde pas le produit.",
      "Les phases C à E sont précisément ce que les 100 000 € accéléreraient, ce qui rend la demande facile à justifier devant un jury : terminer le moteur d'exécution et mener la bêta des praticiens fondateurs à plein régime.",
    ],
  },

  backlog: {
    title: "Comment le travail est organisé",
    body: [
      "Les six phases sont découpées en 27 tickets, un par unité de travail, chacun avec son énoncé de problème, ses étapes et ses critères d'acceptation.",
      "Chaque ticket porte une section « questions ouvertes » explicite, et la consigne pour quiconque le prend en main est la même : faire le travail qui ne dépend pas de la question, poser la question, ne jamais inventer une réponse et l'enterrer dans le code. C'est ce qui garantit que les points de la page « Décisions » vous reviennent au lieu d'être tranchés par accident.",
    ],
  },
} as const;
