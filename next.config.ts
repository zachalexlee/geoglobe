import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors are checked in CI; don't block production deploys
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
