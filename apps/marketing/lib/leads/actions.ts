"use server";

import {
  createLead,
  isDatabaseRegistered,
  isMailerRegistered,
  sendEmail,
  type LeadInput,
} from "@remi/services/server";
import { ensureDatabase } from "@/lib/database";
import { buildLeadEmail } from "@/lib/lead-email";
import { ensureMailer } from "@/lib/mailer";
import { SITE } from "@/lib/site";
import type { LeadSubmission, SubmitResult } from "./state";

// Nothing but `submitLead` may be exported from this file — see ./state.ts.

/**
 * Stores a lead in Neon and tells Morgane by email (Jamie, 2026-11-03).
 *
 * The two channels are independent on purpose. A deployment without
 * `DATABASE_URL`, or a database without the `leads` table yet, still sends
 * the email. A mailer that fails still keeps the row. The visitor hears
 * « merci » when at least one channel took the lead, and the log names the
 * one that did not. A second submit of the same address on the same list is
 * a success with no second email: there is nothing to reveal to the visitor.
 */
export const submitLead = async (
  submission: LeadSubmission,
): Promise<SubmitResult> => {
  if (submission.website) {
    return { ok: true };
  }

  const input: LeadInput = {
    type: submission.type,
    email: submission.email,
    firstName: submission.firstName,
    lastName: submission.lastName,
    phone: submission.phone,
    offerInterest: submission.offerInterest,
    profession: submission.profession,
    message: submission.message,
    consentTextVersion: SITE.consentTextVersion,
  };

  let stored = false;
  ensureDatabase();
  if (isDatabaseRegistered()) {
    try {
      const written = await createLead(input);
      if (!written.ok) {
        // The browser checked the same rules. What reaches here is a request
        // that did not come from the form, and it gets the generic answer.
        return { ok: false, reason: "server" };
      }
      if (written.data.duplicate) {
        return { ok: true };
      }
      stored = true;
    } catch (error) {
      console.error("[leads] store failed — the email still goes out", error);
    }
  }

  let mailed = false;
  ensureMailer();
  if (isMailerRegistered()) {
    try {
      await sendEmail(buildLeadEmail(input));
      mailed = true;
    } catch (error) {
      console.error("[leads] notification failed", error);
    }
  }

  if (!stored && !mailed) {
    console.error("[leads] a lead reached neither the database nor the email");
    return { ok: false, reason: "server" };
  }
  return { ok: true };
};
