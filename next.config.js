/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  images: {
    unoptimized: true,
    domains: [
      'raw.githubusercontent.com',
      'github.com',
      'assets.coingecko.com'
    ]
  },
  output: 'export',
  trailingSlash: true,
};

module.exports = nextConfig;
