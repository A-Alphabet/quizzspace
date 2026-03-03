import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Babel instead of SWC for Windows compatibility
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
