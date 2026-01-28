/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  images: {
    unoptimized: true,
  },

  experimental: {
    serverComponentsExternalPackages: ["mongodb"],
  },

  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.next/**"],
      };
    }
    return config;
  },

  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CORS_ORIGINS || "*",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
