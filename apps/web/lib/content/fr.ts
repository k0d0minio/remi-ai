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
  placeholders: {
    practice: {
      title: "Ma pratique",
      body: "Qui a besoin d'attention avant sa prochaine consultation — progression, points de blocage et engagement en un coup d'œil.",
    },
    frame: {
      title: "Cadre thérapeutique",
      body: "Les préceptes dans lesquels REMI génère : ce qu'il faut privilégier, ce qui est exclu, et jusqu'où une suggestion peut aller.",
    },
    meals: {
      title: "Repas",
      body: "Des idées de repas et des recettes qui suivent votre plan, adaptées à vos goûts, votre quotidien et vos contraintes.",
    },
    steps: {
      title: "Étapes",
      body: "Vos petits pas dans l'ordre — celui en cours, ceux déjà tenus, et ce qui vient ensuite.",
    },
    plan: {
      title: "Mon plan",
      body: "Les recommandations de votre praticien, en mots sur lesquels agir. Il ou elle reste la référence.",
    },
  },
  prototypeNote: {
    title: "Fondations uniquement",
    body: "Voici la coque de l'application et sa couche de données. Les maquettes de ces écrans sont prototypées d'abord dans l'app demo.",
  },
};
