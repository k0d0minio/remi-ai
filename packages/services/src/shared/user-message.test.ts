import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { hasUserMessage, userMessage } from "./user-message";

const sourceRoot = fileURLToPath(new URL("..", import.meta.url));

const sourceFiles = (folder: string): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "migrations" ? [] : sourceFiles(path);
    }
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")
      ? [path]
      : [];
  });

/** Every `err("code", "message")` whose message is one plain string. */
const staticMessages = () => {
  const found = new Map<string, string>();
  const call = /\berr\(\s*"[a-z_]+",\s*"((?:[^"\\]|\\.)*)",?\s*\)/g;
  for (const file of sourceFiles(sourceRoot)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(call)) {
      found.set(match[1] ?? "", file);
    }
  }
  return found;
};

describe("userMessage", () => {
  it("has a French sentence for every static message of a service", () => {
    const missing = [...staticMessages()]
      .filter(([message]) => !hasUserMessage(message))
      .map(([message, file]) => `${message} (${file})`);
    expect(missing).toEqual([]);
  });

  it("gives the exact sentence of a message", () => {
    expect(
      userMessage({
        error: "invalid_input",
        message: "declare at least one item, or answer « none known »",
      }),
    ).toBe("Cochez au moins un élément, ou répondez « Aucune connue ».");
  });

  it("keeps the value that a message carries", () => {
    expect(
      userMessage({
        error: "conflict",
        message:
          "this patient already has « Galette de sarrasin » — remove it from the selection",
      }),
    ).toBe(
      "Ce dossier a déjà « Galette de sarrasin ». Retirez cette recette de la sélection.",
    );
  });

  it("names the row of a list save in French", () => {
    expect(
      userMessage({
        error: "invalid_input",
        message: "row 3: a title is required",
      }),
    ).toBe("Ligne 3 : Indiquez un titre.");
  });

  it("drops the field code of a questionnaire message", () => {
    expect(
      userMessage({
        error: "invalid_input",
        message: "birthDate: that date is not valid",
      }),
    ).toBe("Cette date n'est pas valide.");
  });

  it("never shows an English message that has no sentence", () => {
    expect(
      userMessage({
        error: "invalid_input",
        message: "Invalid input: expected string, received undefined",
      }),
    ).toBe("Une valeur n'est pas valide. Vérifiez votre saisie.");
    expect(
      userMessage({ error: "row 2: Too small", message: "row 2: Too small" }),
    ).toBe("Ligne 2 : Cette action n'a pas abouti. Réessayez.");
  });

  it("falls back on the sentence of the code, then on a general one", () => {
    expect(userMessage({ error: "not_found", message: "no such thing" })).toBe(
      "Cet élément est introuvable.",
    );
    expect(userMessage({ error: "odd_code", message: "odd" })).toBe(
      "Cette action n'a pas abouti. Réessayez.",
    );
  });
});
