/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'axzell-saas.s3.eu-north-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:5000', '*.replit.dev', '*.replit.app'],
    },
  },
};

module.exports = nextConfig;
