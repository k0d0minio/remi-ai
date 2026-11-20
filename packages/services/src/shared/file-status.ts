/**
 * The file status — stories 5 and 30, D-31. Where a patient's file stands in
 * the care: « Dossier à compléter » → « Prêt pour consultation » →
 * « Recommandations à valider » → « Accompagnement actif ».
 *
 * This module is the one home of the four values, their labels and the moves
 * between them. No other file spells them: a screen reads the labels here, and
 * a write goes through `setFileStatus` in the patients service, which checks
 * the move with `canMoveFileStatus`.
 *
 * It is a different fact from `patient_profiles.status`: that one is the
 * retention lifecycle (`active`, `ended`) and stays as it is.
 *
 * Isomorphic: no I/O, so the patient's pages and the console import it as is.
 */

import type { Locale } from "./i18n";

/** In the order a file moves through them. */
export const fileStatuses = [
  "to_complete",
  "ready",
  "to_validate",
  "active",
] as const;

export type FileStatus = (typeof fileStatuses)[number];

/** A new file starts here, whoever opens it. */
export const initialFileStatus: FileStatus = "to_complete";

/**
 * Client-facing, so in both languages. The French is Morgane's wording. Story
 * 30 says « inscription à compléter ». Story 5's « Dossier à compléter » wins
 * (D-31, Jamie accepted the default on 2026-11-03).
 */
export const fileStatusLabels = {
  to_complete: { fr: "Dossier à compléter"},
  ready: { fr: "Prêt pour consultation"},
  to_validate: {
    fr: "Recommandations à valider"
  },
  active: { fr: "Accompagnement actif"},
} as const satisfies Record<FileStatus, Readonly<Record<Locale, string>>>;

/**
 * The allowed moves, one step forward each. `active` has no next status: a
 * patient change after the activation raises a signal (`patient-change-signals`)
 * and changes no status (Morgane's question 4, default accepted by Jamie on
 * 2026-11-03). A first recommendation on a file still `to_complete` moves
 * nothing either (Jamie, 2026-11-03).
 */
export const fileStatusTransitions = {
  to_complete: ["ready"],
  ready: ["to_validate"],
  to_validate: ["active"],
  active: [],
} as const satisfies Record<FileStatus, readonly FileStatus[]>;

export const isFileStatus = (value: unknown): value is FileStatus =>
  (fileStatuses as readonly unknown[]).includes(value);

/** True when the table allows `from → to`. The same status is no move. */
export const canMoveFileStatus = (from: FileStatus, to: FileStatus) =>
  (fileStatusTransitions[from] as readonly FileStatus[]).includes(to);

/**
 * Who opened the file (story 5). The practitioner from the console, or the
 * patient from the practitioner's sign-up link. A file keeps its origin for
 * life: a patient who takes over a practitioner's file does not change it.
 */
export const fileOrigins = ["practitioner", "patient"] as const;

export type FileOrigin = (typeof fileOrigins)[number];

/**
 * The one rule of which files the practitioner's list shows (story 5,
 * criteria 5, 8 and 9). A file the practitioner opened shows at once, as
 * « Dossier à compléter ». A file the patient opened shows only once its
 * mandatory fields are filled, that is from `ready` on. The patient's
 * answers are saved before that. Only the list hides the file.
 */
export const appearsInPatientList = (file: {
  createdBy: FileOrigin;
  fileStatus: FileStatus;
}) => file.createdBy === "practitioner" || file.fileStatus !== "to_complete";
