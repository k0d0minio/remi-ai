import { describe, expect, it } from "vitest";

import { IDENTITY_VOICE, identityVoice } from "./identity";

describe("identityVoice", () => {
  it("reads the text block of the section Voice", () => {
    const text = [
      "# REMI",
      "",
      "## Voice",
      "",
      "Some words for a person.",
      "",
      "```text",
      "Tu es REMI.",
      "Tu parles français.",
      "```",
      "",
      "## Fixed rules",
      "",
      "```text",
      "not this block",
      "```",
    ].join("\n");

    expect(identityVoice(text)).toBe("Tu es REMI.\nTu parles français.");
  });

  it("throws when the section has no text block", () => {
    expect(() => identityVoice("# REMI\n\n## Voice\n\nNo block.\n")).toThrow(
      "the section Voice has no text block",
    );
  });

  it("is the line that each system text of REM-102 started with", () => {
    expect(IDENTITY_VOICE).toBe("Tu es REMI.");
  });
});
