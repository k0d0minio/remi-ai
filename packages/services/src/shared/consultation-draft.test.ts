import { describe, expect, it } from "vitest";
import {
  clearConsultationDrafts,
  consultationDraftKey,
} from "./consultation-draft";

/** A small in-memory copy of the Web Storage API. */
const memoryStore = (entries: Record<string, string>) => {
  const data = new Map(Object.entries(entries));
  return {
    get length() {
      return data.size;
    },
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    keys: () => [...data.keys()],
  };
};

describe("the consultation draft key", () => {
  it("is the prefix and the patient id", () => {
    expect(consultationDraftKey("p-1")).toBe("remi:consultation:p-1");
  });
});

describe("clearing the consultation drafts at sign-out", () => {
  it("removes every draft and keeps the other keys", () => {
    const store = memoryStore({
      [consultationDraftKey("p-1")]: "{}",
      "remi-theme": "dark",
      [consultationDraftKey("p-2")]: "{}",
      [consultationDraftKey("p-3")]: "{}",
      "other:remi:consultation:p-4": "{}",
    });

    clearConsultationDrafts(() => store);

    expect(store.keys()).toEqual(["remi-theme", "other:remi:consultation:p-4"]);
  });

  it("does nothing when the store is empty or missing", () => {
    const store = memoryStore({});
    expect(() => clearConsultationDrafts(() => store)).not.toThrow();
    expect(() => clearConsultationDrafts(() => undefined)).not.toThrow();
  });

  it("never throws when the store cannot be read", () => {
    expect(() =>
      clearConsultationDrafts(() => {
        throw new Error("SecurityError");
      }),
    ).not.toThrow();
  });

  it("never throws when the store is blocked", () => {
    const blocked = {
      get length(): number {
        throw new Error("SecurityError");
      },
      key: () => null,
      removeItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(() => clearConsultationDrafts(() => blocked)).not.toThrow();
  });

  it("never throws when a removal fails", () => {
    const store = memoryStore({ [consultationDraftKey("p-1")]: "{}" });
    const failing = {
      ...store,
      length: 1,
      removeItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(() => clearConsultationDrafts(() => failing)).not.toThrow();
  });
});
