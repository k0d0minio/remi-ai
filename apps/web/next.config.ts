// Test of the shared Neon preview branch. Close this pull request without a merge.
// Prints which Neon endpoint the database host names, as true or false only.
const previewTestHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : "";
console.log("preview-test endpoint:", JSON.stringify({ previewBranch: previewTestHost.startsWith("ep-aged-water-b9z1kq6n"), main: previewTestHost.startsWith("ep-lively-sunset-b93pzbxy"), hasUrl: previewTestHost !== "" }));
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The workspace packages ship ESM source-adjacent output; Next compiles them
  // with the app so they pick up the app's JSX/target settings.
  transpilePackages: ["@remi/ui", "@remi/services"],
};

export default nextConfig;
