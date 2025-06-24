/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:8000',
  },
  // Disable experimental features that might cause file permission issues
  experimental: {
    disableOptimizedLoading: true,
  },
  // Configure webpack to avoid file watching issues on Windows
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig