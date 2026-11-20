/**
 * The identity of REMI: the file `REMI.md` at the root of the package.
 *
 * A person reads all of the file. A model call gets one part of it: the text
 * block of the section `## Voice`. `prepareCall` writes that text at the start
 * of the system text of each step.
 */

import identity from "../REMI.md";

/** The text block of the section Voice. It throws when the block is missing. */
export const identityVoice = (text: string) => {
  const block =
    /^## Voice\n[\s\S]*?\n```text\n([\s\S]*?)\n```/m.exec(text)?.[1]?.trim() ??
    "";
  if (block === "") {
    throw new Error("REMI.md: the section Voice has no text block");
  }
  return block;
};

export const IDENTITY_VOICE = identityVoice(identity);
