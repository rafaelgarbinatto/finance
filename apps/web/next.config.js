/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@financas/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
