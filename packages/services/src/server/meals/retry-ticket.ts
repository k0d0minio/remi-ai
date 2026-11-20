/**
 * The ticket of the one second suggestion of a meal — REM-103, story 28.
 *
 * Pure: the caller gives the secret and the clock. The ticket is a signed
 * value that the page holds between the first answer and « Une autre
 * suggestion ». No table holds a suggestion yet, so the ticket carries what
 * the second generation needs: the meal, and the improvement that the patient
 * refused.
 *
 * What the signature gives:
 * - The page cannot write a ticket. The server signs one ticket for a meal, at
 *   the first answer, and no other code path signs one.
 * - The page cannot change the patient, the meal or the refused improvement.
 *   The refused text goes into a prompt: it is the text that the gate
 *   confirmed, not a text from the page.
 *
 * What the signature does not give: a signed value can be sent two times. The
 * claim on the meal's row stops that (`claimMealRetry`): `version` is the
 * row's `updatedAt` when the ticket was signed, and the claim moves it.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { mealImprovementKinds } from "../../shared/meal-suggestion";

/** A patient answers a suggestion at once. Two hours is a wide limit. */
export const MEAL_RETRY_TTL_SECONDS = 60 * 60 * 2;

/** The longest ticket that the reader parses. A real one is far shorter. */
const TICKET_MAX_LENGTH = 2000;

/**
 * Not the cookie's text: a ticket and a session cookie share the secret, and
 * this label keeps each one useless as the other.
 */
const PURPOSE = "remi.meal-retry.v1";

const claimSchema = z.object({
  patientId: z.uuid(),
  mealId: z.uuid(),
  /** `updatedAt` of the meal's row, in milliseconds, when the ticket was signed. */
  version: z.number().int().nonnegative(),
  refused: z.object({
    kind: z.enum(mealImprovementKinds),
    food: z.string().min(1).max(60),
    replaces: z.string().max(60).nullable(),
  }),
  /** Unix seconds after which the ticket is dead. */
  exp: z.number().int(),
});

export type MealRetryClaim = z.infer<typeof claimSchema>;

const signature = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(`${PURPOSE}.${payload}`).digest("base64url");

export const signMealRetry = (claim: MealRetryClaim, secret: string): string => {
  const payload = Buffer.from(JSON.stringify(claim)).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
};

/** The claim, or null for a ticket that is changed, expired or malformed. */
export const readMealRetry = (
  ticket: unknown,
  secret: string,
  nowMs: number,
): MealRetryClaim | null => {
  if (typeof ticket !== "string" || ticket.length > TICKET_MAX_LENGTH) {
    return null;
  }
  const [payload, given, ...rest] = ticket.split(".");
  if (!payload || !given || rest.length > 0) {
    return null;
  }
  const expected = Buffer.from(signature(payload, secret));
  const received = Buffer.from(given);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }
  try {
    const parsed = claimSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString()),
    );
    if (!parsed.success || parsed.data.exp * 1000 <= nowMs) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};
