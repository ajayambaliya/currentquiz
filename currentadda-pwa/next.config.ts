import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ngmtfxjvvxfjeopwsvls.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/supabase-proxy/:path*',
        destination: 'https://ngmtfxjvvxfjeopwsvls.supabase.co/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/current-affairs-gujarati',
        destination: '/current-affairs-in-gujarati',
        permanent: true,
      },
      {
        source: '/daily',
        destination: '/daily-current-affairs-in-gujarati',
        permanent: true,
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
