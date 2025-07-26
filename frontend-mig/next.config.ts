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
    
    // Enable styled-components support with proper configuration
    styledComponents: {
      // Enable display names in development for better debugging
      displayName: process.env.NODE_ENV !== 'production',
      // Enable server-side rendering
      ssr: true,
      // Enable CSS source maps in development
      cssProp: true,
      // Add component display name as a CSS class name
      fileName: false,
      // Add support for the 'as' prop
      pure: true,
    },
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
    // Important: return the modified config
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
