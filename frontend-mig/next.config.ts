import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Enable compiler optimizations
  compiler: {
    // Enable React Remove Properties in production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
    
    // Enable styled-components support in production
    ...(process.env.NODE_ENV === 'production' && {
      styledComponents: true,
    }),
  },
  
  // Configure images
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Enable experimental features
  experimental: {
    // Enable server actions with proper configuration
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Enable new Next.js features
    optimizePackageImports: [
      '@nextui-org/react',
      'framer-motion',
    ],
  },
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add styled-components support
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-components': require.resolve('styled-components'),
    };
    
    return config;
  },
  
  // Configure TypeScript
  typescript: {
    // Enable TypeScript type checking during build
    ignoreBuildErrors: false,
  },
  
  // Configure ESLint
  eslint: {
    // Enable ESLint during builds
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
