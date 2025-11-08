import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output untuk Docker
  output: 'standalone',

  // Disable Next.js development indicator
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },

  // Disable ESLint during build for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
