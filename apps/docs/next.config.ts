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
});
