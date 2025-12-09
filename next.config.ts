import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // Explicitly set the project root so Turbopack doesn't walk up and pick a parent lockfile
    root: __dirname,
  },
};

export default nextConfig;
