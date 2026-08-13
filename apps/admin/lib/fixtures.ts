import type { AppKey } from "@remi/services/shared";

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
  /**
   * Which deployment this row is. The origin is not stored here: uptime is a
   * stand-in figure, but where an app answers is real configuration, and it has
   * exactly one home — `@remi/services/shared` → `links.ts`. The row carries the
   * key and the component asks for the URL.
   */
  app: AppKey;
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
 *
 * Every person, practice and address below is invented. A fabricated client
 * roster or sign-in history hung on a real, identifiable practitioner is
 * personal data under GDPR, so no fixture may name one — and every address
 * sits on the `.example` TLD, which RFC 2606 reserves and which can never
 * route, so a console mistake cannot reach a real inbox either.
 */
export const practitioners: Practitioner[] = [
  {
    id: "helene-vasseur",
    name: "Dr Hélène Vasseur",
    specialty: "Médecine fonctionnelle",
    practice: "Cabinet Vasseur",
    city: "Waterloo",
    email: "h.vasseur@cabinetvasseur.example",
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
    email: "elodie@cabinetvanhove.example",
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
    practice: "Centre Delcourt",
    city: "Liège",
    email: "j.delcourt@centredelcourt.example",
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
    email: "mc.dubois@dietsambre.example",
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
    email: "antoine@praktijkverbeke.example",
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
    email: "sophie.delvaux@cabinetdelvaux.example",
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
    email: "n.bruyere@nutriperf.example",
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
    practice: "Praktijk Peeters",
    city: "Leuven",
    email: "l.peeters@praktijkpeeters.example",
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
    email: "celine@cabinetmarechal.example",
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
    email: "v.charlier@hainautsante.example",
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
    email: "isabelle@voedingcoppens.example",
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
    email: "hugo@praktijklambrechts.example",
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
    email: "a.renard@cabinetrenard.example",
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
    email: "benoit@cabinetstroobants.example",
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
    email: "camille@cabinetlefevre.example",
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
    source: "Referred by Dr Hélène Vasseur",
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
    source: "Referred by Dr Hélène Vasseur",
    appliedOn: "1 July 2026",
    status: "onboarded",
  },
  {
    id: "app-camille-lefevre",
    name: "Camille Lefèvre",
    specialty: "Médecine fonctionnelle",
    city: "Ixelles",
    source: "Referred by Dr Hélène Vasseur",
    appliedOn: "30 June 2026",
    status: "onboarded",
  },
  {
    id: "app-helene-vasseur",
    name: "Dr Hélène Vasseur",
    specialty: "Médecine fonctionnelle",
    city: "Waterloo",
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

/**
 * The other five surfaces. Admin itself is missing on purpose — an operator
 * reading this card is already standing in it.
 */
export const systemApps: SystemApp[] = [
  {
    app: "web",
    name: "Web",
    description: "The product — the signed-in surface.",
    uptime: "99.98%",
    status: { label: "operational", intent: "success" },
  },
  {
    app: "marketing",
    name: "Marketing",
    description: "The public site.",
    uptime: "100%",
    status: { label: "operational", intent: "success" },
  },
  {
    app: "docs",
    name: "Docs",
    description: "The reference site.",
    uptime: "100%",
    status: { label: "operational", intent: "success" },
  },
  {
    app: "support",
    name: "Support",
    description: "Help centre and ticket intake.",
    uptime: "99.95%",
    status: { label: "operational", intent: "success" },
  },
  {
    app: "demo",
    name: "Demo",
    description: "The prototype sandbox.",
    uptime: "99.90%",
    status: { label: "operational", intent: "success" },
  },
];

/** Where a ticket sits: open needs an answer, pending waits on the requester. */
export type TicketStatus = "open" | "pending" | "resolved";

/** How hard the ticket pulls. Four levels, because five is a discussion. */
export type TicketPriority = "urgent" | "high" | "normal" | "low";

export type TicketMessage = {
  id: string;
  author: string;
  /** Which side of the conversation wrote it — the thread is laid out from this. */
  side: "requester" | "operator";
  sentAt: string;
  body: string;
};

export type SupportTicket = {
  id: string;
  /** What an operator says out loud on a call — the ticket's public handle. */
  reference: string;
  subject: string;
  requester: {
    name: string;
    email: string;
    practice: string;
  };
  status: TicketStatus;
  priority: TicketPriority;
  /** Since it was raised, not since it was last touched. */
  age: string;
  lastReply: string;
  /** Oldest first, so the pane reads top to bottom like the conversation did. */
  thread: TicketMessage[];
};

/**
 * The inbox, ordered the way an operator works it: open first, then pending,
 * then what is already settled. Two of these are the same incidents the overview
 * raises — the plan export and the bounced digests — so a ticket closed here and
 * an item still flagged there would be visibly contradictory rather than quietly
 * so. Everyone writing in is a practitioner who exists in `practitioners` above.
 */
export const supportTickets: SupportTicket[] = [
  {
    id: "tkt-plan-export",
    reference: "REM-2481",
    subject: "Plan export downloads an empty file",
    requester: {
      name: "Julien Delcourt",
      email: "j.delcourt@centredelcourt.example",
      practice: "Centre Delcourt",
    },
    status: "open",
    priority: "urgent",
    age: "2 hours ago",
    lastReply: "2 hours ago",
    thread: [
      {
        id: "tkt-plan-export-1",
        author: "Julien Delcourt",
        side: "requester",
        sentAt: "today at 08:41",
        body: "I have tried three times this morning to export a plan for one of my patients and each time the PDF arrives with nothing in it — 0 KB. No error on screen, the download just starts and finishes. It works for my other patients.",
      },
      {
        id: "tkt-plan-export-2",
        author: "Dana Okafor",
        side: "operator",
        sentAt: "today at 09:02",
        body: "Thanks Julien — I can see the three attempts on our side and they all return a success. Could you tell me which patient it is? If it is only one of them, something in that plan is likely tripping the renderer rather than the export itself.",
      },
      {
        id: "tkt-plan-export-3",
        author: "Julien Delcourt",
        side: "requester",
        sentAt: "today at 09:20",
        body: "It is Margaux Gilson's plan — the long one, five weeks with the supplement schedule at the end. Happy to try a different browser if that helps narrow it down.",
      },
    ],
  },
  {
    id: "tkt-digest-bounces",
    reference: "REM-2477",
    subject: "Four patients are not receiving the weekly digest",
    requester: {
      name: "Élodie Vanhove",
      email: "elodie@cabinetvanhove.example",
      practice: "Cabinet Vanhove",
    },
    status: "open",
    priority: "high",
    age: "yesterday",
    lastReply: "yesterday",
    thread: [
      {
        id: "tkt-digest-bounces-1",
        author: "Élodie Vanhove",
        side: "requester",
        sentAt: "yesterday at 14:12",
        body: "Four of my patients say they have stopped getting the Monday digest. They all work at the same hospital, so I suspect it is their side, but I would rather ask than assume.",
      },
      {
        id: "tkt-digest-bounces-2",
        author: "Dana Okafor",
        side: "operator",
        sentAt: "yesterday at 15:48",
        body: "Your instinct is right — all four addresses are on one domain and every send since 21 July has bounced with the same rejection code. That is a receiving-side block, not four bad addresses. I am putting together what their IT team will need to allow us through and will send it over.",
      },
    ],
  },
  {
    id: "tkt-invite-unopened",
    reference: "REM-2474",
    subject: "Did my invite actually go out?",
    requester: {
      name: "Hugo Lambrechts",
      email: "hugo@praktijklambrechts.example",
      practice: "Praktijk Lambrechts",
    },
    status: "open",
    priority: "normal",
    age: "2 days ago",
    lastReply: "2 days ago",
    thread: [
      {
        id: "tkt-invite-unopened-1",
        author: "Hugo Lambrechts",
        side: "requester",
        sentAt: "1 August 2026 at 11:30",
        body: "I applied for the pilot a couple of weeks ago and was told an invite was on its way, but nothing has arrived. I have checked the spam folder. Could you resend it to this address?",
      },
    ],
  },
  {
    id: "tkt-patient-locked-out",
    reference: "REM-2469",
    subject: "Patient cannot sign in after changing her email",
    requester: {
      name: "Marie-Claire Dubois",
      email: "mc.dubois@dietsambre.example",
      practice: "Diététique du Sambre",
    },
    status: "pending",
    priority: "high",
    age: "3 days ago",
    lastReply: "yesterday",
    thread: [
      {
        id: "tkt-patient-locked-out-1",
        author: "Marie-Claire Dubois",
        side: "requester",
        sentAt: "31 July 2026 at 09:05",
        body: "One of my patients changed her email address in her profile and now cannot sign in with either the old one or the new one. She has an appointment on Thursday and would like her plan back before then.",
      },
      {
        id: "tkt-patient-locked-out-2",
        author: "Dana Okafor",
        side: "operator",
        sentAt: "31 July 2026 at 10:22",
        body: "The change went through on our side but the confirmation was never opened, so the account is sitting between the two addresses. I can move it to the new one manually. Could you confirm with her which address she wants to keep, in writing?",
      },
      {
        id: "tkt-patient-locked-out-3",
        author: "Marie-Claire Dubois",
        side: "requester",
        sentAt: "yesterday at 16:40",
        body: "Asked her this afternoon — waiting on her reply. I will forward it as soon as it lands.",
      },
    ],
  },
  {
    id: "tkt-billing-vat",
    reference: "REM-2463",
    subject: "VAT number missing from the pilot invoice",
    requester: {
      name: "Laurent Peeters",
      email: "l.peeters@praktijkpeeters.example",
      practice: "Praktijk Peeters",
    },
    status: "pending",
    priority: "normal",
    age: "5 days ago",
    lastReply: "4 days ago",
    thread: [
      {
        id: "tkt-billing-vat-1",
        author: "Laurent Peeters",
        side: "requester",
        sentAt: "29 July 2026 at 13:55",
        body: "My accountant needs our VAT number on the invoice. The pilot is free until September, but she would like the paperwork correct before the first real one arrives.",
      },
      {
        id: "tkt-billing-vat-2",
        author: "Sam Verhoeven",
        side: "operator",
        sentAt: "30 July 2026 at 08:30",
        body: "Reasonable, and easier to fix now than in September. Send me the number and I will add it to the practice's billing details so every invoice from the first one onward carries it.",
      },
    ],
  },
  {
    id: "tkt-shared-account",
    reference: "REM-2455",
    subject: "Access suspended without warning",
    requester: {
      name: "Camille Lefèvre",
      email: "camille@cabinetlefevre.example",
      practice: "Cabinet Lefèvre",
    },
    status: "pending",
    priority: "urgent",
    age: "4 days ago",
    lastReply: "3 days ago",
    thread: [
      {
        id: "tkt-shared-account-1",
        author: "Camille Lefèvre",
        side: "requester",
        sentAt: "30 July 2026 at 21:40",
        body: "I have just been locked out and my patients tell me they can only read their plans. Nobody told me this was coming. What has happened?",
      },
      {
        id: "tkt-shared-account-2",
        author: "Dana Okafor",
        side: "operator",
        sentAt: "31 July 2026 at 08:15",
        body: "Two people signed in on your account from different places within the same hour, which is what triggered the suspension. Patient records sit behind that account, so we stop first and ask afterwards. If a colleague is working with you, they need their own seat — I can set one up today and lift the suspension at the same time.",
      },
    ],
  },
  {
    id: "tkt-photo-upload",
    reference: "REM-2448",
    subject: "Meal photos fail to upload from the phone",
    requester: {
      name: "Nathalie Bruyère",
      email: "n.bruyere@nutriperf.example",
      practice: "Nutrition & Performance",
    },
    status: "resolved",
    priority: "normal",
    age: "8 days ago",
    lastReply: "6 days ago",
    thread: [
      {
        id: "tkt-photo-upload-1",
        author: "Nathalie Bruyère",
        side: "requester",
        sentAt: "26 July 2026 at 18:20",
        body: "Two of my athletes cannot attach meal photos — the upload spins and then gives up. Both on iPhones, both on the same version.",
      },
      {
        id: "tkt-photo-upload-2",
        author: "Priya Raman",
        side: "operator",
        sentAt: "27 July 2026 at 09:10",
        body: "Photo logging was still behind a flag for their practice, so the upload had nowhere to go and failed silently rather than saying so. I have opened it for the whole cohort and asked for the silent failure to be turned into a real message.",
      },
      {
        id: "tkt-photo-upload-3",
        author: "Nathalie Bruyère",
        side: "requester",
        sentAt: "28 July 2026 at 07:45",
        body: "Both of them uploaded this morning without trouble. Thank you.",
      },
    ],
  },
  {
    id: "tkt-plan-duplicate",
    reference: "REM-2441",
    subject: "Duplicating a plan drops the supplement schedule",
    requester: {
      name: "Sophie Delvaux",
      email: "sophie.delvaux@cabinetdelvaux.example",
      practice: "Cabinet Delvaux",
    },
    status: "resolved",
    priority: "low",
    age: "11 days ago",
    lastReply: "9 days ago",
    thread: [
      {
        id: "tkt-plan-duplicate-1",
        author: "Sophie Delvaux",
        side: "requester",
        sentAt: "23 July 2026 at 10:02",
        body: "When I duplicate a plan the meals come across but the supplement schedule is empty. Not urgent — I have been retyping it — but it costs me ten minutes each time.",
      },
      {
        id: "tkt-plan-duplicate-2",
        author: "Priya Raman",
        side: "operator",
        sentAt: "25 July 2026 at 14:26",
        body: "Reproduced and fixed in Friday's release — the copy was only carrying the meal blocks. Duplicates made from now on bring the schedule with them; the ones you already made will still need the retype, sorry.",
      },
    ],
  },
];

/** Who a flag is open to. Narrow to wide, and never wider than it says. */
export type FlagScope = "internal" | "staging" | "pilot cohort" | "production";

export type FeatureFlag = {
  /** The key the code reads. Kebab-case, and the same string in both places. */
  id: string;
  label: string;
  description: string;
  scope: FlagScope;
  enabled: boolean;
  updatedBy: string;
  updatedOn: string;
};

/**
 * The roadmap, as switches. Every flag here names something that either ships or
 * does not, so the list doubles as the honest answer to "what is actually on for
 * the cohort today" — which is a different question from what the marketing site
 * says is coming.
 *
 * `plan-editor-v2` is on for everyone with nobody owning it, which is the item
 * the overview raises; leaving it visibly on rather than quietly tidy is the
 * point of having the screen.
 */
export const featureFlags: FeatureFlag[] = [
  {
    id: "messaging",
    label: "Practitioner and patient messaging",
    description:
      "In-product messages between a practitioner and their patients, threaded against the plan rather than an inbox.",
    scope: "pilot cohort",
    enabled: true,
    updatedBy: "Dana Okafor",
    updatedOn: "24 July 2026",
  },
  {
    id: "photo-logging",
    label: "Meal photo logging",
    description:
      "Patients attach a photo to a meal instead of describing it. Opened for the whole cohort after uploads failed silently behind the flag.",
    scope: "pilot cohort",
    enabled: true,
    updatedBy: "Priya Raman",
    updatedOn: "27 July 2026",
  },
  {
    id: "labs-timeline",
    label: "Lab results timeline",
    description:
      "Blood panels plotted over time beside the plan, so a practitioner reads the trend rather than a stack of PDFs.",
    scope: "staging",
    enabled: true,
    updatedBy: "Marc Delhaize",
    updatedOn: "1 August 2026",
  },
  {
    id: "weekly-ai-recap",
    label: "Weekly AI recap",
    description:
      "A written summary of a patient's week, drafted from their signals for the practitioner to edit before it sends.",
    scope: "internal",
    enabled: true,
    updatedBy: "Marc Delhaize",
    updatedOn: "31 July 2026",
  },
  {
    id: "wearables",
    label: "Wearable sync",
    description:
      "Steps, sleep and heart rate pulled from a patient's watch. Off everywhere until the consent copy has been reviewed.",
    scope: "internal",
    enabled: false,
    updatedBy: "Dana Okafor",
    updatedOn: "18 July 2026",
  },
  {
    id: "telehealth",
    label: "Telehealth consultations",
    description:
      "Video appointments booked and held in the product. Not started — the flag exists so the surrounding work can be built against it.",
    scope: "internal",
    enabled: false,
    updatedBy: "Marc Delhaize",
    updatedOn: "9 July 2026",
  },
  {
    id: "plan-editor-v2",
    label: "Plan editor v2",
    description:
      "The rebuilt editor with drag-and-drop weeks. Opened for a two-week trial that ended on Friday and has had no owner since.",
    scope: "production",
    enabled: true,
    updatedBy: "Priya Raman",
    updatedOn: "17 July 2026",
  },
  {
    id: "bulk-patient-invites",
    label: "Bulk patient invites",
    description:
      "Invite a whole practice list from one paste. Held back until the invite email survives a hundred sends in a minute.",
    scope: "staging",
    enabled: false,
    updatedBy: "Sam Verhoeven",
    updatedOn: "22 July 2026",
  },
  {
    id: "dutch-locale",
    label: "Dutch interface",
    description:
      "The product in Dutch. On in staging while the last plan-editor strings are translated; five of the cohort are waiting on it.",
    scope: "staging",
    enabled: true,
    updatedBy: "Sam Verhoeven",
    updatedOn: "29 July 2026",
  },
  {
    id: "monthly-audit-export",
    label: "Monthly audit export",
    description:
      "A signed export of this log, generated on the first of each month and kept for 30 days.",
    scope: "production",
    enabled: true,
    updatedBy: "Dana Okafor",
    updatedOn: "1 July 2026",
  },
];

/** What an entry is about, and the only axis the log is filtered on. */
export type AuditKind =
  "flag" | "access" | "invite" | "content" | "export" | "support";

export type AuditEntry = {
  id: string;
  /** Display form, newest first. The real column will be a timestamp. */
  at: string;
  operator: string;
  action: string;
  /** What the action was done to — a flag key, a person, a template. */
  target: string;
  kind: AuditKind;
};

/**
 * Everything operators have done, newest first. The console's other screens show
 * state; this one shows how the state got there, which is the question that
 * matters after an incident — a suspension with no author is how an argument
 * about what happened becomes unwinnable.
 *
 * The entries are the same events the rest of the fixtures imply: Camille
 * Lefèvre's suspension on 30 July, the three invites that went out on 28 July,
 * the photo-logging flag opened while a ticket was being answered.
 */
export const auditEntries: AuditEntry[] = [
  {
    id: "aud-0130",
    at: "3 August 2026, 09:12",
    operator: "Dana Okafor",
    action: "Signed in to the console",
    target: "admin.remi.app",
    kind: "access",
  },
  {
    id: "aud-0129",
    at: "3 August 2026, 09:04",
    operator: "Sam Verhoeven",
    action: "Ticket assigned",
    target: "REM-2481 — plan export downloads an empty file",
    kind: "support",
  },
  {
    id: "aud-0128",
    at: "3 August 2026, 08:52",
    operator: "Priya Raman",
    action: "Ticket reopened",
    target: "REM-2477 — weekly digest not received",
    kind: "support",
  },
  {
    id: "aud-0127",
    at: "2 August 2026, 17:20",
    operator: "Marc Delhaize",
    action: "Flag scope narrowed to staging",
    target: "labs-timeline",
    kind: "flag",
  },
  {
    id: "aud-0126",
    at: "2 August 2026, 16:41",
    operator: "Dana Okafor",
    action: "Application received",
    target: "Samira Boulahia — Schaerbeek",
    kind: "invite",
  },
  {
    id: "aud-0125",
    at: "2 August 2026, 11:08",
    operator: "Priya Raman",
    action: "Plan template edited",
    target: "Elimination protocol v3",
    kind: "content",
  },
  {
    id: "aud-0124",
    at: "1 August 2026, 15:33",
    operator: "Marc Delhaize",
    action: "Flag enabled",
    target: "labs-timeline",
    kind: "flag",
  },
  {
    id: "aud-0123",
    at: "1 August 2026, 14:02",
    operator: "Sam Verhoeven",
    action: "Ticket resolved",
    target: "REM-2431 — digest arriving on Tuesday",
    kind: "support",
  },
  {
    id: "aud-0122",
    at: "1 August 2026, 09:47",
    operator: "Dana Okafor",
    action: "Application received",
    target: "Katrien Goossens — Mechelen",
    kind: "invite",
  },
  {
    id: "aud-0121",
    at: "31 July 2026, 16:15",
    operator: "Marc Delhaize",
    action: "Flag enabled",
    target: "weekly-ai-recap",
    kind: "flag",
  },
  {
    id: "aud-0120",
    at: "31 July 2026, 10:22",
    operator: "Dana Okafor",
    action: "Ticket replied to",
    target: "REM-2469 — patient cannot sign in",
    kind: "support",
  },
  {
    id: "aud-0119",
    at: "31 July 2026, 08:15",
    operator: "Dana Okafor",
    action: "Ticket replied to",
    target: "REM-2455 — access suspended without warning",
    kind: "support",
  },
  {
    id: "aud-0118",
    at: "30 July 2026, 21:16",
    operator: "Dana Okafor",
    action: "Practitioner access suspended",
    target: "Camille Lefèvre — two sign-ins on one account",
    kind: "access",
  },
  {
    id: "aud-0117",
    at: "30 July 2026, 21:14",
    operator: "Dana Okafor",
    action: "Client records set to read-only",
    target: "Cabinet Lefèvre — 7 clients",
    kind: "access",
  },
  {
    id: "aud-0116",
    at: "30 July 2026, 08:30",
    operator: "Sam Verhoeven",
    action: "Billing details edited",
    target: "Praktijk Peeters — VAT number",
    kind: "content",
  },
  {
    id: "aud-0115",
    at: "29 July 2026, 18:05",
    operator: "Sam Verhoeven",
    action: "Flag enabled",
    target: "dutch-locale",
    kind: "flag",
  },
  {
    id: "aud-0114",
    at: "29 July 2026, 06:00",
    operator: "Automated — monthly export",
    action: "Audit export generated",
    target: "July 2026 — not yet downloaded",
    kind: "export",
  },
  {
    id: "aud-0113",
    at: "28 July 2026, 15:48",
    operator: "Dana Okafor",
    action: "Practitioner invited",
    target: "Hugo Lambrechts — Praktijk Lambrechts",
    kind: "invite",
  },
  {
    id: "aud-0112",
    at: "28 July 2026, 15:46",
    operator: "Dana Okafor",
    action: "Practitioner invited",
    target: "Aurélie Renard — Cabinet Renard",
    kind: "invite",
  },
  {
    id: "aud-0111",
    at: "28 July 2026, 15:44",
    operator: "Dana Okafor",
    action: "Practitioner invited",
    target: "Benoît Stroobants — Cabinet Stroobants",
    kind: "invite",
  },
  {
    id: "aud-0110",
    at: "28 July 2026, 11:19",
    operator: "Priya Raman",
    action: "Practitioner onboarded",
    target: "Isabelle Coppens — Voeding Coppens",
    kind: "access",
  },
  {
    id: "aud-0109",
    at: "27 July 2026, 09:10",
    operator: "Priya Raman",
    action: "Flag scope widened to the pilot cohort",
    target: "photo-logging",
    kind: "flag",
  },
  {
    id: "aud-0108",
    at: "26 July 2026, 13:37",
    operator: "Marc Delhaize",
    action: "Plan template published",
    target: "Sports recovery — 4 weeks",
    kind: "content",
  },
  {
    id: "aud-0107",
    at: "25 July 2026, 14:26",
    operator: "Priya Raman",
    action: "Ticket resolved",
    target: "REM-2441 — duplicating a plan drops the schedule",
    kind: "support",
  },
  {
    id: "aud-0106",
    at: "24 July 2026, 10:41",
    operator: "Dana Okafor",
    action: "Flag enabled",
    target: "messaging",
    kind: "flag",
  },
  {
    id: "aud-0105",
    at: "23 July 2026, 16:52",
    operator: "Sam Verhoeven",
    action: "Patient data exported on request",
    target: "Camille Dubois — GDPR access request",
    kind: "export",
  },
  {
    id: "aud-0104",
    at: "22 July 2026, 09:28",
    operator: "Sam Verhoeven",
    action: "Flag disabled",
    target: "bulk-patient-invites",
    kind: "flag",
  },
  {
    id: "aud-0103",
    at: "21 July 2026, 14:10",
    operator: "Priya Raman",
    action: "Plan template edited",
    target: "Metabolic reset — week 3 meals",
    kind: "content",
  },
  {
    id: "aud-0102",
    at: "20 July 2026, 08:56",
    operator: "Dana Okafor",
    action: "Practitioner onboarded",
    target: "Laurent Peeters — Praktijk Peeters",
    kind: "access",
  },
  {
    id: "aud-0101",
    at: "18 July 2026, 17:02",
    operator: "Dana Okafor",
    action: "Flag disabled",
    target: "wearables",
    kind: "flag",
  },
  {
    id: "aud-0100",
    at: "17 July 2026, 11:35",
    operator: "Priya Raman",
    action: "Flag enabled for a two-week trial",
    target: "plan-editor-v2",
    kind: "flag",
  },
  {
    id: "aud-0099",
    at: "15 July 2026, 09:14",
    operator: "Marc Delhaize",
    action: "Application declined",
    target: "Philippe Warnier — outside the pilot's scope",
    kind: "invite",
  },
];
