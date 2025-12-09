import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enable local development bindings for Cloudflare
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for multiple lockfiles - ensure correct project root
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.lunaxcode.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark Node.js built-in modules as external for Cloudflare compatibility
      config.externals = config.externals || [];
      config.externals.push({
        'node:stream': 'commonjs node:stream',
        'node:crypto': 'commonjs node:crypto',
        'node:buffer': 'commonjs node:buffer',
        'node:util': 'commonjs node:util',
        'node:process': 'commonjs node:process',
      });
    }
    return config;
  },
};

export default nextConfig;
