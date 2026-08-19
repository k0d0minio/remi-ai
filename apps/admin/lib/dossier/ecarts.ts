/**
 * Part two: where what was built diverges from the braindump.
 *
 * The uncomfortable page, and the one that earns the rest. Everything built
 * before 18 August rested on assumptions about the product; the braindump has
 * replaced those assumptions, and some of the work does not survive the
 * substitution. Said plainly rather than softened — a review document that
 * flatters the work is a document nobody can use to decide anything.
 */

import type { Item, PageHeader } from "@/lib/dossier/shared";

export const ecarts = {
  header: {
    eyebrow: "Partie deux — l'inventaire honnête",
    title: "Écarts constatés",
    lead: "Tout ce qui a été construit jusqu'ici l'a été sur des suppositions concernant le produit, et vos documents ont remplacé ces suppositions. Une partie du travail se reporte très bien. Une autre non. Être franc là-dessus compte plus qu'être à l'aise.",
  } satisfies PageHeader,

  transfers: {
    title: "Ce qui se reporte",
    lead: "Rien de tout cela n'est perdu, quelle que soit la direction retenue.",
    items: [
      {
        title: "Les fondations techniques sont saines et réutilisables",
        body: "Structure propre, conventions écrites et appliquées automatiquement, envoi d'emails qui fonctionne, relecture de code protégée. C'est le genre de socle qui coûte cher à rattraper plus tard et rien n'y est spécifique au mauvais produit.",
        tag: { label: "acquis", intent: "success" },
      },
      {
        title: "Supabase, que vous nommez comme base de la V2, s'emboîte",
        body: "Votre document dit que la V2 repose sur « Supabase, workflows IA simplifiés, appels IA ciblés, maîtrise des coûts ». Le code a été construit délibérément pour que la base de données et l'authentification puissent se brancher plus tard sans réécriture : Supabase peut être exactement ce branchement. Cela referme au passage un débat qui traînait dans notre documentation entre Neon et Supabase — votre document tranche.",
        tag: { label: "acquis", intent: "success" },
      },
      {
        title: "La forme générale correspond",
        body: "Une application patient, un espace praticien, une console d'administration : c'est bien l'architecture que vos documents décrivent. Le désaccord porte sur le contenu des écrans, pas sur leur existence.",
        tag: { label: "acquis", intent: "success" },
      },
    ] satisfies readonly Item[],
  },

  diverges: {
    title: "Ce qui ne se reporte pas",
    lead: "Trois écarts, du plus coûteux au moins coûteux s'il n'avait pas été vu.",
    items: [
      {
        title: "L'ancien backlog visait le mauvais produit",
        body: "Sa liste de fonctionnalités avait été reconstruite à partir du code supprimé de la V1 : un questionnaire de scoring psychologique, un moteur d'interprétation génétique, la génération de plans hebdomadaires. Aucun n'apparaît dans vos priorités V2 — la génétique n'y figure que comme idée lointaine, « REMI Genetics ». Construire cette liste aurait dépensé le budget des 10 000 € sur les mauvaises choses.",
        tag: { label: "retiré", intent: "error" },
      },
      {
        title:
          "Six sites déployés, c'est plus lourd qu'un projet à 10 000 € ne le demande",
        body: "L'installation actuelle fait tourner six applications : produit, site marketing, console d'administration, documentation, centre d'aide, démonstration. Votre priorité numéro un est la simplicité radicale et l'itération rapide. Une surface plus légère — produit, espace praticien, une page marketing — mérite d'être discutée. Ce n'est pas une décision de ce dossier ; c'est une conversation pour l'appel.",
        tag: { label: "à décider", intent: "warning" },
      },
      {
        title: "Le pilote signé n'a jamais existé",
        body: "Les données de démonstration de cette console — 15 praticiens, 24,50 € par mois, facturation à partir du 1er septembre — ont été prises pour un contrat réel par un audit antérieur, puis transformées en échéance. Vos documents rétablissent la vérité : les 15 praticiens sont une cible de recrutement bêta. Il n'y a ni date de facturation ni revenu, et tout ce qui reposait sur cette fiction a été supprimé.",
        tag: { label: "corrigé", intent: "warning" },
      },
    ] satisfies readonly Item[],
  },

  reset: {
    title: "La remise à zéro du backlog",
    body: [
      "Les 33 tickets ouverts de la liste de travail ont été supprimés en une fois. Ils étaient dérivés de l'audit et de la reconstruction de la V1, tous deux désormais dépassés. Les six tickets terminés sont conservés : ce travail était réel et reste valable — l'exposition de contenu confidentiel a été fermée, le formulaire de contact envoie réellement, les protections de relecture de code sont actives.",
      "Chaque ticket supprimé reste récupérable dans l'historique du projet : rien n'est effacé, tout est daté. Le plan qui les remplace est la page « Plan V2 », et ses 27 tickets ne seront ouverts qu'une fois que vous l'aurez relu.",
    ],
  },

  facts: {
    title: "Quatre faits qui n'arrêtaient pas de se ré-inventer",
    lead: "À connaître avant de lire n'importe quel document antérieur au 18 août dans ce projet — ils sont maintenant écrits noir sur blanc dans le dépôt pour que la correction tienne.",
    items: [
      {
        title: "Il n'y a pas de pilote signé",
        body: "Les ~15 praticiens sont une cible de recrutement. Personne n'a signé quoi que ce soit.",
        tag: { label: "fait", intent: "neutral" },
      },
      {
        title: "Il n'y a ni date de facturation ni revenu",
        body: "Les « 24,50 € par praticien et par mois à partir du 1er septembre 2026 » étaient des données de démonstration lues comme un contrat.",
        tag: { label: "fait", intent: "neutral" },
      },
      {
        title: "La question de la base de données est close — Supabase",
        body: "Vos documents la nomment. Le débat interne entre Neon et Supabase est terminé.",
        tag: { label: "fait", intent: "neutral" },
      },
      {
        title: "La V2 n'est pas un portage de la V1",
        body: "Le journal alimentaire de sept jours, le questionnaire psychologique, le moteur de nutrigénomique et la génération de plans hebdomadaires rigides sont tous hors périmètre.",
        tag: { label: "fait", intent: "neutral" },
      },
    ] satisfies readonly Item[],
  },

  footer:
    "Sources : le rapport de direction du 18 août 2026 (partie deux), le braindump, et l'historique du dépôt — les tickets supprimés y restent consultables.",
} as const;
