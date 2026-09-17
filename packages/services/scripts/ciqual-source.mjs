import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Finding and reading an unpacked CIQUAL export.
 *
 * Shared by the import and the fixture script, which differ only in what they
 * do with the parsed result. The raw export is not in this repository — it is
 * 75 MB of someone else's data — so both take a directory and both say plainly
 * which file they could not find.
 *
 * The files are named with the edition's date (`compo_2025_11_03.xml`), so
 * they are matched by prefix rather than by a name that would go stale with
 * the next edition.
 */

/**
 * Longest stem first: `alim_grp` also starts with `alim`.
 *
 * The stem must be followed by `_` or `.`, so `compo_2025_11_03.xml` and a
 * plainly renamed `compo.xml` both match while `compo-notes.xml` does not.
 */
const FILES = [
  { key: "alimGrp", stem: "alim_grp" },
  { key: "components", stem: "const" },
  { key: "compo", stem: "compo" },
  { key: "alim", stem: "alim" },
];

export const readCiqualSource = async (dir) => {
  let entries;
  try {
    entries = (await readdir(dir)).filter((name) => name.endsWith(".xml"));
  } catch {
    throw new Error(`cannot read ${dir} — pass the unpacked CIQUAL XML export`);
  }

  const taken = new Set();
  const found = {};

  for (const { key, stem } of FILES) {
    const matches = new RegExp(`^${stem}[_.]`);
    const name = entries
      .filter((entry) => matches.test(entry) && !taken.has(entry))
      .sort()[0];
    if (!name) {
      throw new Error(
        `no ${stem}*.xml in ${dir} — the export needs alim, alim_grp, compo and const`,
      );
    }
    taken.add(name);
    found[key] = name;
  }

  const source = {};
  const checksums = [];

  for (const [key, name] of Object.entries(found)) {
    // The BOM the publisher ships would otherwise land inside the first tag.
    const text = await readFile(join(dir, name), "utf8");
    source[key] = text.replace(/^\uFEFF/, "");
    checksums.push(
      `${name}:${createHash("sha256").update(source[key]).digest("hex")}`,
    );
  }

  return { source, checksums: checksums.sort() };
};
