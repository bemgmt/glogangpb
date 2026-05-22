import Link from 'next/link'

export const metadata = {
  title: 'Kiosk — Glo Gang Photobooth',
  description: 'In-store photobooth kiosk experience.',
}

export default function KioskPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/glogangpb.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '27%',
        overflow: 'hidden',
      }}
    >
      {/* Start CTA — matches original index.html layout */}
      <div style={{ width: 'min(55vw, 500px)' }}>
        <Link
          href="/kiosk/access"
          id="kioskStartBtn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: 'clamp(48px, 8vmin, 90px)',
            borderRadius: 20,
            background: '#1a1a1a',
            color: '#ffd100',
            fontWeight: 900,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '3px solid #000',
            boxShadow: '0 8px 0 #000, 0 12px 20px rgba(0,0,0,0.45)',
            padding: '0.7em 1em',
            fontSize: 'clamp(18px, 3.5vmin, 40px)',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 0.06s ease-out, box-shadow 0.06s ease-out',
          }}
        >
          Click here to start
        </Link>
      </div>
    </div>
  )
}
