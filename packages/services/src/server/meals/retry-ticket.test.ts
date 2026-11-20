import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  MEAL_RETRY_TTL_SECONDS,
  readMealRetry,
  signMealRetry,
  type MealRetryClaim,
} from "./retry-ticket";

/** Made for each run: no key is written in a test file. */
const key = randomBytes(32).toString("base64url");
const otherKey = randomBytes(32).toString("base64url");
const NOW = Date.UTC(2026, 10, 20, 12, 0, 0);

const claim = (overrides: Partial<MealRetryClaim> = {}): MealRetryClaim => ({
  patientId: "11111111-1111-4111-8111-111111111111",
  mealId: "22222222-2222-4222-8222-222222222222",
  version: NOW - 5000,
  refused: { kind: "replace", food: "riz complet", replaces: "riz blanc" },
  exp: Math.floor(NOW / 1000) + MEAL_RETRY_TTL_SECONDS,
  ...overrides,
});

/** The same ticket with another payload, and the first signature. */
const withPayload = (ticket: string, changed: MealRetryClaim) => {
  const payload = Buffer.from(JSON.stringify(changed)).toString("base64url");
  return `${payload}.${ticket.split(".")[1]}`;
};

describe("the ticket of the second meal suggestion", () => {
  it("reads back the claim that the server signed", () => {
    const ticket = signMealRetry(claim(), key);

    expect(readMealRetry(ticket, key, NOW)).toEqual(claim());
  });

  it("refuses a ticket that the page changed", () => {
    const ticket = signMealRetry(claim(), key);
    const changes: MealRetryClaim[] = [
      claim({ version: NOW }),
      claim({ mealId: "33333333-3333-4333-8333-333333333333" }),
      claim({ patientId: "44444444-4444-4444-8444-444444444444" }),
      claim({ refused: { kind: "add", food: "sucre", replaces: null } }),
      claim({ exp: Math.floor(NOW / 1000) + 10 * MEAL_RETRY_TTL_SECONDS }),
    ];

    for (const changed of changes) {
      expect(readMealRetry(withPayload(ticket, changed), key, NOW)).toBeNull();
    }
  });

  it("refuses a ticket that another key signed", () => {
    const ticket = signMealRetry(claim(), otherKey);

    expect(readMealRetry(ticket, key, NOW)).toBeNull();
  });

  it("refuses an expired ticket", () => {
    const ticket = signMealRetry(claim(), key);
    const later = NOW + (MEAL_RETRY_TTL_SECONDS + 1) * 1000;

    expect(readMealRetry(ticket, key, later)).toBeNull();
  });

  it("refuses a value that is not a ticket", () => {
    expect(readMealRetry(null, key, NOW)).toBeNull();
    expect(readMealRetry("", key, NOW)).toBeNull();
    expect(readMealRetry("a.b.c", key, NOW)).toBeNull();
    expect(readMealRetry("x".repeat(3000), key, NOW)).toBeNull();
  });
});
