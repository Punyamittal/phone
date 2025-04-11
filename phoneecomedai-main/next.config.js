/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commenting out export for development to ensure env vars work properly
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  // Explicitly set environment mode to development
  reactStrictMode: true,
};

module.exports = nextConfig;
