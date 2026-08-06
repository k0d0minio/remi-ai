/**
 * The roadmap to first users, as data.
 *
 * What separates today's product — every surface built, no real data — from a
 * product that hosts the pilot cohort and then a few hundred users. Three
 * phases in dependency order, plus the strands that run beside them, and an
 * explicit list of what is deliberately not on the road.
 *
 * The status vocabulary is small on purpose: « à faire » is plain work,
 * « décision en cours » is blocked on a technical choice with Jamie,
 * « décision en attente » is blocked on the Questions ouvertes page — the
 * items Morgane and Arnaud unblock — and « en place » is done.
 *
 * Written in French per the working-languages rule in `CONVENTIONS.md`: this
 * is a review document for Morgane and Arnaud.
 */

export const author = "Jamie Nisbet";

/** The date the page was prepared. */
export const preparedOn = "6 août 2026";

export type RoadmapStatus =
  "à faire" | "décision en cours" | "décision en attente" | "en place";

export type RoadmapItem = {
  title: string;
  status: RoadmapStatus;
  body: string;
};

export type RoadmapPhase = {
  title: string;
  lead: string;
  items: readonly RoadmapItem[];
};

export const roadmap = {
  header: {
    eyebrow: "Pour Morgane et Arnaud — la route vers les premiers utilisateurs",
    title: "Feuille de route",
    lead: "Ce qui sépare le produit d'aujourd'hui — toutes les surfaces construites, aucune donnée réelle — d'un produit qui accueille la cohorte, puis quelques centaines d'utilisateurs. Trois phases, dans l'ordre où elles doivent tomber, et une liste volontairement courte : les gros blocs, pas les finitions.",
    preparedFor: "Pour Morgane et Arnaud",
  },

  standing: {
    title: "Où nous en sommes",
    body: [
      "Le tour honnête du propriétaire : six applications déployées, la boucle cœur dessinée de bout en bout — les recommandations deviennent un plan, le plan devient des repas et des pas, la progression revient vers le praticien — et une console d'opération complète. Tout cela tourne aujourd'hui sur des données de démonstration : rien ne persiste, personne ne se connecte, aucun email ne part réellement.",
      "C'est une décision d'architecture, pas un retard. Chaque écran lit ses données à travers une couche de requêtes dont le contenu se remplace le jour où la base de données arrive, sans toucher aux écrans. La contrepartie de cette discipline : la phase une est un branchement, pas une réécriture.",
    ],
  },

  phases: [
    {
      title: "Phase 1 — les fondations, avant le premier compte réel",
      lead: "Tant que cette phase n'est pas terminée, personne ne peut réellement utiliser Remi. Tout y est bloquant, et presque tout y est déjà préparé.",
      items: [
        {
          title: "La base de données et les comptes",
          status: "à faire",
          body: "Le choix est fait : Neon, un Postgres hébergé en Europe, et une connexion par lien magique — sans mot de passe — avec une double authentification simple pour les praticiens. Reste à brancher : comptes praticien et personne, relation d'accompagnement, plans. L'architecture a été construite pour que ce soit un branchement, et le socle reste ouvert à une évolution vers Supabase plus tard — c'est le même moteur en dessous.",
        },
        {
          title: "Le socle légal",
          status: "décision en attente",
          body: "Politique de confidentialité, conditions d'utilisation, contrat praticien, registre de traitement, consentement explicite pour les données de santé. Dépend directement des questions 1 à 4 de la page « Questions ouvertes » — c'est le bloc que vos réponses débloquent. Sans lui, ouvrir le premier compte réel serait une imprudence.",
        },
        {
          title: "L'email qui part vraiment",
          status: "à faire",
          body: "Invitations, connexions, notifications, réponses du support : la couche d'envoi existe mais n'envoie rien — en l'absence de fournisseur, elle écrit dans un journal, volontairement. Brancher le fournisseur, configurer le domaine d'envoi, écrire les premiers gabarits en français.",
        },
        {
          title: "Voir les pannes avant les utilisateurs",
          status: "à faire",
          body: "Aujourd'hui, une erreur en production est invisible — c'est écrit tel quel dans la documentation technique. Suivi d'erreurs, sauvegardes automatiques de la base avec restauration testée, alerte si un site ne répond plus. C'est l'assurance-vie du pilote, et elle s'installe avant le premier utilisateur, pas après le premier incident.",
        },
      ],
    },
    {
      title: "Phase 2 — le pilote réel, la cohorte sur le produit",
      lead: "La boucle cœur, sur de vraies données, pour de vraies personnes — et le service autour.",
      items: [
        {
          title: "L'entrée des praticiens",
          status: "à faire",
          body: "De la candidature sur le site public au compte actif : examen dans la console, acceptation, création du compte, premier parcours guidé. Le suivi des candidatures existe déjà dans la console — sur données de démonstration.",
        },
        {
          title: "L'invitation des personnes accompagnées",
          status: "à faire",
          body: "Le praticien invite, la personne accepte, et la relation d'accompagnement a un début et une fin — sa fin coupe l'accès, comme le veut la règle du produit. La promesse d'export des données pendant 90 jours après un départ se construit ici, pas après coup.",
        },
        {
          title: "La boucle cœur en production",
          status: "à faire",
          body: "Les deux surfaces existent déjà, écran par écran. Cette étape les fait persister : un plan créé reste, un repas enregistré compte, la progression d'hier est encore là aujourd'hui. C'est le moment où le produit commence à dire la vérité.",
        },
        {
          title: "L'IA, dans le cadre",
          status: "à faire",
          body: "Le branchement est décidé — l'accès passe par la passerelle IA de notre hébergeur — et le garde-fou est architectural : chaque sortie de l'IA est validée contre le cadre fixé par le praticien avant d'être affichée, et laisse une trace consultable. Hors du cadre, Remi n'improvise pas : il le dit et renvoie vers le praticien. Une question reste ouverte pour vous — la question 5 de la page voisine : l'IA doit-elle voir les prénoms ?",
        },
        {
          title: "Le support en vrai",
          status: "à faire",
          body: "La boîte de support de la console branchée sur de vrais messages, les premiers articles du centre d'aide publiés en français, et l'engagement de délai — question 10 de la page voisine — affiché plutôt que supposé.",
        },
      ],
    },
    {
      title: "Phase 3 — prêt à encaisser, le 1er septembre 2026",
      lead: "La facturation commence quand la fenêtre d'enrôlement se ferme. Tout ce qui suit doit être en place avant cette date-là.",
      items: [
        {
          title: "La facturation",
          status: "décision en attente",
          body: "24,50 € HTVA par praticien par mois, gelé un an pour la cohorte. L'entité qui facture, la TVA et la mécanique — manuelle ou automatisée — sont la question 7 de la page voisine ; l'implémentation suit la décision, pas l'inverse.",
        },
        {
          title: "La sécurité qui se prouve",
          status: "à faire",
          body: "Une vraie authentification d'opérateur sur la console — aujourd'hui protégée par une adresse non publiée et l'interdiction d'indexation, pas par une session — la double authentification pour les praticiens, et le journal d'audit alimenté par de vrais événements : qui a fait quoi, et quand, sans trou.",
        },
        {
          title: "Le tableau de bord qui dit vrai",
          status: "à faire",
          body: "La vue d'ensemble de la console — comptes, candidatures, activité — branchée sur les vraies données, pour piloter la fermeture de la fenêtre et la conversion de septembre avec des chiffres réels plutôt qu'un décor.",
        },
      ],
    },
  ] satisfies RoadmapPhase[],

  parallel: {
    title: "En parallèle, sans attendre les phases",
    lead: "Trois chantiers qui n'ont pas de place dans l'ordre des phases parce qu'ils avancent à côté, dès maintenant.",
    items: [
      {
        title: "L'espace de travail commun",
        status: "décision en attente",
        body: "Slack comme lieu du travail produit — listes, canvas, décisions — en français. C'est la question 13 de la page voisine, et le premier pas est une invitation.",
      },
      {
        title: "Le site public remis d'accord avec la réalité",
        status: "décision en attente",
        body: "La FAQ publique et les conditions du pilote se contredisent sur le prix — question 6 de la page voisine. Quel que soit le choix, le site doit dire une seule chose, partout.",
      },
      {
        title: "La langue de travail",
        status: "en place",
        body: "Désormais une règle écrite du dépôt : tout document préparé pour votre analyse ou votre relecture — cette page comprise — est rédigé en français. Le code et sa documentation technique restent en anglais.",
      },
    ] satisfies RoadmapItem[],
  },

  outOfScope: {
    title: "Ce qui n'est pas sur cette route — et pourquoi",
    body: [
      "L'échelle au-delà du millier d'utilisateurs : choisie, pas subie. Le socle actuel porte sereinement la cohorte puis quelques centaines d'utilisateurs ; les vraies questions d'échelle se traiteront à l'approche du plafond, guidées par de vraies données d'usage plutôt que par des suppositions.",
      "Pas d'application mobile native, pas de fonctionnalités hors de la boucle cœur, pas de deuxième langue produit tant que la première n'est pas arrêtée. Chaque « pas encore » ici est réversible — c'est un ordre de passage, pas un renoncement.",
    ],
  },
} as const;
