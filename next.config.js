/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**', // Required for Unsplash to allow all image paths
      },
      {
        protocol: 'https',
        hostname: 'axzell-saas.s3.eu-north-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'http://localhost:5000', // add protocol for consistency
        'https://*.replit.dev',
        'https://*.replit.app',
      ],
    },
  },
};

module.exports = nextConfig;
