import { defineConfig } from "tsup";

/*
 * Four build units, and every split is deliberate.
 *
 *   entry            banner          import path         callable from
 *   ───────────────  ──────────────  ──────────────────  ─────────────────────
 *   src/index.ts     "use client"    @remi/ui            client components
 *   src/server.ts    none            @remi/ui/server     server AND client
 *   src/lib/utils    none            @remi/ui/utils      server AND client
 *   src/motion/*     "use client"    @remi/ui/motion     client components
 *
 * tsup BUNDLES each entry, so every module reachable from an entry is inlined
 * into it. Two consequences that are easy to get wrong and silent when you do:
 *
 *   • src/server/** must never import from src/components/**. Doing so inlines a
 *     client component into a bundle that carries no "use client" banner. There
 *     is an ESLint zone in the repo root config that enforces this — a server
 *     compound that needs a <Button> takes it as a ReactNode prop instead.
 *
 *   • Nothing reachable from src/index.ts or src/server.ts may import
 *     "motion/react". If it does, motion joins that bundle and every app pays
 *     ~34kB on first paint with no error to tell you. Grep dist/ before merging.
 *
 * Collapsing the utils entry into the barrel is what breaks server-side cn().
 * Collapsing the server entry into the barrel gives up RSC on the marketing
 * site. Don't do either.
 */

const shared = {
  format: ["esm"],
  dts: true,
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
} as const;

export default defineConfig([
  {
    ...shared,
    entry: ["src/index.ts"],
    // Only this entry cleans — it runs first, and the rest would wipe it.
    clean: true,
    external: ["react", "react-dom"],
    banner: { js: '"use client";' },
  },
  {
    ...shared,
    entry: ["src/server.ts"],
    clean: false,
    external: ["react", "react-dom"],
  },
  {
    ...shared,
    entry: { "lib/utils": "src/lib/utils.ts" },
    clean: false,
  },
  {
    ...shared,
    entry: { "motion/index": "src/motion/index.tsx" },
    clean: false,
    // `motion` stays external so the dynamic import() inside the shells resolves
    // to a real chunk boundary rather than being inlined into this entry.
    external: ["react", "react-dom", "motion"],
    banner: { js: '"use client";' },
  },
]);
