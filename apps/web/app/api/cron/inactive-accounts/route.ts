import { createHash, timingSafeEqual } from "node:crypto";
import { env, runInactivitySweep } from "@remi/services/server";
import { appHref } from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import { fileStoreReady } from "@/lib/files";
import { mailerReady } from "@/lib/mailer";
import { SIGN_IN_PATH } from "@/lib/patient-auth/paths";

/**
 * The inactivity sweep (`inactive-account-deletion`, privacy policy § 7).
 * Vercel Cron calls it once a day (`vercel.json`). The rule lives in
 * `@remi/services`: a notice at eleven months, the deletion at twelve, a hold
 * that blocks both. `RETENTION.md` says it in words.
 *
 * A trust boundary: the caller must send `Authorization: Bearer <CRON_SECRET>`.
 * The route takes no other input. The answer holds counts only: no name, no
 * e-mail, no id.
 */

export const dynamic = "force-dynamic";

/** Compares digests, so the comparison takes the same time for any guess. */
const sameSecret = (given: string, expected: string) =>
  timingSafeEqual(
    createHash("sha256").update(given).digest(),
    createHash("sha256").update(expected).digest(),
  );

export const GET = async (request: Request) => {
  const secret = env().CRON_SECRET;
  if (!secret) {
    console.error(
      "[cron] CRON_SECRET is unset on this deployment: the inactivity sweep did not run. See .icm/docs/ENV.md.",
    );
    return Response.json({ error: "cron_not_configured" }, { status: 503 });
  }
  const header = request.headers.get("authorization") ?? "";
  if (!sameSecret(header, `Bearer ${secret}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  ensureDatabase();
  if (!mailerReady()) {
    return Response.json({ error: "mailer_not_configured" }, { status: 503 });
  }
  // `deletePatient` removes the files first, and refuses when a file is left
  // with no store to remove it from. The log already names the variable.
  fileStoreReady();
  // It then removes the patient's auth user, and refuses to delete a patient
  // with an account when no auth adapter is registered (REM-133).
  ensureAuthProvider();

  const result = await runInactivitySweep({
    signInUrl: (locale) => appHref("web", SIGN_IN_PATH, locale),
  });
  if (!result.ok) {
    console.error("[cron] the inactivity sweep failed", {
      error: result.error,
      message: result.message,
    });
    return Response.json({ error: result.error }, { status: 503 });
  }
  console.info("[cron] the inactivity sweep ran", result.data);
  return Response.json(result.data);
};
