/**
 * Reuse across patients — what a copied row carries, and how a stored template
 * row is read back.
 *
 * Two rules live here, both pure, because both are needed on the server (the
 * copy picker blanks before the rows ever reach the browser) and in the browser
 * (« Enregistrer comme modèle » blanks into the preview she then adapts).
 *
 * The rule that shapes everything below: a row has **factual** fields, which
 * describe the thing itself and are true whoever holds it, and **personal**
 * fields, which were written to one person. A copy carries the factual ones and
 * arrives with the personal ones blank — a « pourquoi » composed for someone
 * else, saved unread onto a third patient, is worse than a blank.
 */

/** The three kinds a template can hold. Recipes reuse through the library. */
export const protocolTemplateKinds = [
  "recommendation",
  "supplement",
  "pantry",
] as const;

export type ProtocolTemplateKindName = (typeof protocolTemplateKinds)[number];

/**
 * The kinds the copy-from-patient picker offers. Recipes join it so an
 * assignment set can be reused, but they are deliberately not templatable: a
 * named set of library recipes is a patient group in disguise, which is parked
 * in `beyond-december/patient-groups`.
 */
export const protocolCopyKinds = [...protocolTemplateKinds, "recipe"] as const;

export type ProtocolCopyKindName = (typeof protocolCopyKinds)[number];

export const isProtocolTemplateKind = (
  value: string,
): value is ProtocolTemplateKindName =>
  (protocolTemplateKinds as readonly string[]).includes(value);

export const isProtocolCopyKind = (
  value: string,
): value is ProtocolCopyKindName =>
  (protocolCopyKinds as readonly string[]).includes(value);

/**
 * Every field of every kind, all optional — the shape a template row is stored
 * as, and the shape the reader below returns.
 *
 * One flat type rather than a discriminated union on purpose: the union would
 * have to be versioned in the stored JSON, and the whole point of the tolerant
 * reader is that stored rows never carry a version to honour.
 */
export type ProtocolRow = {
  category?: string;
  title?: string;
  detail?: string;
  name?: string;
  dose?: string;
  timing?: string;
  reason?: string;
  item?: string;
  why?: string;
};

/** Exported because it names the return of `protocolKindFields` below. */
export type ProtocolField = keyof ProtocolRow;

/** Every field a kind's row shape has, in the order the grid renders them. */
const kindFields: Record<ProtocolTemplateKindName, readonly ProtocolField[]> = {
  recommendation: ["category", "title", "detail"],
  supplement: ["name", "dose", "timing", "reason"],
  pantry: ["item", "why"],
};

/**
 * The fields written to one person. Everything else on a row is factual: a
 * supplement's dose and moment of intake are facts about the supplement, so
 * they travel; its « raison » is § G's justification for *this* patient, so it
 * does not.
 */
const personalFields: Record<
  ProtocolTemplateKindName,
  readonly ProtocolField[]
> = {
  recommendation: ["detail"],
  supplement: ["reason"],
  pantry: ["why"],
};

export const protocolKindFields = (
  kind: ProtocolTemplateKindName,
): readonly ProtocolField[] => kindFields[kind];

export const isPersonalField = (
  kind: ProtocolTemplateKindName,
  field: ProtocolField,
): boolean => personalFields[kind].includes(field);

/**
 * Read one stored row back into a kind's row shape.
 *
 * Tolerant by contract, which is what keeps templates alive across a change to
 * a row shape: a field the stored row does not carry comes back as the empty
 * string — the same default the columns themselves declare — and a field the
 * stored row carries but the kind does not is dropped. So a template saved
 * before a field existed inserts rows with that field empty, and one saved
 * after a field was removed stops mentioning it. Neither needs a migration.
 */
export const readProtocolRow = (
  kind: ProtocolTemplateKindName,
  stored: unknown,
): ProtocolRow => {
  const source =
    stored !== null && typeof stored === "object"
      ? (stored as Record<string, unknown>)
      : {};
  const row: ProtocolRow = {};
  for (const field of kindFields[kind]) {
    const value = source[field];
    row[field] = typeof value === "string" ? value : "";
  }
  return row;
};

/** Read a whole stored `rows` blob — anything that is not a list is no rows. */
export const readProtocolRows = (
  kind: ProtocolTemplateKindName,
  stored: unknown,
): ProtocolRow[] =>
  Array.isArray(stored) ? stored.map((row) => readProtocolRow(kind, row)) : [];

/**
 * Blank the personal fields of a row, keeping the factual ones.
 *
 * This is the one rule behind both reuse paths: the copy picker runs it on the
 * server, so another patient's wording never reaches the browser at all, and
 * « Enregistrer comme modèle » runs it in the browser, so what she then adapts
 * in the preview starts from the facts rather than from one patient's text.
 */
export const blankPersonalFields = (
  kind: ProtocolTemplateKindName,
  row: ProtocolRow,
): ProtocolRow => {
  const blanked = readProtocolRow(kind, row);
  for (const field of personalFields[kind]) {
    blanked[field] = "";
  }
  return blanked;
};

export const blankPersonalFieldsOf = (
  kind: ProtocolTemplateKindName,
  rows: readonly ProtocolRow[],
): ProtocolRow[] => rows.map((row) => blankPersonalFields(kind, row));
