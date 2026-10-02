/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || '.next',

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }]
  },

  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**']
      }
    }
    return config
  },

  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'"
          },
          ...(process.env.VERCEL_ENV !== 'production' ||
          process.env.SITE_INDEXING_ENABLED !== 'true'
            ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
            : [])
        ]
      }
    ]
  }
}
module.exports = nextConfig
