/**
 * The shape of the dictionary. The app is French only (Jamie, 2026-11-20):
 * `fr.ts` is the one dictionary, and a new text is one line here and one line
 * there. TypeScript is what guarantees no screen reads a label that is missing.
 *
 * It covers chrome — navigation, labels, headings, empty states — for both
 * surfaces.
 *
 * Note what is NOT here: a step's title, a recommendation's detail. Those are
 * data, not chrome — they come from the query layer in the
 * language they were written in, and translating them is a question for the
 * practitioner, not for a dictionary.
 */

import type {
  ChallengeOutcome,
  ConsentKey,
  CookingAffinity,
  CookingTime,
  FoodBudget,
  FoodLimitLevel,
  LifestyleAdviceCategory,
  MandatoryQuestionnaireField,
  MealAlert,
  MealImprovementKind,
  MealIntent,
  MealSlot,
  PersonalisationDimension,
  RecommendationCategory,
  SignalKind,
  SignupField,
  StepStatus,
} from "@remi/services/shared";
import type { PlanMealError } from "@/lib/meals/state";
import type { PatientWriteError } from "@/lib/patient-link/actions";
import type { QuestionnaireSection } from "@/lib/questionnaire/sections";
import type { SaveError } from "@/lib/questionnaire/state";
import type { SignInNotice } from "@/lib/patient-auth/paths";
import type {
  LinkRequestState,
  NewPasswordFormError,
  SignInFormError,
} from "@/lib/patient-auth/state";
import type { SignupFormError } from "@/lib/signup/state";
import type {
  ClaimRequestState,
  TakeoverFormError,
} from "@/lib/takeover/state";

/** What a form that sends a link can answer. */
type LinkStatus = NonNullable<LinkRequestState["status"]>;

export type NavItem = {
  /** Path without the locale prefix — the shell adds it. */
  href: string;
  /** Matches a key in the `icons` map in `components/shell/nav-icons.ts`. */
  icon: string;
  label: string;
};

export type PlaceholderContent = {
  title: string;
  body: string;
};

export type Content = {
  /**
   * The root layout's metadata. Here rather than hard-coded in `layout.tsx`
   * because a browser tab is copy like any other.
   */
  meta: {
    /** Follows the brand's title convention: rendered as "REMI — <title>". */
    title: string;
    description: string;
  };
  shell: {
    /** Announced to screen readers on the sidebar and the mobile panel. */
    navLabel: string;
    openNav: string;
    closeNav: string;
    skipToContent: string;
  };
  roles: {
    practitioner: string;
    patient: string;
    /** The dev-only affordance that flips between the two surfaces. */
    switchTo: string;
  };
  userMenu: {
    label: string;
    account: string;
    /** Heading over the link that leaves for the docs app. */
    help: string;
    documentation: string;
    signOut: string;
  };
  signIn: {
    /** Sits above the display headline on the brand panel. */
    eyebrow: string;
    /** The display headline. The sentence under it is the brand tagline. */
    headline: string;
    title: string;
    lead: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    /** The role picker — a dev affordance, so both surfaces stay reachable. */
    roleLegend: string;
    roleHint: string;
    submit: string;
    pilotNote: string;
    /** The way out for someone who cannot get in — a separate app. */
    aboutLink: string;
  };
  practitionerNav: NavItem[];
  patientNav: NavItem[];
  practice: {
    title: string;
    lead: string;
    stats: {
      attention: string;
      active: string;
      adherence: string;
    };
    attention: {
      title: string;
      allClients: string;
      open: string;
      empty: PlaceholderContent;
    };
    signals: {
      title: string;
      /** The four things that flow back up the loop between consultations. */
      kinds: Record<SignalKind, string>;
      empty: PlaceholderContent;
    };
  };
  clients: {
    title: string;
    lead: string;
    /** The link at the end of every row, through to that client's page. */
    open: string;
    columns: {
      name: string;
      status: string;
      readiness: string;
      nextConsultation: string;
      lastActive: string;
    };
    status: {
      invited: string;
      active: string;
      paused: string;
      ended: string;
    };
    readiness: {
      exploring: string;
      committed: string;
      struggling: string;
    };
    never: string;
    empty: PlaceholderContent;
  };
  clientDetail: {
    /** The link back up to the roster. */
    back: string;
    /** "Supported since {since} · next consultation {next}". */
    lead: string;
    preparePlan: string;
    attention: string;
    dimensions: {
      title: string;
      lead: string;
      labels: Record<PersonalisationDimension, string>;
      /** Where each dimension's content came from — never "the AI decided". */
      sources: {
        genotype: string;
        /** "Therapeutic frame · {practitioner}". */
        frame: string;
        questionnaire: string;
        /** "Declared by {name}". */
        declared: string;
      };
      points: {
        readiness: string;
        motivators: string;
        barriers: string;
        dislikes: string;
        allergies: string;
        cooksFor: string;
        cooking: string;
        mealsOut: string;
        shoppingDay: string;
      };
      /** Stands in for an empty list — an absence, stated rather than hidden. */
      none: string;
      /** Follows the number of weekday cooking minutes. */
      minutes: string;
    };
    progress: {
      title: string;
      /** "Step {order} of {total}". */
      stepOf: string;
      label: string;
      days: string;
      empty: PlaceholderContent;
    };
    signals: {
      title: string;
      empty: PlaceholderContent;
    };
  };
  planComposer: {
    title: string;
    /** "Consultation of {date} · {name}". */
    lead: string;
    notes: {
      title: string;
      lead: string;
    };
    structured: {
      title: string;
      /** "Untick what does not fit. Nothing unticked reaches {name}." */
      lead: string;
      /** "{confirmed} of {total} confirmed". */
      count: string;
      publish: string;
    };
    dialog: {
      /** "Publish {name}'s plan?" */
      title: string;
      /** "{count} recommendations become steps in their space…" */
      body: string;
      cancel: string;
      confirm: string;
    };
    published: {
      title: string;
      /** "{name} will see {count} recommendations in their space." */
      body: string;
    };
    empty: PlaceholderContent;
  };
  frame: {
    title: string;
    effects: {
      title: string;
      /** What the frame changes in practice, in REMI's own terms. */
      points: string[];
    };
    principles: {
      title: string;
      /** Follows the count of switched-on principles: "3 active". */
      active: string;
    };
    excluded: PlaceholderContent;
    emphasised: PlaceholderContent;
    add: string;
    save: string;
  };
  today: {
    title: string;
    lead: string;
    currentStep: string;
    stepProgress: string;
    noPlan: PlaceholderContent;
  };
  plan: {
    title: string;
    lead: string;
    /** Follows the clinic name: "<clinic> · consultation on 22 Jul 2026". */
    consultationOn: string;
    /** Prefixes the next consultation's date: "Review on 19 Aug 2026". */
    nextReview: string;
    categories: Record<RecommendationCategory, string>;
    disclaimer: PlaceholderContent;
    empty: PlaceholderContent;
  };
  steps: {
    title: string;
    lead: string;
    held: string;
    /** Prefixes a step's title in that step's progress bar label. */
    progressLabel: string;
    /** Follows the count in "4 / 14 days". */
    days: string;
    status: Record<StepStatus, string>;
    empty: PlaceholderContent;
  };
  /**
   * The shareable patient view at `/p/[token]` — the one public page in this
   * app, reached by link rather than sign-in. Its own copy, not `plan`'s: that
   * section belongs to the parked practitioner world and can go with it.
   */
  patientLink: {
    /** Precedes the patient's name: "Bonjour Claire". */
    greeting: string;
    lead: string;
    /**
     * The segment navigation. One label per route, so a segment cannot be
     * added without the dictionary naming it.
     */
    /** Accessible name for the segment nav element. */
    navLabel: string;
    nav: {
      home: string;
      recommandations: string;
      complements: string;
      "placard-frigo": string;
      recettes: string;
      documents: string;
      repas: string;
      progression: string;
      messages: string;
      profil: string;
    };
    /**
     * Home, in her § 6 order: today and this week, the prioritised
     * recommendations, the recipes, the essentials, the way in to a meal, and
     * the living summary last.
     */
    todayTitle: string;
    /**
     * The challenge she is running with the patient — first inside
     * « Aujourd'hui », with the patient's two taps. Always rendered: with none
     * running, `empty` says so rather than the slot disappearing.
     */
    challenge: {
      title: string;
      /** Precedes the start date: "depuis le 12 sept.". */
      since: string;
      acquired: string;
      readyForNext: string;
      empty: string;
      /** Keyed by `PatientWriteError`, so a new failure cannot go unworded. */
      errors: Record<PatientWriteError, string>;
    };
    /**
     * The weekly question on the home (D-30, D-31): every active goal scored
     * 0–5 on one card, with an optional word each. `question` precedes the
     * goal's title. Once answered, the card gives way to `answeredOn` and
     * `nextOn`, each followed by a date.
     */
    weeklyCheckIn: {
      title: string;
      lead: string;
      question: string;
      scaleLow: string;
      scaleHigh: string;
      noteLabel: string;
      submit: string;
      answeredOn: string;
      nextOn: string;
      /** Keyed by `PatientWriteError`, so a new failure cannot go unworded. */
      errors: Record<PatientWriteError, string>;
    };
    /**
     * « Ma progression »: each goal's weekly scores as a strip, the current
     * consigne, the meals logged in the last seven days and the challenges
     * behind the patient with how each ended.
     */
    progression: {
      title: string;
      lead: string;
      /** The strip's accessible name, after the goal's title. */
      stripLabel: string;
      noScores: string;
      instructionTitle: string;
      mealsLabel: string;
      pastChallengesTitle: string;
      /** Between a challenge's start and end dates: "12 sept. → 26 sept.". */
      challengeUntil: string;
      outcomes: Record<ChallengeOutcome, string>;
    };
    /** Heads the week's consigne, when she has written one to the patient. */
    weekConsigneTitle: string;
    /** Sits above the goals inside « Aujourd'hui ». */
    goalsTitle: string;
    /** Precedes a goal's starting point: "Point de départ : ...". */
    baselineLabel: string;
    /** Follows each home section into its full segment. */
    seeAllLabel: string;
    /**
     * Everything the meal loop says, in one block — the home's invitation and
     * the form on Repas both, because « Je vais manger » is one string however
     * many places it appears.
     *
     * `actions` are the two buttons that write an entry; `states` are how one
     * already written reads back. They are separate because the verb and the
     * state are different words — « Je vais manger » writes
     * a meal that reads « Prévu ».
     */
    mealEntry: {
      /** The home's invitation card, which links through to Repas. */
      title: string;
      lead: string;
      /** The form on Repas, where the writing actually happens. */
      formTitle: string;
      formLead: string;
      descriptionLabel: string;
      placeholder: string;
      slotLabel: string;
      slotNone: string;
      actions: Record<MealIntent, string>;
      states: Record<MealIntent, string>;
      markEaten: string;
      /** Stands in for the answer until Morgane — or, later, REMI — writes one. */
      awaitingResponse: string;
      /** The journal before the patient has written anything into it. */
      empty: string;
      /** Keyed by `PatientWriteError`, so a new failure cannot go unworded. */
      errors: Record<PatientWriteError, string>;
    };
    /**
     * The general thread — her § 6: one place for how the week went. The home
     * card and the Messages segment share every string, the prompt above all:
     * D-35 fixes it as her own two sentences.
     */
    /**
     * « Mon profil » — the seven fields the patient keeps true themselves
     * (`patient-profile-edit`), then what is on record about them, read-only.
     * The three-level labels are D-25's: the old version's own words.
     */
    profile: {
      title: string;
      lead: string;
      dietaryRegimeLabel: string;
      allergiesLabel: string;
      allergiesHint: string;
      intolerancesLabel: string;
      preferencesLabel: string;
      preferencesHint: string;
      likesCookingLabel: string;
      cookingTimeLabel: string;
      foodBudgetLabel: string;
      /** The « not answered yet » choice of each three-level field. */
      unset: string;
      likesCooking: Record<CookingAffinity, string>;
      cookingTime: Record<CookingTime, string>;
      foodBudget: Record<FoodBudget, string>;
      save: string;
      saved: string;
      /** Keyed by `PatientWriteError`, so a new failure cannot go unworded. */
      errors: Record<PatientWriteError, string>;
      recordTitle: string;
      recordLead: string;
      nameLabel: string;
      ageLabel: string;
      /** « {age} ans » */
      ageValue: string;
      heightLabel: string;
      weightLabel: string;
      notRecorded: string;
    };
    messages: {
      title: string;
      /** Her § 6 question, verbatim in French. */
      prompt: string;
      bodyLabel: string;
      send: string;
      /** Precedes the date of the patient's last message. */
      lastSent: string;
      /** How the patient's own messages are signed in the thread. */
      you: string;
      /** A reply whose author's account no longer exists. */
      practitioner: string;
      /** The home card's way through to the whole thread. */
      seeThread: string;
      threadTitle: string;
      empty: string;
      /** Keyed by `PatientWriteError`, so a new failure cannot go unworded. */
      errors: Record<PatientWriteError, string>;
    };
    summaryTitle: string;
    recommendationsTitle: string;
    categories: Record<RecommendationCategory, string>;
    /** Compléments: the validated protocol, never the profile free text. */
    complementsTitle: string;
    doseLabel: string;
    timingLabel: string;
    reasonLabel: string;
    /**
     * Placard & frigo. The why is the point of the list rather than a
     * decoration — § H is justification logic, so an item renders with its
     * reason attached rather than in a bare checklist.
     */
    pantryTitle: string;
    whyLabel: string;
    /** Recettes: her per-patient « pourquoi pour toi » note. */
    recipesTitle: string;
    recipeNoteLabel: string;
    /**
     * Documents: what she put on the page — her PDFs, images and links, newest
     * first, each with the day she added it. Those she classed as a recipe are
     * listed under Recettes too, and one attached to a goal or a recipe also
     * sits beside it.
     */
    documentsTitle: string;
    documentAddedLabel: string;
    /** Above the documents a goal or a recipe carries. */
    attachedDocumentsLabel: string;
    /** Under Recettes, above the recipe documents that hang from no recipe. */
    recipeDocumentsTitle: string;
    /** Repas: the journal, with her feedback beneath an entry when written. */
    mealsTitle: string;
    mealSlots: Record<MealSlot, string>;
    mealCommentLabel: string;
    mealFeedbackLabel: string;
    empty: string;
    disclaimer: PlaceholderContent;
    /**
     * What this page is, who can open it, and who to ask about the data.
     * Sits in the disclaimer card because a patient reading one is reading
     * the other: both answer "what am I looking at, and who is behind it".
     */
    privacy: PlaceholderContent;
    /** The beta framing consultants read before giving UX feedback. */
    betaNote: string;
  };
  /**
   * The page a practitioner's permanent sign-up link opens, at
   * `/inscription/[token]` (stories 1 and 2): the sign-up form. The
   * invalid-link copy lives in the route's `not-found.tsx`: a not-found
   * boundary receives no locale.
   */
  signupLink: {
    /** The page title in the browser tab. */
    metaTitle: string;
    /** Holds `{name}`: the practitioner's name. */
    title: string;
    intro: string;
    labels: Record<SignupField, string>;
    hints: { phone: string; password: string };
    /** Holds `{fields}`: the refused fields' labels, joined. */
    summary: string;
    /** Holds `{field}`: the field's label. */
    required: string;
    invalid: Record<SignupField, string>;
    tooShort: string;
    form: Record<SignupFormError, string>;
    /**
     * The link after `form.already_registered`, to the sign-in page. The two
     * read as one message. Neither names any data of the existing file.
     */
    signIn: string;
    /**
     * After `form.file_exists`: the button that sends the one-time claim link
     * (`patient-takes-over-file`), and each answer of the request.
     */
    claim: {
      request: string;
      requesting: string;
      status: Record<Exclude<ClaimRequestState["status"], "idle">, string>;
    };
    submit: string;
    submitting: string;
    /** The consent step, before the form (story 3). */
    consent: {
      title: string;
      intro: string;
      /** The name of each consent, as the patient reads it. */
      names: Record<ConsentKey, string>;
      /** Holds `{version}` and `{date}`: the text's version and its date. */
      version: string;
      /** Holds `{name}`: the consent's name. */
      accept: string;
      reread: string;
      /** Holds `{consents}`: the names of the unticked consents, joined. */
      missing: string;
      continue: string;
      back: string;
    };
  };
  /**
   * The preparatory questionnaire (story 4), where a new patient lands after
   * sign-up. The labels of the shared lists (diets, activity levels,
   * allergens…) come from `@remi/services/shared`, not from here. The
   * questions are the patient's own, with « tu », so they live here.
   */
  questionnaire: {
    metaTitle: string;
    title: string;
    /** Shown on the first step only (REM-157). */
    intro: string;
    /** The accessible name of the progress bar. */
    progressLabel: string;
    /** Holds `{current}` and `{total}`: « Étape 2 sur 6 ». */
    step: string;
    /** Under a step that has a mandatory field: what the mark means. */
    mandatoryLegend: string;
    /** Read by a screen reader in place of the mark. */
    mandatory: string;
    optional: string;
    sections: Record<QuestionnaireSection, string>;
    previous: string;
    next: string;
    saving: string;
    /** Shown only after the server confirmed the save (REM-167). */
    saved: string;
    /** The action beside `errors.unavailable`: it sends the value again. */
    retry: string;
    /** The end screen (REM-168): ready, or the mandatory questions left. */
    end: {
      readyTitle: string;
      readyBody: string;
      finish: string;
      /** On the ready screen: returns to the questions. */
      edit: string;
      incompleteTitle: string;
      incompleteBody: string;
      back: string;
    };
    errors: Record<SaveError, string>;
    labels: {
      firstName: string;
      lastName: string;
      birthDate: string;
      email: string;
      phone: string;
      /**
       * The patient's label of each mandatory question, also the link text
       * on the end screen. The console has its own labels.
       */
      mandatory: Record<MandatoryQuestionnaireField, string>;
      desiredWeight: string;
      consultationDate: string;
      /** The diet question (REM-162). */
      diet: string;
      /** Shown after « Autre », where it is mandatory. */
      dietNote: string;
      pathologies: string;
      celiacDisease: string;
      medications: string;
      supplements: string;
      geneticTest: string;
      otherText: string;
    };
    hints: {
      email: string;
      phone: string;
      height: string;
      weight: string;
      desiredWeight: string;
      allergies: string;
      intolerances: string;
      otherText: string;
      celiacDisease: string;
      medications: string;
      supplements: string;
    };
    /**
     * The first step (REM-158): the personal data of the sign-up, shown as
     * known. The patient reads it, and opens the fields to correct it.
     */
    identity: {
      known: string;
      edit: string;
      /** In place of a value the file does not hold. */
      empty: string;
    };
    /** The diet question (REM-162). */
    diet: {
      /** Under « Aucun régime particulier » while no diet is saved. */
      proposed: string;
      /** Saves the proposed choice. Shown while no diet is saved. */
      confirm: string;
      /** After « Autre », while its note is empty: nothing is saved. */
      noteRequired: string;
    };
    /** The genetic consent and the three genotype lists (`genotype-section`). */
    genetic: {
      consentTitle: string;
      consentIntro: string;
      /** `{version}` and `{date}` of the text shown. */
      version: string;
      accept: string;
      refuse: string;
      deciding: string;
      /** After « Je refuse »: the text and « J'accepte » stay. */
      refused: string;
      /** Over the three lists. */
      listsIntro: string;
      /** A decision that did not save. */
      decisionFailed: string;
    };
  };
  /**
   * A date field of the sign-up and of the questionnaire (REM-159): the
   * patient types « JJ/MM/AAAA ».
   */
  dateEntry: {
    placeholder: string;
    hint: string;
    /** A day that no calendar has, or a date left half typed. */
    invalid: string;
    /** A birth date of today or later. */
    notPast: string;
  };
  /**
   * The patient's sign-in at `/connexion` (story 2): the password form, the
   * magic link and the notices the page can open with.
   */
  patientSignIn: {
    metaTitle: string;
    title: string;
    intro: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    submitting: string;
    form: Record<SignInFormError, string>;
    notices: Record<SignInNotice, string>;
    forgotLink: string;
    magicLink: {
      title: string;
      intro: string;
      submit: string;
      submitting: string;
      status: Record<LinkStatus, string>;
    };
    /** For a visitor with no account: it comes from the practitioner's link. */
    noAccount: string;
  };
  /** « Mot de passe oublié » at `/connexion/mot-de-passe-oublie`. */
  forgotPassword: {
    metaTitle: string;
    title: string;
    intro: string;
    emailLabel: string;
    submit: string;
    submitting: string;
    status: Record<LinkStatus, string>;
    back: string;
  };
  /** The page the reset link opens, at `/connexion/nouveau-mot-de-passe`. */
  newPassword: {
    metaTitle: string;
    title: string;
    intro: string;
    emailLabel: string;
    passwordLabel: string;
    passwordHint: string;
    submit: string;
    submitting: string;
    form: Record<NewPasswordFormError, string>;
    /** The link carries no token, or the identity store refused it. */
    invalidLink: string;
    requestAgain: string;
  };
  /**
   * The takeover of a practitioner-created file, at
   * `/inscription/reprendre/[token]` (`patient-takes-over-file`). The consent
   * step reuses `signupLink.consent`.
   */
  takeover: {
    metaTitle: string;
    title: string;
    /** Holds `{name}`: the patient's first name. */
    greeting: string;
    intro: string;
    passwordLabel: string;
    passwordHint: string;
    submit: string;
    submitting: string;
    form: Record<TakeoverFormError, string>;
    /** The link after `has_account`, to the sign-in page. */
    signIn: string;
    /** The page when the link served once or expired. */
    spent: string;
    /** The page when the file or its e-mail already holds an account. */
    hasAccount: string;
  };
  /**
   * Where an activated patient lands, at `/accueil`. A holding page until
   * `patient-home-navigation` builds the patient space.
   */
  patientHome: {
    metaTitle: string;
    title: string;
    comingSoon: string;
  };
  /** The tabs of the patient's shell. The layout puts each href under the locale. */
  patientTabs: NavItem[];
  patientShell: {
    /** `{name}` is the patient's first name. */
    greeting: string;
    /** The greeting when the patient's file has no first name. */
    greetingNoName: string;
    profileLink: string;
  };
  patientRecipes: {
    metaTitle: string;
    title: string;
    comingSoon: string;
  };
  patientProfile: {
    metaTitle: string;
    title: string;
  };
  /**
   * « Mes recommandations » at `/profil/recommandations` (story 23). The
   * headings are Morgane's. The recommendations themselves are the
   * practitioner's text and are not in this dictionary.
   */
  patientRecommendations: {
    metaTitle: string;
    title: string;
    /** The entry on the Profil tab, and the line below it. */
    profileEntry: string;
    profileEntryHint: string;
    backToProfile: string;
    /** `{date}` is the day of the validated version. */
    updatedOn: string;
    /** No version is validated yet, or the version shows nothing. */
    empty: string;
    /** The validated version cannot be read. */
    unavailable: string;
    supplementsTitle: string;
    doseLabel: string;
    timingLabel: string;
    reasonLabel: string;
    lifestyleTitle: string;
    lifestyleCategories: Record<LifestyleAdviceCategory, string>;
    foodTitle: string;
    evictionsTitle: string;
    /** `{date}` is the last day of the eviction. */
    evictionUntil: string;
    /** `{date}` is the first day of an eviction that has not started. */
    evictionFrom: string;
    evictionDurable: string;
    favourTitle: string;
    limitTitle: string;
    limitLevels: Record<FoodLimitLevel, string>;
    /** Above the practitioner's recommendations of the category nutrition. */
    foodAdviceTitle: string;
    goalsTitle: string;
  };
  /**
   * The patient's own data on the Profil tab and at `/profil/mes-donnees`
   * (story 31, REM-85). The labels and the errors of the fields are those of
   * `questionnaire`: one field has one name.
   */
  patientPersonalData: {
    /** The patient's file cannot be read. */
    unavailable: string;
    /** A value that the file does not hold. */
    empty: string;
    edit: string;
    /** The accessible name of « Modifier ». `{label}` is the field's name. */
    editLabel: string;
    save: string;
    saving: string;
    cancel: string;
    personalTitle: string;
    personalIntro: string;
    phoneSaved: string;
    dataTitle: string;
    dataIntro: string;
    rows: {
      weight: string;
      desiredWeight: string;
      activityLevel: string;
      diet: string;
      allergies: string;
      intolerances: string;
      medications: string;
      supplements: string;
    };
    /** `{value}` is a weight with a comma. */
    kilograms: string;
    /** « Autre » and what the patient wrote. */
    dietWithNote: string;
    weightSaved: string;
    /** The entry to `/profil/mes-donnees`, and the line below it. */
    dataLink: string;
    dataLinkHint: string;
    accountTitle: string;
    consentTitle: string;
    /** The consent settings are not built yet. */
    consentNotYet: string;
    dataPage: {
      metaTitle: string;
      title: string;
      intro: string;
      foodTitle: string;
      /** After a saved change of the diet, the allergies or the intolerances. */
      foodSaved: string;
      otherTitle: string;
    };
  };
  /** The sign-out button on the pages behind the patient session. */
  signOut: string;
  /**
   * The waiting screen at `/attente` (story 22): from a complete questionnaire
   * to the activation.
   */
  patientWaiting: {
    metaTitle: string;
    title: string;
    body: string;
    /** Above the practitioner's name. */
    practitionerLabel: string;
    /** Above the appointment date. Shown only when a date is set. */
    appointmentLabel: string;
    /** Says that the answers stay editable. Above the link. */
    questionnaireHint: string;
    questionnaireLink: string;
  };
  /**
   * The meal block of `/accueil` (stories 28 and 31). The question is the
   * page's title and the label of the field.
   */
  patientMeal: {
    question: string;
    hint: string;
    placeholder: string;
    /** The charter's label of the home page's one dominant button (8.1). */
    submit: string;
    submitting: string;
    /** `{count}` is the number of characters left. Shown near the limit only. */
    remaining: string;
    errors: Record<PlanMealError, string>;
    /** After a save: the record, then REMI's answer (REM-102). */
    saved: {
      title: string;
      mealLabel: string;
      another: string;
      suggestion: {
        alertTitle: string;
        /** `{food}` is the part of the meal, in the patient's own words. */
        alerts: Record<MealAlert["source"], string>;
        /** `{food}` is a part of the meal that can hold an excluded food. */
        trace: string;
        /** `{foods}` is a list of foods that the model named. Never a certainty. */
        toCheck: string;
        checkIngredients: string;
        goodTitle: string;
        improveTitle: string;
        /** `{food}`, and `{replaces}` for a replacement. */
        kinds: Record<MealImprovementKind, string>;
        /** `{basis}` is the validated item, in the practitioner's words. */
        basis: string;
        aligned: string;
        /** The safety message: REMI has no improvement that the gate confirms. */
        withheld: string;
        noProtocol: string;
        addressAlert: string;
        unclear: string;
        unavailable: string;
      };
    };
  };
};
