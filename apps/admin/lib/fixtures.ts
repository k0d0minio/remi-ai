/**
 * The console's data, standing in for reads that do not exist yet. Admin has no
 * backend, so these shapes are the contract the real queries will have to
 * satisfy — the screen is designed against them, and swapping in
 * `@remi/services/server` later changes the source, not the components.
 */

/** The shared intent vocabulary — the same five names as `Badge` and `Card`. */
export type Intent = "success" | "warning" | "error" | "info" | "neutral";

export type Operator = {
  name: string;
  email: string;
  role: string;
};

export type Deployment = {
  environment: string;
  release: string;
  /** When the figures on this page were last read. */
  checkedAt: string;
};

export type OperationsStat = {
  label: string;
  value: string;
  detail: string;
  badge: { label: string; intent: Intent };
  /**
   * Percent complete. Present only on the cohort stat — it is the one figure
   * measured against a fixed ceiling rather than counted upward.
   */
  progress?: number;
};

export type AttentionItem = {
  id: string;
  title: string;
  detail: string;
  /** The nav section an operator would go to in order to act on this. */
  area: string;
  age: string;
  status: string;
  intent: Intent;
};

export type SystemApp = {
  name: string;
  description: string;
  uptime: string;
  status: { label: string; intent: Intent };
};

export const operator: Operator = {
  name: "Dana Okafor",
  email: "dana@remi.internal",
  role: "Operations lead",
};

export const deployment: Deployment = {
  environment: "production",
  release: "2026.08.02-1",
  checkedAt: "today at 09:12",
};

/** The founding cohort is capped at fifteen — the number the pilot is sized to. */
export const operationsStats: OperationsStat[] = [
  {
    label: "Pilot practitioners onboarded",
    value: "11 / 15",
    detail: "Four spots left in the founding cohort.",
    badge: { label: "on track", intent: "success" },
    progress: 73,
  },
  {
    label: "Active patients",
    value: "128",
    detail: "Seen by a practitioner in the last 30 days.",
    badge: { label: "+14 this week", intent: "success" },
  },
  {
    label: "Plans published",
    value: "342",
    detail: "Across every practitioner in the cohort.",
    badge: { label: "+27 this week", intent: "info" },
  },
  {
    label: "Signals this week",
    value: "1,204",
    detail: "Meals, steps and check-ins logged by patients.",
    badge: { label: "6% below last week", intent: "warning" },
  },
];

export const attentionItems: AttentionItem[] = [
  {
    id: "plan-export",
    title: "Plan export failing for one practitioner",
    detail:
      "Three retries in a row on the same account. The download returns an empty file rather than an error.",
    area: "Support",
    age: "2 hours ago",
    status: "open",
    intent: "error",
  },
  {
    id: "cohort-invites",
    title: "Three onboarding invites still unopened",
    detail:
      "Sent six days ago to the last practitioners in the founding cohort. None has signed in yet.",
    area: "Pilot",
    age: "6 days ago",
    status: "needs a nudge",
    intent: "warning",
  },
  {
    id: "digest-bounces",
    title: "Weekly digest bounced for four patients",
    detail:
      "All four addresses are on the same domain, which suggests a receiving-side block rather than four bad addresses.",
    area: "Support",
    age: "yesterday",
    status: "investigating",
    intent: "warning",
  },
  {
    id: "flag-rollout",
    title: "Plan editor v2 is still on for the whole cohort",
    detail:
      "The flag was opened for a two-week trial that ended on Friday. It has had no owner since.",
    area: "Flags",
    age: "3 days ago",
    status: "review",
    intent: "info",
  },
  {
    id: "audit-export",
    title: "July audit export has not been downloaded",
    detail:
      "Generated on schedule and available for another 21 days before it is purged.",
    area: "Audit",
    age: "5 days ago",
    status: "reminder",
    intent: "neutral",
  },
];

/** Where a practitioner stands against the founding cohort. */
export type PractitionerStatus = "onboarded" | "invited" | "suspended";

export type RosterClient = {
  id: string;
  name: string;
  status: "active" | "invited" | "paused";
  plans: number;
  lastActive: string;
};

export type PractitionerActivity = {
  plansPublished: number;
  consultations: number;
  signalsReviewed: number;
  lastSignIn: string;
};

export type Practitioner = {
  id: string;
  name: string;
  specialty: string;
  practice: string;
  city: string;
  email: string;
  status: PractitionerStatus;
  /** Everyone on their books — more than the roster below lists. */
  clientCount: number;
  /** Null until they accept: an invited practitioner has no joining date. */
  joinedDate: string | null;
  invitedOn: string;
  /** The three most recently active of their clients, not the whole list. */
  roster: RosterClient[];
  activity: PractitionerActivity;
  /** Why access stands where it does, for the actions card to explain itself. */
  accessNote: string;
};

/**
 * Fifteen records against a cohort of fifteen seats, but only eleven of them
 * onboarded — the arithmetic on the overview ("11 / 15", "four spots left",
 * "three invites unopened") is the same arithmetic as this list, so a figure
 * that drifts on one screen is visibly wrong on the other.
 */
export const practitioners: Practitioner[] = [
  {
    id: "georges-mouton",
    name: "Dr Georges Mouton",
    specialty: "Médecine fonctionnelle",
    practice: "FunMedDev",
    city: "Brussels",
    email: "georges.mouton@funmeddev.be",
    status: "onboarded",
    clientCount: 18,
    joinedDate: "2 June 2026",
    invitedOn: "28 May 2026",
    roster: [
      {
        id: "camille-dubois",
        name: "Camille Dubois",
        status: "active",
        plans: 6,
        lastActive: "yesterday, 19:42",
      },
      {
        id: "thomas-lemaire",
        name: "Thomas Lemaire",
        status: "paused",
        plans: 3,
        lastActive: "9 days ago",
      },
      {
        id: "naima-benali",
        name: "Naïma Benali",
        status: "active",
        plans: 5,
        lastActive: "this morning, 07:15",
      },
    ],
    activity: {
      plansPublished: 52,
      consultations: 61,
      signalsReviewed: 384,
      lastSignIn: "today at 08:26",
    },
    accessNote:
      "Design partner since before the pilot opened. Full access, no restrictions applied.",
  },
  {
    id: "elodie-vanhove",
    name: "Élodie Vanhove",
    specialty: "Diététicienne",
    practice: "Cabinet Vanhove",
    city: "Ghent",
    email: "elodie@cabinetvanhove.be",
    status: "onboarded",
    clientCount: 16,
    joinedDate: "6 July 2026",
    invitedOn: "2 July 2026",
    roster: [
      {
        id: "lise-vermeulen",
        name: "Lise Vermeulen",
        status: "active",
        plans: 4,
        lastActive: "today, 09:04",
      },
      {
        id: "karim-haddad",
        name: "Karim Haddad",
        status: "active",
        plans: 3,
        lastActive: "yesterday, 21:10",
      },
      {
        id: "annelies-de-smet",
        name: "Annelies De Smet",
        status: "invited",
        plans: 0,
        lastActive: "never",
      },
    ],
    activity: {
      plansPublished: 44,
      consultations: 52,
      signalsReviewed: 296,
      lastSignIn: "today at 09:11",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "julien-delcourt",
    name: "Julien Delcourt",
    specialty: "Nutrithérapie",
    practice: "Centre Nutrisens",
    city: "Liège",
    email: "j.delcourt@nutrisens.be",
    status: "onboarded",
    clientCount: 14,
    joinedDate: "8 July 2026",
    invitedOn: "3 July 2026",
    roster: [
      {
        id: "margaux-gilson",
        name: "Margaux Gilson",
        status: "active",
        plans: 5,
        lastActive: "today, 07:48",
      },
      {
        id: "olivier-fontaine",
        name: "Olivier Fontaine",
        status: "active",
        plans: 4,
        lastActive: "2 days ago",
      },
      {
        id: "rachida-amrani",
        name: "Rachida Amrani",
        status: "paused",
        plans: 2,
        lastActive: "3 weeks ago",
      },
    ],
    activity: {
      plansPublished: 38,
      consultations: 47,
      signalsReviewed: 251,
      lastSignIn: "yesterday at 18:02",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "marie-claire-dubois",
    name: "Marie-Claire Dubois",
    specialty: "Diététicienne",
    practice: "Diététique du Sambre",
    city: "Namur",
    email: "mc.dubois@dietsambre.be",
    status: "onboarded",
    clientCount: 13,
    joinedDate: "9 July 2026",
    invitedOn: "3 July 2026",
    roster: [
      {
        id: "sarah-collard",
        name: "Sarah Collard",
        status: "active",
        plans: 4,
        lastActive: "today, 12:30",
      },
      {
        id: "bruno-piret",
        name: "Bruno Piret",
        status: "active",
        plans: 3,
        lastActive: "yesterday, 08:55",
      },
      {
        id: "leila-ouali",
        name: "Leïla Ouali",
        status: "active",
        plans: 3,
        lastActive: "4 days ago",
      },
    ],
    activity: {
      plansPublished: 35,
      consultations: 44,
      signalsReviewed: 238,
      lastSignIn: "today at 12:41",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "antoine-verbeke",
    name: "Antoine Verbeke",
    specialty: "Médecine fonctionnelle",
    practice: "Praktijk Verbeke",
    city: "Antwerp",
    email: "antoine@praktijkverbeke.be",
    status: "onboarded",
    clientCount: 12,
    joinedDate: "13 July 2026",
    invitedOn: "7 July 2026",
    roster: [
      {
        id: "els-baeten",
        name: "Els Baeten",
        status: "active",
        plans: 4,
        lastActive: "today, 06:52",
      },
      {
        id: "mehdi-tazi",
        name: "Mehdi Tazi",
        status: "active",
        plans: 2,
        lastActive: "3 days ago",
      },
      {
        id: "jan-de-cock",
        name: "Jan De Cock",
        status: "paused",
        plans: 1,
        lastActive: "2 weeks ago",
      },
    ],
    activity: {
      plansPublished: 31,
      consultations: 39,
      signalsReviewed: 204,
      lastSignIn: "today at 07:03",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "sophie-delvaux",
    name: "Sophie Delvaux",
    specialty: "Micronutrition",
    practice: "Cabinet Delvaux",
    city: "Louvain-la-Neuve",
    email: "sophie.delvaux@cabinetdelvaux.be",
    status: "onboarded",
    clientCount: 11,
    joinedDate: "15 July 2026",
    invitedOn: "9 July 2026",
    roster: [
      {
        id: "juliette-hermans",
        name: "Juliette Hermans",
        status: "active",
        plans: 3,
        lastActive: "yesterday, 17:20",
      },
      {
        id: "pierre-janssens",
        name: "Pierre Janssens",
        status: "invited",
        plans: 0,
        lastActive: "never",
      },
      {
        id: "fatima-el-idrissi",
        name: "Fatima El Idrissi",
        status: "active",
        plans: 4,
        lastActive: "today, 11:08",
      },
    ],
    activity: {
      plansPublished: 28,
      consultations: 36,
      signalsReviewed: 187,
      lastSignIn: "today at 11:15",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "nathalie-bruyere",
    name: "Nathalie Bruyère",
    specialty: "Diététicienne du sport",
    practice: "Nutrition & Performance",
    city: "Charleroi",
    email: "n.bruyere@nutriperf.be",
    status: "onboarded",
    clientCount: 11,
    joinedDate: "16 July 2026",
    invitedOn: "9 July 2026",
    roster: [
      {
        id: "gaetan-lardinois",
        name: "Gaëtan Lardinois",
        status: "active",
        plans: 5,
        lastActive: "today, 06:10",
      },
      {
        id: "ines-moreau",
        name: "Inès Moreau",
        status: "active",
        plans: 3,
        lastActive: "yesterday, 20:33",
      },
      {
        id: "simon-dethier",
        name: "Simon Dethier",
        status: "active",
        plans: 2,
        lastActive: "5 days ago",
      },
    ],
    activity: {
      plansPublished: 26,
      consultations: 41,
      signalsReviewed: 173,
      lastSignIn: "today at 06:22",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "laurent-peeters",
    name: "Laurent Peeters",
    specialty: "Nutrition clinique",
    practice: "Sint-Rafaël nutrition",
    city: "Leuven",
    email: "l.peeters@sintrafael.be",
    status: "onboarded",
    clientCount: 10,
    joinedDate: "20 July 2026",
    invitedOn: "14 July 2026",
    roster: [
      {
        id: "greet-vandenberghe",
        name: "Greet Vandenberghe",
        status: "active",
        plans: 3,
        lastActive: "today, 10:02",
      },
      {
        id: "youssef-benkirane",
        name: "Youssef Benkirane",
        status: "active",
        plans: 2,
        lastActive: "yesterday, 13:47",
      },
      {
        id: "martine-claes",
        name: "Martine Claes",
        status: "paused",
        plans: 1,
        lastActive: "11 days ago",
      },
    ],
    activity: {
      plansPublished: 24,
      consultations: 33,
      signalsReviewed: 152,
      lastSignIn: "today at 10:09",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "celine-marechal",
    name: "Céline Maréchal",
    specialty: "Naturopathie",
    practice: "Cabinet Maréchal",
    city: "Wavre",
    email: "celine@cabinetmarechal.be",
    status: "onboarded",
    clientCount: 9,
    joinedDate: "22 July 2026",
    invitedOn: "16 July 2026",
    roster: [
      {
        id: "aline-poncelet",
        name: "Aline Poncelet",
        status: "active",
        plans: 3,
        lastActive: "2 days ago",
      },
      {
        id: "damien-schmitz",
        name: "Damien Schmitz",
        status: "active",
        plans: 2,
        lastActive: "yesterday, 09:18",
      },
      {
        id: "nora-belkacem",
        name: "Nora Belkacem",
        status: "invited",
        plans: 0,
        lastActive: "never",
      },
    ],
    activity: {
      plansPublished: 21,
      consultations: 27,
      signalsReviewed: 118,
      lastSignIn: "yesterday at 16:40",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "vincent-charlier",
    name: "Vincent Charlier",
    specialty: "Médecine fonctionnelle",
    practice: "Centre Hainaut santé",
    city: "Mons",
    email: "v.charlier@hainautsante.be",
    status: "onboarded",
    clientCount: 8,
    joinedDate: "24 July 2026",
    invitedOn: "17 July 2026",
    roster: [
      {
        id: "estelle-dumont",
        name: "Estelle Dumont",
        status: "active",
        plans: 2,
        lastActive: "today, 08:44",
      },
      {
        id: "arnaud-lejeune",
        name: "Arnaud Lejeune",
        status: "active",
        plans: 2,
        lastActive: "3 days ago",
      },
      {
        id: "sanaa-cherkaoui",
        name: "Sanaa Cherkaoui",
        status: "active",
        plans: 1,
        lastActive: "yesterday, 22:05",
      },
    ],
    activity: {
      plansPublished: 18,
      consultations: 22,
      signalsReviewed: 96,
      lastSignIn: "today at 08:51",
    },
    accessNote: "Full access. Nothing has been restricted on this account.",
  },
  {
    id: "isabelle-coppens",
    name: "Isabelle Coppens",
    specialty: "Diététicienne",
    practice: "Voeding Coppens",
    city: "Bruges",
    email: "isabelle@voedingcoppens.be",
    status: "onboarded",
    clientCount: 6,
    joinedDate: "28 July 2026",
    invitedOn: "21 July 2026",
    roster: [
      {
        id: "wouter-maes",
        name: "Wouter Maes",
        status: "active",
        plans: 2,
        lastActive: "yesterday, 12:12",
      },
      {
        id: "chloe-verhaegen",
        name: "Chloé Verhaegen",
        status: "active",
        plans: 1,
        lastActive: "4 days ago",
      },
      {
        id: "tom-declercq",
        name: "Tom Declercq",
        status: "invited",
        plans: 0,
        lastActive: "never",
      },
    ],
    activity: {
      plansPublished: 12,
      consultations: 15,
      signalsReviewed: 61,
      lastSignIn: "2 days ago at 14:30",
    },
    accessNote:
      "Newest of the onboarded cohort. Full access, nothing restricted.",
  },
  {
    id: "hugo-lambrechts",
    name: "Hugo Lambrechts",
    specialty: "Nutrition clinique",
    practice: "Praktijk Lambrechts",
    city: "Hasselt",
    email: "hugo@praktijklambrechts.be",
    status: "invited",
    clientCount: 0,
    joinedDate: null,
    invitedOn: "28 July 2026",
    roster: [],
    activity: {
      plansPublished: 0,
      consultations: 0,
      signalsReviewed: 0,
      lastSignIn: "never",
    },
    accessNote:
      "Invite sent six days ago and still unopened. There is no account to suspend yet.",
  },
  {
    id: "aurelie-renard",
    name: "Aurélie Renard",
    specialty: "Diététicienne",
    practice: "Cabinet Renard",
    city: "Tournai",
    email: "a.renard@cabinetrenard.be",
    status: "invited",
    clientCount: 0,
    joinedDate: null,
    invitedOn: "28 July 2026",
    roster: [],
    activity: {
      plansPublished: 0,
      consultations: 0,
      signalsReviewed: 0,
      lastSignIn: "never",
    },
    accessNote:
      "Invite sent six days ago and still unopened. There is no account to suspend yet.",
  },
  {
    id: "benoit-stroobants",
    name: "Benoît Stroobants",
    specialty: "Micronutrition",
    practice: "Cabinet Stroobants",
    city: "Uccle",
    email: "benoit@cabinetstroobants.be",
    status: "invited",
    clientCount: 0,
    joinedDate: null,
    invitedOn: "28 July 2026",
    roster: [],
    activity: {
      plansPublished: 0,
      consultations: 0,
      signalsReviewed: 0,
      lastSignIn: "never",
    },
    accessNote:
      "Invite sent six days ago and still unopened. There is no account to suspend yet.",
  },
  {
    id: "camille-lefevre",
    name: "Camille Lefèvre",
    specialty: "Médecine fonctionnelle",
    practice: "Cabinet Lefèvre",
    city: "Ixelles",
    email: "camille@cabinetlefevre.be",
    status: "suspended",
    clientCount: 7,
    joinedDate: "4 July 2026",
    invitedOn: "1 July 2026",
    roster: [
      {
        id: "victor-hallet",
        name: "Victor Hallet",
        status: "paused",
        plans: 3,
        lastActive: "8 days ago",
      },
      {
        id: "amina-saidi",
        name: "Amina Saïdi",
        status: "paused",
        plans: 2,
        lastActive: "8 days ago",
      },
      {
        id: "brigitte-nys",
        name: "Brigitte Nys",
        status: "paused",
        plans: 2,
        lastActive: "10 days ago",
      },
    ],
    activity: {
      plansPublished: 13,
      consultations: 19,
      signalsReviewed: 74,
      lastSignIn: "30 July 2026 at 21:16",
    },
    accessNote:
      "Suspended on 30 July after two colleagues signed in on one account. Her seven clients are read-only until it is settled.",
  },
];

/** Where an application sits in the funnel. */
export type ApplicationStatus =
  "applied" | "invited" | "onboarded" | "declined";

export type PilotApplication = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  /** How they reached the pilot — the only acquisition read the console has. */
  source: string;
  appliedOn: string;
  status: ApplicationStatus;
};

/**
 * Seat accounting, not the application funnel — the two count different things
 * and conflating them is how "four spots left" and "three invites out" end up
 * contradicting each other on the same screen. Every figure here is the same
 * arithmetic as `practitioners` above: eleven onboarded, three invites out, one
 * suspended account that has given its seat back.
 */
export type PilotCohort = {
  /** The seats the pilot is sized to. Read-only here: it is a term, not a knob. */
  target: number;
  onboarded: number;
  invitesOut: number;
  suspended: number;
};

export const pilotCohort: PilotCohort = {
  target: 15,
  onboarded: 11,
  invitesOut: 3,
  suspended: 1,
};

/**
 * Every application since the window opened, ordered by what is waiting on an
 * operator: unanswered first, settled last. Each `onboarded` and `invited` row
 * names a practitioner who exists in `practitioners` above — this is how they
 * got there, not a second register of people.
 */
export const pilotApplications: PilotApplication[] = [
  {
    id: "app-samira-boulahia",
    name: "Samira Boulahia",
    specialty: "Micronutrition",
    city: "Schaerbeek",
    source: "Referred by Sophie Delvaux",
    appliedOn: "2 August 2026",
    status: "applied",
  },
  {
    id: "app-katrien-goossens",
    name: "Katrien Goossens",
    specialty: "Nutrition clinique",
    city: "Mechelen",
    source: "Pilot page",
    appliedOn: "1 August 2026",
    status: "applied",
  },
  {
    id: "app-mathieu-servais",
    name: "Mathieu Servais",
    specialty: "Nutrition du sport",
    city: "Liège",
    source: "Referred by Nathalie Bruyère",
    appliedOn: "30 July 2026",
    status: "applied",
  },
  {
    id: "app-francoise-thiry",
    name: "Françoise Thiry",
    specialty: "Diététicienne",
    city: "Arlon",
    source: "Pilot page",
    appliedOn: "29 July 2026",
    status: "applied",
  },
  {
    id: "app-benoit-stroobants",
    name: "Benoît Stroobants",
    specialty: "Micronutrition",
    city: "Uccle",
    source: "Pilot page",
    appliedOn: "26 July 2026",
    status: "invited",
  },
  {
    id: "app-aurelie-renard",
    name: "Aurélie Renard",
    specialty: "Diététicienne",
    city: "Tournai",
    source: "Referred by Marie-Claire Dubois",
    appliedOn: "25 July 2026",
    status: "invited",
  },
  {
    id: "app-hugo-lambrechts",
    name: "Hugo Lambrechts",
    specialty: "Nutrition clinique",
    city: "Hasselt",
    source: "Pilot page",
    appliedOn: "24 July 2026",
    status: "invited",
  },
  {
    id: "app-isabelle-coppens",
    name: "Isabelle Coppens",
    specialty: "Diététicienne",
    city: "Bruges",
    source: "UGent nutrition network",
    appliedOn: "18 July 2026",
    status: "onboarded",
  },
  {
    id: "app-vincent-charlier",
    name: "Vincent Charlier",
    specialty: "Médecine fonctionnelle",
    city: "Mons",
    source: "Referred by Julien Delcourt",
    appliedOn: "15 July 2026",
    status: "onboarded",
  },
  {
    id: "app-celine-marechal",
    name: "Céline Maréchal",
    specialty: "Naturopathie",
    city: "Wavre",
    source: "Pilot page",
    appliedOn: "13 July 2026",
    status: "onboarded",
  },
  {
    id: "app-laurent-peeters",
    name: "Laurent Peeters",
    specialty: "Nutrition clinique",
    city: "Leuven",
    source: "KU Leuven nutrition network",
    appliedOn: "11 July 2026",
    status: "onboarded",
  },
  {
    id: "app-nathalie-bruyere",
    name: "Nathalie Bruyère",
    specialty: "Diététicienne du sport",
    city: "Charleroi",
    source: "Referred by Marie-Claire Dubois",
    appliedOn: "7 July 2026",
    status: "onboarded",
  },
  {
    id: "app-sophie-delvaux",
    name: "Sophie Delvaux",
    specialty: "Micronutrition",
    city: "Louvain-la-Neuve",
    source: "Pilot page",
    appliedOn: "6 July 2026",
    status: "onboarded",
  },
  {
    id: "app-antoine-verbeke",
    name: "Antoine Verbeke",
    specialty: "Médecine fonctionnelle",
    city: "Antwerp",
    source: "Referred by Dr Georges Mouton",
    appliedOn: "4 July 2026",
    status: "onboarded",
  },
  {
    id: "app-marie-claire-dubois",
    name: "Marie-Claire Dubois",
    specialty: "Diététicienne",
    city: "Namur",
    source: "Pilot page",
    appliedOn: "2 July 2026",
    status: "onboarded",
  },
  {
    id: "app-julien-delcourt",
    name: "Julien Delcourt",
    specialty: "Nutrithérapie",
    city: "Liège",
    source: "Pilot page",
    appliedOn: "1 July 2026",
    status: "onboarded",
  },
  {
    id: "app-elodie-vanhove",
    name: "Élodie Vanhove",
    specialty: "Diététicienne",
    city: "Ghent",
    source: "Referred by Dr Georges Mouton",
    appliedOn: "1 July 2026",
    status: "onboarded",
  },
  {
    id: "app-camille-lefevre",
    name: "Camille Lefèvre",
    specialty: "Médecine fonctionnelle",
    city: "Ixelles",
    source: "Referred by Dr Georges Mouton",
    appliedOn: "30 June 2026",
    status: "onboarded",
  },
  {
    id: "app-georges-mouton",
    name: "Dr Georges Mouton",
    specialty: "Médecine fonctionnelle",
    city: "Brussels",
    source: "Design partner — approached directly",
    appliedOn: "28 May 2026",
    status: "onboarded",
  },
  {
    id: "app-philippe-warnier",
    name: "Philippe Warnier",
    specialty: "Médecine générale",
    city: "Verviers",
    source: "Pilot page",
    appliedOn: "12 July 2026",
    status: "declined",
  },
  {
    id: "app-dorothee-lallemand",
    name: "Dorothée Lallemand",
    specialty: "Naturopathie",
    city: "Dinant",
    source: "Pilot page",
    appliedOn: "14 July 2026",
    status: "declined",
  },
  {
    id: "app-steven-vandewalle",
    name: "Steven Vandewalle",
    specialty: "Nutrition clinique",
    city: "Kortrijk",
    source: "UGent nutrition network",
    appliedOn: "21 July 2026",
    status: "declined",
  },
];

export type PilotTerm = {
  label: string;
  value: string;
  detail: string;
};

/**
 * The pilot agreement, rendered rather than edited. Every line here is fixed by
 * a signed document, so the console shows what was agreed and offers no control
 * to change it — an operator who could edit the price from a table would be one
 * mis-click from a term nobody agreed to.
 */
export const pilotTerms: PilotTerm[] = [
  {
    label: "Price",
    value: "€24.50 / month",
    detail:
      "Per practitioner, VAT excluded. Held for the founding cohort's first year.",
  },
  {
    label: "Cohort size",
    value: "15 practitioners",
    detail:
      "The ceiling the pilot is sized to. Raising it is a product decision, not an operator one.",
  },
  {
    label: "Enrolment window",
    value: "1 July – 31 August 2026",
    detail: "Applications arriving after the window are held, not rejected.",
  },
  {
    label: "Billing starts",
    value: "1 September 2026",
    detail: "The pilot runs free until the window closes.",
  },
  {
    label: "Commitment",
    value: "Month to month",
    detail:
      "No minimum term. Cancelling leaves the practitioner's plans exportable for 90 days.",
  },
];

export const systemApps: SystemApp[] = [
  {
    name: "Web",
    description: "The product — the signed-in surface.",
    uptime: "99.98%",
    status: { label: "operational", intent: "success" },
  },
  {
    name: "Marketing",
    description: "The public site.",
    uptime: "100%",
    status: { label: "operational", intent: "success" },
  },
  {
    name: "Docs",
    description: "The reference site.",
    uptime: "100%",
    status: { label: "operational", intent: "success" },
  },
  {
    name: "Support",
    description: "Help centre and ticket intake.",
    uptime: "99.95%",
    status: { label: "operational", intent: "success" },
  },
  {
    name: "Demo",
    description: "The prototype sandbox.",
    uptime: "99.90%",
    status: { label: "operational", intent: "success" },
  },
];
