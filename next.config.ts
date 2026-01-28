import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "portal.hireteem.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
