import { describe, expect, it } from "vitest";
import { fileStatuses } from "./file-status";
import {
  patientFileGroups,
  patientFileLayout,
  patientFileSections,
} from "./patient-file-layout";

const allIds = patientFileSections.map((section) => section.id);

describe("the layout of the patient file", () => {
  it("places each section one time at each status", () => {
    for (const status of fileStatuses) {
      const layout = patientFileLayout(status);
      const placed = [
        ...layout.inAction,
        ...layout.work,
        ...layout.rows.flatMap((row) => row.sections),
      ];
      expect([...placed].sort()).toEqual([...allIds].sort());
      expect(new Set(placed).size).toBe(placed.length);
    }
  });

  it("gives each section an id that is unique and a group that exists", () => {
    expect(new Set(allIds).size).toBe(allIds.length);
    for (const section of patientFileSections) {
      expect(patientFileGroups).toContain(section.group);
    }
  });

  it("shows one action for each status", () => {
    expect(patientFileLayout("to_complete").action).toBe("complete");
    expect(patientFileLayout("ready").action).toBe("prepare");
    expect(patientFileLayout("to_validate").action).toBe("validate");
    expect(patientFileLayout("active").action).toBe("follow");
  });

  it("puts the preparation in the action card when the file is ready", () => {
    expect(patientFileLayout("ready").inAction).toEqual(["preparation"]);
    for (const status of ["to_complete", "to_validate", "active"] as const) {
      const layout = patientFileLayout(status);
      expect(layout.inAction).toEqual([]);
      expect(layout.rows.flatMap((row) => row.sections)).toContain(
        "preparation",
      );
    }
  });

  it("opens the answers, then the calculations, before the consultation", () => {
    for (const status of ["to_complete", "ready"] as const) {
      const layout = patientFileLayout(status);
      expect(layout.work).toEqual(["patient-file", "calculations"]);
      expect(layout.rows[0]?.group).toBe("protocol");
    }
  });

  it("opens the protocol first from the validation on", () => {
    for (const status of ["to_validate", "active"] as const) {
      const layout = patientFileLayout(status);
      expect(layout.work).toEqual([
        "objectifs",
        "recommendations",
        "food-directives",
        "meal-structure",
        "supplements",
        "lifestyle-advice",
        "pantry",
        "calculations",
      ]);
      expect(layout.rows[0]).toEqual({
        group: "answers",
        sections: ["patient-file"],
      });
    }
  });

  it("keeps the profile last", () => {
    for (const status of fileStatuses) {
      expect(patientFileLayout(status).rows.at(-1)).toEqual({
        group: "profile",
        sections: ["profile"],
      });
    }
  });
});
