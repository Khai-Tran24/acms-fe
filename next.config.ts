import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["lustrous-collision-unwarlike.ngrok-free.dev"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
