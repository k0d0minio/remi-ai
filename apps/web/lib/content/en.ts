import type { Content } from "./types";

export const en: Content = {
  meta: {
    title: "The wellness copilot between consultations",
    description:
      "Your practitioner's recommendations, applied day to day — meals, habits and small steps.",
  },
  shell: {
    navLabel: "Main",
    openNav: "Open navigation",
    closeNav: "Close navigation",
    skipToContent: "Skip to content",
  },
  roles: {
    practitioner: "Practitioner",
    patient: "Patient",
    switchTo: "Switch surface",
  },
  userMenu: {
    label: "Account menu",
    account: "Account",
    language: "Language",
    appearance: "Appearance",
    themes: { system: "Match system", light: "Light", dark: "Dark" },
    help: "Help",
    supportCentre: "Support centre",
    documentation: "Documentation",
    signOut: "Sign out",
  },
  signIn: {
    eyebrow: "Pilot",
    headline: "Pick up where your last consultation left off.",
    title: "Sign in",
    lead: "Enter your details to continue.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    roleLegend: "Continue as",
    roleHint: "Decides which side of the loop you land on.",
    submit: "Continue",
    pilotNote: "Pilot access only — contact your practitioner.",
    aboutLink: "About REMI",
    helpLink: "Get help",
  },
  practitionerNav: [
    { href: "/practice", icon: "practice", label: "Practice" },
    { href: "/clients", icon: "clients", label: "Clients" },
    { href: "/frame", icon: "frame", label: "Therapeutic frame" },
  ],
  patientNav: [
    { href: "/today", icon: "today", label: "Today" },
    { href: "/meals", icon: "meals", label: "Meals" },
    { href: "/steps", icon: "steps", label: "Steps" },
    { href: "/plan", icon: "plan", label: "My plan" },
  ],
  practice: {
    title: "My practice",
    lead: "What has happened since your last consultations.",
    stats: {
      attention: "To look at before their consultation",
      active: "Active accompaniments",
      adherence: "Average adherence",
    },
    attention: {
      title: "What needs your attention",
      allClients: "All clients",
      open: "Open the file",
      empty: {
        title: "Nothing is stuck",
        body: "Everyone you support has applied something since their last consultation.",
      },
    },
    signals: {
      title: "Since last time",
      kinds: {
        adherence: "Adherence",
        difficulty: "Difficulty",
        engagement: "Engagement",
        win: "Win",
      },
      empty: {
        title: "Nothing yet",
        body: "What the people you support apply between consultations will appear here.",
      },
    },
  },
  clients: {
    title: "Clients",
    lead: "The people you support, and where each of them stands between consultations.",
    open: "Open",
    columns: {
      name: "Name",
      status: "Status",
      readiness: "Readiness",
      nextConsultation: "Next consultation",
      lastActive: "Last active",
    },
    status: {
      invited: "Invited",
      active: "Active",
      paused: "Paused",
      ended: "Ended",
    },
    readiness: {
      exploring: "Exploring",
      committed: "Committed",
      struggling: "Struggling",
    },
    never: "Never",
    empty: {
      title: "No clients yet",
      body: "The people you invite will appear here, with what they have applied since their last consultation.",
    },
  },
  clientDetail: {
    back: "Clients",
    lead: "Supported since {since} · next consultation {next}",
    preparePlan: "Prepare the plan",
    attention: "Sticking point",
    dimensions: {
      title: "Personalisation across five dimensions",
      lead: "What the plan is adapted to. The second one comes from your frame, not from them.",
      labels: {
        genotype: "Genotype",
        preceptes: "Your préceptes",
        psychology: "Psychological profile",
        habits: "Eating habits",
        rhythm: "Daily rhythm",
      },
      sources: {
        genotype: "Genetic report",
        frame: "Therapeutic frame · {practitioner}",
        questionnaire: "Entry questionnaire and consultations",
        declared: "Declared by {name}",
      },
      points: {
        readiness: "Readiness:",
        motivators: "Motivated by:",
        barriers: "Held back by:",
        dislikes: "Dislikes:",
        allergies: "Allergies:",
        cooksFor: "Cooks for:",
        cooking: "Weekday cooking:",
        mealsOut: "Meals out a week:",
        shoppingDay: "Shopping day:",
      },
      none: "None recorded",
      minutes: "min",
    },
    progress: {
      title: "Where they are",
      stepOf: "Step {order} of {total}",
      label: "Days applied",
      days: "days",
      empty: {
        title: "No step under way",
        body: "Publish a plan and the step they are working on appears here.",
      },
    },
    signals: {
      title: "Signals since the last consultation",
      empty: {
        title: "Nothing since last time",
        body: "What they apply, and what they find hard, will appear here.",
      },
    },
  },
  planComposer: {
    title: "From notes to a plan",
    lead: "Consultation of {date} · {name}",
    notes: {
      title: "Your notes",
      lead: "Exactly as you wrote them. REMI never edits them.",
    },
    structured: {
      title: "Structured by REMI",
      lead: "Untick anything that does not fit. Nothing unticked reaches {name}.",
      count: "{confirmed} of {total} confirmed",
      publish: "Publish the plan",
    },
    dialog: {
      title: "Publish {name}'s plan?",
      body: "{count} recommendations become meals and steps in their space. The previous plan is replaced.",
      cancel: "Cancel",
      confirm: "Publish",
    },
    published: {
      title: "Plan published",
      body: "{name} will see {count} recommendations in their space, turned into meals and steps.",
    },
    empty: {
      title: "No consultation yet",
      body: "A plan is composed from the notes of a consultation. This one has not been held yet.",
    },
  },
  frame: {
    title: "Therapeutic frame",
    effects: {
      title: "You set the frame, REMI works inside it",
      points: [
        "No recipe suggested contains an excluded food, for anyone you support.",
        "Only one step runs at a time — REMI does not propose a second until the first holds.",
        "The first month's suggestions are about digestion, whatever the reason for the consultation.",
      ],
    },
    principles: {
      title: "Préceptes",
      active: "active",
    },
    excluded: {
      title: "Never suggested",
      body: "An absolute rule, for everyone you support.",
    },
    emphasised: {
      title: "Favoured",
      body: "A preference: REMI goes here first where a choice exists.",
    },
    add: "Add",
    save: "Save the frame",
  },
  today: {
    title: "Today",
    lead: "One thing at a time, at your pace.",
    currentStep: "Your step this fortnight",
    stepProgress: "Days applied",
    noPlan: {
      title: "No plan yet",
      body: "Your practitioner has not published a plan for you. It will appear here after your next consultation.",
    },
  },
  plan: {
    title: "My plan",
    lead: "What your practitioner recommended, in words you can act on.",
    consultationOn: "consultation on",
    nextReview: "Review on",
    categories: {
      nutrition: "Nutrition",
      habit: "Habit",
      supplement: "Supplement",
      activity: "Activity",
      monitoring: "Follow-up",
    },
    disclaimer: {
      title: "Your practitioner stays the reference",
      body: "REMI applies these recommendations day to day. It does not diagnose and does not replace a consultation — anything clinical belongs to your practitioner.",
    },
    empty: {
      title: "No plan yet",
      body: "Your practitioner has not published a plan for you. It will appear here as soon as they do.",
    },
  },
  meals: {
    title: "Meals",
    lead: "Ideas that follow your plan, adapted to your tastes, your time and what you have in the kitchen.",
    tabs: {
      week: "The week",
      shopping: "Shopping list",
    },
    slots: {
      breakfast: "breakfast",
      lunch: "lunch",
      dinner: "dinner",
      snack: "snack",
    },
    minutes: "min",
    servings: "servings",
    because: "Because your practitioner recommended",
    details: "Ingredients and method",
    shopping: {
      title: "Before the shop",
      body: "Sorted the way the shop is laid out, not the way the recipes are written.",
    },
    empty: {
      title: "No meals yet",
      body: "Meal ideas appear here once your practitioner has published a plan.",
    },
  },
  steps: {
    title: "Your steps",
    lead: "One at a time. The next one waits until this one holds.",
    held: "Steps held",
    progressLabel: "Progress:",
    days: "days",
    status: {
      upcoming: "Upcoming",
      current: "In progress",
      done: "Held",
      skipped: "Skipped",
    },
    empty: {
      title: "No steps yet",
      body: "Your steps appear here once your practitioner has published a plan.",
    },
  },
  patientLink: {
    greeting: "Hello",
    lead: "Your REMI space: your profile and your practitioner's recommendations, in one place.",
    objectiveTitle: "Your objective",
    recommendationsTitle: "Your recommendations",
    categories: {
      nutrition: "Nutrition",
      habit: "Habit",
      supplement: "Supplement",
      activity: "Activity",
      monitoring: "Follow-up",
    },
    empty:
      "Your recommendations will appear here once your practitioner has encoded them.",
    profileTitle: "Your profile",
    constraintsTitle: "To avoid",
    preferencesTitle: "Your preferences",
    medicationsTitle: "Current medication",
    supplementsTitle: "Supplements",
    ageLabel: "years old",
    heightLabel: "cm",
    weightLabel: "kg",
    disclaimer: {
      title: "Your practitioner stays the reference",
      body: "This page reflects what was agreed in consultation. It does not diagnose and does not replace medical advice.",
    },
    privacy: {
      title: "Your data and this link",
      body: "This page shows only what your practitioner recorded for you: your profile and your recommendations. It does not appear in search engines, but it opens without a password — anyone holding the link can read it, so pass it on only to people you choose. To see, correct or have your data deleted, write to your practitioner: nobody else has access.",
    },
    betaNote:
      "REMI is in beta — feedback is welcome, tell us what is missing or in the way.",
  },
};
