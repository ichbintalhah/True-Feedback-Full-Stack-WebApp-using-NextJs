import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/u/:username",
        destination: "/U/:username",
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
