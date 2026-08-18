import type { Metadata, Viewport } from 'next'
import './globals.css'
import { GGNavbar } from '@/components/GGNavbar'
import { GGFooter } from '@/components/GGFooter'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://glogangworldwide.com'

export const metadata: Metadata = {
  title: {
    default: 'DJ Maino Da Plug - Tour DJ, Livestream Host & Music Curator',
    template: '%s | DJ Maino da Plug',
  },
  description:
    'Official site for DJ Maino Da Plug: tour DJ, Glo Streams host, underground music curator, events, press, and booking.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'DJ Maino da Plug',
    title: 'DJ Maino Da Plug - Tour DJ, Livestream Host & Music Curator',
    description: 'Tour DJ, Glo Streams host, underground music curator, and cultural connector.',
    images: [{ url: '/img/epk/dj-maino-epk-cover.jpg', width: 1440, height: 810, alt: 'DJ Maino Da Plug 2026 Electronic Press Kit' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mainodaplug',
    title: 'DJ Maino da Plug',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#07080a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <GGNavbar />
        <main id="main-content">{children}</main>
        <GGFooter />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 800,
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
