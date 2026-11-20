/**
 * The layout of the practitioner's patient file — stories 5 and 6.
 *
 * The page follows the file status. This module is the one home of that rule:
 * which sections the page has, which of them are open in the work column,
 * which are folded rows, in which order, and what the action card shows.
 *
 * To add a section, add one line to `patientFileSections` with its group. The
 * group decides where the section goes at each status. The console gives each
 * section its title and its body.
 *
 * Isomorphic and pure: no I/O, no text. It lives here, not in the console,
 * because the console has no test runner.
 */

import type { FileStatus } from "./file-status";

/**
 * The groups of sections, by the practitioner's work and not by table:
 * - `answers`: what the patient declared.
 * - `calculations`: what REMI computes from the answers.
 * - `protocol`: what the practitioner prescribes.
 * - `follow_up`: what happens between two consultations.
 * - `preparation`: the practitioner's own notes and tools.
 * - `resources`: what the patient receives.
 * - `profile`: the administrative record.
 */
export const patientFileGroups = [
  "answers",
  "calculations",
  "protocol",
  "follow_up",
  "preparation",
  "resources",
  "profile",
] as const;

export type PatientFileGroup = (typeof patientFileGroups)[number];

/**
 * Every section of the page. The `id` is the anchor of the section in the
 * page. Inside a group, the sections keep the order of this list.
 */
export const patientFileSections = [
  { id: "patient-file", group: "answers" },
  { id: "calculations", group: "calculations" },
  { id: "objectifs", group: "protocol" },
  { id: "recommendations", group: "protocol" },
  { id: "food-directives", group: "protocol" },
  { id: "meal-structure", group: "protocol" },
  { id: "supplements", group: "protocol" },
  { id: "lifestyle-advice", group: "protocol" },
  { id: "pantry", group: "protocol" },
  { id: "messages", group: "follow_up" },
  { id: "meals", group: "follow_up" },
  { id: "retain", group: "follow_up" },
  { id: "consultations", group: "follow_up" },
  { id: "challenges", group: "follow_up" },
  { id: "preparation", group: "preparation" },
  { id: "summary", group: "preparation" },
  { id: "anamnesis", group: "preparation" },
  { id: "copy-context", group: "preparation" },
  { id: "recipes", group: "resources" },
  { id: "documents", group: "resources" },
  { id: "patient-link", group: "resources" },
  { id: "profile", group: "profile" },
  { id: "consents", group: "profile" },
] as const satisfies readonly { id: string; group: PatientFileGroup }[];

export type PatientFileSectionId = (typeof patientFileSections)[number]["id"];

/**
 * What the action card shows, one for each status:
 * - `complete`: the missing information.
 * - `prepare`: the appointment and the preparation note.
 * - `validate`: what the validation will hold, and its button.
 * - `follow`: the validated version and the patient's open changes.
 */
export type PatientFileAction = "complete" | "prepare" | "validate" | "follow";

export type PatientFileRowGroup = {
  group: PatientFileGroup;
  sections: readonly PatientFileSectionId[];
};

export type PatientFileLayout = {
  action: PatientFileAction;
  /**
   * The sections that the action card holds at this status. They are in the
   * card and not in `work` or `rows`, so the page shows each form one time.
   */
  inAction: readonly PatientFileSectionId[];
  /** The open blocks of the work column, in the order of the page. */
  work: readonly PatientFileSectionId[];
  /** The folded rows under the work column, group by group. */
  rows: readonly PatientFileRowGroup[];
};

type Plan = {
  action: PatientFileAction;
  inAction: readonly PatientFileSectionId[];
  open: readonly PatientFileGroup[];
  folded: readonly PatientFileGroup[];
};

/**
 * Before the consultation the answers come first and the calculations under
 * them (story 6). From « Recommandations à valider » on, the protocol comes
 * first and the answers become the first folded row.
 */
const beforeConsultation = {
  open: ["answers", "calculations"],
  folded: ["protocol", "preparation", "follow_up", "resources", "profile"],
} as const satisfies Pick<Plan, "open" | "folded">;

const fromProtocol = {
  open: ["protocol", "calculations"],
  folded: ["answers", "follow_up", "preparation", "resources", "profile"],
} as const satisfies Pick<Plan, "open" | "folded">;

const plans = {
  to_complete: { action: "complete", inAction: [], ...beforeConsultation },
  // The appointment and the preparation note are the work of this status.
  ready: { action: "prepare", inAction: ["preparation"], ...beforeConsultation },
  to_validate: { action: "validate", inAction: [], ...fromProtocol },
  active: { action: "follow", inAction: [], ...fromProtocol },
} as const satisfies Record<FileStatus, Plan>;

/** The layout of the page for one file status. Each section is in it once. */
export const patientFileLayout = (status: FileStatus): PatientFileLayout => {
  const plan: Plan = plans[status];
  const sectionsOf = (group: PatientFileGroup): PatientFileSectionId[] =>
    patientFileSections
      .filter((section) => section.group === group)
      .map((section) => section.id)
      .filter((id) => !plan.inAction.includes(id));
  return {
    action: plan.action,
    inAction: plan.inAction,
    work: plan.open.flatMap(sectionsOf),
    rows: plan.folded
      .map((group) => ({ group, sections: sectionsOf(group) }))
      .filter((row) => row.sections.length > 0),
  };
};
