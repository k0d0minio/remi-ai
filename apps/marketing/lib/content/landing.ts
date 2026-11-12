import type { OfferInterest } from "@remi/services/shared";
import { SITE } from "@/lib/site";

/**
 * Morgane's copy for the landing page, as she wrote it on 2 November 2026.
 * The components read it and never hold a sentence of their own. A change of
 * wording is a change here, not in a component.
 */

export type OfferId = Exclude<OfferInterest, "undecided">;

export type Offer = {
  id: OfferId;
  name: string;
  hook: string;
  /** The pilot price in euros: one payment for 8 weeks, not a subscription. */
  price: number;
  /** The commercial price in euros, after the pilot. Shown beside the pilot price, never struck through. */
  commercialPrice: number;
  includes: string[];
  highlight?: string;
  footnote?: string;
  learnMore?: { label: string; href: string };
};

export type FaqItem = { q: string; a: string };

export const META = {
  title: "REMI — Devenez patient pilote | Nutrition personnalisée",
  description:
    "REMI transforme des recommandations nutritionnelles personnalisées en actions concrètes au quotidien. Rejoignez les premiers patients pilotes à partir du 15 décembre 2026 — places limitées.",
  ogTitle: "REMI — Devenez patient pilote",
  ogDescription:
    "Des recettes personnalisées, un coup de pouce pour améliorer vos repas, 8 semaines d’accompagnement. Tarif de lancement, places limitées.",
};

export const NAV = [
  { href: "#offres", label: "Offres" },
  { href: "#fonctionnement", label: "Fonctionnement" },
  { href: "#equipe", label: "Équipe" },
  { href: "#calendrier", label: "Calendrier" },
  { href: "#praticiens", label: "Praticiens" },
];

export const HEADER = {
  logoLabel: "REMI — retour en haut",
  cta: "Je deviens patient pilote",
  menuLabel: "Menu",
};

export const HERO = {
  badge: "Programme pilote · places limitées",
  titleFirst: "Une alimentation qui vous ressemble.",
  titleSecond: "Des conseils faciles à appliquer.",
  lead: "REMI vous propose chaque jour des recettes adaptées à vos besoins et vous aide à améliorer vos repas, un petit changement à la fois.",
  pilotBefore: "Rejoignez nos premiers patients pilotes dès le ",
  pilotAfter: `. Profitez de ${SITE.pilotDurationWeeks} semaines avec REMI à tarif préférentiel et participez à son développement.`,
  primary: "Je deviens patient pilote",
  secondary: "Découvrir les offres",
};

export const OFFERS_SECTION = {
  title: "Choisissez l’accompagnement qui vous correspond.",
  lead: "Deux formules de 8 semaines, à prix unique. Dans les deux, REMI fonctionne de la même façon : seul le point de départ change.",
  note: "Aucun paiement à ce stade : l’inscription est une simple manifestation d’intérêt.",
  priceUnit: `prix pilote · ${SITE.pilotDurationWeeks} semaines`,
  commercialPriceLabel: "Prix commercial :",
  pilotPriceNote: "Tarif réservé aux 30 premiers participants pilotes",
  cta: "Je suis intéressé(e)",
};

export const OFFERS: Offer[] = [
  {
    id: "genetic",
    name: "REMI + analyse génétique",
    hook: "Un test ADN ciblé, un médecin spécialisé et REMI pour adapter votre alimentation à votre profil.",
    price: 349,
    commercialPrice: 399,
    includes: [
      "Test ADN ciblé",
      "Consultation d’une heure avec un médecin spécialisé",
      "Interprétation et recommandations nutritionnelles personnalisées",
      "8 semaines d’utilisation de REMI",
    ],
    highlight:
      "Résultats durables : les variantes analysées ne changent pas au cours de la vie.",
    footnote: "Analyse ciblée, pas un séquençage complet de l’ADN.",
    learnMore: { label: "Comprendre l’analyse génétique", href: "#genetique" },
  },
  {
    id: "consultation",
    name: "REMI + consultation nutritionnelle",
    hook: "Faites le point sur vos habitudes et avancez avec un accompagnement adapté à vos objectifs.",
    price: 119,
    commercialPrice: 149,
    includes: [
      "Consultation d’une heure avec Morgane",
      "3 objectifs nutritionnels personnalisés",
      "Consultation de suivi à mi-parcours",
      "8 semaines d’utilisation de REMI",
    ],
  },
];

export const offerById = (id: OfferId): Offer =>
  OFFERS.find((offer) => offer.id === id) ?? OFFERS[0];

/**
 * The genetic offer, explained. Morgane's decision: the author of the source
 * book is not named on the page. The nuances of the source stay: an approach
 * and a clinical experience, not all shown by studies. No ideal share of
 * carbohydrates and fats, no prevention or treatment of a disease.
 */
export const GENETIC = {
  anchor: "genetique",
  eyebrow: "Comprendre l’analyse génétique",
  title: "Et si votre ADN vous aidait à personnaliser votre alimentation ?",
  intro:
    "Nous sommes tous différents, jusque dans nos gènes. Certaines variations génétiques peuvent influencer la manière dont notre organisme métabolise les graisses ou digère certains aliments. Grâce à un test ADN ciblé, à l’accompagnement d’un médecin spécialisé et à REMI, découvrez comment utiliser ces informations pour adapter votre alimentation au quotidien.",
  genotype: {
    title: "Un génotype, c’est quoi ?",
    text: "C’est votre version personnelle de certains gènes, héritée de vos parents. Quelques-unes de ces variations sont étudiées en nutrition, car elles peuvent influencer la façon dont le corps traite les graisses ou l’amidon.",
  },
  axesTitle: "Trois axes explorés",
  axes: [
    {
      id: "apoe",
      icon: "drop",
      gene: "APOE",
      topic: "Les graisses",
      text: "Ce gène intervient dans le transport des graisses dans l’organisme. Sa version est le point de départ pour orienter la place des graisses et des glucides dans votre assiette.",
    },
    {
      id: "amy1a",
      icon: "grain",
      gene: "AMY1A",
      topic: "L’amidon",
      text: "Il influence la quantité d’amylase dans la salive, qui commence à digérer l’amidon (pain, pâtes, riz, pommes de terre).",
    },
    {
      id: "dio2",
      icon: "thyroid",
      gene: "DIO2",
      topic: "La thyroïde",
      text: "Il intervient dans la conversion d’une hormone thyroïdienne en sa forme active. Dans cette approche avant-gardiste, il peut nuancer la place des glucides, toujours avec le contexte clinique.",
    },
  ] as const,
  approach:
    "Cette approche avant-gardiste et innovante associe ces informations au contexte clinique pour orienter certaines recommandations alimentaires, notamment l’équilibre entre graisses et glucides.",
  stepsTitle: "Du test à votre assiette",
  steps: [
    {
      title: "Un test ADN ciblé",
      text: "Quelques variantes, pas tout votre ADN.",
    },
    {
      title: "Une consultation d’une heure",
      text: "Un médecin spécialisé interprète vos résultats et définit vos recommandations.",
    },
    {
      title: "REMI au quotidien",
      text: "Des recettes adaptées chaque jour et des repas améliorés pas à pas.",
    },
  ],
  durable: {
    title: "Une information qui dure",
    text: "Les variantes analysées ne changent pas au cours de la vie : le test n’a pas besoin d’être répété. Vos recommandations, elles, pourront évoluer avec votre santé, votre âge et votre mode de vie.",
  },
  value: {
    titleBefore: "Pourquoi ",
    titleAfter: " ?",
    text: "Ce package réunit en un seul parcours un test ADN ciblé, une consultation d’une heure avec un médecin spécialisé, l’interprétation avec des recommandations personnalisées, et 8 semaines pour les appliquer avec REMI.",
    cta: "Je suis intéressé(e) · ",
  },
  caution:
    "Une approche avant-gardiste, pas une certitude : ces orientations s’appuient sur une approche innovante de la nutrition et sur le contexte clinique. Toutes ne sont pas démontrées par des études cliniques. Le test ne permet ni de prévenir ni de traiter une maladie, et il s’agit d’une analyse ciblée, pas d’un séquençage complet de l’ADN. Le contenu exact du test est confirmé avec le laboratoire.",
  faqTitle: "Pourquoi faire un test génétique ?",
  faq: [
    {
      q: "À quoi sert ce test dans mon alimentation ?",
      a: "À partir de votre profil plutôt que d’un conseil standard. Certaines variations peuvent influencer la façon dont votre organisme traite les graisses ou l’amidon, et aider à orienter certaines recommandations.",
    },
    {
      q: "Dois-je refaire le test plus tard ?",
      a: "Non : les variantes analysées ne changent pas au cours de la vie, le test n’a pas besoin d’être répété. Vos recommandations, elles, pourront être ajustées au fil du temps.",
    },
    {
      q: "Est-ce un séquençage complet de mon ADN ?",
      a: "Non. C’est une analyse ciblée de quelques variantes en lien avec la nutrition.",
    },
    {
      q: "Le test peut-il me dire exactement quoi manger ?",
      a: "Non. Il aide à orienter certaines recommandations, toujours avec le contexte clinique. Il ne détermine pas avec certitude vos proportions idéales de glucides et de lipides.",
    },
  ] satisfies FaqItem[],
};

export const FEATURES_SECTION = {
  title: "REMI vous accompagne au quotidien.",
  note: "Aperçus illustratifs. REMI n’est pas un outil médical et ne remplace pas un professionnel de santé.",
};

export const FEATURES = [
  {
    id: "recipes",
    title: "Vos recettes, chaque jour",
    text: "Petit-déjeuner, déjeuner, dîner et collation si nécessaire : des recettes adaptées à votre profil, vos besoins et vos objectifs.",
  },
  {
    id: "improve",
    title: "Améliorez vos repas, sans changer vos habitudes",
    text: "Vous avez prévu des pâtes, une pizza ou un sandwich ? Dites à REMI ce que vous allez manger. Il vous propose de petits ajustements concrets, adaptés à votre profil nutritionnel, et vous explique leurs bienfaits.",
  },
] as const;

/** The content of the previews. Fictional, until real screenshots exist. */
export const MOCK = {
  mealsLabel: "Exemple de repas du jour",
  meals: [
    {
      slot: "Petit-déjeuner",
      name: "Pancakes à l’avoine, yaourt et fruits rouges",
    },
    {
      slot: "Déjeuner",
      name: "Poulet rôti au citron, patates douces et brocoli",
    },
    { slot: "Dîner", name: "Curry doux de pois chiches et épinards" },
    { slot: "Collation", name: "Houmous et bâtonnets de légumes croquants" },
  ],
  /**
   * The interactive preview (Morgane, 4 November 2026): a visitor picks a meal,
   * it shows as a message to REMI, three concrete suggestions follow. The
   * explanations of the pizza and the sandwich are ours, in the shape of hers.
   */
  improve: {
    label: "Exemple d’amélioration d’un repas",
    pickLabel: "Choisissez un repas",
    meals: [
      {
        id: "pasta",
        name: "Pâtes à la crème",
        emoji: "🍝",
        message: "Ce soir, je prépare des pâtes à la crème 🍝",
        suggestions: [
          {
            action: "Ajoutez du poulet ou des pois chiches.",
            why: "Pour apporter des protéines et favoriser la satiété.",
          },
          {
            action: "Ajoutez des brocolis ou des courgettes.",
            why: "Pour enrichir votre repas en fibres, vitamines et minéraux.",
          },
          {
            action:
              "Remplacez une partie de la crème par une alternative végétale adaptée.",
            why: "Pour ajuster l’apport en graisses saturées selon votre profil.",
          },
        ],
      },
      {
        id: "pizza",
        name: "Pizza",
        emoji: "🍕",
        message: "Ce soir, c’est pizza 🍕",
        suggestions: [
          {
            action: "Ajoutez des légumes : champignons, poivrons ou roquette.",
            why: "Pour enrichir votre repas en fibres, vitamines et minéraux.",
          },
          {
            action: "Accompagnez-la d’une salade.",
            why: "Pour augmenter les fibres et favoriser la satiété.",
          },
          {
            action: "Adaptez la garniture et la quantité de fromage.",
            why: "Pour ajuster l’apport en graisses selon vos besoins.",
          },
        ],
      },
      {
        id: "sandwich",
        name: "Sandwich",
        emoji: "🥪",
        message: "À midi, je prends un sandwich 🥪",
        suggestions: [
          {
            action: "Choisissez un pain complet, si votre profil le permet.",
            why: "Pour plus de fibres et une énergie plus stable.",
          },
          {
            action: "Ajoutez des crudités : roquette, concombre, tomates.",
            why: "Pour enrichir votre repas en fibres, vitamines et minéraux.",
          },
          {
            action:
              "Ajoutez une source de protéines adaptée : poulet, houmous ou tofu.",
            why: "Pour apporter des protéines et favoriser la satiété.",
          },
        ],
      },
    ],
    personal:
      "Avec REMI, chaque suggestion tient compte de votre profil, de vos objectifs et de vos besoins nutritionnels.",
    message:
      "Mangez ce que vous aimez. REMI vous aide à faire les bons ajustements.",
  },
};

export const SIGNUP = {
  title: "Rejoignez les premiers patients pilotes.",
  lead: `Début du pilote le ${SITE.pilotStartLabel}, places limitées. L’inscription n’engage à rien et ne demande aucun paiement.`,
  ticks: [
    "Tarif préférentiel réservé aux pilotes",
    `${SITE.pilotDurationWeeks} semaines avec REMI`,
    "Vous participez à son développement",
  ],
  callBefore: "Une question ? Appelez-nous au ",
  callAfter: ".",
};

/** The conversational sign-up: path A (patient pilot), path B (a question). */
export const FLOW = {
  progressLabel: (step: number, total: number) => `Étape ${step} sur ${total}`,
  intro: {
    title: "REMI vous intéresse ?",
    sub: "Une minute suffit.",
    pilot: "Je veux devenir patient pilote",
    pilotSub: `Démarrage le ${SITE.pilotStartLabel}`,
    info: "J’aimerais en savoir plus",
    infoSub: "Questions fréquentes ou votre propre question",
  },
  offer: {
    title: "Quelle formule vous intéresse ?",
    sub: "Rien n’est définitif à ce stade.",
    unit: `· ${SITE.pilotDurationWeeks} semaines`,
    undecided: "Je ne sais pas encore",
    undecidedSub: "Nous vous aiderons à choisir",
  },
  contact: {
    title: "Comment pouvons-nous vous recontacter ?",
    formulaUndecided: "Formule : à décider ensemble.",
    formulaBefore: "Formule : ",
    formulaAfter: ".",
    change: "Modifier",
    firstName: "Prénom",
    email: "Adresse e-mail",
    phone: "Numéro de téléphone",
    hint: "Merci de ne pas indiquer de donnée de santé ou génétique.",
    submit: "Rejoindre les patients pilotes",
  },
  done: {
    title: "Merci pour votre intérêt !",
    text: "Nous vous recontacterons prochainement avec les prochaines étapes pour rejoindre les patients pilotes REMI.",
    hint: "Aucun paiement n’est demandé à ce stade.",
  },
  info: {
    title: "Vos questions, nos réponses",
    sub: "Une autre question ? Laissez-nous votre e-mail.",
    email: "Adresse e-mail",
    message: "Votre question",
    submit: "Envoyer",
  },
  infoDone: {
    title: "Bien reçu, merci !",
    text: "Nous revenons vers vous rapidement. Vous pouvez aussi rejoindre les patients pilotes.",
    cta: "Je veux devenir patient pilote",
  },
  back: "Retour",
  sending: "Envoi…",
  optional: "(facultatif)",
  honeypot: "Ne pas remplir",
};

export const FAQ: FaqItem[] = [
  {
    q: "Qu’est-ce que REMI ?",
    a: "Une application qui aide à appliquer au quotidien des recommandations nutritionnelles personnalisées : recettes adaptées et conseils concrets pour améliorer vos repas.",
  },
  {
    q: "Dois-je payer maintenant ?",
    a: "Non. L’inscription est une simple manifestation d’intérêt. Nous vous recontactons avec les prochaines étapes.",
  },
  {
    q: "Que se passe-t-il pendant les 8 semaines ?",
    a: "Vous utilisez REMI au quotidien et partagez vos retours pour nous aider à l’améliorer. En échange, vous bénéficiez d’un tarif préférentiel.",
  },
  {
    q: "Quelle différence entre les deux formules ?",
    a: "REMI fonctionne de la même façon dans les deux. Seul le point de départ change : une analyse génétique avec un médecin spécialisé, ou une consultation avec Morgane, nutrithérapeute et naturopathe.",
  },
  {
    q: "Que contient le test génétique ?",
    a: "Une analyse ciblée de quelques variantes en lien avec la nutrition, pas un séquençage complet de l’ADN. Le contenu exact est confirmé avec le laboratoire avant votre décision.",
  },
  {
    q: "REMI est-il un outil médical ?",
    a: "Non. REMI ne pose pas de diagnostic et ne remplace pas un professionnel de santé.",
  },
  {
    q: "Que faites-vous de mes données ?",
    a: "Nous ne demandons que votre prénom, votre e-mail et, si vous le souhaitez, votre téléphone. Aucune donnée de santé ni génétique n’est collectée ici. Détails dans la politique de confidentialité.",
  },
];

export const TEAM_INTRO = {
  title: "L’équipe derrière REMI",
  text: "Nutrition, entrepreneuriat et technologie : une équipe complémentaire pour rendre la nutrition personnalisée accessible au quotidien.",
  portraitLabel: (name: string) => `Portrait de ${name}`,
};

export const TEAM = [
  {
    id: "morgane",
    name: "Morgane Paquet",
    role: "Cofondatrice · Vision produit et nutrition",
    bio: "Nutrithérapeute et naturopathe. Elle définit l’approche nutritionnelle de REMI et reçoit les patients en consultation.",
    photo: "/team/morgane-paquet.jpg",
  },
  {
    id: "arnaud",
    name: "Arnaud Ruelle",
    role: "Cofondateur · Stratégie et développement",
    bio: "Il contribue à la stratégie et au développement de REMI.",
    photo: "/team/arnaud-ruelle.jpg",
  },
  {
    id: "jamie",
    name: "Jamie Nisbet",
    role: "CTO",
    bio: "Il conçoit et développe l’application REMI.",
    photo: "/team/jamie-nisbet.jpg",
  },
];

export const TIMELINE_SECTION = {
  title: "Une feuille de route construite avec les utilisateurs.",
  note: "Calendrier indicatif, susceptible d’évoluer selon les résultats des pilotes.",
};

/** Dates from the product roadmap, the milestones and the OKR. */
export const TIMELINE = [
  {
    id: "patients",
    when: "Décembre 2026",
    title: "Patients pilotes",
    text: "Les premiers participants utilisent REMI pendant 8 semaines.",
    current: true,
  },
  {
    id: "recruitment",
    when: "Mars 2027",
    title: "Recrutement des praticiens pilotes",
    text: "Événement de présentation et ouverture du programme.",
  },
  {
    id: "co-build",
    when: "Printemps 2027",
    title: "Co-développement",
    text: "Nous construisons la solution avec les praticiens.",
  },
  {
    id: "launch",
    when: "Fin 2027",
    title: "Déploiement commercial",
    text: "Objectif, selon les résultats des pilotes.",
  },
];

export const PRACTITIONERS = {
  eyebrow: "Pour les praticiens",
  title:
    "Vous accompagnez vos patients. Et si REMI vous aidait à aller plus loin ?",
  lead: "Nous développons REMI avec des professionnels de santé pour simplifier la rédaction de leurs recommandations, faciliter le suivi entre les consultations et aider leurs patients à passer à l’action.",
  sub: "Rejoignez notre liste d’attente pour participer au programme praticiens pilotes dès 2027.",
  cta: "Je rejoins la liste d’attente praticiens",
  dialog: {
    title: "Liste d’attente praticiens pilotes",
    sub: "Quelques informations pour vous recontacter.",
    firstName: "Prénom",
    lastName: "Nom",
    profession: "Profession / spécialité",
    professionPlaceholder: "ex. nutrithérapeute, naturopathe, diététicien(ne)…",
    email: "Adresse e-mail",
    phone: "Téléphone",
    message: "Ce qui vous intéresse le plus",
    submit: "Rejoindre la liste d’attente",
    close: "Fermer",
    doneTitle: "Merci, vous êtes sur la liste !",
    doneText:
      "Nous reviendrons vers vous pour le programme praticiens pilotes.",
  },
};

export const FOOTER = {
  tagline:
    "Des recommandations nutritionnelles personnalisées, faciles à appliquer au quotidien.",
  contactTitle: "Contact",
  infoTitle: "Informations",
  infoLabel: "Informations légales",
  copyright: (year: number) =>
    `© ${year} REMI AI. REMI n’est pas un dispositif médical et ne remplace pas l’avis d’un professionnel de santé.`,
};

export const LEGAL_NAV = [
  { slug: "mentions-legales", label: "Mentions légales" },
  { slug: "cgu", label: "Conditions générales d’utilisation" },
  { slug: "cgv", label: "Conditions générales de vente" },
  { slug: "confidentialite", label: "Politique de confidentialité" },
] as const;

export const STICKY = {
  label: "Patient pilote",
  dismiss: "Masquer ce bouton",
};

export const CONSENT = {
  text: "J’accepte que REMI utilise mes coordonnées pour me recontacter au sujet du programme pilote. Je peux retirer mon consentement à tout moment.",
  link: "Politique de confidentialité",
};

export const MESSAGES = {
  required: "Ce champ est requis.",
  email: "Veuillez saisir une adresse e-mail valide.",
  phone: "Veuillez saisir un numéro valide (ou laissez vide).",
  consent:
    "Votre accord est nécessaire pour que nous puissions vous recontacter.",
  network:
    "Connexion impossible pour le moment. Vérifiez votre connexion et réessayez.",
  server: `L’inscription est momentanément indisponible. Vous pouvez nous écrire à ${SITE.contactEmail}.`,
};

export const UNDER_CONSTRUCTION = {
  meta: {
    title: "Bientôt",
    description: "REMI arrive. Le site ouvre bientôt.",
  },
  eyebrow: "Bientôt",
  title: "REMI arrive.",
  lead: "Des recommandations nutritionnelles personnalisées, faciles à appliquer au quotidien. Le site ouvre bientôt.",
  contactLead: "Une question en attendant ?",
};

export const LEGAL_PAGE = {
  back: "Retour au site",
  updated: "Dernière mise à jour : ",
};
