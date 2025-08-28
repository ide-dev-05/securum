import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;

