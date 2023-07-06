/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/rewrite',
        destination: '/',
      },
      {
        source: '/blog/:slug',
        destination: 'https://example.com/blog/:slug', // Matched parameters can be used in the destination
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/redirect',
        destination: '/',
        permanent: true,
      },
    ]
  },
  // output: 'standalone',
}

module.exports = nextConfig
