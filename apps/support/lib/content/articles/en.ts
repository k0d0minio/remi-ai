import type { Article } from "../types";

/**
 * The English articles, in the order each category lists them.
 *
 * Every claim here is checked against the product rather than against the
 * roadmap: where a capability does not exist, the article says so in a
 * `warning` note instead of describing it in the future tense and hoping the
 * reader notices. That is the rule apps/support/AGENTS.md sets, and it is the
 * only reason a pre-launch help centre is worth reading.
 *
 * `updated` is the day the article was last checked against the product, not
 * the day the file changed — a help centre that only tracks edits tells you
 * nothing about whether it is still true.
 */
export const articles: Article[] = [
  /* ---------------------------------------------------------------- getting started */
  {
    slug: "what-remi-does",
    category: "getting-started",
    title: "What REMI is, and what it is not",
    summary:
      "REMI turns your practitioner's recommendations into daily meals and small steps. It does not diagnose, treat, or replace the person who advises you.",
    updated: "2026-08-03",
    related: ["how-your-plan-reaches-you", "what-your-practitioner-sees"],
    blocks: [
      {
        kind: "paragraph",
        text: "You leave a consultation knowing what to do. Then the week happens — the shop, work, seven o'clock on a Tuesday — and the advice that was perfectly clear on Monday is gone by Thursday. REMI exists for that gap, and for nothing else.",
      },
      {
        kind: "paragraph",
        text: "It is a wellness copilot: your practitioner sets the direction, and REMI helps you apply it between two consultations. It is used with a practitioner, never instead of one.",
      },
      { kind: "heading", id: "what-it-does", text: "What REMI does" },
      {
        kind: "columns",
        columns: [
          {
            intent: "success",
            title: "REMI does this",
            items: [
              "Turns the recommendations your practitioner has confirmed into a plan written in words you can act on",
              "Suggests meals and recipes that stay inside those recommendations, adapted to your tastes, your time and your kitchen",
              "Gives you one small step at a time, and waits for it to hold before proposing the next",
              "Sends progress signals back to your practitioner, so the next consultation starts from what actually happened",
            ],
          },
          {
            intent: "error",
            title: "REMI never does this",
            items: [
              "Diagnose. REMI forms no clinical opinion and offers none.",
              "Treat or prescribe. No dosages, no supplements of its own initiative, no change to anything a practitioner or doctor has set.",
              "Replace professional care. It is built to send you back to your practitioner, not to keep you in an app.",
              "Invent its own programme. With no practitioner's recommendations behind it, there is nothing for REMI to support.",
            ],
          },
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "REMI is not medical advice",
        body: "REMI helps people apply their practitioner's recommendations. It does not diagnose, treat, or replace professional care — anything clinical belongs with your practitioner. If something has changed in your health, or you are worried about a symptom, contact them or your doctor. Do not wait for a suggestion in the app to tell you what to do.",
      },
      {
        kind: "heading",
        id: "not-a-diet-app",
        text: "Why it is not a diet app",
      },
      {
        kind: "paragraph",
        text: 'A diet app decides what you should eat. REMI has no opinion of its own about that. Every meal it suggests is traceable to a recommendation a practitioner wrote and confirmed — the meals screen shows that line on each card, under "because your practitioner recommended". If nobody has recommended it, REMI does not suggest it.',
      },
      {
        kind: "paragraph",
        text: "The same goes in the other direction. Your practitioner sets a therapeutic frame — the rules of their own practice, and an absolute list of what must never be suggested. REMI generates strictly inside that frame. Outside it, it does not improvise: it says it cannot, and points back to the person who can.",
      },
      { kind: "heading", id: "today", text: "Where REMI stands today" },
      {
        kind: "paragraph",
        text: "REMI is pre-launch. It is being built with a first cohort of practitioners, and it is not open to the public: you reach it through a practitioner who is in the pilot. Parts of what is described across this help centre are working, parts are still being built, and each article says which is which.",
      },
      {
        kind: "action",
        body: "The public site carries the fuller version — what is in development, what is designed but not built, and what has no date attached to it.",
        link: { target: "marketing", path: "/", label: "Read the main site" },
      },
    ],
  },
  {
    slug: "joining-the-pilot",
    category: "getting-started",
    title: "Joining the pilot",
    summary:
      "REMI is not open to the public. There are two ways in: apply as a practitioner, or be invited by one who is already in the cohort.",
    updated: "2026-08-01",
    related: ["signing-in", "contacting-support"],
    blocks: [
      {
        kind: "paragraph",
        text: "The first version of REMI is being built with a deliberately small group: fifteen practitioners, chosen one conversation at a time. They are not beta testers on a mailing list — they shape what gets built, and in what order.",
      },
      {
        kind: "heading",
        id: "practitioners",
        text: "If you are a practitioner",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Write to us",
            body: "Through the contact form on the public site. Tell us about your practice and what happens to your recommendations after a consultation — that is the application, and it is read by a founder rather than a form.",
          },
          {
            title: "We talk",
            body: "A real conversation, not a screening call. Places are reviewed personally: we are looking for engaged practitioners rather than sign-ups.",
          },
          {
            title: "You get set up",
            body: "Access is arranged with you directly during the pilot — there is no self-service sign-up page, on purpose.",
          },
          {
            title: "You keep shaping it",
            body: "Expect us to ask for your feedback every couple of weeks. That exchange is the point of the pilot, not a courtesy.",
          },
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "No commitment, and no price yet",
        body: "You can leave the pilot whenever you want. Pilot terms — including what it will cost — are being worked out with the first practitioners rather than announced to them, so you will not find a number on any REMI page until there is a real one.",
      },
      {
        kind: "heading",
        id: "individuals",
        text: "If you are working with a practitioner",
      },
      {
        kind: "paragraph",
        text: "You cannot join REMI on your own, and that is deliberate: without a practitioner's recommendations behind it, there is no plan for REMI to support. You arrive through the practitioner who supports you, and they invite you.",
      },
      {
        kind: "list",
        items: [
          "If your practitioner is already in the pilot, ask them to invite you — the invitation comes from their side.",
          "If they are not, tell us who supports you and we will get in touch with them.",
          "If you simply want to know when REMI opens more widely, write to us and we will keep you posted.",
        ],
      },
      {
        kind: "action",
        body: "There is one front door for all of this — the contact form on the public site. The founders answer it themselves.",
        link: { target: "marketing", path: "/contact", label: "Get in touch" },
      },
    ],
  },
  {
    slug: "contacting-support",
    category: "getting-started",
    title: "Contacting support",
    summary:
      "One front door: the contact form on the public site, answered by the founders. Here is what to put in a message, and what not to.",
    updated: "2026-08-03",
    related: ["joining-the-pilot", "what-remi-does"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI has one contact route for the whole product, on the public site. The team is small and reads everything, so a message gets a person rather than a queue. There is deliberately no second address: a second front door quietly becomes the unread one.",
      },
      { kind: "heading", id: "what-to-say", text: "What to put in a message" },
      {
        kind: "list",
        items: [
          "What you were trying to do, in your own words — the screen you were on is more useful than the feature's name.",
          "What happened instead, and what you expected.",
          "Whether you are a practitioner or someone a practitioner supports. The two sides of REMI behave differently, and it changes the answer.",
          "The language you are using REMI in, if the problem is with the wording of something.",
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "Please do not send personal health details",
        body: "The contact form is not a clinical channel and the team cannot advise on anything clinical. Symptoms, medication, results, a change in how you feel — those belong with your practitioner or your doctor, who know you and can act. If your question is about your plan itself rather than about the software, they are also the faster answer.",
      },
      {
        kind: "heading",
        id: "delivery",
        text: "One honest caveat about the form",
      },
      {
        kind: "paragraph",
        text: "The contact form validates what you type, but its delivery is not connected yet — no email vendor has been chosen, so submitting the form does not send anything. The form says so on the confirmation screen, and the two founders' addresses are printed on the same page. Until delivery is wired up, write to one of them directly.",
      },
      {
        kind: "action",
        body: "The addresses, and the form, are both on the contact page.",
        link: {
          target: "marketing",
          path: "/contact",
          label: "Open the contact page",
        },
      },
      {
        kind: "heading",
        id: "reply",
        text: "What happens after you write",
      },
      {
        kind: "paragraph",
        text: "A founder replies to the address you wrote from, and to nothing else. If the answer turns out to be something this help centre should have told you, the article that would have saved you the message gets written. That is what the help centre is for — measured on the questions it stops, not the ones it collects.",
      },
    ],
  },

  /* ------------------------------------------------------------- plan and meals */
  {
    slug: "how-your-plan-reaches-you",
    category: "plan-and-meals",
    title: "How your practitioner's plan reaches you",
    summary:
      "From consultation notes to the plan on your screen: what REMI structures, what your practitioner confirms, and what never reaches you.",
    updated: "2026-08-03",
    related: ["understanding-your-step", "what-your-practitioner-sees"],
    blocks: [
      {
        kind: "paragraph",
        text: "Nothing appears in your space that your practitioner has not signed off. The path from their notes to your screen has one gate in it, and they hold it.",
      },
      { kind: "heading", id: "the-path", text: "The path, step by step" },
      {
        kind: "steps",
        items: [
          {
            title: "The consultation happens as it always has",
            body: "Your practitioner listens, decides and writes their notes exactly the way they already do. REMI changes nothing about that, and never edits what they wrote.",
          },
          {
            title: "REMI structures the notes",
            body: "It reads the notes and proposes a list of separate recommendations, each with a title, a short detail and a category — nutrition, habit, supplement, activity or follow-up.",
          },
          {
            title: "Your practitioner confirms, line by line",
            body: "They tick what is right and untick what is not. Anything unticked stays a draft and never leaves their screen. This is the gate: REMI proposes, a human decides.",
          },
          {
            title: "They publish the plan",
            body: "Publishing sends the confirmed recommendations into your space, where they become your plan, your meals for the week and your steps. Publishing a new plan replaces the previous one.",
          },
        ],
      },
      {
        kind: "note",
        intent: "success",
        title: "Unconfirmed recommendations do not reach you",
        body: "Your side of REMI filters drafts out rather than trusting that only confirmed ones were ever written. If a recommendation was discussed in the consultation but is not in your plan, your practitioner has not confirmed it — ask them, rather than assuming it was lost.",
      },
      { kind: "heading", id: "what-you-see", text: "What lands on your side" },
      {
        kind: "list",
        items: [
          "My plan — every confirmed recommendation, grouped by category, with the date of the consultation it came from and the date it is next reviewed.",
          "Meals — a week of suggestions built from that plan, each card carrying the recommendation it honours, plus a shopping list sorted the way a shop is laid out.",
          "Steps — the recommendations turned into one change at a time, in order.",
          "Today — the single step you are working on right now, and how far into it you are.",
        ],
      },
      {
        kind: "heading",
        id: "changes",
        text: "When the plan changes",
      },
      {
        kind: "paragraph",
        text: "A plan is not permanent. It carries a review date, and your practitioner can publish a new one after any consultation — or before the next one, if something is clearly not working. When they do, the new plan replaces the old one in full, so what you see is always the current version rather than an archive you have to read backwards.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Not built yet: asking for a change from inside REMI",
        body: "There is no messaging between you and your practitioner in REMI today — secure messaging is designed but not built. If a recommendation does not work for you, tell them the way you already do, by their usual channel or at the next consultation.",
      },
    ],
  },
  {
    slug: "understanding-your-step",
    category: "plan-and-meals",
    title: "Understanding your daily step",
    summary:
      "One change at a time, with a target number of days. What the step screen shows, what the statuses mean, and how a day gets counted.",
    updated: "2026-08-02",
    related: ["how-your-plan-reaches-you", "logging-meals"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI never asks you to change everything on day one. Your plan is broken into steps, and exactly one of them is live at a time — the next waits until the current one holds. That is the whole habit thesis of the product, and it is why your screen looks emptier than a to-do list.",
      },
      { kind: "heading", id: "anatomy", text: "What a step is made of" },
      {
        kind: "list",
        items: [
          'A title — one concrete change, small enough to do without rearranging your life. "One fermented food a day", not "improve your digestion".',
          "A why — the thread back to the consultation, in your terms rather than the practitioner's shorthand.",
          "A target: the number of days it takes for the step to count as held.",
          "A count of the days applied so far, shown as a bar on Today and on Steps.",
        ],
      },
      { kind: "heading", id: "statuses", text: "The four statuses" },
      {
        kind: "list",
        items: [
          "Upcoming — written into your plan, waiting its turn. It is not asking anything of you yet.",
          "In progress — the one step that is live. Today shows it, and nothing else competes with it.",
          "Held — you reached the target. It stays part of your routine, and the next step starts.",
          "Skipped — set aside rather than failed. A step that does not fit your life is a fact about the step, and your practitioner can see it and choose something else.",
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "A step that struggles holds the queue",
        body: "REMI does not bury a difficult step under the next four. If a step is not being applied, it stays live and shows up on your practitioner's side as a sticking point — which is the moment to change the step, not to add another.",
      },
      {
        kind: "heading",
        id: "counting",
        text: "How a day gets counted",
      },
      {
        kind: "paragraph",
        text: "This is the part still being settled with the pilot cohort, and it is worth saying plainly: there is no button in REMI today that lets you mark a day as done. The step screen shows the step, its target and its progress, but the way a day gets recorded is being designed with the first practitioners rather than guessed at.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "If the count looks wrong, say so",
        body: "During the pilot, the safe assumption is that the number on your screen is a starting point for a conversation rather than a measurement of your week. Tell your practitioner what actually happened — that is the version that counts, and it is the version they act on.",
      },
    ],
  },
  {
    slug: "logging-meals",
    category: "plan-and-meals",
    title: "Logging meals",
    summary:
      "What the meals screen does today — a week of suggestions and a shopping list — and the honest answer about recording what you actually ate.",
    updated: "2026-08-02",
    related: ["understanding-your-step", "how-your-plan-reaches-you"],
    blocks: [
      {
        kind: "note",
        intent: "warning",
        title: "Logging a meal is not built yet",
        body: "REMI shows you meals; it cannot yet record the ones you ate. There is no button to mark a meal as cooked or skipped, and logging a meal from a photo is designed but not built. If you came here looking for that, this article ends with what to do instead — the rest describes what the screen does today.",
      },
      {
        kind: "heading",
        id: "what-exists",
        text: "What the meals screen does",
      },
      {
        kind: "paragraph",
        text: "Meals shows a week of suggestions built from the plan your practitioner published: breakfast, lunch, dinner and snacks, laid out by day. It is a proposal for the week, not a prescription — you cook what fits.",
      },
      {
        kind: "list",
        items: [
          'Every card names the recommendation it honours, under "because your practitioner recommended". A suggestion you cannot trace back to a consultation is not something REMI makes.',
          "Each recipe carries how long it takes, how many it serves, its ingredients and its method.",
          "The shopping list gathers the week's ingredients and sorts them the way a shop is laid out, not the way the recipes are written.",
          "Nothing your practitioner excluded in their therapeutic frame can appear here, for anyone they support.",
        ],
      },
      {
        kind: "heading",
        id: "swapping",
        text: "A meal you cannot or will not eat",
      },
      {
        kind: "paragraph",
        text: "Skip it. A suggestion you ignore costs nothing, and the perfect recipe you never cook helps nobody. What matters is the recommendation behind it — if the reason you are skipping is structural rather than a matter of taste, that is worth telling your practitioner: an allergy, an intolerance, a food you will never eat, a week where cooking is not happening.",
      },
      {
        kind: "note",
        intent: "info",
        title: "Allergies and exclusions belong in the plan",
        body: "REMI adapts to what it has been told. Anything that must never be suggested to you belongs in what your practitioner records about you, not in a filter you set once and hope holds — tell them, and it applies to every suggestion from then on.",
      },
      {
        kind: "heading",
        id: "meanwhile",
        text: "Until logging exists",
      },
      {
        kind: "list",
        items: [
          "Keep it simple: note what you swapped and why, however you already note things.",
          "Bring that to the consultation. It is the input your practitioner cannot get any other way at the moment.",
          'If a whole week went sideways, say so rather than reconstructing it. A practitioner reads "three days of travel" more usefully than a guessed-at log.',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- practitioners */
  {
    slug: "setting-up-the-frame",
    category: "practitioners",
    title: "Setting up the therapeutic frame",
    summary:
      "Your préceptes, an absolute exclusion list and the foods you favour. The frame is what makes REMI a copilot for your practice rather than a generic diet app.",
    updated: "2026-08-03",
    related: ["reading-progress-signals", "invite-someone-you-support"],
    blocks: [
      {
        kind: "paragraph",
        text: "The therapeutic frame is where you tell REMI how your practice works. Everything it generates for the people you support — meals, steps, encouragement — is produced inside that frame. Outside it, REMI does not improvise: it declines and points back to you.",
      },
      {
        kind: "paragraph",
        text: "The frame is a set of switches and lists rather than a free-text box, and that is deliberate. A prose description of your approach would be a prompt, and a prompt is not a boundary. A rule you can see, switch on and switch off is something you can actually check.",
      },
      { kind: "heading", id: "three-parts", text: "The three parts" },
      {
        kind: "steps",
        items: [
          {
            title: "Préceptes",
            body: "The rules of your own practice, each with a title and the detail behind it, and each either active or not. An inactive précepte is not the same as one you never wrote: it says you considered it and ruled it out for now, and the screen shows both.",
          },
          {
            title: "Never suggested",
            body: "An absolute boundary, applied to everyone you support. Ingredients, food groups, whole approaches — nothing on this list can appear in a suggestion, and it is not overridable by a person's preferences.",
          },
          {
            title: "Favoured",
            body: "A preference rather than a rule. Where REMI has a genuine choice between options, it goes here first.",
          },
        ],
      },
      {
        kind: "heading",
        id: "effects",
        text: "What the frame actually changes",
      },
      {
        kind: "paragraph",
        text: "The frame screen shows the effects in plain sentences rather than leaving you to infer them — for example: no recipe suggested contains an excluded food, for anyone you support; only one step runs at a time, and REMI does not propose a second until the first holds; the first month's suggestions concentrate on digestion, whatever the reason for the consultation. Those sentences are generated from your frame, so they change when it does.",
      },
      {
        kind: "note",
        intent: "info",
        title: "The frame is practice-wide, not per person",
        body: "It applies across everyone you support. What is specific to one person — their allergies, what they dislike, who they cook for, how much time they have on a weekday — lives in their own profile and in the plan you publish for them. Two different levers, on purpose: one describes your practice, the other describes a person.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Not built yet: saving a frame",
        body: "The frame editor is in the product and you can work with it, but no storage vendor has been chosen yet, so changes are not persisted between visits. During the pilot, tell us the frame you want and we set it up with you — and expect this to be one of the first things to change.",
      },
    ],
  },
  {
    slug: "reading-progress-signals",
    category: "practitioners",
    title: "How practitioners read progress signals",
    summary:
      "What flows back between two consultations: four kinds of signal, three severities, and what a signal deliberately is not.",
    updated: "2026-08-03",
    related: ["setting-up-the-frame", "what-your-practitioner-sees"],
    blocks: [
      {
        kind: "paragraph",
        text: "Between two sessions you normally go blind: you have no view of what was applied, what was misunderstood, and where someone quietly gave up. Progress signals are the answer to that — small observations that flow back up, so the next consultation starts from evidence rather than recall.",
      },
      { kind: "heading", id: "kinds", text: "The four kinds" },
      {
        kind: "list",
        items: [
          "Adherence — whether the current step is being applied, and what the rhythm looks like.",
          "Difficulty — something reported as hard, with the pattern around it where there is one.",
          "Engagement — the relationship with REMI itself: an invitation not accepted, a silence that has gone on.",
          "Win — a step held, a streak, something that worked and is worth naming out loud at the next session.",
        ],
      },
      { kind: "heading", id: "severity", text: "The three severities" },
      {
        kind: "columns",
        columns: [
          {
            intent: "success",
            title: "What a severity is",
            items: [
              "Positive — worth seeing, and worth repeating back to the person.",
              "Neutral — context. It explains a number without asking anything of you.",
              'Attention — the sticking points. These drive the "what needs your attention" list on your practice screen, so a person going quiet does not depend on you remembering to check.',
            ],
          },
          {
            intent: "error",
            title: "What a signal is not",
            items: [
              "Not a diagnosis. A signal is an observation with a date, not a clinical conclusion.",
              "Not a score. There is no ranking of the people you support, and no grade attached to a person.",
              'Not an alert you must act on. Attention means "look before their next consultation", not "something is wrong now".',
              "Not a substitute for asking. The person's own account of their week is still the better source, and REMI is built to send you back to it.",
            ],
          },
        ],
      },
      { kind: "heading", id: "where", text: "Where signals appear" },
      {
        kind: "list",
        items: [
          'My practice — "since last time" gathers the recent signals across everyone you support, and "what needs your attention" lists the people to look at before their consultation.',
          "The client file — the signals since that person's last consultation, next to the step they are working on and how far into it they are.",
          "A signal is traceable to what produced it when there is something to trace: a step, a meal. When there is not — an invitation left unaccepted — it says so rather than inventing a source.",
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "The range of signals is narrower than it will be",
        body: "Signals are generated from what the person's side of REMI records, and recording is the part still being built: there is no meal logging yet, and no way for someone to mark a day as done. Read the signals as a partial picture during the pilot, and keep asking the questions you already ask.",
      },
    ],
  },
  {
    slug: "invite-someone-you-support",
    category: "practitioners",
    title: "Inviting someone you support",
    summary:
      "Invitations come from your side, never from ours. The four statuses a person moves through, and what to do while invitation email is not connected.",
    updated: "2026-08-01",
    related: ["setting-up-the-frame", "joining-the-pilot"],
    blocks: [
      {
        kind: "paragraph",
        text: "Nobody arrives in REMI on their own. A person is invited by the practitioner who supports them, and the access that follows is scoped to that relationship — you see the people you support, and nobody else.",
      },
      { kind: "heading", id: "statuses", text: "The four statuses" },
      {
        kind: "list",
        items: [
          "Invited — the invitation has gone out and has not been accepted yet. If it stays that way, it surfaces as an engagement signal rather than sitting quietly in a list.",
          "Active — they are in, with a plan published or on the way.",
          "Paused — the accompaniment is on hold. Nothing is deleted, and nothing is asked of them meanwhile.",
          "Ended — the relationship is over. Access ends when the relationship that justified it does.",
        ],
      },
      {
        kind: "heading",
        id: "before",
        text: "What to have ready before you invite",
      },
      {
        kind: "list",
        items: [
          "Your therapeutic frame, at least in outline — it is what every suggestion they see will be generated inside.",
          "A consultation to publish a plan from. An invitation without a plan behind it gives them an empty space and no reason to come back.",
          "A word in the consultation about what REMI is, and what it is not. The first article in this help centre is written to be read by them, and it is a reasonable thing to point them at.",
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "Not built yet: sending the invitation email",
        body: "No email vendor has been committed, so REMI does not actually send an invitation today — the seam is in place and nothing goes out of it. During the pilot, tell us who you want to onboard and we arrange their access with you directly.",
      },
      {
        kind: "action",
        body: "That request goes through the same front door as everything else.",
        link: { target: "marketing", path: "/contact", label: "Write to us" },
      },
    ],
  },

  /* -------------------------------------------------------- account and billing */
  {
    slug: "signing-in",
    category: "account-and-billing",
    title: "Signing in and recovering access",
    summary:
      "How you get into REMI during the pilot, why there is no sign-up page, and what to do when you cannot get in.",
    updated: "2026-08-01",
    related: ["joining-the-pilot", "switching-language"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI opens on a sign-in screen: your email, your password, and which side of the loop you are continuing on — practitioner, or the person a practitioner supports. That choice decides your navigation and what you land on, so it is part of signing in rather than a setting you find later.",
      },
      {
        kind: "note",
        intent: "info",
        title: "There is no sign-up button, on purpose",
        body: "Pilot access only. A practitioner joins by talking to us; a person joins by being invited by their practitioner. An account nobody has a plan behind would open an empty product, which is worse than a closed door.",
      },
      { kind: "heading", id: "cannot-get-in", text: "If you cannot get in" },
      {
        kind: "list",
        items: [
          "Check you are on the right address for the product rather than this help centre — the two are separate sites, and only one of them asks you to sign in.",
          "If you are a person a practitioner supports, ask them first: an invitation that was never accepted looks exactly like a password problem from your side.",
          "Otherwise write to us. During the pilot, access is arranged by a human, so a message gets you back in faster than any form would.",
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "Not built yet: password reset",
        body: 'No authentication vendor has been chosen yet, so there is no "forgot your password" flow and no self-service recovery. This is one of the first things that changes when a provider is committed. Until then, recovering access means writing to us.',
      },
      {
        kind: "heading",
        id: "signing-out",
        text: "Signing out",
      },
      {
        kind: "paragraph",
        text: "The account menu at the top right of the product carries sign out, alongside your account details and your language. Signing out ends the session on that device and nothing else — nothing in your plan changes, and your practitioner sees no difference.",
      },
      {
        kind: "action",
        body: "Access questions go to the same place as everything else.",
        link: { target: "marketing", path: "/contact", label: "Write to us" },
      },
    ],
  },
  {
    slug: "switching-language",
    category: "account-and-billing",
    title: "Switching language",
    summary:
      "English and French, everywhere. How the switcher works, what it keeps, and the one kind of text it cannot translate.",
    updated: "2026-07-30",
    related: ["signing-in", "contacting-support"],
    blocks: [
      {
        kind: "paragraph",
        text: "Every REMI site ships in English and French: the product, the public site, and this help centre. French is the launch market — REMI is built in Belgium, first for francophone practitioners and the people they support — and English is there for everyone else.",
      },
      { kind: "heading", id: "how", text: "How to switch" },
      {
        kind: "list",
        items: [
          "The EN | FR switcher sits in the header of every page, on every REMI site.",
          "It keeps you where you are: switching halfway through an article gives you the same article in the other language, not the home page.",
          "The language is in the address. Every page exists twice — /en/… and /fr/… — so a link you send someone carries the language you were reading in.",
          "In the product, the account menu also carries a language setting, so the choice follows you rather than being re-made on each device.",
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "The first visit guesses, then stops guessing",
        body: "Arriving without a language in the address, you are sent to the one your browser asks for — French if that is what it prefers, English otherwise. It is a guess made once; the switcher overrules it, and the address you land on is the one that counts.",
      },
      {
        kind: "heading",
        id: "not-translated",
        text: "What the switcher cannot translate",
      },
      {
        kind: "paragraph",
        text: "The interface is translated. What people write is not. Your practitioner's notes, the recommendations they confirmed and the wording of your steps appear in the language they wrote them in — translating a clinical instruction automatically is exactly the kind of helpfulness that goes wrong quietly. If you are reading recommendations in a language you are not comfortable in, tell your practitioner rather than a machine.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "If something is untranslated, that is a bug",
        body: "An English sentence on the French site is a defect, not a gap in the plan: both dictionaries are checked by the type system before anything ships. Send us the page and we will fix it.",
      },
    ],
  },
  {
    slug: "billing-during-the-pilot",
    category: "account-and-billing",
    title: "Billing during the pilot",
    summary:
      "Nothing to pay, no card taken, no price decided. What that means in practice, and what will happen when there is a number.",
    updated: "2026-08-01",
    related: ["joining-the-pilot", "exporting-or-deleting-your-data"],
    blocks: [
      {
        kind: "paragraph",
        text: "There is nothing to pay during the pilot. No card is taken, no subscription is created, and there is no billing screen in REMI — because there is nothing for it to show.",
      },
      { kind: "heading", id: "pricing", text: "Why there is no price yet" },
      {
        kind: "paragraph",
        text: "Pricing is not decided. It is being worked out honestly with the first practitioners rather than announced to them, and until it is settled you will not find a number on any REMI page. That is not coyness — a price invented before the product is finished is a promise made to the wrong people.",
      },
      {
        kind: "list",
        items: [
          "Pilot terms, including what it will cost, are being finalised with the first cohort.",
          "There is no commitment attached to the pilot: you can leave whenever you want.",
          "Nothing here converts to a paid plan silently. When there is a price, it will be a conversation with the practitioners who helped build the thing, not a surprise on a card statement.",
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "If you are the person your practitioner supports",
        body: "The pilot conversation is with practitioners, so billing is not something you have to think about. If your practitioner has told you something different about what REMI costs you, they are the ones to ask — their own arrangement with the people they support is theirs, not ours.",
      },
      {
        kind: "action",
        body: "Ask us where pricing stands. The honest answer is easier to give than the polished one.",
        link: { target: "marketing", path: "/contact", label: "Ask us" },
      },
    ],
  },

  /* ---------------------------------------------------------- privacy and data */
  {
    slug: "what-your-practitioner-sees",
    category: "privacy-and-data",
    title: "What your practitioner can and cannot see",
    summary:
      "Access follows the care relationship. What flows back to the practitioner who supports you, what does not, and when access ends.",
    updated: "2026-08-03",
    related: ["reading-progress-signals", "your-data-and-gdpr"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI only works if you know who is on the other side of it. The answer is short: the practitioner who supports you, and nobody else.",
      },
      {
        kind: "columns",
        columns: [
          {
            intent: "info",
            title: "They can see",
            items: [
              "The plan they published for you, and the recommendations in it.",
              "Which step you are on, its target and how far into it you are.",
              "Progress signals since your last consultation — what is being applied, what is proving hard, what went well.",
              "Whether you have accepted their invitation, and when you were last active.",
              "What REMI has suggested to you, so it can be corrected rather than discovered.",
            ],
          },
          {
            intent: "error",
            title: "They cannot see",
            items: [
              "Anything from before the accompaniment started, or from outside it.",
              "The people another practitioner supports — access is scoped to the relationship that justifies it.",
              "A clinical record. REMI is not the medical record; diagnoses, prescriptions and history stay in their own system.",
              "Anything a practitioner elsewhere holds about you. REMI does not gather records from other places.",
            ],
          },
        ],
      },
      { kind: "heading", id: "why", text: "Why they see it at all" },
      {
        kind: "paragraph",
        text: "Because the loop only closes if it flows back. The reason a practitioner goes blind between two consultations is that nothing reaches them, and the cost of that is a session spent reconstructing a fortnight instead of adjusting a plan. What REMI sends back is what makes the next consultation start where you actually are.",
      },
      {
        kind: "note",
        intent: "info",
        title: "Access ends when the relationship does",
        body: "When an accompaniment ends, so does the access that came with it. A practitioner does not keep a window into someone they no longer support. Their own notes, in their own system, remain theirs — that record is not REMI's to hold or to delete.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Where this stands today",
        body: "REMI is pre-launch and no storage vendor is committed, so no client data is being processed yet. The rules above are how the product is being built rather than a description of a running system — which is exactly why they are written down before the first record exists.",
      },
    ],
  },
  {
    slug: "your-data-and-gdpr",
    category: "privacy-and-data",
    title: "Your data and GDPR",
    summary:
      "A Belgian company under GDPR: what REMI collects, what it will never do with it, and what has honestly not been decided yet.",
    updated: "2026-08-03",
    related: ["exporting-or-deleting-your-data", "what-your-practitioner-sees"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI is built by a Belgian company, so GDPR is the floor here rather than the ambition. The decisions below were taken before the first record exists — protection built in while the schema is still being designed is a different product from protection retrofitted after launch.",
      },
      { kind: "heading", id: "commitments", text: "The commitments" },
      {
        kind: "list",
        items: [
          "Collect less than we could. Only what the accompaniment actually needs — a field that would be interesting to have but is not needed to help someone does not get collected.",
          "Access follows the care relationship. A practitioner sees the people they support, and access ends when that relationship does.",
          "Never sold, never traded, never a training set. Your data is not turned into someone else's product, and that is a decision about the product rather than a setting you have to find.",
          "Written down rather than assumed. What is stored, why, for how long and who processes it — recorded as it is built, with sub-processors named.",
          "Clinical data stays clinical. REMI is not the medical record: diagnoses, prescriptions and history stay in your practitioner's own system.",
        ],
      },
      { kind: "heading", id: "residency", text: "Where the data will live" },
      {
        kind: "paragraph",
        text: "The intent is that personal data stays in the EU, with a Belgian or other EU region as the default for the pilot. No storage vendor has been committed yet — deliberately, because that is what keeps residency a criterion for choosing rather than a migration project afterwards. Any processing that would leave the EU gets named, documented and justified before it happens.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "What this is, and what it is not",
        body: "This is written intent, and worth what a written intent is worth. REMI holds no certification and claims none, and no client data is being processed today. When a vendor is chosen, the public site's trust page gets a name, a region and a date — and if the answer turns out differently, that page changes rather than quietly staying the same.",
      },
      {
        kind: "heading",
        id: "ai",
        text: "The AI question",
      },
      {
        kind: "paragraph",
        text: "It is the question worth asking, and it does not have a finished answer yet: which provider, what exactly is sent, and what is deliberately kept out of it. No AI vendor is committed either. What is already decided is the boundary — personal data is not used to train models that serve anyone but the person it belongs to.",
      },
      {
        kind: "action",
        body: "The public site's trust page carries the long version, including the questions we would rather be asked early than late.",
        link: {
          target: "marketing",
          path: "/trust",
          label: "Read trust and data",
        },
      },
    ],
  },
  {
    slug: "exporting-or-deleting-your-data",
    category: "privacy-and-data",
    title: "Exporting or deleting your data",
    summary:
      "The rights you have, how to use them while there is no button for it, and the one record REMI cannot delete for you.",
    updated: "2026-08-03",
    related: ["your-data-and-gdpr", "contacting-support"],
    blocks: [
      {
        kind: "paragraph",
        text: "Under GDPR you can ask what is held about you, ask for a copy in a portable form, have mistakes corrected, and have your data deleted. Those rights apply whether or not a product has built a button for them.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "There is no export or delete button yet",
        body: "Self-service export and deletion are not built. Saying so is more useful than describing a screen that does not exist — until it does, a request is handled by a person, and it is handled.",
      },
      { kind: "heading", id: "how", text: "How to ask" },
      {
        kind: "steps",
        items: [
          {
            title: "Write to us",
            body: "Through the contact page on the public site, from the address your account uses. Say which of the two you want — a copy, or deletion — and whether it covers everything or one specific thing.",
          },
          {
            title: "We confirm it is you",
            body: "A request to hand over or erase someone's data is exactly the kind of message that must not be taken at face value, so expect a step that checks the request came from you.",
          },
          {
            title: "It gets done, and you hear back",
            body: "You get told what was exported or removed, rather than a silent completion. If some of it cannot be deleted, you are told which part and why.",
          },
        ],
      },
      {
        kind: "heading",
        id: "limits",
        text: "What deletion does not cover",
      },
      {
        kind: "columns",
        columns: [
          {
            intent: "success",
            title: "REMI can remove",
            items: [
              "Your account and the profile behind it.",
              "The plans, steps and meal suggestions in your space.",
              "The progress signals generated from your use of REMI.",
            ],
          },
          {
            intent: "neutral",
            title: "REMI cannot remove",
            items: [
              "Your practitioner's own notes and clinical record. Those live in their system, they are the ones responsible for them, and a request for those goes to them.",
              "Anything a practitioner has separately written down outside REMI.",
              "Records a law requires to be kept — where that applies, you are told which and for how long.",
            ],
          },
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "Deleting is not the only option",
        body: "If what you want is to stop for a while rather than erase everything, an accompaniment can be paused: nothing is deleted, and nothing is asked of you meanwhile. Say which one you mean — the two are easy to confuse and only one of them is reversible.",
      },
      {
        kind: "action",
        body: "Both requests go through the contact page.",
        link: {
          target: "marketing",
          path: "/contact",
          label: "Make a request",
        },
      },
    ],
  },
];
