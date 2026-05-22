/** @type {import('next').NextConfig} */
const useWindowsDistDirWorkaround =
  process.platform === "win32" && process.env.VERCEL !== "1"

const nextConfig = {
  ...(useWindowsDistDirWorkaround ? { distDir: ".next-build" } : {}),
  env: {
    NEXT_PUBLIC_APP_VERSION:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ||
      Date.now().toString(36),
    NEXT_PUBLIC_SANITY_PROJECT_ID:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder-sanity-id',
    NEXT_PUBLIC_SANITY_DATASET:
      process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "glogangworldwide.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.sanity.io",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://www.sanity.io",
          },
        ],
      },
      {
        source: "/studio",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.sanity.io",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://www.sanity.io",
          },
        ],
      },
    ]
  },
}

export default nextConfig
