/**
 * Q3: the tools we use, the tools we will need, and what they cost.
 *
 * The register Morgane asked for, with one deliberate omission: no monthly
 * figures. Every number here would have been guessed, and a cost register built
 * on guesses is worse than none — it gets quoted later as if it were read off
 * an invoice.
 */

import type { FactRow, PageHeader } from "@/lib/dossier/shared";

export const outils = {
  header: {
    eyebrow: "Réponse à la question 3",
    title: "Outils et coûts",
    lead: "Ce que la stack utilise aujourd'hui, ce qu'il lui manque, et ce que la V1 fait peut-être encore payer. Un point à réconcilier pendant l'appel : sur les quatre outils que vous citez, seul Supabase est de mon côté — DigitalOcean, Mistral et Euria, je ne les trouve pas.",
  } satisfies PageHeader,

  current: {
    title: "Ce que la stack utilise aujourd'hui",
    description: "Quatre lignes en service, une à brancher, deux à décider.",
    columns: ["Outil", "Ce qu'il fait pour nous"],
    statusColumn: "État",
    rows: [
      {
        cells: ["Vercel", "Héberge tous les sites."],
        tag: { label: "en service", intent: "success" },
      },
      {
        cells: [
          "GitHub",
          "Le code, avec les protections de relecture actives.",
        ],
        tag: { label: "en service", intent: "success" },
      },
      {
        cells: [
          "Resend",
          "Envoie les emails — le formulaire de contact passe réellement par lui.",
        ],
        tag: { label: "en service", intent: "success" },
      },
      {
        cells: [
          "Supabase",
          "Base de données, authentification et stockage de la V2. Pas encore connecté — le code est construit prêt à le recevoir, c'est la phase B.",
        ],
        tag: { label: "à connecter", intent: "warning" },
      },
      {
        cells: [
          "Fournisseur de modèle d'IA",
          "Nécessaire pour « Améliore mon assiette » et pour le parser. Aucun n'est branché ; le choix est ouvert — et si la souveraineté compte pour le Startup Boost, un fournisseur européen comme Mistral renforce nettement cet argument.",
        ],
        tag: { label: "à choisir", intent: "warning" },
      },
      {
        cells: [
          "Prestataire de paiement",
          "Nécessaire pour les abonnements praticiens, au moment de la monétisation. Rien n'est choisi, et rien ne presse : c'est la phase F.",
        ],
        tag: { label: "plus tard", intent: "neutral" },
      },
    ] satisfies readonly FactRow[],
  },

  unfound: {
    title: "Les outils que vous citez et que je ne trouve pas",
    description:
      "Trois questions courtes, dont les réponses peuvent faire économiser un abonnement — ou révéler une obligation.",
    columns: ["Votre liste", "Ce que j'ai trouvé", "Ma question"],
    rows: [
      {
        cells: [
          "DigitalOcean",
          "Introuvable de mon côté.",
          "Quelque chose y tourne-t-il encore, et facture-t-il, depuis la V1 ? Si oui, sur quel compte, et pouvons-nous y accéder ou l'arrêter ?",
        ],
      },
      {
        cells: [
          "Mistral",
          "Nulle part.",
          "En usage quelque part, ou une intention ? Comme dit plus haut : comme fournisseur d'IA européen, il servirait réellement l'argument de souveraineté — si vous penchiez de ce côté, c'était un bon réflexe.",
        ],
      },
      {
        cells: [
          "Euria",
          "Nulle part, et je préfère ne pas deviner ce que c'est.",
          "De quoi s'agit-il, à quoi cela sert-il, et est-ce que nous le payons ?",
        ],
      },
    ] satisfies readonly FactRow[],
  },

  legacy: {
    title: "Les comptes de la V1 — peut-être encore facturés",
    description:
      "Chacun est potentiellement une carte débitée chaque mois pour un produit qui ne tourne plus.",
    columns: ["Outil", "Son rôle dans la V1"],
    statusColumn: "À faire",
    rows: [
      {
        cells: [
          "Supabase (projet V1)",
          "Toute la partie serveur : base de données, authentification, stockage, fonctions.",
        ],
        tag: { label: "vérifier les données", intent: "error" },
      },
      {
        cells: ["OpenRouter", "Les appels aux modèles d'IA."],
        tag: { label: "fermer ou reprendre", intent: "warning" },
      },
      {
        cells: [
          "LlamaParse",
          "La lecture des PDF. Directement pertinent à nouveau : c'est exactement le besoin du parser de la phase E.",
        ],
        tag: { label: "fermer ou reprendre", intent: "warning" },
      },
      {
        cells: ["Brevo", "Les emails transactionnels."],
        tag: { label: "fermer ou reprendre", intent: "warning" },
      },
      {
        cells: [
          "Lovable",
          "La plateforme sur laquelle la V1 a été construite.",
        ],
        tag: { label: "fermer ou reprendre", intent: "warning" },
      },
    ] satisfies readonly FactRow[],
  },

  dataQuestion: {
    title: "La question qui prime sur toutes les autres",
    body: "Le projet Supabase de la V1 contient-il encore de vraies données de santé de patients, issues des tests FunMedDev ? Si oui, c'est une obligation de protection des données qu'il faut traiter indépendamment de tout le reste — avant de fermer quoi que ce soit, parce que fermer un compte n'efface ni les sauvegardes ni la responsabilité. C'est la seule ligne de cette page qui ne peut pas attendre l'appel suivant.",
  },

  costs: {
    title: "Sur les coûts",
    body: [
      "Je n'ai volontairement écrit aucun chiffre que je ne peux pas vérifier. Un tableau de coûts rempli d'estimations finit toujours par être cité comme s'il avait été lu sur une facture, et il induit en erreur bien plus longtemps qu'il ne rend service.",
      "La façon d'obtenir le vrai montant mensuel est simple : les factures, ou m'ajouter sur chaque compte. Résultat proposé pour l'appel : un seul tableau partagé — outil, qui détient le compte, à quoi il sert, facture-t-il encore, combien par mois. Une demi-heure, fait une bonne fois, et la vision claire des coûts que vous demandez existe de façon permanente.",
    ],
  },
} as const;
