/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@financas-a-dois/shared'],
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
};

module.exports = nextConfig;
