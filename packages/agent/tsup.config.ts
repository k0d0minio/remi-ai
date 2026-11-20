import { defineConfig } from "tsup";

// One entry. The contracts, the prompts and the identity file are markdown
// files inlined as strings, so no route reads a file at run time. A change of
// the `exports` of package.json is a change here too.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  loader: { ".md": "text" },
  dts: { resolve: false, respectExternal: true },
  clean: true,
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
});
