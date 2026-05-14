import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/prototipo-ui.html",
      },
    ];
  },
};

export default nextConfig;
