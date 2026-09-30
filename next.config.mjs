/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Heavy static media (videos, 3D models, images) rarely change — let browsers/CDN cache them.
        source: '/:path*.:ext(mp4|webm|glb|gltf|png|jpg|jpeg|webp|avif|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@react-three/drei",
      "@react-three/fiber",
      "three"
    ],
  },
};

export default nextConfig;
