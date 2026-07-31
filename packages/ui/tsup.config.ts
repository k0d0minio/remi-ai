import { defineConfig } from "tsup";

// Two build units, and the split is deliberate:
//   • the component barrel ships with a "use client" banner — everything it exports
//     is a client component, so a server component importing from it would fail;
//   • lib/utils ships WITHOUT the banner, so `cn()` is callable from a server
//     component via the "@remi/ui/utils" subpath.
// Collapsing these into one entry is what breaks server-side `cn()`. Don't.
export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    target: "es2022",
    outDir: "dist",
    external: ["react", "react-dom"],
    banner: { js: '"use client";' },
  },
  {
    entry: { "lib/utils": "src/lib/utils.ts" },
    format: ["esm"],
    dts: true,
    clean: false,
    sourcemap: true,
    target: "es2022",
    outDir: "dist",
  },
]);
