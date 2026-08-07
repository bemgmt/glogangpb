import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://glogangworldwide.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/member/', '/kiosk/', '/studio/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
