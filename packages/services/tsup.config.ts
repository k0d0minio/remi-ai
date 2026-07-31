import { defineConfig } from "tsup";

// One entry per public subpath in package.json → exports. The subpaths are the
// contract: an app importing "@remi/services/server" is stating it runs on Node,
// and the root barrel stays types-only so importing it can never drag a Node-only
// dependency into a client bundle. Adding an entry here means adding an exports
// key too — they are checked against each other by hand, so keep them adjacent.
export default defineConfig({
  entry: [
    "src/index.ts",
    "src/shared/index.ts",
    "src/server/index.ts",
    "src/db/index.ts",
    "src/ai/index.ts",
    "src/email/index.ts",
  ],
  format: ["esm"],
  dts: { resolve: false, respectExternal: true },
  clean: true,
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
});
