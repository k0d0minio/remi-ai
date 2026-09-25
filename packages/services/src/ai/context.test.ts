import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONTEXT_PREAMBLE,
  patientContextText,
  type PatientContextInput,
} from "./context";

/**
 * One full record and one empty one. Between them they cover what the function
 * exists to get right: every block rendered in order, and nothing rendered for
 * a field Morgane has not filled in.
 */
const full: PatientContextInput = {
  profile: {
    pseudonym: "Patiente A",
    age: 41,
    sex: "femme",
    objective: "retrouver de l'énergie",
    dietaryRegime: "sans gluten",
    allergies: "arachides",
    intolerances: "lactose",
    constraints: "reflux, éviter les plats épicés",
    preferences: "aime le poisson, n'aime pas les abats",
    likesCooking: "un peu",
    cookingTime: "faible",
    foodBudget: "économique",
    medications: "lévothyroxine",
    supplements: "magnésium acheté en pharmacie",
  },
  goals: [
    { title: "améliorer l'énergie", baseline: "énergie 3/10" },
    { title: "réduire les ballonnements", baseline: "" },
  ],
  instruction:
    "Priorité énergie et anti-inflammatoire, peu de changements la première semaine.",
  recommendations: [
    {
      categoryLabel: "Nutrition",
      entries: [
        { title: "Protéines au petit-déjeuner", detail: "œufs ou skyr" },
        { title: "Trois légumes par jour", detail: "" },
      ],
    },
    {
      categoryLabel: "Habitudes",
      entries: [{ title: "Marcher 20 minutes", detail: "après le déjeuner" }],
    },
  ],
  supplements: [
    {
      name: "Vitamine D",
      dose: "2000 UI",
      timing: "le matin",
      reason: "carence confirmée",
    },
    { name: "Oméga 3", dose: "1 g", timing: "", reason: "" },
  ],
  essentials: [
    { item: "Sardines en boîte", why: "protéines et oméga 3 rapides" },
    { item: "Patate douce", why: "" },
  ],
  summary:
    "Vient pour une fatigue installée depuis l'hiver. Vigilance sur le reflux.",
};

const empty: PatientContextInput = {
  profile: {
    pseudonym: "Patient B",
    age: null,
    sex: "",
    objective: "",
    dietaryRegime: "",
    allergies: "",
    intolerances: "",
    constraints: "",
    preferences: "",
    likesCooking: "",
    cookingTime: "",
    foodBudget: "",
    medications: "",
    supplements: "",
  },
  goals: [],
  instruction: "",
  recommendations: [],
  supplements: [],
  essentials: [],
  summary: "",
};

describe("patientContextText", () => {
  it("renders the six protocol blocks by default, in order, and leaves the summary out", () => {
    const text = patientContextText(full);

    expect(text.startsWith(DEFAULT_CONTEXT_PREAMBLE)).toBe(true);
    expect(text).toContain("Profil\n- Patiente A · 41 ans · femme");
    expect(text).toContain("- Allergies : arachides");
    expect(text).toContain(
      "- Aime cuisiner : un peu\n- Temps disponible pour cuisiner : faible\n- Budget : économique",
    );
    expect(text).toContain("- Médicaments : lévothyroxine");
    expect(text).toContain("- Compléments hors protocole : magnésium");
    expect(text).toContain(
      "Objectifs en cours\n- améliorer l'énergie (énergie 3/10)",
    );
    expect(text).toContain("Consigne du moment\nPriorité énergie");
    expect(text).toContain("Recommandations actives\nNutrition");
    expect(text).toContain("- Protéines au petit-déjeuner — œufs ou skyr");
    expect(text).toContain(
      "Compléments en cours\n- Vitamine D · 2000 UI · le matin — carence confirmée",
    );
    expect(text).toContain(
      "Essentiels placard / frigo\n- Sardines en boîte — protéines",
    );

    // Off by default — this is the one block a recipe prompt rarely needs.
    expect(text).not.toContain("Résumé");
    expect(text).not.toContain("fatigue installée");

    const order = [
      "Profil",
      "Objectifs en cours",
      "Consigne du moment",
      "Recommandations actives",
      "Compléments en cours",
      "Essentiels placard / frigo",
    ].map((heading) => text.indexOf(heading));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("renders a row without its optional half as the row alone", () => {
    const text = patientContextText(full);

    expect(text).toContain("- réduire les ballonnements\n");
    expect(text).toContain("- Trois légumes par jour\n");
    expect(text).toContain("- Oméga 3 · 1 g\n");
    expect(text).toContain("- Patate douce");
    // No trailing separator where the second half is missing.
    expect(text).not.toContain("— \n");
    expect(text).not.toContain(" · \n");
    expect(text).not.toContain("()");
  });

  it("reduces an empty record to the preamble and the pseudonym", () => {
    // Who the context is about is the one thing always worth emitting; every
    // other field and every other block is absent rather than placeheld.
    expect(patientContextText(empty)).toBe(
      `${DEFAULT_CONTEXT_PREAMBLE}\n\nProfil\n- Patient B`,
    );
  });

  it("omits a block whose every field is empty rather than heading it", () => {
    const text = patientContextText(
      { ...full, instruction: "   ", essentials: [{ item: "  ", why: "x" }] },
      { blocks: { resume: true } },
    );

    expect(text).not.toContain("Consigne du moment");
    expect(text).not.toContain("Essentiels placard / frigo");
    expect(text).toContain("Profil");
  });

  it("omits a recommendation category whose entries are all blank", () => {
    const text = patientContextText({
      ...full,
      recommendations: [
        { categoryLabel: "Nutrition", entries: [{ title: "", detail: "x" }] },
        {
          categoryLabel: "Habitudes",
          entries: [{ title: "Marcher", detail: "" }],
        },
      ],
    });

    expect(text).toContain("Recommandations actives\nHabitudes\n- Marcher");
    expect(text).not.toContain("Nutrition");
  });

  it("drops each block the caller turns off", () => {
    for (const block of [
      "profil",
      "objectifs",
      "consigne",
      "recommandations",
      "complements",
      "essentiels",
    ] as const) {
      const text = patientContextText(full, { blocks: { [block]: false } });
      expect(text).not.toContain(
        {
          profil: "Profil",
          objectifs: "Objectifs en cours",
          consigne: "Consigne du moment",
          recommandations: "Recommandations actives",
          complements: "Compléments en cours",
          essentiels: "Essentiels placard / frigo",
        }[block],
      );
    }
  });

  it("adds the summary when the caller turns it on", () => {
    const text = patientContextText(full, { blocks: { resume: true } });

    expect(text).toContain("Résumé\nVient pour une fatigue installée");
    // Last in the order, after the six protocol blocks.
    expect(text.indexOf("Résumé")).toBeGreaterThan(
      text.indexOf("Essentiels placard / frigo"),
    );
  });

  it("renders only the preamble when every block is off", () => {
    expect(
      patientContextText(full, {
        blocks: {
          profil: false,
          objectifs: false,
          consigne: false,
          recommandations: false,
          complements: false,
          essentiels: false,
          resume: false,
        },
      }),
    ).toBe(DEFAULT_CONTEXT_PREAMBLE);
  });

  it("takes the caller's preamble, and drops it when it is blank", () => {
    const custom = "Tu es diététicien. Améliore le repas décrit ci-dessous.";

    expect(
      patientContextText(full, { preamble: custom }).startsWith(custom),
    ).toBe(true);
    expect(
      patientContextText(full, { preamble: "   " }).startsWith("Profil"),
    ).toBe(true);
  });

  it("renders exactly the rows it is given — archiving is the caller's concern", () => {
    const text = patientContextText({
      ...full,
      goals: [{ title: "objectif archivé passé en entrée", baseline: "" }],
    });

    expect(text).toContain("- objectif archivé passé en entrée");
    expect(text).not.toContain("améliorer l'énergie");
  });

  it("is pure — the same input twice gives the same text", () => {
    expect(patientContextText(full)).toBe(patientContextText(full));
  });
});
