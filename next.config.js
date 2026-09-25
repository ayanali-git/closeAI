/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed to enable dynamic API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: '/help',
        destination: '/support/help',
        permanent: true,
      },
      {
        source: '/pricing',
        destination: '/product/pricing',
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "bufferutil": false,
      "utf-8-validate": false,
    };
    return config;
  },
};

module.exports = nextConfig;
