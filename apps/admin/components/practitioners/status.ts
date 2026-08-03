import type { Intent, PractitionerStatus, RosterClient } from "@/lib/fixtures";

/**
 * One mapping, read by the table, the profile card and the filter row. Status is
 * the column an operator scans for, so a practitioner who reads as suspended in
 * the list and merely paused on their own page is a bug that only shows up when
 * somebody acts on the wrong one.
 */
export const practitionerStatusLabels: Record<PractitionerStatus, string> = {
  onboarded: "onboarded",
  invited: "invited",
  suspended: "suspended",
};

export const practitionerStatusIntents: Record<PractitionerStatus, Intent> = {
  onboarded: "success",
  invited: "info",
  suspended: "error",
};

export const rosterStatusLabels: Record<RosterClient["status"], string> = {
  active: "active",
  invited: "invited",
  paused: "paused",
};

export const rosterStatusIntents: Record<RosterClient["status"], Intent> = {
  active: "success",
  invited: "info",
  paused: "warning",
};
