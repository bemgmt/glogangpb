/** @type {import('next').NextConfig} */
const useWindowsDistDirWorkaround =
  process.platform === 'win32' && process.env.VERCEL !== '1'

const scriptSources = ["'self'", "'unsafe-inline'", 'https://*.vercel-scripts.com']
if (process.env.NODE_ENV !== 'production') scriptSources.push("'unsafe-eval'")

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  `script-src ${scriptSources.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.supabase.co",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sanity.io https://vitals.vercel-insights.com",
  "frame-src https://player.twitch.tv https://*.sanity.io",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig = {
  ...(useWindowsDistDirWorkaround ? { distDir: '.next-build' } : {}),
  env: {
    NEXT_PUBLIC_APP_VERSION:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || Date.now().toString(36),
    NEXT_PUBLIC_SANITY_PROJECT_ID:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder-sanity-id',
    NEXT_PUBLIC_SANITY_DATASET:
      process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'glogangworldwide.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/:path((?!studio(?:/|$)).*)',
        headers: [
          { key: 'Content-Security-Policy', value: `${contentSecurityPolicy}; frame-ancestors 'self'` },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        source: '/studio/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.sanity.io" },
        ],
      },
      {
        source: '/studio',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.sanity.io" },
        ],
      },
    ]
  },
}

export default nextConfig
