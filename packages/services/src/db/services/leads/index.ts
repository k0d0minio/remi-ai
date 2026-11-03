import { z } from "zod";
import { leadTypes, offerInterests, type LeadType } from "../../../shared/leads";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { Lead } from "../../models/lead";

/**
 * The waiting lists of the public site (triage/morgane-transmission).
 *
 * The site calls `createLead` from a server action and never reaches the
 * table itself. The console reads with `listLeads` and marks a row with
 * `setLeadContacted`. Nothing deletes a lead here: a person who asks to be
 * forgotten is a hand operation on the database until a ticket says otherwise.
 */

const rows = () => getDatabase().collection<Lead>("leads");

const optionalText = (max: number) => z.string().trim().max(max).optional();

const leadInput = z.object({
  type: z.enum(leadTypes),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("a valid email address is required")),
  firstName: optionalText(120),
  lastName: optionalText(120),
  phone: optionalText(40),
  offerInterest: z.enum(offerInterests).optional(),
  profession: optionalText(200),
  message: optionalText(2000),
  consentTextVersion: z.string().trim().min(1),
});

export type LeadInput = z.input<typeof leadInput>;

/** The form sends an empty string for a field left blank. The row holds null. */
const blankToNull = (value: string | undefined): string | null =>
  value === undefined || value === "" ? null : value;

export type LeadWrite = {
  lead: Lead;
  /** True when this address was already on this list. The row is the old one. */
  duplicate: boolean;
};

const findExisting = async (type: LeadType, email: string) =>
  (await rows().findMany({ type, email }, { limit: 1 })).items[0] ?? null;

/**
 * Stores one lead. A second submit of the same address on the same list
 * returns the existing row with `duplicate: true`, so the caller can answer
 * the visitor with the same success either way.
 */
export const createLead = async (
  input: LeadInput,
): Promise<Result<LeadWrite>> => {
  const parsed = leadInput.safeParse(input);
  if (!parsed.success) {
    return err(
      "invalid_input",
      "a lead needs a list, a valid email address and the consent version",
    );
  }
  const data = parsed.data;
  const firstName = blankToNull(data.firstName);
  const profession = blankToNull(data.profession);
  if (data.type !== "info_request" && !firstName) {
    return err("invalid_input", "a pilot lead needs a first name");
  }
  if (data.type === "practitioner_pilot" && !profession) {
    return err("invalid_input", "a practitioner lead needs a profession");
  }

  const existing = await findExisting(data.type, data.email);
  if (existing) {
    return ok({ lead: existing, duplicate: true });
  }
  try {
    const lead = await rows().insert({
      type: data.type,
      email: data.email,
      firstName,
      lastName: blankToNull(data.lastName),
      phone: blankToNull(data.phone),
      offerInterest: data.type === "patient_pilot" ? (data.offerInterest ?? null) : null,
      profession: data.type === "practitioner_pilot" ? profession : null,
      message: blankToNull(data.message),
      consentTextVersion: data.consentTextVersion,
      contactedAt: null,
    });
    return ok({ lead, duplicate: false });
  } catch (cause) {
    // The unique index caught a second submit that raced the read above.
    const raced = await findExisting(data.type, data.email);
    if (raced) {
      return ok({ lead: raced, duplicate: true });
    }
    throw cause;
  }
};

export type LeadQuery = {
  type?: LeadType | "all";
  /** `pending` is the default view of the console: the rows still to answer. */
  state?: "pending" | "contacted" | "all";
};

/** The leads the console shows, newest first. */
export const listLeads = async (query: LeadQuery = {}): Promise<Lead[]> => {
  const filter = query.type && query.type !== "all" ? { type: query.type } : {};
  const page = await rows().findMany(filter, { limit: 500 });
  const state = query.state ?? "all";
  const items = page.items.filter((lead) =>
    state === "all"
      ? true
      : state === "contacted"
        ? lead.contactedAt !== null
        : lead.contactedAt === null,
  );
  return [...items].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
};

export const getLead = async (id: Id): Promise<Result<Lead>> => {
  const lead = await rows().findById(id);
  return lead ? ok(lead) : err("not_found", "no such lead");
};

/** Morgane's own mark: she wrote back, or she takes the mark off again. */
export const setLeadContacted = async (
  id: Id,
  contacted: boolean,
): Promise<Result<Lead>> => {
  const current = await rows().findById(id);
  if (!current) {
    return err("not_found", "no such lead");
  }
  const updated = await rows().update(id, {
    contactedAt: contacted ? new Date() : null,
  });
  return updated ? ok(updated) : err("not_found", "no such lead");
};
