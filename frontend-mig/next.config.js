/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable static exports for Vercel
  output: 'standalone',
  // Add any environment variables that should be available on the client side
  env: {
    NEXT_PUBLIC_GROQ_API_KEY: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  },
  // Enable server components
  experimental: {
    serverComponents: true,
  },
  // Configure images if you're using next/image
  images: {
    domains: ['images.unsplash.com'], // Add any image domains you use
  },
};

module.exports = nextConfig;
