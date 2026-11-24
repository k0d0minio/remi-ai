import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The workspace packages ship ESM source-adjacent output; Next compiles them
  // with the app so they pick up the app's JSX/target settings.
  transpilePackages: ["@remi/ui", "@remi/services"],
  // `@remi/services/shared` → `links.ts` builds a preview's cross-app links
  // from the Vercel environment and the git branch of the build. Copy both
  // into the bundle so that the browser reads the same values as the server.
  env: {
    NEXT_PUBLIC_VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV ?? "",
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? "",
  },
};

export default nextConfig;
