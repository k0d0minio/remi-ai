/**
 * The dossier's opening page, as data.
 *
 * Written from where the project stands today, never as a before-and-after:
 * the plan this dossier presents is the plan, and an earlier one Morgane never
 * saw is not context she can use. Everything here is a pointer — what REMI
 * does, the four answers, and an agenda for the call. Nothing is argued; the
 * four pages behind it do that.
 */

import { ClipboardList, Sparkles, Utensils } from "lucide-react";
import type { FlowNode } from "@/components/company/flow-diagram";
import type { Item, PageHeader } from "@/lib/dossier/shared";

export const synthese = {
  header: {
    eyebrow: "À lire avant l'appel",
    title: "Synthèse",
    lead: "Vos quatre questions répondues en une ligne chacune, le produit en un schéma, et un ordre du jour pour l'appel. Quatre pages derrière celle-ci ; celle-ci se lit en une minute.",
  } satisfies PageHeader,

  minute: {
    title: "En une minute",
    body: [
      "La V2 tient en six phases, A à F : décider, poser les fondations, la boucle patient, le dashboard praticien, le parser, puis l'argent et la bêta. Simplicité radicale d'abord, de la valeur en moins de 60 secondes, et le budget d'environ 10 000 € comme contrainte qui décide du périmètre.",
      "C'est une proposition, pas une décision : elle attend votre relecture. Deux choses ont une échéance et ne peuvent pas l'attendre — la candidature Startup Boost, qui clôture le 15 septembre, et le sort des données patients de la V1.",
    ],
  },

  loop: {
    title: "Ce que REMI fait, en un schéma",
    description:
      "Le dernier kilomètre entre le praticien et le quotidien du patient. Tout le produit sert cette boucle, et chaque phase du plan en construit un morceau.",
    nodes: [
      {
        title: "Le praticien",
        body: "Il consulte et rédige ses recommandations, comme il le fait déjà.",
        icon: ClipboardList,
        via: "PDF ou compte rendu, lu automatiquement",
      },
      {
        title: "REMI",
        body: "Le parser en tire des règles structurées, puis en fait des micro-actions faisables en quelques minutes — avec leur pourquoi.",
        icon: Sparkles,
        via: "une action à la fois, adaptée au repas prévu",
      },
      {
        title: "Le patient",
        body: "Il dit ce qu'il s'apprête à manger et reçoit une amélioration réaliste, tenant compte de ses goûts, son budget et son temps.",
        icon: Utensils,
      },
    ] satisfies readonly FlowNode[],
    returnLabel:
      "Ce qu'il fait réellement remonte au praticien : adhérence, difficultés, retours — qui ajuste ses règles sans attendre la consultation suivante.",
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
        body: "Quatre outils en service, Supabase à brancher, un fournisseur d'IA à choisir. Trois des outils que vous citez — DigitalOcean, Mistral, Euria — restent introuvables de mon côté, et les comptes de la V1 sont peut-être encore facturés chaque mois. Aucun chiffre inventé : la vision claire des coûts se construit avec les factures ou les accès.",
        tag: { label: "Outils", intent: "info" },
      },
      {
        title: "Sommes-nous sur la même longueur d'onde ?",
        body: "Oui. Le périmètre gelé de la V2 est celui de vos priorités — améliore mon assiette, hub du jour, « je mange autre chose », journal de compléments, micro-actions, dashboard praticien, parser — et rien d'autre n'y entre. Le seul point où je vous propose de trancher autrement que l'installation actuelle : six sites déployés, c'est lourd pour un budget de 10 000 €.",
        tag: { label: "Plan V2", intent: "info" },
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
        body: "L'ordre proposé vous convient-il, et le budget d'environ 10 000 € tient-il la comparaison avec ce périmètre ? C'est la conversation la plus structurante de l'appel.",
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
