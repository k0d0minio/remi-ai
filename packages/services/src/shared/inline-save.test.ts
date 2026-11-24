import { describe, expect, it } from "vitest";
import { shownAfterSave, singleFlight } from "./inline-save";

describe("the text shown after a save in place", () => {
  it("shows the server value when no save happened", () => {
    expect(shownAfterSave("Ancien texte", null)).toBe("Ancien texte");
    expect(shownAfterSave(null, null)).toBeNull();
  });

  it("never shows the old text while the server prop is stale", () => {
    const save = { stored: "Nouveau texte", before: "Ancien texte" };
    expect(shownAfterSave("Ancien texte", save)).toBe("Nouveau texte");
  });

  it("shows an empty note at once after a clear", () => {
    const save = { stored: null, before: "Ancien texte" };
    expect(shownAfterSave("Ancien texte", save)).toBeNull();
  });

  it("follows the server again when the prop changes", () => {
    const save = { stored: "Nouveau texte", before: "Ancien texte" };
    expect(shownAfterSave("Nouveau texte", save)).toBe("Nouveau texte");
    expect(shownAfterSave("Texte de la consultation", save)).toBe(
      "Texte de la consultation",
    );
  });
});

describe("one send for each save", () => {
  it("sends one time for a blur followed by a fast click", () => {
    const flight = singleFlight();
    let sends = 0;
    const submit = () => {
      if (flight.start()) {
        sends += 1;
      }
    };
    submit(); // the blur
    submit(); // the click, before the action ends
    expect(sends).toBe(1);
  });

  it("accepts the next save when the first one ends", () => {
    const flight = singleFlight();
    expect(flight.start()).toBe(true);
    expect(flight.start()).toBe(false);
    flight.end();
    expect(flight.start()).toBe(true);
  });
});
