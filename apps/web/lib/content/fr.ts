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
    help: "Aide",
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
    lead: "Une chose à la fois, à ton rythme.",
    currentStep: "Ton étape de la quinzaine",
    stepProgress: "Jours appliqués",
    noPlan: {
      title: "Pas encore de plan",
      body: "Ton praticien n'a pas encore publié de plan. Il apparaîtra ici après ta prochaine consultation.",
    },
  },
  plan: {
    title: "Mon plan",
    lead: "Ce que ton praticien a recommandé, en mots sur lesquels agir.",
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
      title: "Ton praticien reste la référence",
      body: "REMI applique ces recommandations au quotidien. Il ne pose pas de diagnostic et ne remplace pas une consultation — tout ce qui est clinique appartient à ton praticien.",
    },
    empty: {
      title: "Pas encore de plan",
      body: "Ton praticien n'a pas encore publié de plan pour toi. Il apparaîtra ici dès qu'il l'aura fait.",
    },
  },
  steps: {
    title: "Tes étapes",
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
      body: "Tes étapes apparaîtront ici une fois que ton praticien aura publié un plan.",
    },
  },
  patientLink: {
    greeting: "Bonjour",
    lead: "Ton espace REMI : ce qui a été convenu avec ta praticienne, au même endroit.",
    navLabel: "Tes pages",
    nav: {
      home: "Aujourd'hui",
      recommandations: "Recommandations",
      complements: "Compléments",
      "placard-frigo": "Placard & frigo",
      recettes: "Recettes",
      documents: "Documents",
      repas: "Repas",
      progression: "Ma progression",
      messages: "Messages",
      profil: "Mon profil",
    },
    todayTitle: "Aujourd'hui / cette semaine",
    challenge: {
      title: "Le challenge du moment",
      since: "depuis le",
      acquired: "Challenge acquis",
      readyForNext: "Prêt(e) pour le prochain",
      empty:
        "Pas de challenge en cours pour l'instant — ta praticienne t'en proposera un.",
      errors: {
        invalid_input: "Cela n'a pas pu être enregistré. Recharge la page.",
        rate_limited:
          "Tu as écrit beaucoup de choses d'un coup — réessaie dans un instant.",
        not_found: "Ce challenge a changé entre-temps. Recharge la page.",
        unknown: "Cela n'a pas fonctionné. Réessaie dans un instant.",
      },
    },
    weeklyCheckIn: {
      title: "Ta semaine",
      lead: "Un chiffre par objectif, de 0 à 5 — ta praticienne le verra.",
      question: "Cette semaine, comment ça s'est passé pour :",
      scaleLow: "0 — pas bien du tout",
      scaleHigh: "5 — très bien",
      noteLabel: "Un mot (facultatif)",
      submit: "Envoyer",
      answeredOn: "Merci ! Réponse envoyée le",
      nextOn: "Prochaine question le",
      errors: {
        invalid_input: "Choisis au moins un chiffre avant d'envoyer.",
        rate_limited:
          "Tu as écrit beaucoup de choses d'un coup — réessaie dans un instant.",
        not_found: "Tu as déjà répondu cette semaine. Recharge la page.",
        unknown: "Cela n'a pas fonctionné. Réessaie dans un instant.",
      },
    },
    progression: {
      title: "Ma progression",
      lead: "Tes réponses de chaque semaine, objectif par objectif.",
      stripLabel: "tes chiffres de la semaine, de 0 à 5",
      noScores:
        "Pas encore de chiffre — la première question t'attend sur l'accueil.",
      instructionTitle: "La consigne du moment",
      mealsLabel: "Repas notés ces 7 derniers jours :",
      pastChallengesTitle: "Mes challenges passés",
      challengeUntil: "→",
      outcomes: {
        acquired: "Acquis",
        not_acquired: "Non acquis",
        abandoned: "Abandonné",
      },
    },
    profile: {
      title: "Mon profil",
      lead: "Ce que tu manges, ce que tu évites et le temps que tu as : garde-le à jour, ta praticienne et REMI s'en servent pour tes suggestions.",
      dietaryRegimeLabel: "Type d'alimentation",
      allergiesLabel: "Allergies",
      allergiesHint:
        "Les aliments à toujours éviter. Ta praticienne verra chaque changement.",
      intolerancesLabel: "Intolérances",
      preferencesLabel: "Aliments aimés / non aimés",
      preferencesHint: "Ce que tu aimes, ce que tu n'aimes pas.",
      likesCookingLabel: "Aimes-tu cuisiner ?",
      cookingTimeLabel: "Temps disponible pour cuisiner",
      foodBudgetLabel: "Budget alimentaire",
      unset: "Pas renseigné",
      likesCooking: { yes: "Oui", somewhat: "Un peu", no: "Non" },
      cookingTime: { low: "Faible", medium: "Moyen", high: "Important" },
      foodBudget: {
        economical: "Économique",
        standard: "Standard",
        comfort: "Confort",
      },
      save: "Enregistrer",
      saved: "Enregistré. Ta praticienne verra ce qui a changé.",
      errors: {
        invalid_input:
          "Ce profil n'a pas pu être enregistré : un champ dépasse 2000 caractères.",
        rate_limited:
          "Tu as écrit beaucoup de choses d'un coup — réessaie dans un instant.",
        not_found:
          "Ce lien n'est plus valable. Demandes-en un nouveau à ta praticienne.",
        unknown: "Cela n'a pas fonctionné. Réessaie dans un instant.",
      },
      recordTitle: "Ce que ta praticienne a noté",
      recordLead: "Pour le modifier, parles-en à ta praticienne.",
      nameLabel: "Nom",
      ageLabel: "Âge",
      ageValue: "{age} ans",
      heightLabel: "Taille",
      weightLabel: "Poids",
      notRecorded: "Pas encore noté",
    },
    messages: {
      title: "Ton accompagnement",
      prompt:
        "Comment se passe ton accompagnement cette semaine ? Tu peux aussi dire ici ce que tu as pensé des recettes, des challenges ou des recommandations proposées.",
      bodyLabel: "Ton message",
      send: "Envoyer",
      lastSent: "Dernier message envoyé le",
      you: "Toi",
      practitioner: "Ta praticienne",
      seeThread: "Voir tes messages",
      threadTitle: "Tes échanges",
      empty:
        "Tu n'as encore rien écrit. Ton premier message apparaîtra ici.",
      errors: {
        invalid_input:
          "Ce message n'a pas pu être envoyé : il est vide ou dépasse 2000 caractères.",
        rate_limited:
          "Tu as écrit beaucoup de choses d'un coup — réessaie dans un instant.",
        not_found:
          "Ce lien n'est plus valable. Demandes-en un nouveau à ta praticienne.",
        unknown: "Cela n'a pas fonctionné. Réessaie dans un instant.",
      },
    },
    weekConsigneTitle: "La consigne de la semaine",
    goalsTitle: "Ce sur quoi tu travailles",
    baselineLabel: "Point de départ",
    seeAllLabel: "Tout voir",
    mealEntry: {
      title: "Un repas ?",
      lead: "Dis-le à REMI, avant ou après — ta praticienne le verra.",
      formTitle: "Dis ce que tu manges",
      formLead:
        "Avant ou après, comme cela t'arrange. Ta praticienne le voit et te répond ici.",
      descriptionLabel: "Ton repas",
      placeholder: "Spaghetti sauce tomate",
      slotLabel: "Moment",
      slotNone: "Aucun",
      actions: {
        planned: "Je vais manger",
        eaten: "J'ai mangé",
      },
      states: {
        planned: "Prévu",
        eaten: "Mangé",
      },
      markEaten: "Je l'ai mangé",
      awaitingResponse: "Ta praticienne te répondra ici.",
      empty:
        "Tu n'as encore rien noté. Écris ton premier repas ci-dessus.",
      errors: {
        invalid_input:
          "Ce repas n'a pas pu être enregistré : vérifie le texte.",
        rate_limited:
          "Tu as écrit beaucoup de choses d'un coup — réessaie dans un instant.",
        not_found: "Ce repas n'existe plus. Recharge la page.",
        unknown: "Cela n'a pas fonctionné. Réessaie dans un instant.",
      },
    },
    summaryTitle: "Où tu en es",
    recommendationsTitle: "Tes recommandations",
    categories: {
      nutrition: "Nutrition",
      habit: "Habitude",
      supplement: "Complément",
      activity: "Activité",
      monitoring: "Suivi",
    },
    complementsTitle: "Tes compléments",
    doseLabel: "Dose",
    timingLabel: "Quand",
    reasonLabel: "Pourquoi",
    pantryTitle: "Placard & frigo",
    whyLabel: "Pourquoi pour toi",
    recipesTitle: "Tes recettes",
    recipeNoteLabel: "Pourquoi pour toi",
    documentsTitle: "Tes documents",
    documentAddedLabel: "Ajouté le",
    attachedDocumentsLabel: "À lire",
    recipeDocumentsTitle: "Tes recettes en document",
    mealsTitle: "Tes repas",
    mealSlots: {
      petit_dejeuner: "Petit-déjeuner",
      dejeuner: "Déjeuner",
      diner: "Dîner",
      collation: "Collation",
    },
    mealCommentLabel: "Ce que tu as dit",
    mealFeedbackLabel: "Le mot de ta praticienne",
    empty: "Cela apparaîtra ici une fois que ta praticienne l'aura encodé.",
    disclaimer: {
      title: "Ta praticienne reste la référence",
      body: "Cette page reflète ce qui a été convenu en consultation. Elle ne pose pas de diagnostic et ne remplace pas un avis médical.",
    },
    privacy: {
      title: "Tes données et ce lien",
      body: "Cette page montre ce que ta praticienne a enregistré pour toi, et ce que tu y écris toi-même. Ce que tu écris est conservé, rattaché à ton lien et lu par ta praticienne — c'est ce qui lui permet de te suivre entre deux consultations. La page n'apparaît pas dans les moteurs de recherche, mais elle s'ouvre sans mot de passe : toute personne qui possède le lien peut la lire et y écrire à ta place, ne le transmets donc qu'aux personnes de ton choix. Pour consulter, corriger ou faire supprimer tes données, ou pour obtenir un nouveau lien, écris à ta praticienne : personne d'autre n'y a accès.",
    },
    betaNote:
      "REMI est en bêta — tes retours sont les bienvenus, dis-nous ce qui manque ou ce qui gêne.",
  },
  signupLink: {
    metaTitle: "Inscription",
    title: "Inscription chez {name}",
    intro:
      "Crée ton compte REMI. Il est rattaché à la personne qui te suit, et t'ouvre le questionnaire à remplir avant la consultation.",
    labels: {
      lastName: "Nom",
      firstName: "Prénom",
      birthDate: "Date de naissance",
      email: "Adresse e-mail",
      phone: "Téléphone",
      password: "Mot de passe",
    },
    hints: {
      phone: "Des chiffres, avec un + au début si besoin.",
      password: "Au moins 8 caractères.",
    },
    summary: "À corriger : {fields}.",
    required: "{field} : ce champ est obligatoire.",
    invalid: {
      lastName: "Ce nom est trop long.",
      firstName: "Ce prénom est trop long.",
      birthDate: "Cette date n'est pas valide.",
      email: "Cette adresse e-mail n'est pas valide.",
      phone:
        "Ce numéro n'est pas valide. Utilise 8 à 15 chiffres, avec un + au début si besoin.",
      password: "Ce mot de passe est trop long.",
    },
    tooShort: "Le mot de passe compte au moins 8 caractères.",
    form: {
      invalid_link:
        "Ce lien n'est pas valide. Demandes-en un nouveau à la personne qui te suit.",
      already_registered: "Tu as déjà un compte.",
      file_exists: "Un dossier existe déjà pour cette adresse.",
      rate_limited: "Trop d'essais. Réessaie dans quelques minutes.",
      unavailable:
        "L'inscription n'a pas abouti. Réessaie dans un instant : tes réponses sont gardées.",
      consent_missing:
        "Coche chaque consentement obligatoire. Aucun compte n'a été créé.",
      consent_stale:
        "Le texte a changé depuis l'ouverture de la page. Recharge la page pour lire la version en vigueur. Aucun compte n'a été créé.",
    },
    signIn: "Connecte-toi.",
    claim: {
      request: "Recevoir un lien par e-mail",
      requesting: "Envoi du lien…",
      status: {
        sent: "Si un dossier existe pour cette adresse, un lien vient d'y partir. Il sert une seule fois et expire dans 24 heures.",
        rate_limited:
          "Un lien est parti il y a moins de cinq minutes. Regarde dans ta boîte de réception, puis réessaie plus tard.",
        unavailable: "Le lien n'a pas pu partir. Réessaie dans un instant.",
      },
    },
    submit: "Créer mon compte",
    submitting: "Création du compte…",
    consent: {
      title: "Tes données personnelles",
      intro:
        "Avant de créer ton compte, lis comment REMI traite tes données. Ton compte ne peut pas être créé sans ton accord.",
      names: {
        care: "Traitement de tes données pour ton suivi",
        genetic: "Traitement de tes données génétiques",
      },
      version: "Version {version} du {date}",
      accept: "J'ai lu et j'accepte : {name}.",
      reread: "Relire",
      missing: "Coche pour continuer : {consents}.",
      continue: "Continuer",
      back: "Revoir mes consentements",
    },
  },
  questionnaire: {
    metaTitle: "Questionnaire",
    title: "Préparons ta consultation",
    intro:
      "Quelques informations pour mieux te connaître et préparer ton accompagnement. Tu peux compléter ce questionnaire à ton rythme.",
    progressLabel: "Progression du questionnaire",
    step: "Étape {current} sur {total}",
    mandatoryLegend: "* Champ obligatoire",
    mandatory: "obligatoire",
    optional: "(facultatif)",
    sections: {
      identite: "Identité",
      profil: "Profil",
      consultation: "Consultation",
      alimentation: "Alimentation",
      sante: "Santé",
      genetique: "Génétique",
    },
    previous: "Précédent",
    next: "Continuer",
    saving: "Enregistrement…",
    saved: "Enregistré",
    retry: "Réessayer",
    end: {
      readyTitle: "Ton questionnaire est prêt !",
      readyBody:
        "Tes réponses ont bien été enregistrées et permettront à ton praticien de préparer votre consultation.",
      finish: "Terminer",
      edit: "Modifier mes réponses",
      incompleteTitle: "Il reste quelques informations à compléter.",
      incompleteBody:
        "Complète les questions ci-dessous pour finaliser ton questionnaire.",
      back: "Revenir au questionnaire",
    },
    errors: {
      required: "Ce champ ne peut pas rester vide.",
      invalid: "Cette valeur n'est pas valide.",
      phone:
        "Ce numéro n'est pas valide. Utilise 8 à 15 chiffres, avec un + au début si besoin.",
      height_range: "Indique une taille entre 100 et 250 cm, sans décimale.",
      weight_range:
        "Indique un poids entre 25 et 300 kg, avec une décimale au plus.",
      consent:
        "Cette information demande ton consentement aux soins. Parles-en à ton praticien.",
      genetic_consent:
        "Tes génotypes demandent ton consentement génétique. Donne-le plus haut pour les enregistrer.",
      signed_out: "Ta session a expiré. Reconnecte-toi pour continuer.",
      unavailable: "Impossible d'enregistrer.",
    },
    labels: {
      firstName: "Prénom",
      lastName: "Nom",
      birthDate: "Date de naissance",
      email: "Adresse e-mail",
      phone: "Téléphone",
      mandatory: {
        sexForCalculation:
          "Sexe biologique utilisé pour les calculs nutritionnels",
        heightCm: "Taille (cm)",
        weightKg: "Poids actuel (kg)",
        activityLevel: "Niveau d'activité physique",
        consultationReason: "Motif de consultation",
        allergies: "Allergies",
        intolerances: "Intolérances",
      },
      desiredWeight: "Poids souhaité (kg)",
      consultationDate: "Date de consultation",
      diet: "Quel type d'alimentation suis-tu ?",
      dietNote: "Précise ton type d'alimentation",
      pathologies: "Pathologies",
      celiacDisease: "Maladie cœliaque",
      medications: "Médicaments",
      supplements: "Compléments alimentaires",
      geneticTest:
        "As-tu réalisé un test génétique permettant de connaître tes génotypes APOE, DIO2 et AMY1A ?",
      otherText: "Précise",
    },
    hints: {
      email: "Pour modifier ton e-mail, contacte ton praticien.",
      phone: "Des chiffres, avec un + au début si besoin.",
      height: "Entre 100 et 250 cm.",
      weight: "Entre 25 et 300 kg.",
      desiredWeight: "Laisse vide si tu n'en as pas.",
      allergies:
        "Coche « Aucune allergie connue » ou chaque allergie. Une catégorie cochée sans précision est exclue en entier.",
      intolerances:
        "Coche « Aucune intolérance connue » ou chaque intolérance.",
      otherText: "Précise « Autre » pour l'enregistrer.",
      celiacDisease:
        "Coche si un médecin l'a diagnostiquée. Le gluten est alors exclu strictement, contaminations croisées comprises.",
      medications:
        "Ceux que tu prends aujourd'hui, avec leur dose si tu la connais.",
      supplements: "Vitamines, minéraux, plantes…",
    },
    identity: {
      known:
        "Ces informations viennent de ton inscription. Vérifie-les : tu peux les corriger si besoin.",
      edit: "Modifier mes informations",
      empty: "Non renseigné",
    },
    diet: {
      proposed: "Choix proposé",
      confirm: "Confirmer ce choix",
      noteRequired: "Précise ton type d'alimentation pour enregistrer « Autre ».",
    },
    genetic: {
      consentTitle: "Traitement de tes données génétiques",
      consentIntro:
        "Pour enregistrer tes génotypes, REMI a besoin de ton accord. Lis le texte, puis donne ou refuse ton consentement.",
      version: "Version {version} du {date}",
      accept: "J'accepte",
      refuse: "Je refuse",
      deciding: "Enregistrement…",
      refused:
        "Tu as refusé : REMI n'enregistre aucun génotype. Tu peux changer d'avis à tout moment avec « J'accepte ».",
      listsIntro:
        "Choisis chaque résultat tel qu'il figure sur le rapport du laboratoire. Laisse une liste vide si tu ne connais pas le résultat.",
      decisionFailed:
        "Ta réponse n'a pas pu être enregistrée. Vérifie ta connexion et réessaie.",
    },
  },
  dateEntry: {
    placeholder: "JJ/MM/AAAA",
    hint: "Format : JJ/MM/AAAA.",
    invalid: "Cette date n'est pas valide. Utilise le format JJ/MM/AAAA.",
    notPast: "La date de naissance doit être dans le passé.",
  },
  patientSignIn: {
    metaTitle: "Connexion",
    title: "Connexion",
    intro: "Connecte-toi avec le compte créé lors de ton inscription.",
    emailLabel: "Adresse e-mail",
    passwordLabel: "Mot de passe",
    submit: "Se connecter",
    submitting: "Connexion…",
    form: {
      wrong_credentials: "Adresse e-mail ou mot de passe incorrect.",
      no_account:
        "Aucun compte REMI n'est lié à cette adresse. Inscris-toi avec le lien reçu de la personne qui te suit.",
      rate_limited: "Trop d'essais. Réessaie dans quelques minutes.",
      unavailable: "La connexion n'a pas abouti. Réessaie dans un instant.",
    },
    notices: {
      no_account:
        "Aucun compte REMI n'est lié à cette adresse. Inscris-toi avec le lien reçu de la personne qui te suit.",
      password_changed:
        "Ton nouveau mot de passe est enregistré. Connecte-toi avec lui.",
    },
    forgotLink: "Mot de passe oublié ?",
    magicLink: {
      title: "Recevoir un lien de connexion",
      intro:
        "Sans mot de passe : nous envoyons un lien à ton adresse e-mail. Il te connecte en un clic.",
      submit: "Recevoir un lien",
      submitting: "Envoi…",
      status: {
        sent: "Si cette adresse a un compte, un lien de connexion vient de partir. Ouvre-le depuis ta boîte mail.",
        rate_limited: "Trop d'essais. Réessaie dans quelques minutes.",
        unavailable: "Le lien n'a pas pu partir. Réessaie dans un instant.",
      },
    },
    noAccount:
      "Pas encore de compte ? Il se crée avec le lien reçu de la personne qui te suit.",
  },
  forgotPassword: {
    metaTitle: "Mot de passe oublié",
    title: "Mot de passe oublié",
    intro:
      "Indique l'adresse e-mail de ton compte. Nous y envoyons un lien pour choisir un nouveau mot de passe.",
    emailLabel: "Adresse e-mail",
    submit: "Recevoir le lien",
    submitting: "Envoi…",
    status: {
      sent: "Si cette adresse a un compte, un lien vient de partir. Il est valable une heure et sert une seule fois.",
      rate_limited: "Trop d'essais. Réessaie dans quelques minutes.",
      unavailable: "Le lien n'a pas pu partir. Réessaie dans un instant.",
    },
    back: "Retour à la connexion",
  },
  newPassword: {
    metaTitle: "Nouveau mot de passe",
    title: "Choisis un nouveau mot de passe",
    intro:
      "Confirme l'adresse e-mail de ton compte et choisis un nouveau mot de passe.",
    emailLabel: "Adresse e-mail",
    passwordLabel: "Nouveau mot de passe",
    passwordHint: "Au moins 8 caractères.",
    submit: "Enregistrer et me connecter",
    submitting: "REMI regarde ton repas…",
    form: {
      too_short: "Le mot de passe compte au moins 8 caractères.",
      too_long: "Ce mot de passe est trop long.",
      invalid_link: "Ce lien a expiré ou a déjà servi. Demandes-en un nouveau.",
      rate_limited: "Trop d'essais. Réessaie dans quelques minutes.",
      unavailable:
        "Le mot de passe n'a pas été enregistré. Réessaie dans un instant.",
    },
    invalidLink: "Ce lien a expiré ou a déjà servi.",
    requestAgain: "Demander un nouveau lien",
  },
  takeover: {
    metaTitle: "Reprendre mon dossier",
    title: "Reprends ton dossier REMI",
    greeting: "Bonjour {name},",
    intro:
      "La personne qui te suit a ouvert ton dossier. Donne ton accord sur le traitement de tes données, puis choisis un mot de passe. Tu retrouves ensuite les informations déjà enregistrées.",
    passwordLabel: "Mot de passe",
    passwordHint: "Au moins 8 caractères.",
    submit: "Créer mon compte",
    submitting: "Création du compte…",
    form: {
      consent_missing:
        "Coche chaque consentement obligatoire. Aucun compte n'a été créé.",
      consent_stale:
        "Le texte a changé depuis l'ouverture de la page. Recharge la page pour lire la version en vigueur. Aucun compte n'a été créé.",
      too_short: "Le mot de passe compte au moins 8 caractères.",
      too_long: "Ce mot de passe est trop long.",
      spent: "Ce lien n'est plus valide. Aucun compte n'a été créé.",
      has_account: "Tu as déjà un compte.",
      rate_limited: "Trop d'essais. Réessaie dans quelques minutes.",
      unavailable: "Le compte n'a pas été créé. Réessaie dans un instant.",
    },
    signIn: "Connecte-toi.",
    spent:
      "Ce lien n'est plus valide : il a déjà servi ou il a expiré. Connecte-toi si tu as déjà un compte. Sinon, demande un nouveau lien depuis le lien d'inscription de la personne qui te suit.",
    hasAccount: "Tu as déjà un compte pour ce dossier.",
  },
  patientHome: {
    metaTitle: "Accueil",
    title: "Accueil",
    comingSoon:
      "Ton espace arrive bientôt. Tu y trouveras tes recommandations et tes recettes.",
  },
  patientTabs: [
    { href: "/accueil", icon: "home", label: "Accueil" },
    { href: "/recettes", icon: "recipes", label: "Recettes" },
    { href: "/profil", icon: "profile", label: "Profil" },
  ],
  patientShell: {
    greeting: "Bonjour {name}",
    greetingNoName: "Bonjour",
    profileLink: "Profil",
  },
  patientRecipes: {
    metaTitle: "Recettes",
    title: "Recettes",
    comingSoon:
      "Tes propositions de recettes arrivent bientôt. Tu les trouveras ici, jour par jour.",
  },
  patientProfile: {
    metaTitle: "Profil",
    title: "Profil",
  },
  patientRecommendations: {
    metaTitle: "Mes recommandations",
    title: "Mes recommandations",
    profileEntry: "Mes recommandations",
    profileEntryHint: "Ce que ton praticien a validé pour toi.",
    backToProfile: "Retour au profil",
    updatedOn: "Mis à jour le {date}",
    empty:
      "Tes recommandations apparaîtront ici dès que ton praticien les aura validées.",
    unavailable:
      "Tes recommandations ne peuvent pas s'afficher pour le moment. Réessaie dans un instant.",
    supplementsTitle:
      "Compléments alimentaires, plantes et huiles essentielles",
    doseLabel: "Posologie",
    timingLabel: "Moment de prise",
    reasonLabel: "Pourquoi",
    lifestyleTitle: "Conseils d'hygiène de vie",
    lifestyleCategories: {
      physical_activity: "Activité physique",
      stress_management: "Gestion du stress",
      sleep: "Sommeil",
      hydration: "Hydratation",
      eating_behaviour: "Comportements alimentaires / habitudes à table",
      lifestyle_other: "Autres conseils d'hygiène de vie",
      monitoring: "Suivi",
    },
    foodTitle: "Recommandations alimentaires",
    evictionsTitle: "Évictions totales",
    evictionUntil: "jusqu'au {date}",
    evictionFrom: "à partir du {date}",
    evictionDurable: "exclusion durable",
    favourTitle: "À favoriser",
    limitTitle: "À limiter",
    limitLevels: {
      reduce: "à réduire",
      rare: "rarement",
    },
    foodAdviceTitle: "Conseils de ton praticien",
    goalsTitle: "Objectifs prioritaires",
  },
  patientPersonalData: {
    unavailable:
      "Tes informations ne peuvent pas s'afficher pour le moment. Réessaie dans un instant.",
    empty: "Non renseigné",
    edit: "Modifier",
    editLabel: "Modifier : {label}",
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
    personalTitle: "Mes informations personnelles",
    personalIntro:
      "Tu peux modifier ton téléphone ici. Pour corriger ton nom, ton prénom ou ta date de naissance, contacte ton praticien.",
    phoneSaved: "Ton numéro de téléphone est enregistré.",
    dataTitle: "Mes données de suivi",
    dataIntro:
      "Tu peux les mettre à jour à tout moment. Ton praticien voit chaque changement, et tes recommandations validées ne changent pas.",
    rows: {
      weight: "Poids actuel",
      desiredWeight: "Poids souhaité",
      activityLevel: "Niveau d'activité physique",
      diet: "Type d'alimentation",
      allergies: "Allergies",
      intolerances: "Intolérances",
      medications: "Médicaments",
      supplements: "Compléments alimentaires",
    },
    kilograms: "{value} kg",
    dietWithNote: "{diet} : {note}",
    weightSaved:
      "Ton poids est enregistré. Ton praticien voit ce changement.",
    dataLink: "Modifier mes autres données",
    dataLinkHint:
      "Alimentation, allergies, intolérances, activité, poids souhaité, médicaments et compléments.",
    accountTitle: "Mon compte",
    consentTitle: "Mes consentements",
    dataPage: {
      metaTitle: "Mes données de suivi",
      title: "Mes données de suivi",
      intro:
        "Chaque changement s'enregistre tout seul, sans bouton. Ton praticien le voit, et tes recommandations validées ne changent pas.",
      foodTitle: "Alimentation, allergies et intolérances",
      foodSaved:
        "C'est enregistré : ce changement s'applique tout de suite aux idées que REMI te propose, et ton praticien le voit.",
      otherTitle: "Activité, poids souhaité et traitements",
    },
  },
  signOut: "Se déconnecter",
  patientWaiting: {
    metaTitle: "Ton accompagnement se prépare",
    title: "Ton praticien prépare ton accompagnement",
    body:
      "Tes réponses sont bien arrivées. Dès que ton accompagnement est prêt, ton espace REMI s'ouvre ici, avec le même compte.",
    practitionerLabel: "Ton praticien",
    appointmentLabel: "Ton rendez-vous",
    questionnaireHint: "Tu peux encore adapter tes réponses, à ton rythme.",
    questionnaireLink: "Revoir mon questionnaire",
  },
  patientMeal: {
    question: "Qu'as-tu prévu de manger ?",
    hint: "Écris le plat et, si tu les connais, ses ingrédients.",
    placeholder: "Par exemple : spaghetti sauce tomate, parmesan, salade verte",
    submit: "Améliorer mon repas",
    submitting: "REMI regarde ton repas…",
    remaining: "Caractères restants : {count}",
    errors: {
      empty: "Écris d'abord ce que tu as prévu de manger.",
      too_long: "Ton texte est trop long : 500 caractères au maximum.",
      daily_limit:
        "Tu as enregistré 20 repas aujourd'hui, le maximum pour une journée. Tu pourras en ajouter demain.",
      unavailable:
        "Ton repas n'a pas pu être enregistré. Réessaie dans un instant.",
    },
    saved: {
      title: "Ton repas est enregistré",
      mealLabel: "Ton repas",
      another: "Saisir un autre repas",
      suggestion: {
        alertTitle: "À regarder avant tout",
        alerts: {
          allergy:
            "« {food} » ne convient pas avec une allergie que tu as déclarée.",
          intolerance:
            "« {food} » ne convient pas avec une intolérance que tu as déclarée.",
          coeliac:
            "« {food} » contient du gluten, à écarter avec la maladie cœliaque.",
          eviction:
            "« {food} » fait partie des aliments que ton praticien t'a demandé d'écarter.",
          diet: "« {food} » ne correspond pas au type d'alimentation que tu as déclaré.",
        },
        trace:
          "« {food} » peut contenir un aliment à écarter pour toi. Vérifie ses ingrédients.",
        toCheck:
          "REMI pense que ces aliments peuvent contenir un aliment à écarter pour toi : {foods}. Vérifie leurs ingrédients.",
        checkIngredients:
          "REMI ne connaît pas la composition exacte de ton repas. Vérifie toujours les ingrédients.",
        goodTitle: "Ce qui est déjà bien",
        improveTitle: "Ce que tu pourrais améliorer",
        kinds: {
          add: "Tu peux essayer d'ajouter : {food}",
          replace: "Tu peux essayer de remplacer {replaces} par : {food}",
          remove: "Tu peux essayer de retirer : {food}",
        },
        basis: "En lien avec : {basis}",
        aligned:
          "Ton repas est déjà en accord avec tes recommandations. Bon appétit !",
        withheld:
          "REMI n'a pas trouvé d'amélioration sûre à te proposer pour ce repas. Vérifie les ingrédients de ton repas.",
        noProtocol:
          "Ton praticien n'a pas encore validé tes recommandations. REMI ne propose donc pas d'amélioration pour le moment.",
        addressAlert:
          "Une piste : remplace ou retire d'abord l'aliment signalé plus haut.",
        unclear:
          "REMI n'a pas compris ton repas. Écris le plat et ses ingrédients dans un nouveau repas.",
        unavailable:
          "La suggestion de REMI n'est pas disponible pour le moment. Ton repas est bien enregistré.",
        feedback: {
          accept: "Ça me convient",
          decline: "Pas pour moi",
          declined: "D'accord. REMI peut te proposer une autre piste.",
          another: "Une autre suggestion",
          anotherPending: "REMI cherche une autre piste…",
          noOther:
            "REMI n'a pas d'autre suggestion à te proposer pour ce repas. Bon appétit.",
          closing: "Merci pour ton retour. Bon appétit.",
        },
      },
    },
  },
  patientConsents: {
    intro:
      "Tu peux relire chaque texte et retirer ton consentement à tout moment. Le retrait prend effet tout de suite.",
    states: {
      given: "Consentement donné le {date}",
      refused: "Consentement refusé le {date}",
      withdrawn: "Consentement retiré le {date}",
      none: "Ce consentement ne t'a pas encore été demandé.",
    },
    version: "Version {version} du texte",
    legacyVersion:
      "Ton praticien a recueilli ce consentement avant ton inscription. Le texte n'est pas enregistré dans REMI.",
    reread: "Relire",
    rereadLabel: "Relire : {name}",
    withdraw: "Retirer mon consentement",
    withdrawLabel: "Retirer mon consentement : {name}",
    confirmTitle: "Retirer ce consentement ?",
    consequences: {
      care: "REMI arrête tout de suite ses suggestions et ses recettes pour toi, ton espace se met en pause et ton praticien voit que tu as retiré ton consentement.",
      genetic:
        "REMI efface tout de suite tes trois résultats génétiques et n'en tient plus compte pour ton suivi.",
    },
    past: "Ce retrait ne change rien à ce qui a été fait avant.",
    confirm: "Oui, retirer mon consentement",
    withdrawing: "Retrait en cours…",
    cancel: "Annuler",
    give: "Donner à nouveau mon consentement",
    giveLabel: "Donner à nouveau mon consentement : {name}",
    giveIntro: "Relis le texte ci-dessus, puis confirme ton choix.",
    giveConfirm: "J'ai lu le texte et je donne mon consentement",
    giving: "Enregistrement…",
    errors: {
      signed_out: "Ta session a expiré. Reconnecte-toi, puis réessaie.",
      stale: "Le texte a changé. Recharge la page, puis relis-le.",
      unavailable:
        "Ton choix n'a pas pu être enregistré. Réessaie dans un instant.",
    },
    deletion:
      "Pour supprimer ton compte, envoie un e-mail à info@remiai.be.",
    pause: {
      metaTitle: "Ton espace est en pause",
      title: "Ton espace REMI est en pause",
      withdrawn:
        "Tu as retiré ton consentement au traitement de tes données le {date}. Ton praticien le voit sur ton dossier.",
      missing:
        "REMI a besoin de ton consentement au traitement de tes données pour t'accompagner.",
      stopsTitle: "Ce qui s'arrête",
      stops: [
        "REMI ne te propose plus de suggestion ni de recette.",
        "Tu ne peux plus enregistrer de repas ni ouvrir tes recommandations et tes données de suivi.",
      ],
      staysTitle: "Ce qui ne change pas",
      stays:
        "Ce qui a été fait avant reste valable, et tes données ne sont pas supprimées.",
      againTitle: "Pour reprendre ton accompagnement",
      again:
        "Relis le texte ci-dessous et donne à nouveau ton consentement. Ton espace s'ouvre à nouveau tout de suite.",
      consentsTitle: "Mes consentements",
    },
  },
};
