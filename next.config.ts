import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native addon — keep it out of the server bundle so the
  // deployed runtime loads it from node_modules instead of webpack output.
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
