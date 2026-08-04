import {
  CreditCard,
  Compass,
  ShieldCheck,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import type { Content } from "./types";

/**
 * Le dictionnaire français — le marché de lancement. Mêmes règles que la
 * version anglaise : REMI est pré-lancement, donc le centre d'aide décrit ce que
 * le produit se construit à faire, jamais une réponse qu'il ne peut pas encore
 * donner. Aucune promesse d'article déjà écrit, aucun classement qui n'a pas été
 * mesuré.
 */
export const fr: Content = {
  header: {
    label: "Aide",
    homeLabel: "accueil du centre d'aide",
    languageLabel: "Langue",
    product: { target: "product", path: "/", label: "Aller sur REMI" },
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
      { target: "product", path: "/", label: "Aller sur REMI" },
    ],
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
        "La recherche arrivera avec les premiers articles — d'ici là, les catégories ci-dessous sont tout le centre d'aide.",
    },

    categories: {
      eyebrow: "Parcourir",
      title: "Cinq endroits où chercher",
      lead: "Chacun s'écrit au fil du pilote. Les questions listées sont celles auxquelles les articles répondront.",
      items: [
        {
          slug: "getting-started",
          icon: Compass,
          title: "Premiers pas",
          body: "Ce qu'est REMI, à qui il s'adresse, et ce qui se passe pendant votre première semaine.",
          topics: [
            "Ce que REMI fait, et ce qu'il ne fait délibérément pas",
            "S'installer après l'invitation de votre praticien",
            "À quoi ressemble la première semaine",
          ],
        },
        {
          slug: "plan-and-meals",
          icon: UtensilsCrossed,
          title: "Votre plan et vos repas",
          body: "Comment les recommandations de votre praticien deviennent des repas, des habitudes et de petits pas au quotidien.",
          topics: [
            "D'où viennent vos suggestions de repas",
            "Remplacer un repas que vous ne pouvez ou ne voulez pas manger",
            "Allergies, intolérances et aliments à éviter",
          ],
        },
        {
          slug: "practitioners",
          icon: Stethoscope,
          title: "Pour les praticiens",
          body: "Gérer sa pratique dans REMI : recommandations, ce que vous voyez entre deux consultations, et là où votre jugement reste la référence.",
          topics: [
            "Transformer des notes de consultation en recommandations",
            "Ce que vous voyez entre deux consultations",
            "Inviter une personne que vous accompagnez",
          ],
        },
        {
          slug: "account-and-billing",
          icon: CreditCard,
          title: "Compte et facturation",
          body: "Se connecter, modifier ses informations, et comment la facturation fonctionnera quand il y aura quelque chose à facturer.",
          topics: [
            "Se connecter et récupérer l'accès",
            "Modifier son e-mail ou ses informations",
            "Fermer son compte, et ce qu'il advient de vos données",
          ],
        },
        {
          slug: "privacy-and-data",
          icon: ShieldCheck,
          title: "Confidentialité et données",
          body: "Ce que REMI conserve, qui peut le voir, et les droits que vous avez dessus.",
          topics: [
            "Ce que votre praticien voit — et ne voit pas",
            "Où vos données sont stockées, et pour combien de temps",
            "Exporter ou supprimer tout ce que REMI conserve",
          ],
        },
      ],
    },

    popular: {
      eyebrow: "Commencer ici",
      title: "Les questions qui reviennent en premier",
      note: "REMI est en phase pilote : c'est l'ordre dans lequel le centre d'aide s'écrit, pas un classement. Rien n'est mesuré ici, et cette page ne prétendra jamais le contraire.",
      items: [
        {
          slug: "what-remi-does",
          title: "Ce que REMI fait, et ce qu'il ne fait délibérément pas",
          category: "getting-started",
        },
        {
          slug: "what-your-practitioner-sees",
          title: "Ce que votre praticien voit — et ne voit pas",
          category: "privacy-and-data",
        },
        {
          slug: "swapping-a-meal",
          title:
            "Remplacer un repas que vous ne pouvez ou ne voulez pas manger",
          category: "plan-and-meals",
        },
        {
          slug: "invite-someone-you-support",
          title: "Inviter une personne que vous accompagnez",
          category: "practitioners",
        },
        {
          slug: "signing-in",
          title: "Se connecter et récupérer l'accès",
          category: "account-and-billing",
        },
      ],
    },

    cta: {
      title: "Toujours bloqué ?",
      body: "L'équipe est petite et lit tout. Dites-nous ce que vous cherchiez à faire : nous répondrons — et nous écrirons l'article qui vous aurait évité le message.",
      action: { target: "marketing", path: "/contact", label: "Nous écrire" },
    },
  },
};
