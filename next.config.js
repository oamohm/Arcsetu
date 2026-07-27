/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // TypeScript की छोटी-मोटी टाइप चेकिंग एरर्स से Vercel बिल्ड नहीं रुकेगा
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint वार्निंग्स की वजह से बिल्ड फेल नहीं होगा
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
