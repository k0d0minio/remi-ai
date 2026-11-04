import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { FileClaimPurpose } from "../../../shared/file-claim";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientFileClaim } from "../../models/patient-file-claim";
import { systemActor } from "../access";
import { getPatientAccountByProfile } from "../patient-accounts";
import { getPatient } from "../patients";

/**
 * The one-time links into a practitioner-created file
 * (`patient-takes-over-file`, story 1).
 *
 * The token is a capability, stored hashed, as `operator-invitations` does it:
 * SHA-256 of 32 random bytes. The plaintext exists once, in the e-mail.
 *
 * One file has at most one open link. A new link voids the earlier open
 * links of the same file, whatever their purpose: « the mail never arrived »
 * asks for a new link, and two working links would be one too many.
 */

const claims = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientFileClaim>("patient_file_claims");

/** How long each link stays valid (Jamie accepted the defaults, 2026-11-03). */
export const fileClaimLifetimeMs: Record<FileClaimPurpose, number> = {
  activation: 7 * 24 * 60 * 60 * 1000,
  claim: 24 * 60 * 60 * 1000,
};

/** One claim e-mail per file per 5 minutes (question 8, the default). */
export const CLAIM_RESEND_INTERVAL_MS = 5 * 60 * 1000;

const newToken = () => randomBytes(32).toString("base64url");

const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** The shape `newToken` makes. Anything else is not a token: no lookup. */
const tokenShape = /^[A-Za-z0-9_-]{16,128}$/;

const isOpen = (claim: PatientFileClaim, now: number) =>
  claim.usedAt === null && claim.expiresAt.getTime() > now;

/** The plaintext token comes back once, with the row. It is never readable again. */
export type IssuedFileClaim = {
  claim: PatientFileClaim;
  token: string;
};

/**
 * Issues a link for a file with an e-mail and no account.
 *
 * - `not_found`: no such file.
 * - `invalid_input`: the file has no e-mail. The takeover needs one.
 * - `conflict`: the file already has an account. The patient signs in.
 * - `rate_limited`: a `claim` link for this file is younger than five minutes.
 */
export const issueFileClaim = async (
  patientId: Id,
  purpose: FileClaimPurpose,
  options: { now?: Date } = {},
  db?: DatabaseClient,
): Promise<Result<IssuedFileClaim>> => {
  const patient = await getPatient(systemActor, patientId, db);
  if (!patient.ok) {
    return patient;
  }
  if (!patient.data.email?.trim()) {
    return err("invalid_input", "the file has no e-mail to take it over with");
  }
  if (await getPatientAccountByProfile(patientId, db)) {
    return err("conflict", "this file already has an account");
  }

  const now = (options.now ?? new Date()).getTime();
  const existing = await claims(db).findMany(
    { patientProfileId: patientId },
    { limit: 100 },
  );
  const open = existing.items.filter((claim) => isOpen(claim, now));
  if (
    purpose === "claim" &&
    open.some(
      (claim) =>
        claim.purpose === "claim" &&
        now - claim.createdAt.getTime() < CLAIM_RESEND_INTERVAL_MS,
    )
  ) {
    return err("rate_limited", "a claim link went out less than five minutes ago");
  }
  for (const claim of open) {
    await claims(db).remove(claim.id);
  }

  const token = newToken();
  const claim = await claims(db).insert({
    patientProfileId: patientId,
    purpose,
    tokenHash: digest(token),
    expiresAt: new Date(now + fileClaimLifetimeMs[purpose]),
    usedAt: null,
  });
  return ok({ claim, token });
};

/**
 * Resolves a token to its open link, or says why it is not open. The three
 * failures stay apart: a spent link is a thing the patient can act on (sign
 * in, or ask for a new link), unlike a wrong token.
 *
 * - `not_found`: no link has this token.
 * - `conflict`: the link served once already.
 * - `not_permitted`: the link expired.
 */
export const resolveFileClaim = async (
  token: string,
  options: { now?: Date } = {},
  db?: DatabaseClient,
): Promise<Result<PatientFileClaim>> => {
  if (!tokenShape.test(token)) {
    return err("not_found", "this link is not valid");
  }
  const page = await claims(db).findMany(
    { tokenHash: digest(token) },
    { limit: 1 },
  );
  const claim = page.items[0];
  if (!claim) {
    return err("not_found", "this link is not valid");
  }
  if (claim.usedAt !== null) {
    return err("conflict", "this link has already served");
  }
  const now = (options.now ?? new Date()).getTime();
  if (claim.expiresAt.getTime() <= now) {
    return err("not_permitted", "this link has expired");
  }
  return ok(claim);
};

/** Marks the link spent. With `db`, inside the takeover's transaction. */
export const markFileClaimUsed = async (
  id: Id,
  db?: DatabaseClient,
): Promise<Result<PatientFileClaim>> => {
  if (!z.uuid().safeParse(id).success) {
    return err("not_found", "no such link");
  }
  const updated = await claims(db).update(id, { usedAt: new Date() });
  return updated ? ok(updated) : err("not_found", "no such link");
};
