/**
 * The patient context block — one pure function from a loaded record to the
 * plain French text a prompt opens with.
 *
 * Built for `copy-context`, whose whole feature is a button that puts this text
 * on the clipboard for Morgane to paste into a model of her choosing. Every
 * `ai-assist` prompt opens with the same block, so this is deliberately the
 * first thing built and the last thing a vendor choice could touch: no I/O, no
 * clock, no `Result`, nothing that names a provider.
 *
 * **Pseudonymous by construction.** `PatientContextInput` has no `fullName`,
 * `email` or `shareToken` field. That is the guarantee, and it is a type rather
 * than a convention precisely because "remember not to include the name" is the
 * kind of rule that survives exactly as long as the person who wrote it.
 *
 * The closed vocabularies — sex, cooking affinity, recommendation category —
 * arrive already rendered in French. Their labels live in the console's
 * `vocabulary.ts`, which is their one home (`apps/admin/AGENTS.md`), and a
 * second copy here would be the forked variant `CONVENTIONS.md` forbids. What
 * this file owns is the wording that exists nowhere else: the block headings
 * and the connective punctuation.
 */

/** The preamble Morgane's own paste opens with, and the field's starting value. */
export const DEFAULT_CONTEXT_PREAMBLE =
  "Tu es un chef de cuisine qui respecte les recommandations d'une nutrithérapeute. Propose des recettes qui tiennent compte de tout ce qui suit.";

export const contextBlocks = [
  "profil",
  "objectifs",
  "consigne",
  "recommandations",
  "complements",
  "essentiels",
  "resume",
] as const;

export type ContextBlock = (typeof contextBlocks)[number];

/**
 * Which blocks the text carries. The six protocol blocks are on; `resume` is
 * off, being the longest and the most clinical — a recipe prompt rarely needs
 * the whole synthesis.
 */
export const defaultContextBlocks: Record<ContextBlock, boolean> = {
  profil: true,
  objectifs: true,
  consigne: true,
  recommandations: true,
  complements: true,
  essentiels: true,
  resume: false,
};

export type ContextProfile = {
  pseudonym: string;
  /** Years, or `null` when no birth date is on file. */
  age: number | null;
  /** Already French, and `""` when it is `unspecified` — the caller decides. */
  sex: string;
  objective: string;
  dietaryRegime: string;
  allergies: string;
  intolerances: string;
  constraints: string;
  preferences: string;
  /** Already French ("oui" / "un peu" / "non"), `""` when not recorded. */
  likesCooking: string;
  foodBudget: string;
  medications: string;
  /** What the patient takes outside the protocol — prose, not the rows below. */
  supplements: string;
};

export type ContextGoal = { title: string; baseline: string };

export type ContextRecommendationGroup = {
  /** Already French — "Nutrition", "Habitudes", … */
  categoryLabel: string;
  entries: readonly { title: string; detail: string }[];
};

export type ContextSupplement = {
  name: string;
  dose: string;
  timing: string;
  reason: string;
};

export type ContextEssential = { item: string; why: string };

/**
 * Only active rows belong here. The function renders exactly what it is given
 * and knows nothing about archiving — filtering is the caller's, which is what
 * keeps this testable against fixtures rather than against a database.
 */
export type PatientContextInput = {
  profile: ContextProfile;
  goals: readonly ContextGoal[];
  instruction: string;
  recommendations: readonly ContextRecommendationGroup[];
  supplements: readonly ContextSupplement[];
  essentials: readonly ContextEssential[];
  summary: string;
};

export type PatientContextOptions = {
  preamble?: string;
  blocks?: Partial<Record<ContextBlock, boolean>>;
};

const HEADINGS: Record<ContextBlock, string> = {
  profil: "Profil",
  objectifs: "Objectifs en cours",
  consigne: "Consigne du moment",
  recommandations: "Recommandations actives",
  complements: "Compléments en cours",
  essentiels: "Essentiels placard / frigo",
  resume: "Résumé",
};

/** Trims, and treats whitespace-only as absent — a space is not an answer. */
const filled = (value: string | null | undefined): string =>
  (value ?? "").trim();

/** `Label : value`, or nothing at all when the value is absent. */
const line = (label: string, value: string): string | null => {
  const text = filled(value);
  return text === "" ? null : `${label} : ${text}`;
};

const bullets = (items: readonly (string | null)[]): string =>
  items.filter((item): item is string => item !== null).join("\n");

const profileBlock = (profile: ContextProfile): string => {
  // The identity line is the pseudonym plus whatever else is on file; the
  // pseudonym alone is enough for it to be worth rendering.
  const identity = [
    filled(profile.pseudonym),
    profile.age !== null ? `${profile.age} ans` : "",
    filled(profile.sex),
  ]
    .filter((part) => part !== "")
    .join(" · ");

  return bullets([
    identity === "" ? null : `- ${identity}`,
    line("- Objectif", profile.objective),
    line("- Régime", profile.dietaryRegime),
    line("- Allergies", profile.allergies),
    line("- Intolérances", profile.intolerances),
    line("- Contraintes", profile.constraints),
    line("- Goûts et aversions", profile.preferences),
    line("- Aime cuisiner", profile.likesCooking),
    line("- Budget", profile.foodBudget),
    line("- Médicaments", profile.medications),
    line("- Compléments hors protocole", profile.supplements),
  ]);
};

const goalsBlock = (goals: readonly ContextGoal[]): string =>
  bullets(
    goals.map((goal) => {
      const title = filled(goal.title);
      if (title === "") {
        return null;
      }
      const baseline = filled(goal.baseline);
      return baseline === "" ? `- ${title}` : `- ${title} (${baseline})`;
    }),
  );

const recommendationsBlock = (
  groups: readonly ContextRecommendationGroup[],
): string =>
  groups
    .map((group) => {
      const entries = bullets(
        group.entries.map((entry) => {
          const title = filled(entry.title);
          if (title === "") {
            return null;
          }
          const detail = filled(entry.detail);
          return detail === "" ? `- ${title}` : `- ${title} — ${detail}`;
        }),
      );
      // A category whose every entry is blank contributes no heading either.
      return entries === ""
        ? null
        : `${filled(group.categoryLabel)}\n${entries}`;
    })
    .filter((group): group is string => group !== null)
    .join("\n\n");

const supplementsBlock = (supplements: readonly ContextSupplement[]): string =>
  bullets(
    supplements.map((supplement) => {
      const name = filled(supplement.name);
      if (name === "") {
        return null;
      }
      // Name · dose · moment, as § G columns it; a missing column is skipped
      // rather than rendered as an empty separator.
      const head = [name, filled(supplement.dose), filled(supplement.timing)]
        .filter((part) => part !== "")
        .join(" · ");
      const reason = filled(supplement.reason);
      return reason === "" ? `- ${head}` : `- ${head} — ${reason}`;
    }),
  );

const essentialsBlock = (essentials: readonly ContextEssential[]): string =>
  bullets(
    essentials.map((essential) => {
      const item = filled(essential.item);
      if (item === "") {
        return null;
      }
      const why = filled(essential.why);
      return why === "" ? `- ${item}` : `- ${item} — ${why}`;
    }),
  );

const bodyFor = (block: ContextBlock, input: PatientContextInput): string => {
  switch (block) {
    case "profil":
      return profileBlock(input.profile);
    case "objectifs":
      return goalsBlock(input.goals);
    case "consigne":
      return filled(input.instruction);
    case "recommandations":
      return recommendationsBlock(input.recommendations);
    case "complements":
      return supplementsBlock(input.supplements);
    case "essentiels":
      return essentialsBlock(input.essentials);
    case "resume":
      return filled(input.summary);
  }
};

/**
 * The context as plain French text: the preamble, then one headed block per
 * enabled section that has something to say.
 *
 * An empty field, an empty list and a block of nothing but empty fields all
 * render as nothing — no `Allergies : —`, no orphan heading, no run of blank
 * lines. A paste is read by a model and by Morgane, and both read placeholders
 * as facts.
 */
export const patientContextText = (
  input: PatientContextInput,
  options: PatientContextOptions = {},
): string => {
  const blocks = { ...defaultContextBlocks, ...options.blocks };
  const preamble = filled(options.preamble ?? DEFAULT_CONTEXT_PREAMBLE);

  const sections = contextBlocks
    .filter((block) => blocks[block])
    .map((block) => ({ block, body: bodyFor(block, input) }))
    .filter(({ body }) => body !== "")
    .map(({ block, body }) => `${HEADINGS[block]}\n${body}`);

  return [preamble === "" ? null : preamble, ...sections]
    .filter((part): part is string => part !== null)
    .join("\n\n");
};
