import { describe, expect, it } from "vitest";
import {
  awaitsCheckInOn,
  checkInCategories,
  firstRecommendationPerCategory,
  isCheckInCategory,
  orderCheckInRotation,
  type CheckInSubject,
} from "./patient";
import type { RecommendationCategory } from "../db/models/recommendation";

/**
 * The "principales" rule the console's at-a-glance and the patient link's home
 * both render from. Asserted from the criterion — the first active
 * recommendation of each category, by position — rather than from either
 * caller, which is what makes it the place the two surfaces cannot drift.
 */
const rec = (category: string, title: string) =>
  ({ category, title }) as { category: "nutrition"; title: string };

describe("the first recommendation of each category", () => {
  it("takes the head of each category's run, in category order", () => {
    const picked = firstRecommendationPerCategory([
      rec("nutrition", "Légumes à chaque repas"),
      rec("nutrition", "Moins de sucre le matin"),
      rec("habit", "Marcher après le déjeuner"),
      rec("monitoring", "Peser le lundi"),
    ]);

    expect(picked.map((entry) => entry.title)).toEqual([
      "Légumes à chaque repas",
      "Marcher après le déjeuner",
      "Peser le lundi",
    ]);
  });

  it("never returns two of the same category", () => {
    const picked = firstRecommendationPerCategory([
      rec("habit", "Première"),
      rec("habit", "Deuxième"),
      rec("habit", "Troisième"),
    ]);

    expect(picked).toHaveLength(1);
    expect(picked[0].title).toBe("Première");
  });

  it("skips a category with nothing in it rather than padding", () => {
    const picked = firstRecommendationPerCategory([
      rec("activity", "Vélo le week-end"),
    ]);

    expect(picked).toHaveLength(1);
  });

  it("is empty when nothing is active, which is a real state", () => {
    expect(firstRecommendationPerCategory([])).toEqual([]);
  });

  it("preserves the order it is given within a category", () => {
    // The caller sorts by position; re-sorting here would mean reordering in
    // the console stopped reordering what the patient sees.
    const picked = firstRecommendationPerCategory([
      rec("nutrition", "Position 0"),
      rec("nutrition", "Position 1"),
    ]);

    expect(picked[0].title).toBe("Position 0");
  });
});

/**
 * The rotation behind decision D-9's « comment ça se passe ? ». Asserted from
 * the acceptance criteria — least-recently-answered first, asked once a
 * calendar day — rather than from the home that renders it.
 */
const subject = (
  id: string,
  lastAnsweredOn: string | null,
  kind: CheckInSubject["kind"] = "goal",
): CheckInSubject => ({ id, kind, lastAnsweredOn });

describe("which subject the check-in asks about next", () => {
  it("leads with a subject nobody has ever answered", () => {
    const ordered = orderCheckInRotation([
      subject("answered-recently", "2026-09-17"),
      subject("never-answered", null),
      subject("answered-long-ago", "2026-08-01"),
    ]);

    expect(ordered.map((entry) => entry.id)).toEqual([
      "never-answered",
      "answered-long-ago",
      "answered-recently",
    ]);
  });

  it("puts the oldest answer first among subjects that have one", () => {
    const ordered = orderCheckInRotation([
      subject("newest", "2026-09-18"),
      subject("oldest", "2026-09-01"),
      subject("middle", "2026-09-10"),
    ]);

    expect(ordered.map((entry) => entry.id)).toEqual([
      "oldest",
      "middle",
      "newest",
    ]);
  });

  it("keeps the caller's order when two subjects were last answered the same day", () => {
    const ordered = orderCheckInRotation([
      subject("first-goal", "2026-09-10"),
      subject("second-goal", "2026-09-10"),
      subject("third-goal", "2026-09-10"),
    ]);

    expect(ordered.map((entry) => entry.id)).toEqual([
      "first-goal",
      "second-goal",
      "third-goal",
    ]);
  });

  it("rotates: answering today's subject sends it to the back tomorrow", () => {
    const before = orderCheckInRotation([
      subject("energy", "2026-09-01"),
      subject("sleep", "2026-09-02"),
    ]);
    expect(before[0].id).toBe("energy");

    const after = orderCheckInRotation([
      subject("energy", "2026-09-18"),
      subject("sleep", "2026-09-02"),
    ]);
    expect(after[0].id).toBe("sleep");
  });

  it("mixes goals and recommendations in one rotation", () => {
    const ordered = orderCheckInRotation([
      subject("goal", "2026-09-17"),
      subject("recommendation", null, "recommendation"),
    ]);

    expect(ordered[0].kind).toBe("recommendation");
  });

  it("leaves the input untouched", () => {
    const subjects = [subject("b", "2026-09-10"), subject("a", null)];
    orderCheckInRotation(subjects);

    expect(subjects.map((entry) => entry.id)).toEqual(["b", "a"]);
  });
});

describe("whether the home asks today", () => {
  it("asks when nothing has been answered today", () => {
    expect(
      awaitsCheckInOn([subject("energy", "2026-09-17")], "2026-09-18"),
    ).toBe(true);
  });

  it("asks when the patient has never answered at all", () => {
    expect(awaitsCheckInOn([subject("energy", null)], "2026-09-18")).toBe(true);
  });

  it("stops asking once any subject carries today's date", () => {
    expect(
      awaitsCheckInOn(
        [subject("energy", "2026-09-18"), subject("sleep", "2026-09-01")],
        "2026-09-18",
      ),
    ).toBe(false);
  });

  it("asks again the next calendar day", () => {
    const answered = [subject("energy", "2026-09-18")];

    expect(awaitsCheckInOn(answered, "2026-09-18")).toBe(false);
    expect(awaitsCheckInOn(answered, "2026-09-19")).toBe(true);
  });

  it("asks nothing of a patient with no goals and no recommendations", () => {
    expect(awaitsCheckInOn([], "2026-09-18")).toBe(false);
  });
});

describe("which recommendations the check-in may ask about", () => {
  it("covers habits, activity and monitoring, and nothing to do with food", () => {
    expect(checkInCategories).toEqual(["habit", "activity", "monitoring"]);
    expect(isCheckInCategory("nutrition")).toBe(false);
    expect(isCheckInCategory("supplement")).toBe(false);
  });

  it("narrows to the first recommendation of each askable category", () => {
    // Typed as the service returns them, so the filter below narrows a real
    // union rather than a cast — food in, food out is the thing being asserted.
    const protocol: readonly {
      category: RecommendationCategory;
      title: string;
    }[] = [
      { category: "nutrition", title: "Légumes à chaque repas" },
      { category: "habit", title: "Se coucher avant 23h" },
      { category: "habit", title: "Pas d'écran au lit" },
      { category: "supplement", title: "Magnésium le soir" },
      { category: "monitoring", title: "Peser le lundi" },
    ];

    const askable = firstRecommendationPerCategory(
      protocol.filter((entry) => isCheckInCategory(entry.category)),
    );

    expect(askable.map((entry) => entry.title)).toEqual([
      "Se coucher avant 23h",
      "Peser le lundi",
    ]);
  });
});
