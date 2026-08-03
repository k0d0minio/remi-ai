import type { Content } from "./types";

export const fr: Content = {
  shell: {
    navLabel: "Principale",
    openNav: "Ouvrir la navigation",
    closeNav: "Fermer la navigation",
    skipToContent: "Aller au contenu",
  },
  roles: {
    practitioner: "Praticien",
    person: "Personne accompagnée",
    switchTo: "Changer de surface",
  },
  userMenu: {
    label: "Menu du compte",
    account: "Compte",
    language: "Langue",
    signOut: "Se déconnecter",
  },
  signIn: {
    eyebrow: "Pilote",
    headline: "Reprenez là où votre dernière consultation s'est arrêtée.",
    title: "Connexion",
    lead: "Saisissez vos identifiants pour continuer.",
    email: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    password: "Mot de passe",
    roleLegend: "Continuer en tant que",
    roleHint: "Détermine la surface sur laquelle vous arrivez.",
    submit: "Continuer",
    pilotNote: "Accès réservé au pilote — contactez votre praticien.",
  },
  practitionerNav: [
    { href: "/practice", icon: "practice", label: "Ma pratique" },
    { href: "/clients", icon: "clients", label: "Personnes accompagnées" },
    { href: "/frame", icon: "frame", label: "Cadre thérapeutique" },
  ],
  personNav: [
    { href: "/today", icon: "today", label: "Aujourd'hui" },
    { href: "/meals", icon: "meals", label: "Repas" },
    { href: "/steps", icon: "steps", label: "Étapes" },
    { href: "/plan", icon: "plan", label: "Mon plan" },
  ],
  clients: {
    title: "Personnes accompagnées",
    lead: "Les personnes que vous accompagnez, et où chacune en est entre deux consultations.",
    columns: {
      name: "Nom",
      status: "Statut",
      readiness: "Disposition",
      nextConsultation: "Prochaine consultation",
      lastActive: "Dernière activité",
    },
    status: {
      invited: "Invitée",
      active: "Active",
      paused: "En pause",
      ended: "Terminée",
    },
    readiness: {
      exploring: "En exploration",
      committed: "Engagée",
      struggling: "En difficulté",
    },
    never: "Jamais",
    empty: {
      title: "Aucune personne accompagnée",
      body: "Les personnes que vous invitez apparaîtront ici, avec ce qu'elles ont appliqué depuis leur dernière consultation.",
    },
  },
  today: {
    title: "Aujourd'hui",
    lead: "Une chose à la fois, à votre rythme.",
    currentStep: "Votre étape de la quinzaine",
    stepProgress: "Jours appliqués",
    noPlan: {
      title: "Pas encore de plan",
      body: "Votre praticien n'a pas encore publié de plan. Il apparaîtra ici après votre prochaine consultation.",
    },
  },
  plan: {
    title: "Mon plan",
    lead: "Ce que votre praticien a recommandé, en mots sur lesquels agir.",
    consultationOn: "consultation du",
    nextReview: "Revoir le",
    categories: {
      nutrition: "Nutrition",
      habit: "Habitude",
      supplement: "Complément",
      activity: "Activité",
      monitoring: "Suivi",
    },
    disclaimer: {
      title: "Votre praticien reste la référence",
      body: "REMI applique ces recommandations au quotidien. Il ne pose pas de diagnostic et ne remplace pas une consultation — tout ce qui est clinique appartient à votre praticien.",
    },
    empty: {
      title: "Pas encore de plan",
      body: "Votre praticien n'a pas encore publié de plan pour vous. Il apparaîtra ici dès qu'il l'aura fait.",
    },
  },
  meals: {
    title: "Repas",
    lead: "Des idées qui suivent votre plan, adaptées à vos goûts, votre temps et ce que vous avez en cuisine.",
    tabs: {
      week: "La semaine",
      shopping: "Liste de courses",
    },
    slots: {
      breakfast: "petit-déjeuner",
      lunch: "déjeuner",
      dinner: "dîner",
      snack: "collation",
    },
    minutes: "min",
    servings: "portions",
    because: "Parce que votre praticien a recommandé",
    details: "Ingrédients et préparation",
    shopping: {
      title: "Avant les courses",
      body: "Rangée comme le magasin, pas comme les recettes.",
    },
    empty: {
      title: "Pas encore de repas",
      body: "Les idées de repas apparaîtront ici une fois que votre praticien aura publié un plan.",
    },
  },
  steps: {
    title: "Vos étapes",
    lead: "Une seule à la fois. La suivante attend que celle-ci tienne.",
    held: "Étapes tenues",
    progressLabel: "Progression :",
    days: "jours",
    status: {
      upcoming: "À venir",
      current: "En cours",
      done: "Tenue",
      skipped: "Passée",
    },
    empty: {
      title: "Pas encore d'étapes",
      body: "Vos étapes apparaîtront ici une fois que votre praticien aura publié un plan.",
    },
  },
  placeholders: {
    practice: {
      title: "Ma pratique",
      body: "Qui a besoin d'attention avant sa prochaine consultation — progression, points de blocage et engagement en un coup d'œil.",
    },
    frame: {
      title: "Cadre thérapeutique",
      body: "Les préceptes dans lesquels REMI génère : ce qu'il faut privilégier, ce qui est exclu, et jusqu'où une suggestion peut aller.",
    },
  },
  prototypeNote: {
    title: "Fondations uniquement",
    body: "Voici la coque de l'application et sa couche de données. Les maquettes de ces écrans sont prototypées d'abord dans l'app demo.",
  },
};
