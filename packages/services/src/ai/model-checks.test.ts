import { describe, expect, it } from "vitest";
import type { CatalogueModel } from "./index";
import { checkModelForRole, failedChecks } from "./model-checks";

const model = (patch: Partial<CatalogueModel> = {}): CatalogueModel => ({
  id: "acme/small",
  name: "Acme Small",
  type: "language",
  tags: ["tool-use", "structured-output"],
  noTraining: "all",
  zdr: "none",
  ...patch,
});

describe("checkModelForRole", () => {
  it("passes a listed model with structured output and no training", () => {
    const catalogue = [model()];
    expect(checkModelForRole(catalogue, "acme/small")).toEqual({
      ok: true,
      model: catalogue[0],
    });
  });

  it("does not block on zdr", () => {
    for (const zdr of ["all", "some", "none", null]) {
      expect(checkModelForRole([model({ zdr })], "acme/small").ok).toBe(true);
    }
  });

  it("refuses an id that the catalogue does not list", () => {
    expect(checkModelForRole([model()], "acme/other")).toEqual({
      ok: false,
      failed: "not_listed",
      model: null,
    });
  });

  it("matches the id exactly", () => {
    expect(checkModelForRole([model()], "Acme/Small").ok).toBe(false);
    expect(checkModelForRole([model()], "acme/small ").ok).toBe(false);
  });

  it("refuses a model with no structured output", () => {
    expect(
      checkModelForRole([model({ tags: ["tool-use"] })], "acme/small"),
    ).toMatchObject({ ok: false, failed: "no_structured_output" });
  });

  it.each(["some", "none", null, "ALL", ""])(
    "refuses a model whose no_training is %s",
    (noTraining) => {
      expect(
        checkModelForRole([model({ noTraining })], "acme/small"),
      ).toMatchObject({ ok: false, failed: "may_train" });
    },
  );

  it("names the first failed check, in the order of the checks", () => {
    const entry = model({ tags: [], noTraining: "none" });
    expect(checkModelForRole([entry], "acme/small")).toMatchObject({
      failed: "no_structured_output",
    });
    expect(failedChecks(entry)).toEqual(["no_structured_output", "may_train"]);
  });
});
