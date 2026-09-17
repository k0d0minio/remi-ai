import { revalidatePath } from "next/cache";
import {
  writeThroughPatientLink,
  type PatientLinkWriteRequest,
} from "@remi/services/server";
import type { Locale, Result } from "@remi/services/shared";
import { ensureDatabase } from "@/lib/database";

/**
 * What a server action on `/p/[token]` calls to write something.
 *
 * Not itself a server action, and deliberately: it takes the write as a
 * callback, and a callback cannot cross the `"use server"` boundary. Each
 * feature's action file is the endpoint — this is what those endpoints go
 * through, so none of them has to remember the rules. The rules themselves
 * live in `@remi/services`, where the in-memory client tests them; what is
 * left here is what only the app knows: registering the adapter, and telling
 * Next.js the segment it just changed.
 *
 * It takes the token and never a patient id. The token in the URL is the whole
 * credential (decision #2, 2026-09-10) — nothing is read from a cookie, no
 * session is created, and an action that could name a patient directly would
 * let anyone write to any record by guessing a uuid.
 */
export const writePatientLink = async <T>(
  locale: Locale,
  token: string,
  request: Omit<PatientLinkWriteRequest<T>, "token">,
): Promise<Result<T>> => {
  ensureDatabase();

  const result = await writeThroughPatientLink({ ...request, token });
  if (result.ok) {
    // The whole token subtree: the navigation lives in the layout and a write
    // can make a segment appear, so revalidating the page alone would leave a
    // patient with a row they cannot navigate to.
    revalidatePath(`/${locale}/p/${token}`, "layout");
  }
  return result;
};
