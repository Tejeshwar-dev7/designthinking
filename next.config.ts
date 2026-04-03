import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@vladmandic/face-api'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': false,
    };
    return config;
  },
  turbopack: {},
};

export default nextConfig;
