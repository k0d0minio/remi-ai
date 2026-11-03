import { describe, expect, it } from "vitest";
import {
  appearsInPatientList,
  canMoveFileStatus,
  fileStatuses,
  fileStatusLabels,
  initialFileStatus,
  isFileStatus,
} from "./file-status";

describe("the file status vocabulary", () => {
  it("holds the four statuses in the order a file moves through them", () => {
    expect(fileStatuses).toEqual([
      "to_complete",
      "ready",
      "to_validate",
      "active",
    ]);
    expect(initialFileStatus).toBe("to_complete");
  });

  it("labels each status in French and English", () => {
    expect(fileStatusLabels.to_complete.fr).toBe("Dossier à compléter");
    expect(fileStatusLabels.ready.fr).toBe("Prêt pour consultation");
    expect(fileStatusLabels.to_validate.fr).toBe("Recommandations à valider");
    expect(fileStatusLabels.active.fr).toBe("Accompagnement actif");
    for (const status of fileStatuses) {
      expect(fileStatusLabels[status].en).not.toBe("");
    }
  });

  it("recognises only its own values", () => {
    expect(isFileStatus("ready")).toBe(true);
    expect(isFileStatus("ended")).toBe(false);
    expect(isFileStatus(undefined)).toBe(false);
  });
});

describe("the allowed moves", () => {
  it("allows one step forward at a time", () => {
    expect(canMoveFileStatus("to_complete", "ready")).toBe(true);
    expect(canMoveFileStatus("ready", "to_validate")).toBe(true);
    expect(canMoveFileStatus("to_validate", "active")).toBe(true);
  });

  it("refuses a skipped step and every move back", () => {
    expect(canMoveFileStatus("to_complete", "to_validate")).toBe(false);
    expect(canMoveFileStatus("to_complete", "active")).toBe(false);
    expect(canMoveFileStatus("ready", "active")).toBe(false);
    expect(canMoveFileStatus("ready", "to_complete")).toBe(false);
    expect(canMoveFileStatus("to_validate", "ready")).toBe(false);
  });

  it("allows no move out of active", () => {
    for (const status of fileStatuses) {
      expect(canMoveFileStatus("active", status)).toBe(false);
    }
  });

  it("treats the same status as no move", () => {
    for (const status of fileStatuses) {
      expect(canMoveFileStatus(status, status)).toBe(false);
    }
  });
});

describe("the patient list's appearance rule", () => {
  it("hides a file the patient opened while its questionnaire is incomplete", () => {
    expect(
      appearsInPatientList({ createdBy: "patient", fileStatus: "to_complete" }),
    ).toBe(false);
  });

  it("shows a file the patient opened from « Prêt pour consultation » on", () => {
    for (const fileStatus of ["ready", "to_validate", "active"] as const) {
      expect(appearsInPatientList({ createdBy: "patient", fileStatus })).toBe(
        true,
      );
    }
  });

  it("shows a file the practitioner opened at once, as « Dossier à compléter »", () => {
    expect(
      appearsInPatientList({
        createdBy: "practitioner",
        fileStatus: "to_complete",
      }),
    ).toBe(true);
  });

  it("keeps showing a practitioner's file at every later status", () => {
    for (const fileStatus of fileStatuses) {
      expect(
        appearsInPatientList({ createdBy: "practitioner", fileStatus }),
      ).toBe(true);
    }
  });
});
