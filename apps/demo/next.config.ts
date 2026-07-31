import type { NextConfig } from "next";

// The demo never reaches a backend, so @remi/services is deliberately absent
// from transpilePackages as well as from package.json — ESLint blocks the import
// too. Three independent guards on the same rule, because a demo that quietly
// grows a data layer stops being a safe place to prototype.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@remi/ui"],
};

export default nextConfig;
