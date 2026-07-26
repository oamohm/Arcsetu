/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // TypeScript errors से Vercel build fail नहीं होगी
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint warnings से भी build fail नहीं होगी
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
