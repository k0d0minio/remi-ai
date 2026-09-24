import type { Entity, Id } from "../../types";
import type {
  documentKinds,
  documentTags,
  DocumentFileType,
} from "../../shared/files";

export type DocumentKind = (typeof documentKinds)[number];
export type DocumentTag = (typeof documentTags)[number];

/**
 * One document Morgane put on a patient's page — a PDF or an image she
 * uploaded, or a link with a title. The patient reads it through the link and
 * never writes one.
 *
 * A file carries `blobKey`, `mime` and `size` and no `url`; a link carries
 * `url` and none of the three. It attaches to at most one of a goal or one of
 * the patient's recipe assignments (D-26) — both null is the common case —
 * and deleting either parent leaves the document on the patient, unattached.
 */
export type PatientDocument = Entity & {
  patientId: Id;
  kind: DocumentKind;
  tag: DocumentTag;
  title: string;
  url: string | null;
  blobKey: string | null;
  mime: DocumentFileType | null;
  size: number | null;
  goalId: Id | null;
  recipeAssignmentId: Id | null;
  /** The operator's email as it read when she added it — text, not a key. */
  addedByEmail: string;
  /** `YYYY-MM-DD` at the practice — what the patient sees beside the title. */
  addedOn: string;
};
