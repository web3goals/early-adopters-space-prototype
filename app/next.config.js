/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }; // Fix for RainbowKit
    return config;
  },
};

module.exports = nextConfig;
