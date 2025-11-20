import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable browser source maps in production (prevents invalid source map warnings)
  productionBrowserSourceMaps: false,

  // Optional: Strict mode for React
  reactStrictMode: true,

  // You can add other Next.js config options here
};

export default nextConfig;
