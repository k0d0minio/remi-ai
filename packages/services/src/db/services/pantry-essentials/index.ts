import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PantryEssential } from "../../models/pantry-essential";
import { touchPatient } from "../patients";

/**
 * The placard/frigo list Morgane keeps per patient — brainstorm § H.
 *
 * Two things order it and they are not the same: `position` is the order she
 * chose, and `archivedAt` splits the list in force from what has dropped off.
 * A list refresh archives; nothing here deletes by default, because "why did
 * we stop buying the sardines" is answered by a row, not by a memory.
 *
 * The fields an item does *not* have — quantity, season, nutrients — are the
 * point of § H's own warning, so validation here caps the two it does: an item
 * is a short name, and a why is one line, not a paragraph.
 */

const essentials = () =>
  getDatabase().collection<PantryEssential>("patient_pantry_essentials");

const uuidSchema = z.uuid();

const essentialFields = z.object({
  item: z.string().trim().min(1, "an item is required").max(120),
  why: z.string().trim().max(280),
});

export type PantryEssentialInput = Partial<z.infer<typeof essentialFields>>;

/** Her order, with creation time as the tiebreak for rows that predate it. */
const byPosition = (a: PantryEssential, b: PantryEssential) => {
  if (a.position !== b.position) {
    return a.position - b.position;
  }
  return a.createdAt.getTime() - b.createdAt.getTime();
};

const allForPatient = async (
  patientId: Id,
): Promise<readonly PantryEssential[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await essentials().findMany({ patientId }, { limit: 200 });
  return [...page.items].sort(byPosition);
};

/** The list in force — what Morgane hands the patient. */
export const listPantryEssentials = async (
  patientId: Id,
): Promise<readonly PantryEssential[]> =>
  (await allForPatient(patientId)).filter(
    (essential) => essential.archivedAt === null,
  );

/** What dropped off the list, newest archive first. */
export const listArchivedPantryEssentials = async (
  patientId: Id,
): Promise<readonly PantryEssential[]> =>
  (await allForPatient(patientId))
    .filter((essential) => essential.archivedAt !== null)
    .sort(
      (a, b) => (b.archivedAt?.getTime() ?? 0) - (a.archivedAt?.getTime() ?? 0),
    );

/** Appends to the end of the list, leaving the existing run untouched. */
const nextPosition = async (patientId: Id) => {
  const siblings = await allForPatient(patientId);
  return siblings.reduce(
    (highest, essential) => Math.max(highest, essential.position + 1),
    0,
  );
};

export const addPantryEssential = async (
  patientId: Id,
  input: PantryEssentialInput,
): Promise<Result<PantryEssential>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = essentialFields.partial({ why: true }).safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const created = await essentials().insert({
    patientId,
    item: parsed.data.item,
    why: parsed.data.why ?? "",
    position: await nextPosition(patientId),
    archivedAt: null,
  });
  await touchPatient(patientId);
  return ok(created);
};

export const updatePantryEssential = async (
  id: Id,
  input: PantryEssentialInput,
): Promise<Result<PantryEssential>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such pantry essential");
  }
  const parsed = essentialFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const existing = await essentials().findById(id);
  if (!existing) {
    return err("not_found", "no such pantry essential");
  }
  const updated = await essentials().update(id, { ...parsed.data });
  if (!updated) {
    return err("not_found", "no such pantry essential");
  }
  await touchPatient(existing.patientId);
  return ok(updated);
};

/**
 * Moves an item one slot up or down the active list.
 *
 * The move happens in an array and the whole run is then renumbered 0…n-1,
 * rather than swapping the two stored ranks — the same reasoning as the
 * recommendations service: rows that predate a position all carry 0, so
 * swapping stored values would swap two zeroes, and a renumber leaves the run
 * canonical as a side effect of the first reorder.
 */
export const movePantryEssential = async (
  id: Id,
  direction: "up" | "down",
): Promise<Result<PantryEssential>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such pantry essential");
  }
  const existing = await essentials().findById(id);
  if (!existing) {
    return err("not_found", "no such pantry essential");
  }
  const run = await listPantryEssentials(existing.patientId);
  const index = run.findIndex((essential) => essential.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= run.length) {
    // Already at the end of the list: not an error, just nothing to do.
    return ok(existing);
  }

  const reordered = [...run];
  reordered[index] = run[target];
  reordered[target] = run[index];

  for (const [position, essential] of reordered.entries()) {
    if (essential.position !== position) {
      await essentials().update(essential.id, { position });
    }
  }
  await touchPatient(existing.patientId);

  const moved = await essentials().findById(id);
  return moved ? ok(moved) : err("not_found", "no such pantry essential");
};

export const archivePantryEssential = async (
  id: Id,
  archived: boolean,
): Promise<Result<PantryEssential>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such pantry essential");
  }
  const updated = await essentials().update(id, {
    archivedAt: archived ? new Date() : null,
  });
  if (!updated) {
    return err("not_found", "no such pantry essential");
  }
  await touchPatient(updated.patientId);
  return ok(updated);
};

/**
 * The permanent one. Archiving is the everyday move; this exists for a row
 * that should never have been written — a wrong patient, a typo caught twice.
 */
export const deletePantryEssential = async (id: Id): Promise<Result<true>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such pantry essential");
  }
  const existing = await essentials().findById(id);
  const removed = await essentials().remove(id);
  if (!removed) {
    return err("not_found", "no such pantry essential");
  }
  if (existing) {
    await touchPatient(existing.patientId);
  }
  return ok(true);
};
