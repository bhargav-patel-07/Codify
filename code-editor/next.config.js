// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Ensure webpack 5 is used
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  
  // Enable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Enable ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configure images
  images: {
    domains: ['images.unsplash.com'], // Add any other domains you need
  },
};

module.exports = nextConfig;
