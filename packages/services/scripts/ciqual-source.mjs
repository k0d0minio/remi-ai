import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

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

/**
 * `pnpm ciqual:import <dir>` from the repo root reaches this through a
 * `--filter`, which runs the script with the PACKAGE as its working directory —
 * so a relative path the operator typed at the root would resolve under
 * `packages/services` and appear not to exist. pnpm sets `INIT_CWD` to where the
 * command was actually typed, which is the directory a relative path means.
 */
const fromInvocationDir = (dir) =>
  isAbsolute(dir) ? dir : resolve(process.env.INIT_CWD ?? process.cwd(), dir);

export const readCiqualSource = async (given) => {
  const dir = fromInvocationDir(given);
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
    const raw = await readFile(join(dir, name));
    // Hashed as shipped, before anything is stripped, so the recorded checksum
    // is the one `sha256sum <file>` prints. A hash of our own post-processing
    // would answer a question nobody asked — the point of storing it is that an
    // operator can confirm the database holds the export in their hands.
    checksums.push(
      `${name}:${createHash("sha256").update(raw).digest("hex")}`,
    );
    // The BOM the publisher ships would otherwise land inside the first tag.
    source[key] = raw.toString("utf8").replace(/^\uFEFF/, "");
  }

  return { source, checksums: checksums.sort() };
};
