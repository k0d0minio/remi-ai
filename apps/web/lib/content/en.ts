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
    help: "Help",
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
  },
  practitionerNav: [
    { href: "/practice", icon: "practice", label: "Practice" },
    { href: "/clients", icon: "clients", label: "Clients" },
    { href: "/frame", icon: "frame", label: "Therapeutic frame" },
  ],
  patientNav: [
    { href: "/today", icon: "today", label: "Today" },
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
      body: "{count} recommendations become steps in their space. The previous plan is replaced.",
      cancel: "Cancel",
      confirm: "Publish",
    },
    published: {
      title: "Plan published",
      body: "{name} will see {count} recommendations in their space, turned into steps.",
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
    lead: "Your REMI space: what was agreed with your practitioner, in one place.",
    navLabel: "Your pages",
    nav: {
      home: "Today",
      recommandations: "Recommendations",
      complements: "Supplements",
      "placard-frigo": "Pantry & fridge",
      recettes: "Recipes",
      documents: "Documents",
      repas: "Meals",
      progression: "My progress",
      messages: "Messages",
      profil: "My profile",
    },
    todayTitle: "Today / this week",
    challenge: {
      title: "Your current challenge",
      since: "since",
      acquired: "Challenge done",
      readyForNext: "Ready for the next one",
      empty: "No challenge right now — your practitioner will suggest one.",
      errors: {
        invalid_input: "That could not be saved. Reload the page.",
        rate_limited: "That is a lot at once — try again in a moment.",
        not_found:
          "This challenge has changed in the meantime. Reload the page.",
        unknown: "That did not work. Try again in a moment.",
      },
    },
    weeklyCheckIn: {
      title: "Your week",
      lead: "One number per goal, from 0 to 5 — your practitioner will see it.",
      question: "This week, how did it go for:",
      scaleLow: "0 — not well at all",
      scaleHigh: "5 — very well",
      noteLabel: "A word (optional)",
      submit: "Send",
      answeredOn: "Thank you! Answer sent on",
      nextOn: "Next question on",
      errors: {
        invalid_input: "Pick at least one number before sending.",
        rate_limited: "That is a lot at once — try again in a moment.",
        not_found: "You have already answered this week. Reload the page.",
        unknown: "That did not work. Try again in a moment.",
      },
    },
    progression: {
      title: "My progress",
      lead: "Your answers each week, goal by goal.",
      stripLabel: "your weekly numbers, from 0 to 5",
      noScores:
        "No number yet — the first question is waiting on the home page.",
      instructionTitle: "Your current focus",
      mealsLabel: "Meals logged in the last 7 days:",
      pastChallengesTitle: "My past challenges",
      challengeUntil: "→",
      outcomes: {
        acquired: "Done",
        not_acquired: "Not yet",
        abandoned: "Dropped",
      },
    },
    profile: {
      title: "My profile",
      lead: "What you eat, what you avoid and how much time you have: keep it up to date — your practitioner and REMI use it for your suggestions.",
      dietaryRegimeLabel: "Diet",
      allergiesLabel: "Allergies",
      allergiesHint:
        "What you must never eat. Your practitioner will see every change.",
      intolerancesLabel: "Intolerances",
      preferencesLabel: "Foods you like / dislike",
      preferencesHint: "What you like, what you don't.",
      likesCookingLabel: "Do you like cooking?",
      cookingTimeLabel: "Time available to cook",
      foodBudgetLabel: "Food budget",
      unset: "Not given",
      likesCooking: { yes: "Yes", somewhat: "A little", no: "No" },
      cookingTime: { low: "Little", medium: "Some", high: "Plenty" },
      foodBudget: {
        economical: "Economical",
        standard: "Standard",
        comfort: "Comfortable",
      },
      save: "Save",
      saved: "Saved. Your practitioner will see what changed.",
      errors: {
        invalid_input:
          "This profile could not be saved: a field is over 2000 characters.",
        rate_limited: "You wrote a lot at once — try again in a moment.",
        not_found:
          "This link is no longer valid. Ask your practitioner for a new one.",
        unknown: "That did not work. Try again in a moment.",
      },
      recordTitle: "What your practitioner noted",
      recordLead: "To change it, talk to your practitioner.",
      nameLabel: "Name",
      ageLabel: "Age",
      ageValue: "{age} years old",
      heightLabel: "Height",
      weightLabel: "Weight",
      notRecorded: "Not noted yet",
    },
    messages: {
      title: "Your follow-up",
      prompt:
        "How is your follow-up going this week? You can also tell us here what you thought of the recipes, challenges or recommendations you were given.",
      bodyLabel: "Your message",
      send: "Send",
      lastSent: "Last message sent on",
      you: "You",
      practitioner: "Your practitioner",
      seeThread: "See your messages",
      threadTitle: "Your conversation",
      empty:
        "You have not written anything yet. Your first message will appear here.",
      errors: {
        invalid_input:
          "This message could not be sent: it is empty or longer than 2000 characters.",
        rate_limited: "That is a lot at once — try again in a moment.",
        not_found:
          "This link is no longer valid. Ask your practitioner for a new one.",
        unknown: "That did not work. Try again in a moment.",
      },
    },
    weekConsigneTitle: "This week's focus",
    goalsTitle: "What you are working on",
    baselineLabel: "Starting point",
    seeAllLabel: "See all",
    mealEntry: {
      title: "A meal?",
      lead: "Tell REMI, before or after — your practitioner will see it.",
      formTitle: "Say what you are eating",
      formLead:
        "Before or after, whichever suits you. Your practitioner sees it and answers you here.",
      descriptionLabel: "Your meal",
      placeholder: "Spaghetti with tomato sauce",
      slotLabel: "When",
      slotNone: "None",
      actions: {
        planned: "I am about to eat",
        eaten: "I have eaten",
      },
      states: {
        planned: "Planned",
        eaten: "Eaten",
      },
      markEaten: "I have eaten this",
      awaitingResponse: "Your practitioner will answer you here.",
      empty: "Nothing noted yet. Write your first meal above.",
      errors: {
        invalid_input: "That meal could not be saved — check the text.",
        rate_limited: "That is a lot at once — try again in a moment.",
        not_found: "That meal is no longer there. Reload the page.",
        unknown: "That did not work. Try again in a moment.",
      },
    },
    summaryTitle: "Where you are",
    recommendationsTitle: "Your recommendations",
    categories: {
      nutrition: "Nutrition",
      habit: "Habit",
      supplement: "Supplement",
      activity: "Activity",
      monitoring: "Follow-up",
    },
    complementsTitle: "Your supplements",
    doseLabel: "Dose",
    timingLabel: "When",
    reasonLabel: "Why",
    pantryTitle: "Pantry & fridge",
    whyLabel: "Why this one",
    recipesTitle: "Your recipes",
    recipeNoteLabel: "Why this one for you",
    documentsTitle: "Your documents",
    documentAddedLabel: "Added",
    attachedDocumentsLabel: "To read",
    recipeDocumentsTitle: "Your recipe documents",
    mealsTitle: "Your meals",
    mealSlots: {
      petit_dejeuner: "Breakfast",
      dejeuner: "Lunch",
      diner: "Dinner",
      collation: "Snack",
    },
    mealCommentLabel: "What you said",
    mealFeedbackLabel: "Your practitioner's note",
    empty: "This will appear here once your practitioner has encoded it.",
    disclaimer: {
      title: "Your practitioner stays the reference",
      body: "This page reflects what was agreed in consultation. It does not diagnose and does not replace medical advice.",
    },
    privacy: {
      title: "Your data and this link",
      body: "This page shows what your practitioner recorded for you, and what you write here yourself. What you write is kept, attached to your link and read by your practitioner — that is what lets them follow you between consultations. The page does not appear in search engines, but it opens without a password: anyone holding the link can read it and write here as you, so pass it on only to people you choose. To see, correct or have your data deleted, or to get a new link, write to your practitioner: nobody else has access.",
    },
    betaNote:
      "REMI is in beta — feedback is welcome, tell us what is missing or in the way.",
  },
  signupLink: {
    metaTitle: "Sign up",
    title: "Sign up with {name}",
    intro:
      "Create your REMI account. It is attached to your practitioner, and it opens the questionnaire to fill in before your consultation.",
    labels: {
      lastName: "Last name",
      firstName: "First name",
      birthDate: "Date of birth",
      email: "E-mail address",
      phone: "Phone",
      password: "Password",
    },
    hints: {
      phone: "Digits, with a + at the start if needed.",
      password: "At least 8 characters.",
    },
    summary: "To correct: {fields}.",
    required: "{field}: this field is required.",
    invalid: {
      lastName: "This last name is too long.",
      firstName: "This first name is too long.",
      birthDate: "This date is not valid.",
      email: "This e-mail address is not valid.",
      phone:
        "This number is not valid. Use 8 to 15 digits, with a + at the start if needed.",
      password: "This password is too long.",
    },
    tooShort: "The password needs at least 8 characters.",
    form: {
      invalid_link:
        "This link is not valid. Ask your practitioner for a new one.",
      already_registered: "You already have an account.",
      file_exists: "A file already exists for this address.",
      rate_limited: "Too many attempts. Try again in a few minutes.",
      unavailable:
        "The sign-up did not go through. Try again in a moment: your answers are kept.",
      consent_missing: "Tick each mandatory consent. No account was created.",
      consent_stale:
        "The text changed after the page opened. Reload the page to read the current version. No account was created.",
    },
    signIn: "Sign in.",
    claim: {
      request: "Get a link by e-mail",
      requesting: "Sending the link…",
      status: {
        sent: "If a file exists for this address, a link just went to it. It works once and expires in 24 hours.",
        rate_limited:
          "A link went out less than five minutes ago. Look in your inbox, then try again later.",
        unavailable: "The link could not go out. Try again in a moment.",
      },
    },
    submit: "Create my account",
    submitting: "Creating your account…",
    consent: {
      title: "Your personal data",
      intro:
        "Before you create your account, read how REMI processes your data. Your account cannot be created without your agreement.",
      names: {
        care: "Processing of your data for your care",
        genetic: "Processing of your genetic data",
      },
      version: "Version {version} of {date}",
      accept: "I have read and I accept: {name}.",
      reread: "Read again",
      missing: "Tick to continue: {consents}.",
      continue: "Continue",
      back: "Review my consents",
    },
  },
  questionnaire: {
    metaTitle: "Questionnaire",
    title: "Let's prepare your consultation",
    intro:
      "A few details to get to know you better and prepare your support. You can complete this questionnaire at your own pace.",
    progressLabel: "Questionnaire progress",
    step: "Step {current} of {total}",
    mandatoryLegend: "* Mandatory field",
    mandatory: "mandatory",
    optional: "(optional)",
    sections: {
      identite: "Identity",
      profil: "Profile",
      consultation: "Consultation",
      alimentation: "Diet",
      sante: "Health",
      genetique: "Genetics",
    },
    previous: "Previous",
    next: "Continue",
    saving: "Saving…",
    saved: "Saved",
    retry: "Try again",
    end: {
      readyTitle: "Your questionnaire is ready!",
      readyBody:
        "Your answers are saved. Your practitioner will use them to prepare your consultation.",
      finish: "Finish",
      edit: "Change my answers",
      incompleteTitle: "A few details are still missing.",
      incompleteBody:
        "Answer the questions below to complete your questionnaire.",
      back: "Back to the questionnaire",
    },
    errors: {
      required: "This field cannot stay empty.",
      invalid: "This value is not valid.",
      height_range: "Enter a height from 100 to 250 cm, with no decimal.",
      weight_range:
        "Enter a weight from 25 to 300 kg, with one decimal at most.",
      consent:
        "This information needs your consent to care. Talk to your practitioner about it.",
      genetic_consent:
        "Your genotypes need your genetic consent. Give it above to save them.",
      signed_out: "Your session has expired. Sign in again to continue.",
      unavailable: "Unable to save.",
    },
    labels: {
      firstName: "First name",
      lastName: "Last name",
      birthDate: "Date of birth",
      email: "Email address",
      phone: "Phone",
      desiredWeight: "Desired weight",
      consultationDate: "Consultation date",
      diet: "Diet / type of eating",
      dietNote: "Describe your diet",
      pathologies: "Medical conditions",
      celiacDisease: "Coeliac disease",
      medications: "Medications",
      supplements: "Food supplements",
      geneticTest:
        "Have you taken a genetic test that gives your APOE, DIO2 and AMY1A genotypes?",
      otherText: "Specify",
    },
    hints: {
      email: "To change your email, contact your practitioner.",
      height: "In cm, from 100 to 250.",
      weight: "In kg, from 25 to 300.",
      desiredWeight: "In kg, from 25 to 300. Leave empty if you have none.",
      dietDefault:
        "“No particular diet” is shown by default. Tap your answer to save it.",
      allergies:
        "Tick “No known allergy” or each allergy. A ticked category with no detail is excluded whole.",
      intolerances: "Tick “No known intolerance” or each intolerance.",
      otherText: "Specify “Other” to save it.",
      celiacDisease:
        "Tick if a doctor diagnosed it. Gluten is then excluded strictly, cross-contamination included.",
      medications: "The ones you take today, with their dose if you know it.",
      supplements: "Vitamins, minerals, herbs…",
    },
    genetic: {
      consentTitle: "Processing of your genetic data",
      consentIntro:
        "To save your genotypes, REMI needs your agreement. Read the text, then give or refuse your consent.",
      version: "Version {version} of {date}",
      accept: "I agree",
      refuse: "I refuse",
      deciding: "Saving…",
      refused:
        "You refused: REMI saves no genotype. You can change your mind at any time with “I agree”.",
      listsIntro:
        "Choose each result as it appears on the laboratory report. Leave a list empty if you do not know the result.",
      decisionFailed:
        "Your answer could not be saved. Check your connection and try again.",
    },
  },
  patientSignIn: {
    metaTitle: "Sign in",
    title: "Sign in",
    intro: "Sign in with the account you created when you signed up.",
    emailLabel: "E-mail address",
    passwordLabel: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    form: {
      wrong_credentials: "Wrong e-mail address or password.",
      no_account:
        "No REMI account uses this address. Sign up with the link from the person who supports you.",
      rate_limited: "Too many attempts. Try again in a few minutes.",
      unavailable: "The sign-in did not go through. Try again in a moment.",
    },
    notices: {
      no_account:
        "No REMI account uses this address. Sign up with the link from the person who supports you.",
      password_changed: "Your new password is saved. Sign in with it.",
    },
    forgotLink: "Forgot your password?",
    magicLink: {
      title: "Get a sign-in link",
      intro:
        "No password needed: we send a link to your e-mail address. It signs you in with one click.",
      submit: "Get a link",
      submitting: "Sending…",
      status: {
        sent: "If this address has an account, a sign-in link is on its way. Open it from your inbox.",
        rate_limited: "Too many attempts. Try again in a few minutes.",
        unavailable: "The link could not be sent. Try again in a moment.",
      },
    },
    noAccount:
      "No account yet? It is created with the link from the person who supports you.",
  },
  forgotPassword: {
    metaTitle: "Forgot password",
    title: "Forgot your password",
    intro:
      "Enter your account's e-mail address. We send a link there to choose a new password.",
    emailLabel: "E-mail address",
    submit: "Get the link",
    submitting: "Sending…",
    status: {
      sent: "If this address has an account, a link is on its way. It is valid for one hour and works once.",
      rate_limited: "Too many attempts. Try again in a few minutes.",
      unavailable: "The link could not be sent. Try again in a moment.",
    },
    back: "Back to sign-in",
  },
  newPassword: {
    metaTitle: "New password",
    title: "Choose a new password",
    intro: "Confirm your account's e-mail address and choose a new password.",
    emailLabel: "E-mail address",
    passwordLabel: "New password",
    passwordHint: "At least 8 characters.",
    submit: "Save and sign in",
    submitting: "Saving…",
    form: {
      too_short: "The password needs at least 8 characters.",
      too_long: "This password is too long.",
      invalid_link:
        "This link has expired or was already used. Ask for a new one.",
      rate_limited: "Too many attempts. Try again in a few minutes.",
      unavailable: "The password was not saved. Try again in a moment.",
    },
    invalidLink: "This link has expired or was already used.",
    requestAgain: "Ask for a new link",
  },
  takeover: {
    metaTitle: "Take over my file",
    title: "Take over your REMI file",
    greeting: "Hello {name},",
    intro:
      "The person who follows you opened your file. Give your consent to the processing of your data, then choose a password. You then find the information already recorded.",
    passwordLabel: "Password",
    passwordHint: "At least 8 characters.",
    submit: "Create my account",
    submitting: "Creating the account…",
    form: {
      consent_missing: "Tick each mandatory consent. No account was created.",
      consent_stale:
        "The text changed since the page opened. Reload the page to read the current version. No account was created.",
      too_short: "The password needs at least 8 characters.",
      too_long: "This password is too long.",
      spent: "This link is no longer valid. No account was created.",
      has_account: "You already have an account.",
      rate_limited: "Too many attempts. Try again in a few minutes.",
      unavailable: "The account was not created. Try again in a moment.",
    },
    signIn: "Sign in.",
    spent:
      "This link is no longer valid: it served once already, or it expired. Sign in if you already have an account. Otherwise, ask for a new link from the sign-up link of the person who follows you.",
    hasAccount: "You already have an account for this file.",
  },
  patientHome: {
    metaTitle: "Home",
    title: "Home",
    comingSoon:
      "Your space is coming soon. Your recommendations and recipes will be here.",
  },
  patientTabs: [
    { href: "/accueil", icon: "home", label: "Home" },
    { href: "/recettes", icon: "recipes", label: "Recipes" },
    { href: "/profil", icon: "profile", label: "Profile" },
  ],
  patientShell: {
    greeting: "Hello {name}",
    greetingNoName: "Hello",
    profileLink: "Profile",
  },
  patientRecipes: {
    metaTitle: "Recipes",
    title: "Recipes",
    comingSoon:
      "Your recipe suggestions are coming soon. You will find them here, day by day.",
  },
  patientProfile: {
    metaTitle: "Profile",
    title: "Profile",
    comingSoon:
      "Your recommendations, your personal information and your account settings are coming here soon.",
  },
  signOut: "Sign out",
  patientWaiting: {
    metaTitle: "Your care is being prepared",
    title: "Your practitioner is preparing your care",
    body:
      "Your answers have arrived. As soon as your care is ready, your REMI space opens here, with the same account.",
    practitionerLabel: "Your practitioner",
    appointmentLabel: "Your appointment",
    questionnaireHint: "You can still adjust your answers, at your own pace.",
    questionnaireLink: "Review my questionnaire",
  },
};
