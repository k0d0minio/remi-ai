import nextra from "nextra";

// Nextra owns the MDX pipeline; the docs app has no Tailwind pass of its own —
// nextra-theme-docs brings its own styling. Keeping the docs site off the shared
// design system is deliberate: it is reference material, not product surface.
const withNextra = nextra({
  defaultShowCopyCode: true,
});

export default withNextra({
  poweredByHeader: false,
  reactStrictMode: true,
  // The one workspace package this app takes, and not the design system: the
  // navbar has to link back to the other five apps, and where each one answers
  // is catalogued once in `@remi/services/shared` → `links.ts`. `@remi/ui` stays
  // out — that is the dependency the paragraph above is about.
  transpilePackages: ["@remi/services"],
  // `@remi/services/shared` → `links.ts` builds a preview's cross-app links
  // from the Vercel environment and the git branch of the build. Copy both
  // into the bundle so that the browser reads the same values as the server.
  env: {
    NEXT_PUBLIC_VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV ?? "",
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? "",
  },
  turbopack: {
    // Unrelated to this app's own config: Nextra 4.6 points this alias at
    // `@vercel/turbopack-next/mdx-import-source`, a Next internal that no longer
    // exists in 16.2, so the build fails to resolve the MDX provider. Nextra's
    // webpack path already aliases it to the root mdx-components; this is the
    // same thing spelled for Turbopack. Nextra merges a caller's resolveAlias
    // over its own, so this wins. Delete it when Nextra ships the fix.
    resolveAlias: {
      "next-mdx-import-source-file": "./mdx-components.tsx",
    },
  },
});
