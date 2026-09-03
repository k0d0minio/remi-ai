import type { Content } from "./types";

export const fr: Content = {
  meta: {
    title: "Le copilote bien-être entre deux consultations",
    description:
      "Les recommandations de votre praticien, appliquées au quotidien — repas, habitudes et petits pas.",
  },
  shell: {
    navLabel: "Principale",
    openNav: "Ouvrir la navigation",
    closeNav: "Fermer la navigation",
    skipToContent: "Aller au contenu",
  },
  roles: {
    practitioner: "Praticien",
    patient: "Patient",
    switchTo: "Changer de surface",
  },
  userMenu: {
    label: "Menu du compte",
    account: "Compte",
    language: "Langue",
    appearance: "Apparence",
    themes: { system: "Selon le système", light: "Clair", dark: "Sombre" },
    help: "Aide",
    supportCentre: "Centre d'aide",
    documentation: "Documentation",
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
    aboutLink: "À propos de REMI",
    helpLink: "Obtenir de l'aide",
  },
  practitionerNav: [
    { href: "/practice", icon: "practice", label: "Ma pratique" },
    { href: "/clients", icon: "clients", label: "Personnes accompagnées" },
    { href: "/frame", icon: "frame", label: "Cadre thérapeutique" },
  ],
  patientNav: [
    { href: "/today", icon: "today", label: "Aujourd'hui" },
    { href: "/steps", icon: "steps", label: "Étapes" },
    { href: "/plan", icon: "plan", label: "Mon plan" },
  ],
  practice: {
    title: "Ma pratique",
    lead: "Ce qui s'est passé depuis vos dernières consultations.",
    stats: {
      attention: "À regarder avant la consultation",
      active: "Accompagnements actifs",
      adherence: "Assiduité moyenne",
    },
    attention: {
      title: "Ce qui demande votre attention",
      allClients: "Toutes les personnes",
      open: "Ouvrir la fiche",
      empty: {
        title: "Rien ne bloque",
        body: "Chaque personne que vous accompagnez a appliqué quelque chose depuis sa dernière consultation.",
      },
    },
    signals: {
      title: "Depuis la dernière fois",
      kinds: {
        adherence: "Assiduité",
        difficulty: "Difficulté",
        engagement: "Engagement",
        win: "Réussite",
      },
      empty: {
        title: "Rien pour l'instant",
        body: "Ce que les personnes accompagnées appliquent entre deux consultations apparaîtra ici.",
      },
    },
  },
  clients: {
    title: "Personnes accompagnées",
    lead: "Les personnes que vous accompagnez, et où chacune en est entre deux consultations.",
    open: "Ouvrir",
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
  clientDetail: {
    back: "Personnes accompagnées",
    lead: "Accompagnée depuis le {since} · prochaine consultation le {next}",
    preparePlan: "Préparer le plan",
    attention: "Point de blocage",
    dimensions: {
      title: "Personnalisation à 360°",
      lead: "Ce à quoi le plan est adapté. Le deuxième axe vient de votre cadre, pas d'elle.",
      labels: {
        genotype: "Génotype",
        preceptes: "Vos préceptes",
        psychology: "Profil psychologique",
        habits: "Habitudes alimentaires",
        rhythm: "Rythme de vie",
      },
      sources: {
        genotype: "Rapport génétique",
        frame: "Cadre thérapeutique · {practitioner}",
        questionnaire: "Questionnaire d'entrée et consultations",
        declared: "Déclaré par {name}",
      },
      points: {
        readiness: "Disposition :",
        motivators: "Motivée par :",
        barriers: "Freinée par :",
        dislikes: "N'aime pas :",
        allergies: "Allergies :",
        cooksFor: "Cuisine pour :",
        cooking: "Cuisine en semaine :",
        mealsOut: "Repas dehors par semaine :",
        shoppingDay: "Jour de courses :",
      },
      none: "Rien de renseigné",
      minutes: "min",
    },
    progress: {
      title: "Où elle en est",
      stepOf: "Étape {order} sur {total}",
      label: "Jours appliqués",
      days: "jours",
      empty: {
        title: "Aucune étape en cours",
        body: "Publiez un plan et l'étape en cours apparaîtra ici.",
      },
    },
    signals: {
      title: "Signaux depuis la dernière consultation",
      empty: {
        title: "Rien depuis la dernière fois",
        body: "Ce qu'elle applique, et ce qui lui coûte, apparaîtra ici.",
      },
    },
  },
  planComposer: {
    title: "Des notes au plan",
    lead: "Consultation du {date} · {name}",
    notes: {
      title: "Vos notes",
      lead: "Telles que vous les avez écrites. REMI ne les modifie jamais.",
    },
    structured: {
      title: "Structuré par REMI",
      lead: "Décochez ce qui ne correspond pas. Rien de décoché n'atteint {name}.",
      count: "{confirmed} sur {total} confirmées",
      publish: "Publier le plan",
    },
    dialog: {
      title: "Publier le plan de {name} ?",
      body: "{count} recommandations deviendront des étapes dans son espace. Le plan précédent sera remplacé.",
      cancel: "Annuler",
      confirm: "Publier",
    },
    published: {
      title: "Plan publié",
      body: "{name} verra {count} recommandations dans son espace, traduites en étapes.",
    },
    empty: {
      title: "Pas encore de consultation",
      body: "Un plan se compose à partir des notes d'une consultation. Celle-ci n'a pas encore eu lieu.",
    },
  },
  frame: {
    title: "Cadre thérapeutique",
    effects: {
      title: "Vous posez le cadre, REMI travaille dedans",
      points: [
        "Aucune recette proposée ne contient un aliment exclu, pour aucune personne accompagnée.",
        "Une seule étape est active à la fois — REMI n'en propose pas une deuxième tant que la première n'est pas tenue.",
        "Les suggestions du premier mois portent sur la digestion, quel que soit le motif de consultation.",
      ],
    },
    principles: {
      title: "Préceptes",
      active: "actifs",
    },
    excluded: {
      title: "Jamais proposé",
      body: "Une règle absolue, pour toutes les personnes que vous accompagnez.",
    },
    emphasised: {
      title: "Privilégié",
      body: "Une préférence : REMI y va en premier quand le choix existe.",
    },
    add: "Ajouter",
    save: "Enregistrer le cadre",
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
  patientLink: {
    greeting: "Bonjour",
    lead: "Votre espace REMI : votre profil et les recommandations de votre praticienne, réunis au même endroit.",
    objectiveTitle: "Votre objectif",
    recommendationsTitle: "Vos recommandations",
    categories: {
      nutrition: "Nutrition",
      habit: "Habitude",
      supplement: "Complément",
      activity: "Activité",
      monitoring: "Suivi",
    },
    empty:
      "Vos recommandations apparaîtront ici dès que votre praticienne les aura encodées.",
    profileTitle: "Votre profil",
    constraintsTitle: "À éviter",
    preferencesTitle: "Vos préférences",
    medicationsTitle: "Traitements en cours",
    supplementsTitle: "Compléments",
    ageLabel: "ans",
    heightLabel: "cm",
    weightLabel: "kg",
    disclaimer: {
      title: "Votre praticienne reste la référence",
      body: "Cette page reprend ce qui a été convenu en consultation. Elle ne pose pas de diagnostic et ne remplace pas un avis médical.",
    },
    privacy: {
      title: "Vos données et ce lien",
      body: "Cette page n'affiche que ce que votre praticienne a encodé pour vous : votre profil et vos recommandations. Elle n'apparaît pas dans les moteurs de recherche, mais elle s'ouvre sans mot de passe — toute personne disposant du lien peut la lire, ne le transmettez donc qu'aux personnes de votre choix. Pour consulter, corriger ou faire supprimer vos données, écrivez à votre praticienne : personne d'autre n'y a accès.",
    },
    betaNote:
      "REMI est en version bêta — vos retours sont les bienvenus, dites-nous ce qui manque ou ce qui gêne.",
  },
};
