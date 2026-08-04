import {
  CreditCard,
  Compass,
  ShieldCheck,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import { articles } from "./articles/fr";
import type { Content } from "./types";

/**
 * Le dictionnaire français — le marché de lancement. Mêmes règles que la
 * version anglaise : REMI est pré-lancement, donc le centre d'aide décrit ce que
 * le produit fait aujourd'hui et dit clairement là où une capacité n'existe pas
 * encore. Aucun classement qui n'a pas été mesuré, aucun article qui décrit un
 * écran inexistant.
 */
export const fr: Content = {
  header: {
    label: "Aide",
    homeLabel: "accueil du centre d'aide",
    languageLabel: "Langue",
    product: { target: "web", path: "/", label: "Aller sur REMI" },
  },

  footer: {
    tagline:
      "Le centre d'aide de REMI — comment le produit fonctionne, ce qu'il fait de vos données, et à qui écrire quand la réponse n'y est pas.",
    disclaimer:
      "REMI aide à appliquer les recommandations d'un praticien. Il ne diagnostique pas, ne traite pas et ne remplace pas un suivi professionnel — tout ce qui est clinique relève de votre praticien.",
    navLabel: "Pied de page",
    links: [
      { target: "marketing", path: "/", label: "Site principal" },
      { target: "marketing", path: "/practitioners", label: "Praticiens" },
      { target: "marketing", path: "/contact", label: "Contact" },
      { target: "web", path: "/", label: "Aller sur REMI" },
    ],
    status: "État des services",
  },

  home: {
    meta: {
      title: "Centre d'aide",
      description:
        "Les réponses sur REMI : premiers pas, votre plan et vos repas, ce que voit votre praticien, votre compte, et le traitement de vos données.",
    },

    hero: {
      eyebrow: "Centre d'aide",
      title: "Comment pouvons-nous vous aider ?",
      subtitle:
        "Commencez par une catégorie, ou lisez les questions qui reviennent en premier. Si la réponse n'y est pas, une personne lira votre message.",
      searchLabel: "Rechercher dans le centre d'aide",
      searchPlaceholder: "Comment pouvons-nous vous aider ?",
      searchNote:
        "La recherche n'est pas encore branchée — un champ qui avale ce que vous tapez est pire que pas de champ. Chaque article est à un clic dans les catégories ci-dessous.",
    },

    categories: {
      eyebrow: "Parcourir",
      title: "Cinq endroits où chercher",
      lead: "Chacun contient les réponses aux questions qu'on lui pose vraiment. Chaque article dit ce que REMI fait aujourd'hui, et où il s'arrête.",
      countLabel: { one: "article", many: "articles" },
    },

    popular: {
      eyebrow: "Commencer ici",
      title: "Les questions qui reviennent en premier",
      note: "REMI est en phase pilote : c'est l'ordre dans lequel le centre d'aide a été écrit, pas un classement. Rien n'est mesuré ici, et cette page ne prétendra jamais le contraire.",
      slugs: [
        "what-remi-does",
        "what-your-practitioner-sees",
        "how-your-plan-reaches-you",
        "joining-the-pilot",
        "logging-meals",
      ],
    },

    cta: {
      title: "Toujours bloqué ?",
      body: "L'équipe est petite et lit tout. Dites-nous ce que vous cherchiez à faire : nous répondrons — et nous écrirons l'article qui vous aurait évité le message.",
      action: { target: "marketing", path: "/contact", label: "Nous écrire" },
    },
  },

  categories: [
    {
      slug: "getting-started",
      icon: Compass,
      title: "Premiers pas",
      body: "Ce qu'est REMI, à qui il s'adresse, et comment on y entre pendant le pilote.",
    },
    {
      slug: "plan-and-meals",
      icon: UtensilsCrossed,
      title: "Votre plan et vos repas",
      body: "Comment les recommandations de votre praticien deviennent des repas, des pas et un plan sur lequel agir.",
    },
    {
      slug: "practitioners",
      icon: Stethoscope,
      title: "Pour les praticiens",
      body: "Gérer sa pratique dans REMI : le cadre thérapeutique, ce que vous voyez entre deux consultations, et l'invitation des personnes que vous accompagnez.",
    },
    {
      slug: "account-and-billing",
      icon: CreditCard,
      title: "Compte et facturation",
      body: "Se connecter, changer de langue, et ce que veut dire la facturation tant que REMI est en pilote.",
    },
    {
      slug: "privacy-and-data",
      icon: ShieldCheck,
      title: "Confidentialité et données",
      body: "Ce que REMI conserve, qui peut le voir, et les droits que vous avez dessus.",
    },
  ],

  articles,

  category: {
    eyebrow: "Centre d'aide",
    backLabel: "Toutes les catégories",
    countLabel: { one: "article", many: "articles" },
    missing: {
      title: "Ce n'est pas la réponse qu'il vous fallait ?",
      body: "Cette catégorie s'écrit à partir des questions qu'on nous pose réellement. Si la vôtre n'y est pas, c'est un manque qu'il vaut mieux connaître — dites-le-nous et l'article s'écrit.",
      action: { target: "marketing", path: "/contact", label: "Nous demander" },
    },
  },

  article: {
    backLabel: "Retour à",
    updatedLabel: "Vérifié contre le produit le",
    minutesLabel: "min de lecture",
    tocLabel: "Sur cette page",
    prevLabel: "Précédent",
    nextLabel: "Suivant",
    relatedLabel: "À lire ensuite",
    helpful: {
      question: "Cette réponse vous a-t-elle aidé ?",
      yes: "Oui",
      no: "Non",
      note: "Ces deux boutons n'enregistrent rien — il n'y a pas encore de circuit derrière eux, et un bouton qui jette discrètement votre réponse est pire que pas de bouton. En attendant, dites-le-nous en une phrase : cela arrive chez une personne.",
      action: {
        target: "marketing",
        path: "/contact",
        label: "Nous le dire plutôt",
      },
    },
  },

  status: {
    meta: {
      title: "État des services",
      description:
        "L'état de chaque surface REMI — le produit, le site principal, ce centre d'aide, le site de référence, la console d'exploitation et le bac à sable de prototypage.",
    },
    eyebrow: "État",
    title: "État des services",
    lead: "REMI, ce sont six surfaces. Cette page les couvre toutes, y compris les deux que seule l'équipe utilise — une page d'état qui cache la moitié du système est une page d'état à laquelle personne ne se fie.",
    notice: {
      title: "Aucune supervision n'est encore branchée",
      body: "REMI est en pré-lancement et rien ici n'est mesuré : les quatre-vingt-dix jours ci-dessous sont des données de démonstration, gardées pour que cette page soit prête le jour où de vraies vérifications tourneront. Voyez-y la forme de la réponse, pas la réponse. Quand un incident sera réel, il sera écrit ici en toutes lettres, pas seulement en barres.",
    },
    overall: "Toutes les surfaces sont opérationnelles",
    operational: "Opérationnel",
    services: {
      web: {
        name: "Le produit",
        description:
          "La partie connectée : votre plan, vos repas et vos pas, et la console du praticien.",
      },
      marketing: {
        name: "Site principal",
        description:
          "Le site public — ce qu'est REMI, à qui il s'adresse, et comment fonctionne le pilote.",
      },
      support: {
        name: "Centre d'aide",
        description: "Ce site.",
      },
      docs: {
        name: "Site de référence",
        description:
          "Comment REMI est construit, pour celles et ceux qui le construisent et le font tourner.",
      },
      admin: {
        name: "Console d'exploitation",
        description:
          "Usage interne uniquement. L'équipe s'en sert pour piloter le pilote ; aucun visiteur n'y accède.",
      },
      demo: {
        name: "Bac à sable de prototypage",
        description:
          "Là où un écran est essayé avant d'être construit. Données fictives uniquement, par construction.",
      },
    },
    uptimeLabel: "sur les 90 derniers jours",
    rangeStart: "Il y a 90 jours",
    rangeEnd: "Aujourd'hui",
    historyLabel: "historique sur 90 jours",
    legend: {
      up: "Opérationnel",
      degraded: "Dégradé",
      down: "Interruption",
    },
  },
};
