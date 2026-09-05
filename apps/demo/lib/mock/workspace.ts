import type {
  AnamnesisCategory,
  GlanceItem,
  PatientRecord,
  ProfileField,
  RecommendationGroup,
  WorkspaceGoal,
  WorkspaceInstruction,
  WorkspaceList,
  WorkspaceMeal,
  WorkspaceRow,
  WorkspaceSectionId,
  WorkspaceSegment,
} from "./types";

/**
 * The section registry — every section the admin patient page renders today,
 * in the order it renders them, plus the segment each falls into on a phone.
 *
 * It is one list because the whole design rests on one: the page renders its
 * sections once, in this order, and desktop columns, the medium anchor row and
 * the phone segments are all views over it. A section added here appears in the
 * rail index, the anchor row and its segment without being placed three times.
 *
 * The segment names and this grouping are provisional — they are the first
 * question the live prototype exists to ask.
 */
export const workspaceSections: {
  id: WorkspaceSectionId;
  label: string;
  segment: WorkspaceSegment;
}[] = [
  { id: "lien", label: "Lien patient", segment: "suivi" },
  { id: "resume", label: "Résumé vivant", segment: "suivi" },
  { id: "objectifs", label: "Objectifs et consigne", segment: "suivi" },
  { id: "recommandations", label: "Recommandations", segment: "suivi" },
  { id: "complements", label: "Protocole de compléments", segment: "suivi" },
  { id: "essentiels", label: "Essentiels placard / frigo", segment: "suivi" },
  { id: "recettes", label: "Recettes", segment: "suivi" },
  { id: "repas", label: "Journal des repas", segment: "journal" },
  { id: "retenir", label: "À retenir", segment: "journal" },
  { id: "consultations", label: "Consultations", segment: "dossier" },
  { id: "anamnese", label: "Anamnèse", segment: "dossier" },
  { id: "profil", label: "Profil", segment: "profil" },
  { id: "zone-sensible", label: "Zone sensible", segment: "profil" },
];

export const segmentLabels: Record<WorkspaceSegment, string> = {
  brief: "En bref",
  suivi: "Suivi",
  journal: "Journal",
  dossier: "Dossier",
  profil: "Profil",
};

export const segmentOrder: WorkspaceSegment[] = [
  "brief",
  "suivi",
  "journal",
  "dossier",
  "profil",
];

/** What the "Ajouter" menu offers, phone sheet and desktop menu alike. */
export const addActions: { id: string; label: string; hint: string }[] = [
  {
    id: "recommandation",
    label: "Une recommandation",
    hint: "Ce que la personne voit sur son lien",
  },
  {
    id: "complement",
    label: "Un complément",
    hint: "Dose, moment, et pourquoi celui-là",
  },
  { id: "essentiel", label: "Un essentiel", hint: "Placard ou frigo" },
  { id: "recette", label: "Une recette", hint: "Depuis la bibliothèque" },
  { id: "repas", label: "Un repas", hint: "Transcrit de ce qu'elle a envoyé" },
  { id: "observation", label: "Une observation", hint: "Hors repas" },
  {
    id: "consultation",
    label: "Une consultation",
    hint: "Vos notes de séance",
  },
];

const camilleGoals: WorkspaceGoal[] = [
  {
    id: "goal-proteines",
    title: "Des protéines au petit-déjeuner, cinq matins sur sept",
    why: "Les fringales de 11 h reviennent exactement les matins sans protéines. C'est le levier le plus court avant de toucher au reste.",
    reached: false,
    checkIns: [
      {
        on: "26 août 2026",
        note: "Cinq matins sur sept la semaine dernière, six celle d'avant. Tient sans y penser.",
        direction: "up",
      },
      {
        on: "12 août 2026",
        note: "Quatre sur sept. Les deux matins ratés sont les jours de trajet vers Namur.",
        direction: "flat",
      },
      {
        on: "29 juillet 2026",
        note: "Deux sur sept pour commencer. Œufs le week-end seulement.",
        direction: "up",
      },
    ],
  },
  {
    id: "goal-diner",
    title: "Dîner avant 20 h 30 en semaine",
    why: "Le décalage du dîner est ce qui décale le reste — coucher, réveil, et le petit-déjeuner du lendemain.",
    reached: false,
    checkIns: [
      {
        on: "26 août 2026",
        note: "Trois soirs sur cinq. Le mardi et le jeudi restent tard à cause du cours de 19 h.",
        direction: "flat",
      },
      {
        on: "12 août 2026",
        note: "Deux soirs sur cinq. On garde l'objectif, on ne l'élargit pas.",
        direction: "flat",
      },
    ],
  },
];

const camilleArchivedGoals: WorkspaceGoal[] = [
  {
    id: "goal-eau",
    title: "Un litre et demi d'eau par jour",
    why: "Point de départ posé en mai, quand rien d'autre n'était encore stable.",
    reached: true,
    checkIns: [
      {
        on: "15 juillet 2026",
        note: "Acquis. Bouteille sur le bureau, plus besoin d'y penser — objectif retiré de la liste active.",
        direction: "up",
      },
    ],
  },
];

const camilleInstruction: WorkspaceInstruction = {
  text: "Ne pas ajouter de nouvelle contrainte tant que le petit-déjeuner n'est pas acquis. Elle abandonne quand la liste s'allonge, pas quand elle est difficile.",
  setOn: "12 août 2026",
  superseded: [
    {
      id: "instr-1",
      text: "Rester sur le terrain digestif avant de regarder le sommeil.",
      setOn: "17 juin 2026",
    },
  ],
};

const camilleRecommendations: RecommendationGroup[] = [
  {
    category: "Alimentation",
    rows: [
      {
        id: "rec-1",
        title: "Deux œufs ou 150 g de fromage blanc au petit-déjeuner",
        detail:
          "Cinq matins sur sept. Le but est la satiété jusqu'à midi, pas la quantité de protéines.",
        meta: "depuis le 17 juin",
        badge: null,
      },
      {
        id: "rec-2",
        title: "Une source de légumes crus à chaque déjeuner",
        detail:
          "Crudités, herbes fraîches ou une salade à côté — ce qui passe le mieux au bureau.",
        meta: "depuis le 17 juin",
        badge: null,
      },
      {
        id: "rec-3",
        title: "Café après le petit-déjeuner, jamais à jeun",
        detail:
          "Les remontées acides du matin suivent exactement le café à jeun dans son journal.",
        meta: "depuis le 15 juillet",
        badge: { label: "à revoir", variant: "warning" },
      },
      {
        id: "rec-4",
        title: "Un aliment fermenté par jour",
        detail:
          "Kéfir, choucroute crue ou miso. Commencer petit : deux cuillères, pas un bol.",
        meta: "depuis le 12 août",
        badge: { label: "nouveau", variant: "info" },
      },
    ],
  },
  {
    category: "Rythme",
    rows: [
      {
        id: "rec-5",
        title: "Dîner terminé avant 20 h 30 en semaine",
        detail:
          "Les deux soirs de cours restent hors de la règle, c'est admis.",
        meta: "depuis le 29 juillet",
        badge: null,
      },
      {
        id: "rec-6",
        title: "Dix minutes de marche après le déjeuner",
        detail:
          "Pas un objectif sportif — c'est la digestion de l'après-midi qui est visée.",
        meta: "depuis le 29 juillet",
        badge: null,
      },
    ],
  },
  {
    category: "À surveiller",
    rows: [
      {
        id: "rec-7",
        title:
          "Noter les jours de ballonnements et ce qui a été mangé la veille",
        detail:
          "Deux semaines suffisent. On cherche un motif, pas un journal alimentaire complet.",
        meta: "depuis le 12 août",
        badge: null,
      },
    ],
  },
];

const camilleArchivedRecommendations: WorkspaceRow[] = [
  {
    id: "rec-a1",
    title: "Supprimer le gluten pendant trois semaines",
    detail:
      "Essayé en juin, sans effet net sur les ballonnements. Arrêté pour ne pas empiler les restrictions.",
    meta: "retirée le 15 juillet",
    badge: null,
  },
  {
    id: "rec-a2",
    title: "Une tisane de fenouil après chaque repas",
    detail: "Trop de gestes à tenir en même temps. Reportée, pas abandonnée.",
    meta: "retirée le 29 juillet",
    badge: null,
  },
  {
    id: "rec-a3",
    title: "Peser les portions de féculents",
    detail:
      "Contre-productif chez elle : la pesée a réveillé un rapport de contrôle qu'on ne veut pas nourrir.",
    meta: "retirée le 17 juin",
    badge: null,
  },
];

const camilleSupplements: WorkspaceList = {
  rows: [
    {
      id: "sup-1",
      title: "Magnésium bisglycinate",
      detail:
        "300 mg le soir, au dîner. Pour les crampes nocturnes et l'endormissement.",
      meta: "soir · depuis le 17 juin",
      badge: null,
    },
    {
      id: "sup-2",
      title: "Vitamine D3",
      detail:
        "2000 UI par jour avec un repas gras, jusqu'en avril. Dosage de novembre à revoir.",
      meta: "matin · depuis le 17 juin",
      badge: null,
    },
    {
      id: "sup-3",
      title: "Probiotique multi-souches",
      detail:
        "Une gélule à jeun le matin, huit semaines, puis on réévalue. Pas de renouvellement automatique.",
      meta: "matin · depuis le 12 août",
      badge: { label: "8 semaines", variant: "info" },
    },
    {
      id: "sup-4",
      title: "Oméga-3 EPA/DHA",
      detail:
        "1 g au déjeuner. Elle mange du poisson gras moins d'une fois par semaine.",
      meta: "midi · depuis le 29 juillet",
      badge: null,
    },
  ],
  archived: [
    {
      id: "sup-a1",
      title: "Fer bisglycinate",
      detail:
        "Arrêté après la prise de sang d'août — ferritine remontée à 68. Rien à compenser.",
      meta: "arrêté le 26 août",
      badge: null,
    },
    {
      id: "sup-a2",
      title: "Complexe B",
      detail: "Nausées le matin dès la deuxième semaine. Non remplacé.",
      meta: "arrêté le 15 juillet",
      badge: null,
    },
  ],
};

const camilleEssentials: WorkspaceList = {
  rows: [
    {
      id: "ess-1",
      title: "Œufs bio",
      detail: "Le petit-déjeuner tient ou ne tient pas à cette boîte-là.",
      meta: "frigo",
      badge: null,
    },
    {
      id: "ess-2",
      title: "Fromage blanc entier",
      detail: "L'alternative des matins pressés. Entier, pas 0 %.",
      meta: "frigo",
      badge: null,
    },
    {
      id: "ess-3",
      title: "Sardines à l'huile d'olive",
      detail: "Le déjeuner de secours quand il n'y a rien de préparé.",
      meta: "placard",
      badge: null,
    },
    {
      id: "ess-4",
      title: "Purée d'amandes complète",
      detail:
        "Pour la collation de 16 h, sur une pomme ou une tranche de pain.",
      meta: "placard",
      badge: null,
    },
    {
      id: "ess-5",
      title: "Choucroute crue",
      detail: "Deux cuillères par jour — le fermenté le plus facile chez elle.",
      meta: "frigo",
      badge: { label: "nouveau", variant: "info" },
    },
    {
      id: "ess-6",
      title: "Herbes fraîches",
      detail:
        "Persil, coriandre, ciboulette. Ce qui rend les crudités tenables.",
      meta: "frigo",
      badge: null,
    },
  ],
  archived: [
    {
      id: "ess-a1",
      title: "Lait d'avoine",
      detail: "Sorti de la liste avec le café à jeun : plus rien à y verser.",
      meta: "retiré le 15 juillet",
      badge: null,
    },
    {
      id: "ess-a2",
      title: "Galettes de riz soufflé",
      detail:
        "Ne tenaient pas jusqu'au repas suivant. Remplacées par les amandes.",
      meta: "retiré le 29 juillet",
      badge: null,
    },
  ],
};

const camilleRecipes: WorkspaceList = {
  rows: [
    {
      id: "rp-1",
      title: "Œufs brouillés aux herbes, pain au levain",
      detail:
        "Sept minutes. C'est la recette qui a rendu l'objectif petit-déjeuner tenable.",
      meta: "petit-déjeuner",
      badge: null,
    },
    {
      id: "rp-2",
      title: "Bol de sarrasin, sardines, crudités",
      detail: "Se prépare la veille et se mange froid au bureau.",
      meta: "déjeuner",
      badge: null,
    },
    {
      id: "rp-3",
      title: "Soupe de lentilles corail au curcuma",
      detail:
        "Pour les soirs de cours — prête en vingt minutes, dîner avant 20 h 30.",
      meta: "dîner",
      badge: { label: "nouveau", variant: "info" },
    },
    {
      id: "rp-4",
      title: "Poêlée de choux au miso",
      detail:
        "Le fermenté sous une forme chaude, pour les jours où le cru ne passe pas.",
      meta: "dîner",
      badge: null,
    },
  ],
  archived: [
    {
      id: "rp-a1",
      title: "Porridge d'avoine aux fruits rouges",
      detail:
        "Sorti du lot quand le petit-déjeuner est passé aux protéines. Gardé : il redeviendra utile.",
      meta: "retirée le 17 juin",
      badge: null,
    },
    {
      id: "rp-a2",
      title: "Salade de quinoa, feta, concombre",
      detail: "Remplacée par le bol de sarrasin, qui tient mieux au frigo.",
      meta: "retirée le 29 juillet",
      badge: null,
    },
    {
      id: "rp-a3",
      title: "Curry de pois chiches",
      detail: "Trop de ballonnements le lendemain, deux fois sur deux.",
      meta: "retirée le 12 août",
      badge: null,
    },
  ],
};

const camilleMeals: { entries: WorkspaceMeal[]; archived: WorkspaceMeal[] } = {
  entries: [
    {
      id: "meal-1",
      on: "2 septembre 2026",
      slot: "petit-déjeuner",
      text: "Deux œufs brouillés, une tranche de pain au levain, un café après.",
      feedback: null,
    },
    {
      id: "meal-2",
      on: "2 septembre 2026",
      slot: "déjeuner",
      text: "Bol de sarrasin avec sardines et concombre, mangé à 13 h 30 au bureau.",
      feedback: null,
    },
    {
      id: "meal-3",
      on: "1 septembre 2026",
      slot: "dîner",
      text: "Soupe de lentilles corail, une tartine. Dîner à 20 h 15, soir de cours.",
      feedback:
        "Exactement ce qu'on cherchait pour les mardis. Gardez cette soupe au congélateur en double portion.",
    },
    {
      id: "meal-4",
      on: "1 septembre 2026",
      slot: "collation",
      text: "Une pomme avec de la purée d'amandes, vers 16 h 30.",
      feedback: "Parfait. C'est la collation qui vous évite le dîner de 21 h.",
    },
    {
      id: "meal-5",
      on: "31 août 2026",
      slot: "petit-déjeuner",
      text: "Café seul, partie à 7 h pour Namur. Ballonnements dans le train.",
      feedback:
        "Le lien café à jeun / remontées se confirme une troisième fois. On garde deux œufs durs dans le sac les jours de trajet.",
    },
    {
      id: "meal-6",
      on: "30 août 2026",
      slot: "dîner",
      text: "Poêlée de choux au miso avec du riz. Digestion calme.",
      feedback:
        "Bien noté — le fermenté chaud passe mieux que le cru chez vous.",
    },
  ],
  archived: [
    {
      id: "meal-a1",
      on: "18 août 2026",
      slot: "déjeuner",
      text: "Sandwich de la gare, mangé debout.",
      feedback: "Rien à en tirer de plus, on sort l'entrée du journal actif.",
    },
    {
      id: "meal-a2",
      on: "14 août 2026",
      slot: "dîner",
      text: "Restaurant, entrée et plat. Pas de détail noté.",
      feedback: null,
    },
  ],
};

const camilleLearnings: WorkspaceList = {
  rows: [
    {
      id: "lrn-1",
      title: "Le café à jeun déclenche les remontées",
      detail:
        "Trois occurrences notées sur des repas différents, toujours les matins de trajet.",
      meta: "sur un repas · 31 août",
      badge: { label: "repas", variant: "info" },
    },
    {
      id: "lrn-2",
      title: "Le fermenté chaud passe, le cru ballonne",
      detail: "Miso et choucroute cuite oui, kéfir et choucroute crue non.",
      meta: "sur un repas · 30 août",
      badge: { label: "repas", variant: "info" },
    },
    {
      id: "lrn-3",
      title:
        "Elle abandonne quand la liste s'allonge, pas quand c'est difficile",
      detail:
        "Vrai en juin avec le gluten, vrai en juillet avec la pesée. C'est la consigne de l'accompagnement.",
      meta: "observation · 12 août",
      badge: { label: "observation", variant: "neutral" },
    },
    {
      id: "lrn-4",
      title: "Les mardis et jeudis ne seront jamais des soirs normaux",
      detail:
        "Cours de 19 h à 20 h. On construit autour, on ne lutte pas contre.",
      meta: "observation · 29 juillet",
      badge: { label: "observation", variant: "neutral" },
    },
  ],
  archived: [
    {
      id: "lrn-a1",
      title: "Suspicion d'intolérance au gluten",
      detail:
        "Trois semaines d'éviction sans effet net. L'hypothèse est close, pas mise de côté.",
      meta: "close le 15 juillet",
      badge: null,
    },
  ],
};

const camilleConsultations: WorkspaceRow[] = [
  {
    id: "cons-1",
    title: "Consultation du 26 août 2026",
    detail:
      "Prise de sang revue : ferritine à 68, fer arrêté. Petit-déjeuner acquis cinq matins sur sept. Le dîner reste le point dur — on ne touche pas au reste avant qu'il tienne. Probiotique reconduit jusqu'à la mi-octobre.",
    meta: "45 min · cabinet",
    badge: null,
  },
  {
    id: "cons-2",
    title: "Consultation du 12 août 2026",
    detail:
      "Ballonnements toujours présents mais moins fréquents. Ajout du fermenté quotidien et du probiotique. Consigne posée : ne rien ajouter tant que le petit-déjeuner n'est pas acquis.",
    meta: "45 min · visio",
    badge: null,
  },
  {
    id: "cons-3",
    title: "Consultation du 15 juillet 2026",
    detail:
      "Éviction du gluten sans effet — arrêtée. Café à jeun identifié comme déclencheur des remontées. Objectif eau retiré, il est acquis.",
    meta: "45 min · cabinet",
    badge: null,
  },
  {
    id: "cons-4",
    title: "Première consultation du 17 juin 2026",
    detail:
      "Anamnèse complète. Motif : ballonnements quotidiens depuis l'hiver, fringales de 11 h, sommeil haché. Trois recommandations posées, pas dix.",
    meta: "90 min · cabinet",
    badge: null,
  },
];

const camilleAnamnesis: AnamnesisCategory[] = [
  {
    id: "digestif",
    label: "Terrain digestif",
    entries: [
      {
        label: "Transit",
        value: "Alternance, tendance à la constipation les semaines chargées.",
      },
      {
        label: "Ballonnements",
        value: "Quotidiens depuis janvier, pic en fin d'après-midi au bureau.",
      },
      {
        label: "Reflux",
        value: "Le matin uniquement, les jours de café à jeun.",
      },
    ],
  },
  {
    id: "sommeil",
    label: "Sommeil et énergie",
    entries: [
      {
        label: "Endormissement",
        value: "20 à 40 minutes, mieux depuis le magnésium.",
      },
      {
        label: "Réveils",
        value: "Un réveil vers 3 h, deux à trois nuits par semaine.",
      },
      { label: "Énergie", value: "Creux net de 11 h et de 16 h 30." },
    ],
  },
  {
    id: "antecedents",
    label: "Antécédents",
    entries: [
      { label: "Médicaux", value: "Anémie ferriprive en 2023, corrigée." },
      { label: "Familiaux", value: "Diabète de type 2 côté paternel." },
    ],
  },
  {
    id: "gyneco",
    label: "Cycle et hormonal",
    entries: [
      {
        label: "Cycle",
        value: "Régulier, 28 jours. Syndrome prémenstruel marqué.",
      },
    ],
  },
  { id: "sportif", label: "Activité physique", entries: [] },
  { id: "environnement", label: "Environnement et expositions", entries: [] },
];

const camilleProfile: ProfileField[] = [
  { label: "Nom complet", value: "Camille Dubois" },
  { label: "Date de naissance", value: "14 mars 1991 (35 ans)" },
  { label: "Sexe", value: "Femme" },
  { label: "Taille", value: "168 cm" },
  { label: "Poids", value: "63 kg (26 août 2026)" },
  {
    label: "Profession",
    value: "Chargée de projet, déplacements hebdomadaires",
  },
  { label: "Langue", value: "Français" },
  { label: "Téléphone", value: null },
];

const camilleGlance: GlanceItem[] = [
  {
    id: "derniere-consultation",
    label: "Dernière consultation",
    value: "26 août 2026",
    hint: "Prochaine le 19 septembre",
    intent: null,
  },
  {
    id: "repas-en-attente",
    label: "Repas en attente de retour",
    value: "2",
    hint: "Les deux du 2 septembre",
    intent: "warning",
  },
  {
    id: "objectifs-actifs",
    label: "Objectifs actifs",
    value: "2 sur 3",
    hint: "Un atteint et retiré en juillet",
    intent: null,
  },
  {
    id: "consigne",
    label: "Consigne",
    value: "Ne rien ajouter avant que le petit-déjeuner tienne",
    hint: "posée le 12 août",
    intent: "info",
  },
  {
    id: "lien",
    label: "Lien ouvert",
    value: "Hier, 19 h 42",
    hint: "Quatre pages actives",
    intent: "success",
  },
];

const camille: PatientRecord = {
  clientId: "camille",
  pseudonym: "Camille D.",
  fullName: "Camille Dubois",
  status: "active",
  identity: "35 ans · femme · 168 cm · 63 kg",
  link: {
    url: "remi.health/p/8f3a-c1d9-4b22",
    sharedOn: "17 juin 2026",
    lastOpenedAt: "hier, 19 h 42",
    segments: ["Recommandations", "Essentiels", "Recettes", "Compléments"],
  },
  summary: {
    text: "Terrain digestif fragile depuis l'hiver, sur fond de fringales de 11 h et de sommeil haché. Le levier qui marche chez elle est la satiété du matin, pas la restriction : chaque fois qu'on a retiré quelque chose, elle a décroché. L'accompagnement avance donc par ajouts courts, un à la fois, avec un point toutes les deux semaines. Depuis août les ballonnements reculent et le fer est normalisé ; le dîner tardif des soirs de cours reste le dernier point dur.",
    revisedOn: "26 août 2026",
    revisionCount: 4,
  },
  goals: camilleGoals,
  archivedGoals: camilleArchivedGoals,
  instruction: camilleInstruction,
  recommendations: camilleRecommendations,
  archivedRecommendations: camilleArchivedRecommendations,
  supplements: camilleSupplements,
  essentials: camilleEssentials,
  recipes: camilleRecipes,
  meals: camilleMeals,
  learnings: camilleLearnings,
  consultations: camilleConsultations,
  anamnesis: camilleAnamnesis,
  profile: camilleProfile,
  consent:
    "Consentement recueilli le 17 juin 2026, en consultation. Couvre la tenue du dossier et le partage du lien patient. Révocable à tout moment.",
  glance: camilleGlance,
};

const thomas: PatientRecord = {
  clientId: "thomas",
  pseudonym: "Thomas L.",
  fullName: "Thomas Lemaire",
  status: "active",
  identity: "42 ans · homme · 181 cm · 88 kg",
  link: {
    url: "remi.health/p/2c7e-90ab-11f4",
    sharedOn: "3 juin 2026",
    lastOpenedAt: "il y a 9 jours",
    segments: ["Recommandations", "Essentiels"],
  },
  summary: {
    text: "Trois à quatre déplacements par semaine, repas pris debout ou sautés. Rien de ce qui suppose une cuisine ne tient chez lui. L'accompagnement porte sur ce qui se fait en gare et à l'hôtel — c'est la seule version qui a une chance d'être appliquée.",
    revisedOn: "11 août 2026",
    revisionCount: 2,
  },
  goals: [
    {
      id: "goal-dejeuner",
      title: "Un vrai déjeuner assis, trois jours sur cinq",
      why: "Sauter le déjeuner est ce qui produit le dîner de 22 h et la nuit courte derrière.",
      reached: false,
      checkIns: [
        {
          on: "11 août 2026",
          note: "Un jour sur cinq. Trois déplacements cette semaine-là, rien d'appliqué depuis neuf jours.",
          direction: "down",
        },
        {
          on: "28 juillet 2026",
          note: "Trois jours sur cinq, la semaine sans déplacement.",
          direction: "up",
        },
      ],
    },
  ],
  archivedGoals: [],
  instruction: {
    text: "Ne rien proposer qui suppose une cuisine. Tout doit être faisable en gare, à l'hôtel ou dans un train.",
    setOn: "3 juin 2026",
    superseded: [],
  },
  recommendations: [
    {
      category: "Alimentation",
      rows: [
        {
          id: "t-rec-1",
          title: "Un déjeuner assis, même court",
          detail:
            "Quinze minutes assis valent mieux qu'un sandwich correct mangé debout.",
          meta: "depuis le 3 juin",
          badge: null,
        },
        {
          id: "t-rec-2",
          title: "Deux fruits secs et des amandes dans la sacoche",
          detail: "Le filet qui évite le dîner de 22 h les jours de train.",
          meta: "depuis le 24 juin",
          badge: null,
        },
      ],
    },
  ],
  archivedRecommendations: [
    {
      id: "t-rec-a1",
      title: "Préparer les repas du dimanche pour la semaine",
      detail:
        "Trois semaines sans une seule préparation. La recommandation était fausse, pas lui.",
      meta: "retirée le 24 juin",
      badge: null,
    },
  ],
  supplements: {
    rows: [
      {
        id: "t-sup-1",
        title: "Vitamine D3",
        detail: "2000 UI par jour. Peu d'extérieur en semaine.",
        meta: "matin · depuis le 3 juin",
        badge: null,
      },
    ],
    archived: [],
  },
  essentials: {
    rows: [
      {
        id: "t-ess-1",
        title: "Amandes non salées",
        detail: "Un sachet dans la sacoche, remplacé le dimanche soir.",
        meta: "placard",
        badge: null,
      },
      {
        id: "t-ess-2",
        title: "Bananes",
        detail: "Ce qui s'achète partout, y compris dans une gare.",
        meta: "frigo",
        badge: null,
      },
    ],
    archived: [
      {
        id: "t-ess-a1",
        title: "Légumes surgelés",
        detail: "Jamais utilisés — il n'est pas là le soir.",
        meta: "retiré le 24 juin",
        badge: null,
      },
    ],
  },
  recipes: {
    rows: [
      {
        id: "t-rp-1",
        title: "Omelette de dix minutes",
        detail: "Pour les rares soirs à la maison.",
        meta: "dîner",
        badge: null,
      },
    ],
    archived: [],
  },
  meals: {
    entries: [
      {
        id: "t-meal-1",
        on: "24 août 2026",
        slot: "déjeuner",
        text: "Sandwich au comptoir, mangé debout entre deux trains.",
        feedback: null,
      },
    ],
    archived: [],
  },
  learnings: {
    rows: [
      {
        id: "t-lrn-1",
        title: "Les semaines de déplacement sont des semaines perdues",
        detail:
          "Deux fois sur deux. Il faut deux régimes de recommandations, pas un.",
        meta: "observation · 11 août",
        badge: { label: "observation", variant: "neutral" },
      },
    ],
    archived: [],
  },
  consultations: [
    {
      id: "t-cons-1",
      title: "Consultation du 11 août 2026",
      detail:
        "Rien d'appliqué depuis neuf jours, trois déplacements. On arrête d'ajouter et on réécrit les recommandations pour la vie en train.",
      meta: "30 min · visio",
      badge: null,
    },
    {
      id: "t-cons-2",
      title: "Première consultation du 3 juin 2026",
      detail:
        "Motif : fatigue de fin de journée et prise de poids sur deux ans. Anamnèse partielle, à compléter.",
      meta: "90 min · cabinet",
      badge: null,
    },
  ],
  anamnesis: [
    {
      id: "digestif",
      label: "Terrain digestif",
      entries: [{ label: "Transit", value: "Normal." }],
    },
    {
      id: "sommeil",
      label: "Sommeil et énergie",
      entries: [
        {
          label: "Coucher",
          value: "Après 23 h 30 les jours de retour tardif.",
        },
      ],
    },
    { id: "antecedents", label: "Antécédents", entries: [] },
    { id: "sportif", label: "Activité physique", entries: [] },
    { id: "environnement", label: "Environnement et expositions", entries: [] },
  ],
  profile: [
    { label: "Nom complet", value: "Thomas Lemaire" },
    { label: "Date de naissance", value: "8 février 1984 (42 ans)" },
    { label: "Sexe", value: "Homme" },
    { label: "Taille", value: "181 cm" },
    { label: "Poids", value: "88 kg (11 août 2026)" },
    {
      label: "Profession",
      value: "Commercial, trois à quatre déplacements par semaine",
    },
    { label: "Langue", value: "Français" },
    { label: "Téléphone", value: null },
  ],
  consent:
    "Consentement recueilli le 3 juin 2026, en consultation. Couvre la tenue du dossier et le partage du lien patient.",
  glance: [
    {
      id: "derniere-consultation",
      label: "Dernière consultation",
      value: "11 août 2026",
      hint: "Prochaine le 11 septembre",
      intent: null,
    },
    {
      id: "repas-en-attente",
      label: "Repas en attente de retour",
      value: "1",
      hint: "Depuis le 24 août",
      intent: "warning",
    },
    {
      id: "objectifs-actifs",
      label: "Objectifs actifs",
      value: "1",
      hint: "En recul au dernier point",
      intent: "error",
    },
    {
      id: "consigne",
      label: "Consigne",
      value: "Rien qui suppose une cuisine",
      hint: "posée le 3 juin",
      intent: "info",
    },
    {
      id: "lien",
      label: "Lien ouvert",
      value: "Il y a 9 jours",
      hint: "Deux pages actives",
      intent: "warning",
    },
  ],
};

const naima: PatientRecord = {
  clientId: "naima",
  pseudonym: "Naïma B.",
  fullName: "Naïma Benali",
  status: "active",
  identity: "29 ans · femme · 162 cm · 57 kg",
  link: {
    url: "remi.health/p/5d91-ff02-77c3",
    sharedOn: "21 avril 2026",
    lastOpenedAt: "ce matin, 7 h 15",
    segments: ["Recommandations", "Essentiels", "Recettes"],
  },
  summary: {
    text: "Ballonnements les jours de bureau, jamais le week-end — le motif est environnemental avant d'être alimentaire. Elle teste volontiers, ce qui rend les hypothèses rapides à trancher, à condition de n'en poser qu'une à la fois.",
    revisedOn: "19 août 2026",
    revisionCount: 3,
  },
  goals: [
    {
      id: "n-goal-ferment",
      title: "Un aliment fermenté par jour",
      why: "L'hypothèse la plus simple à tester avant de regarder le stress du bureau.",
      reached: false,
      checkIns: [
        {
          on: "19 août 2026",
          note: "Six jours sur sept. Kéfir le matin, sans difficulté.",
          direction: "up",
        },
      ],
    },
  ],
  archivedGoals: [
    {
      id: "n-goal-petitdej",
      title: "Ne plus sauter le petit-déjeuner",
      why: "Point de départ d'avril.",
      reached: true,
      checkIns: [
        {
          on: "17 juin 2026",
          note: "Acquis depuis six semaines. Retiré de la liste active.",
          direction: "up",
        },
      ],
    },
  ],
  instruction: {
    text: "Une hypothèse à la fois. Elle teste tout ce qu'on lui donne, ce qui rend deux tests simultanés illisibles.",
    setOn: "17 juin 2026",
    superseded: [],
  },
  recommendations: [
    {
      category: "Alimentation",
      rows: [
        {
          id: "n-rec-1",
          title: "Un aliment fermenté par jour",
          detail: "Kéfir le matin — c'est celui qui passe le mieux chez elle.",
          meta: "depuis le 17 juin",
          badge: null,
        },
        {
          id: "n-rec-2",
          title: "Déjeuner hors du bureau deux fois par semaine",
          detail:
            "Le test porte sur le contexte, pas sur le contenu de l'assiette.",
          meta: "depuis le 19 août",
          badge: { label: "nouveau", variant: "info" },
        },
      ],
    },
  ],
  archivedRecommendations: [
    {
      id: "n-rec-a1",
      title: "Réduire les crucifères",
      detail: "Sans effet sur les ballonnements du bureau. Hypothèse close.",
      meta: "retirée le 19 août",
      badge: null,
    },
  ],
  supplements: {
    rows: [
      {
        id: "n-sup-1",
        title: "Magnésium bisglycinate",
        detail: "200 mg le soir, pour la tension de fin de journée.",
        meta: "soir · depuis le 17 juin",
        badge: null,
      },
    ],
    archived: [
      {
        id: "n-sup-a1",
        title: "Enzymes digestives",
        detail: "Aucun effet après quatre semaines. Arrêtées.",
        meta: "arrêté le 19 août",
        badge: null,
      },
    ],
  },
  essentials: {
    rows: [
      {
        id: "n-ess-1",
        title: "Kéfir nature",
        detail: "Un verre le matin, avant le café.",
        meta: "frigo",
        badge: null,
      },
      {
        id: "n-ess-2",
        title: "Pois chiches en bocal",
        detail: "La base du déjeuner emporté.",
        meta: "placard",
        badge: null,
      },
    ],
    archived: [],
  },
  recipes: {
    rows: [
      {
        id: "n-rp-1",
        title: "Salade de pois chiches au citron confit",
        detail: "Se transporte, se mange froide, tient jusqu'à 16 h.",
        meta: "déjeuner",
        badge: null,
      },
    ],
    archived: [
      {
        id: "n-rp-a1",
        title: "Gratin de chou-fleur",
        detail: "Sorti avec l'hypothèse crucifères.",
        meta: "retirée le 19 août",
        badge: null,
      },
    ],
  },
  meals: {
    entries: [
      {
        id: "n-meal-1",
        on: "3 septembre 2026",
        slot: "petit-déjeuner",
        text: "Kéfir, deux tartines au levain, thé.",
        feedback:
          "Rien à changer. Le kéfir tient depuis six semaines, c'est acquis.",
      },
      {
        id: "n-meal-2",
        on: "2 septembre 2026",
        slot: "déjeuner",
        text: "Salade de pois chiches, mangée au bureau. Ballonnements vers 16 h.",
        feedback: null,
      },
    ],
    archived: [],
  },
  learnings: {
    rows: [
      {
        id: "n-lrn-1",
        title: "Les ballonnements sont liés au lieu, pas à l'assiette",
        detail:
          "Absents le week-end avec les mêmes aliments. Cinq semaines d'observation.",
        meta: "observation · 19 août",
        badge: { label: "observation", variant: "neutral" },
      },
    ],
    archived: [
      {
        id: "n-lrn-a1",
        title: "Piste crucifères",
        detail: "Close après quatre semaines d'éviction sans effet.",
        meta: "close le 19 août",
        badge: null,
      },
    ],
  },
  consultations: [
    {
      id: "n-cons-1",
      title: "Consultation du 19 août 2026",
      detail:
        "Piste crucifères close. Nouvelle hypothèse : le contexte du déjeuner. Une seule à la fois.",
      meta: "45 min · visio",
      badge: null,
    },
    {
      id: "n-cons-2",
      title: "Première consultation du 21 avril 2026",
      detail:
        "Motif : ballonnements de fin de journée et fatigue. Anamnèse complète.",
      meta: "90 min · cabinet",
      badge: null,
    },
  ],
  anamnesis: [
    {
      id: "digestif",
      label: "Terrain digestif",
      entries: [
        {
          label: "Ballonnements",
          value: "Jours de bureau uniquement, à partir de 16 h.",
        },
        { label: "Transit", value: "Régulier." },
      ],
    },
    {
      id: "sommeil",
      label: "Sommeil et énergie",
      entries: [{ label: "Sommeil", value: "Sept heures, sans réveil." }],
    },
    { id: "antecedents", label: "Antécédents", entries: [] },
    {
      id: "gyneco",
      label: "Cycle et hormonal",
      entries: [{ label: "Cycle", value: "Régulier, sans douleur." }],
    },
    { id: "environnement", label: "Environnement et expositions", entries: [] },
  ],
  profile: [
    { label: "Nom complet", value: "Naïma Benali" },
    { label: "Date de naissance", value: "2 octobre 1996 (29 ans)" },
    { label: "Sexe", value: "Femme" },
    { label: "Taille", value: "162 cm" },
    { label: "Poids", value: "57 kg (19 août 2026)" },
    { label: "Profession", value: "Développeuse, bureau partagé" },
    { label: "Langue", value: "Français" },
    { label: "Téléphone", value: null },
  ],
  consent:
    "Consentement recueilli le 21 avril 2026, en consultation. Couvre la tenue du dossier et le partage du lien patient.",
  glance: [
    {
      id: "derniere-consultation",
      label: "Dernière consultation",
      value: "19 août 2026",
      hint: "Prochaine le 2 septembre",
      intent: null,
    },
    {
      id: "repas-en-attente",
      label: "Repas en attente de retour",
      value: "1",
      hint: "Le déjeuner du 2 septembre",
      intent: "warning",
    },
    {
      id: "objectifs-actifs",
      label: "Objectifs actifs",
      value: "1 sur 2",
      hint: "Un atteint en juin",
      intent: null,
    },
    {
      id: "consigne",
      label: "Consigne",
      value: "Une hypothèse à la fois",
      hint: "posée le 17 juin",
      intent: "info",
    },
    {
      id: "lien",
      label: "Lien ouvert",
      value: "Ce matin, 7 h 15",
      hint: "Trois pages actives",
      intent: "success",
    },
  ],
};

/**
 * The early case, and it is on purpose: a layout that only works on a full
 * record is not a layout. Pierre has been invited and nothing else has
 * happened yet — the rail, the segments and the section index all have to hold
 * with almost nothing in them.
 */
const pierre: PatientRecord = {
  clientId: "pierre",
  pseudonym: "Pierre J.",
  fullName: "Pierre Janssens",
  status: "invited",
  identity: "51 ans · homme · profil à compléter",
  link: {
    url: "remi.health/p/a04b-6e17-c885",
    sharedOn: "30 juillet 2026",
    lastOpenedAt: null,
    segments: ["Recommandations"],
  },
  summary: null,
  goals: [],
  archivedGoals: [],
  instruction: null,
  recommendations: [],
  archivedRecommendations: [],
  supplements: { rows: [], archived: [] },
  essentials: { rows: [], archived: [] },
  recipes: { rows: [], archived: [] },
  meals: { entries: [], archived: [] },
  learnings: { rows: [], archived: [] },
  consultations: [],
  anamnesis: [
    { id: "digestif", label: "Terrain digestif", entries: [] },
    { id: "sommeil", label: "Sommeil et énergie", entries: [] },
    { id: "antecedents", label: "Antécédents", entries: [] },
    { id: "sportif", label: "Activité physique", entries: [] },
    { id: "environnement", label: "Environnement et expositions", entries: [] },
  ],
  profile: [
    { label: "Nom complet", value: "Pierre Janssens" },
    { label: "Date de naissance", value: "19 septembre 1974 (51 ans)" },
    { label: "Sexe", value: "Homme" },
    { label: "Taille", value: null },
    { label: "Poids", value: null },
    { label: "Profession", value: null },
    { label: "Langue", value: "Français" },
    { label: "Téléphone", value: null },
  ],
  consent:
    "Pas encore recueilli — l'invitation est partie le 30 juillet 2026 et n'a pas été acceptée.",
  glance: [
    {
      id: "derniere-consultation",
      label: "Dernière consultation",
      value: "Aucune",
      hint: "Première prévue le 14 septembre",
      intent: null,
    },
    {
      id: "repas-en-attente",
      label: "Repas en attente de retour",
      value: "0",
      hint: null,
      intent: null,
    },
    {
      id: "objectifs-actifs",
      label: "Objectifs actifs",
      value: "0",
      hint: "Rien avant la première consultation",
      intent: null,
    },
    {
      id: "consigne",
      label: "Consigne",
      value: "Aucune",
      hint: null,
      intent: null,
    },
    {
      id: "lien",
      label: "Lien ouvert",
      value: "Jamais",
      hint: "Invitation partie il y a cinq semaines",
      intent: "error",
    },
  ],
};

export const patientRecords: Record<string, PatientRecord> = {
  camille,
  thomas,
  naima,
  pierre,
};
