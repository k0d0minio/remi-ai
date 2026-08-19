/**
 * Part four: the plan that replaces the retired backlog.
 *
 * Six phases in dependency order, cut from the braindump's own priorities —
 * simplicity first, the practitioner dashboard as the strategic centre, value
 * in 60 seconds, and the ~€10k budget as a constraint rather than a footnote.
 * Proposed, not decided: nothing here is opened as a ticket before Morgane and
 * Arnaud have read it.
 */

import type { Item, PageHeader } from "@/lib/dossier/shared";

export const plan = {
  header: {
    eyebrow: "Partie quatre — le plan proposé",
    title: "Plan V2",
    lead: "L'ancien backlog a disparu. Voici son remplaçant, construit à partir de vos propres priorités : la simplicité d'abord, le dashboard praticien comme centre stratégique, de la valeur en moins de 60 secondes, et la discipline des 10 000 €. Six phases, dans l'ordre où elles doivent tomber, découpées en 27 tickets — qui ne seront ouverts qu'après votre relecture.",
  } satisfies PageHeader,

  phaseA: {
    title: "Phase A · Décider et déblayer le terrain",
    lead: "Quelques jours. Des décisions, pas du développement — et chacune évite de construire la mauvaise chose ensuite.",
    items: [
      {
        title: "Adopter Supabase officiellement",
        body: "Vos documents le nomment, le code est prêt à le recevoir. Une décision, qui referme un vieux débat interne.",
        tag: { label: "décision", intent: "info" },
      },
      {
        title: "Geler le périmètre de la V2",
        body: "Améliore mon assiette, hub du jour, « je mange autre chose », journal de compléments, micro-actions et leur pourquoi, dashboard praticien, parser. Rien d'autre n'entre dans la V2.",
        tag: { label: "décision", intent: "info" },
      },
      {
        title: "Décider ce qui survit des six sites",
        body: "Recommandation : produit patient, espace praticien et une page marketing pour l'instant ; le reste en pause. C'est votre priorité de simplicité radicale appliquée à notre propre installation.",
        tag: { label: "à décider ensemble", intent: "warning" },
      },
      {
        title: "Trancher le Startup Boost",
        body: "Répondre aux deux verrous d'éligibilité — siège wallon, date de constitution — et décider go ou no-go, avant que le dossier ne consomme septembre.",
        tag: { label: "échéance 15 septembre", intent: "error" },
      },
      {
        title: "Régler le sort de la V1",
        body: "Vérifier si l'ancien Supabase contient de vraies données patients, puis fermer ou reprendre les comptes fournisseurs. Les données d'abord, les comptes ensuite — jamais l'inverse.",
        tag: { label: "urgent", intent: "error" },
      },
      {
        title: "Construire le registre des outils et des coûts",
        body: "Le tableau partagé de la page « Outils et coûts » : outil, détenteur du compte, usage, facturation, montant mensuel.",
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
        body: "Profil patient, praticien, recommandation, règle, micro-action, retour — en suivant vos concepts, pas ceux de la V1.",
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
        body: "Fondé sur les aliments les plus fréquents, avec une première micro-action générée immédiatement. Pas de journal de sept jours.",
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
      {
        title: "La cible",
        body: "Les premiers jalons de vos documents : 10 à 30 praticiens actifs, 2 000 à 5 000 € de revenu récurrent mensuel.",
        tag: { label: "vos jalons", intent: "info" },
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
    title: "Comment le backlog est organisé",
    body: [
      "Les six phases sont découpées en 27 tickets, un par unité de travail, chacun avec son énoncé de problème, ses étapes et ses critères d'acceptation. Ils vivent dans le projet lui-même, et le ticket est retiré par la modification qui le réalise — jamais par un ménage ultérieur.",
      "Chaque ticket porte aussi une section « questions ouvertes » explicite, et la consigne pour quiconque le prend en main est la même : faire le travail qui ne dépend pas de la question, poser la question, ne jamais inventer une réponse et l'enterrer dans le code. C'est volontaire — les phases ont été proposées avant votre relecture, et un certain nombre de choses que vos documents ne tranchent pas seraient sinon décidées par accident.",
    ],
  },

  footer:
    "Sources : le rapport de direction du 18 août 2026 (partie quatre) et le braindump — roadmap/court-term.md, roadmap/priorities.md, roadmap/features.md, developpement-produit/ai.md, developpement-produit/workflow.md, business/kpi.md.",
} as const;
