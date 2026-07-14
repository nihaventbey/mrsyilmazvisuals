import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      // Default is 1MB; portfolio / hero / logo uploads need room for photos.
      bodySizeLimit: "20mb",
    },
    // Default proxy body is 10MB; keep aligned with server action uploads.
    proxyClientMaxBodySize: "20mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;
