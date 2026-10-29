// Test of the shared Neon preview branch. Close this pull request without a merge.
// Prints the database host only, never the full URL.
console.log("preview-test db host:", process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : "none");
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The workspace packages ship ESM source-adjacent output; Next compiles them
  // with the app so they pick up the app's JSX/target settings.
  transpilePackages: ["@remi/ui", "@remi/services"],
};

export default nextConfig;
