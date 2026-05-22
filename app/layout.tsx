import type { Metadata, Viewport } from 'next'
import './globals.css'
import { GGNavbar } from '@/components/GGNavbar'
import { GGFooter } from '@/components/GGFooter'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: {
    default: 'Glo Gang Worldwide — Official Fan Portal',
    template: '%s | Glo Gang Worldwide',
  },
  description:
    'The official fan community portal for Glo Gang Worldwide — Chief Keef\'s label. Artists, events, exclusive member content & the iconic photobooth experience.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://glogangworldwide.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://glogangworldwide.com',
    siteName: 'Glo Gang Worldwide',
    title: 'Glo Gang Worldwide — Official Fan Portal',
    description: 'Official fan community portal for Glo Gang Worldwide.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@glogang',
    title: 'Glo Gang Worldwide',
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
  themeColor: '#0f1115',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <GGNavbar />
        <main>{children}</main>
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
