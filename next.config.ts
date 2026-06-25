import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so a stray parent lockfile doesn't confuse the build.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
