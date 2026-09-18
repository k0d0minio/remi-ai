import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import {
  isProtocolTemplateKind,
  readProtocolRow,
  readProtocolRows,
  type ProtocolRow,
  type ProtocolTemplateKindName,
} from "../../../shared/protocol-reuse";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type {
  ProtocolTemplate,
  ProtocolTemplateView,
} from "../../models/protocol-template";

/**
 * Personal templates — a named set of protocol rows saved once and inserted
 * into any patient.
 *
 * The permission rule lives here rather than at the call sites, because there
 * are four of them and a comparison written by hand in a component is the one
 * that gets forgotten: **a template belongs to the operator who saved it.** She
 * may rename, overwrite, delete and change the share flag on her own sets; a
 * set someone else shared she may only insert. Every mutation below therefore
 * takes the asking operator and refuses on a mismatch with `not_permitted`,
 * never a silent no-op.
 *
 * Nothing here touches a patient. Saving a template writes no patient row, and
 * inserting one only fills a grid the operator still has to save — which is why
 * the audit trail records the save and not the insert.
 */

const templates = () =>
  getDatabase().collection<ProtocolTemplate>("protocol_templates");

const uuidSchema = z.uuid();

const nameSchema = z.string().trim().min(1, "a name is required").max(120);

/** A stored blob can be anything; a template of an unknown kind is not shown. */
const knownKind = (template: ProtocolTemplate): boolean =>
  isProtocolTemplateKind(template.kind);

const byName = (a: ProtocolTemplateView, b: ProtocolTemplateView) =>
  a.name.localeCompare(b.name, "fr");

/**
 * Read a stored template into the shape a grid is filled from, resolving
 * ownership against the operator asking.
 */
const view = (
  template: ProtocolTemplate,
  operatorId: Id,
): ProtocolTemplateView => ({
  ...template,
  rows: readProtocolRows(template.kind, template.rows),
  owned: template.operatorId === operatorId,
});

/**
 * Every template of one kind this operator may insert: her own, plus the ones
 * another operator has shared.
 *
 * The filter is applied in memory for the same reason `listPatients` does it —
 * the seam speaks in exact-match filters only, and "mine or shared" is not one.
 * A console with two operators and a handful of named sets each does not earn a
 * query language.
 */
export const listProtocolTemplates = async (
  operatorId: Id,
  kind: ProtocolTemplateKindName,
): Promise<readonly ProtocolTemplateView[]> => {
  if (!uuidSchema.safeParse(operatorId).success) {
    return [];
  }
  const page = await templates().findMany({ kind }, { limit: 200 });
  return page.items
    .filter(knownKind)
    .filter((template) => template.operatorId === operatorId || template.shared)
    .map((template) => view(template, operatorId))
    .sort(byName);
};

/** One template, if this operator may insert it at all. */
export const getProtocolTemplate = async (
  id: Id,
  operatorId: Id,
): Promise<Result<ProtocolTemplateView>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such template");
  }
  const template = await templates().findById(id);
  if (!template || !knownKind(template)) {
    return err("not_found", "no such template");
  }
  if (template.operatorId !== operatorId && !template.shared) {
    return err("not_found", "no such template");
  }
  return ok(view(template, operatorId));
};

/**
 * Her own set under this name, if one exists — what makes a re-save an
 * overwrite rather than a second set with the same name. Deliberately scoped to
 * her own: a set someone else shared under the same name is not hers to replace.
 */
const ownTemplateNamed = async (
  operatorId: Id,
  kind: ProtocolTemplateKindName,
  name: string,
): Promise<ProtocolTemplate | null> => {
  const page = await templates().findMany({ operatorId, kind }, { limit: 200 });
  const match = page.items.find(
    (template) =>
      template.name.localeCompare(name, "fr", { sensitivity: "base" }) === 0,
  );
  return match ?? null;
};

export type SavedProtocolTemplate = {
  template: ProtocolTemplateView;
  /** True when the save replaced one of her own sets rather than adding one. */
  overwritten: boolean;
};

/**
 * Save a named set, replacing her own set of the same name and kind.
 *
 * The rows are normalised through the tolerant reader on the way in as well as
 * on the way out, so a stored blob never carries a field the kind does not have
 * — the reader stays the only thing that decides a row's shape, in both
 * directions.
 */
export const saveProtocolTemplate = async (
  operatorId: Id,
  kind: ProtocolTemplateKindName,
  name: string,
  rows: readonly ProtocolRow[],
): Promise<Result<SavedProtocolTemplate>> => {
  if (!uuidSchema.safeParse(operatorId).success) {
    return err("not_found", "no such operator");
  }
  const parsedName = nameSchema.safeParse(name);
  if (!parsedName.success) {
    return err("invalid_input", parsedName.error.issues[0].message);
  }
  const normalised = rows.map((row) => readProtocolRow(kind, row));
  if (normalised.length === 0) {
    return err("invalid_input", "a template needs at least one row");
  }

  const existing = await ownTemplateNamed(operatorId, kind, parsedName.data);
  if (existing) {
    const updated = await templates().update(existing.id, {
      name: parsedName.data,
      rows: normalised,
    });
    if (!updated) {
      return err("not_found", "no such template");
    }
    return ok({ template: view(updated, operatorId), overwritten: true });
  }

  const created = await templates().insert({
    operatorId,
    kind,
    name: parsedName.data,
    rows: normalised,
    shared: false,
  });
  return ok({ template: view(created, operatorId), overwritten: false });
};

/**
 * The three mutations only an owner may make. Each re-reads the row and checks
 * ownership before writing — a check done in the component that opened the menu
 * is a courtesy, not a control (`apps/admin/AGENTS.md`).
 */
const ownedTemplate = async (
  id: Id,
  operatorId: Id,
): Promise<Result<ProtocolTemplate>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such template");
  }
  const template = await templates().findById(id);
  if (!template || !knownKind(template)) {
    return err("not_found", "no such template");
  }
  if (template.operatorId !== operatorId) {
    return err("not_permitted", "this template belongs to another operator");
  }
  return ok(template);
};

export const renameProtocolTemplate = async (
  id: Id,
  operatorId: Id,
  name: string,
): Promise<Result<ProtocolTemplateView>> => {
  const owned = await ownedTemplate(id, operatorId);
  if (!owned.ok) {
    return owned;
  }
  const parsedName = nameSchema.safeParse(name);
  if (!parsedName.success) {
    return err("invalid_input", parsedName.error.issues[0].message);
  }
  const clash = await ownTemplateNamed(
    operatorId,
    owned.data.kind,
    parsedName.data,
  );
  if (clash && clash.id !== id) {
    return err("invalid_input", "another template already uses that name");
  }
  const updated = await templates().update(id, { name: parsedName.data });
  if (!updated) {
    return err("not_found", "no such template");
  }
  return ok(view(updated, operatorId));
};

export const setProtocolTemplateShared = async (
  id: Id,
  operatorId: Id,
  shared: boolean,
): Promise<Result<ProtocolTemplateView>> => {
  const owned = await ownedTemplate(id, operatorId);
  if (!owned.ok) {
    return owned;
  }
  const updated = await templates().update(id, { shared });
  if (!updated) {
    return err("not_found", "no such template");
  }
  return ok(view(updated, operatorId));
};

/**
 * Deleted outright, not archived.
 *
 * The archive-don't-delete rule everywhere else in this package exists because
 * a patient's stopped supplement is history worth keeping. A template is not
 * anyone's history: it is a shortcut she authored, and a deleted shortcut
 * leaves every row it ever inserted exactly where it was.
 */
export const deleteProtocolTemplate = async (
  id: Id,
  operatorId: Id,
): Promise<Result<ProtocolTemplateView>> => {
  const owned = await ownedTemplate(id, operatorId);
  if (!owned.ok) {
    return owned;
  }
  const removed = await templates().remove(id);
  if (!removed) {
    return err("not_found", "no such template");
  }
  return ok(view(owned.data, operatorId));
};
