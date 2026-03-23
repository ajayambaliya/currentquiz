import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zoamwugxvboxgjxqvntw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/supabase-proxy/:path*',
        destination: 'https://zoamwugxvboxgjxqvntw.supabase.co/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
