import type { Metadata, Viewport } from 'next'
import './globals.css'
import { GGNavbar } from '@/components/GGNavbar'
import { GGFooter } from '@/components/GGFooter'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: {
    default: 'DJ Maino da Plug — Official Fan Portal & VIP Community',
    template: '%s | DJ Maino da Plug',
  },
  description:
    'The official fan portal and VIP community for DJ Maino da Plug. Explore music releases, live shows, exclusive drops, and the interactive photobooth.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    siteName: 'DJ Maino da Plug',
    title: 'DJ Maino da Plug — Official Fan Portal & VIP Community',
    description: 'Official fan community and member portal for DJ Maino da Plug.',
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
