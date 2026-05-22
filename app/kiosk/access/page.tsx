'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// ─── Approved QR codes stored in localStorage (same as original login.html) ──
function getApprovedCodes(): string[] {
  try {
    return (localStorage.getItem('approved_codes') || '').split('\n').map(s => s.trim()).filter(Boolean)
  } catch { return [] }
}

function isCodeApproved(code: string): boolean {
  return getApprovedCodes().includes(code.trim())
}

export default function KioskAccessPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'scan' | 'pay'>('scan')
  const [scanResult, setScanResult] = useState('Waiting…')
  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // ─── QR Scanner (BarcodeDetector / fallback) ───────────────────
  async function startScan() {
    try {
      setScanResult('Starting camera…')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      setScanResult('Camera started. Hold QR in view…')

      // BarcodeDetector scan loop
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              handleCode(codes[0].rawValue)
            }
          } catch {}
        }, 400)
      } else {
        setScanResult('BarcodeDetector not supported. Use manual entry below.')
      }
    } catch (err: any) {
      setScanResult('Camera error: ' + err.message)
    }
  }

  function stopScan() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setScanning(false)
    setScanResult('Camera stopped.')
  }

  function handleCode(code: string) {
    setScanResult(`Detected: ${code}`)
    stopScan()
    if (isCodeApproved(code)) {
      toast.success('QR Approved ✓')
      setTimeout(() => router.push('/kiosk/booth'), 700)
    } else {
      toast.error('QR not approved ✕')
    }
  }

  function verifyManual() {
    const code = manualCode.trim()
    if (!code) { toast.error('Enter a code'); return }
    handleCode(code)
    setManualCode('')
  }

  function loadSamples() {
    localStorage.setItem('approved_codes', 'GG-TEST-2025\nVIP-1234')
    toast.success('Sample codes loaded to device.')
  }

  function startFreeSession() {
    toast.success('Free session started ✓')
    setTimeout(() => router.push('/kiosk/booth'), 600)
  }

  useEffect(() => () => stopScan(), [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: 'linear-gradient(180deg, rgba(15,17,21,0.95), rgba(15,17,21,0.6))',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <div style={{ fontWeight: 900 }}>Access</div>
          <Link href="/kiosk" className="gg-btn gg-btn--ghost gg-btn--sm">← Back</Link>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px' }}>
          {(['scan', 'pay'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t === 'pay') stopScan() }}
              className={`gg-btn ${tab === t ? 'gg-btn--primary' : 'gg-btn--ghost'}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {t === 'scan' ? 'Scan QR' : 'Pay'}
            </button>
          ))}
        </div>
      </header>

      <div style={{ padding: 16, display: 'grid', gap: 16 }}>
        {/* ── Scan tab ── */}
        {tab === 'scan' && (
          <div className="gg-card">
            <h2 style={{ marginBottom: 12, fontSize: '1.2rem' }}>Scan Approved QR</h2>
            {/* Video */}
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#0b0f16', border: '1px solid var(--border)', marginBottom: 12 }}>
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: '100%', height: '55vh', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <button onClick={startScan} disabled={scanning} className="gg-btn gg-btn--primary">
                {scanning ? 'Scanning…' : 'Start Camera'}
              </button>
              <button onClick={stopScan} disabled={!scanning} className="gg-btn gg-btn--ghost">Stop</button>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 14, marginBottom: 16 }}>
              {scanResult}
            </div>

            {/* Manual entry */}
            <div className="gg-card" style={{ marginBottom: 12 }}>
              <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>Manual entry (if camera fails):</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="gg-field" style={{ flex: 1 }}>
                  <input
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && verifyManual()}
                    placeholder="Enter QR code text"
                  />
                </div>
                <button onClick={verifyManual} className="gg-btn gg-btn--secondary">Verify</button>
              </div>
            </div>

            {/* Sample codes loader */}
            <div className="gg-card">
              <p style={{ fontWeight: 700, marginBottom: 6 }}>Sample codes: <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>GG-TEST-2025, VIP-1234</span></p>
              <button onClick={loadSamples} className="gg-btn gg-btn--ghost gg-btn--sm">Load to Device</button>
            </div>
          </div>
        )}

        {/* ── Pay tab ── */}
        {tab === 'pay' && (
          <div className="gg-card">
            <h2 style={{ marginBottom: 16, fontSize: '1.2rem' }}>Choose Your Session</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Free */}
              <div className="gg-card" style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>Free (Test)</h3>
                <p style={{ marginBottom: 16, fontSize: 13 }}>Setup and testing. No charge.</p>
                <button onClick={startFreeSession} className="gg-btn gg-btn--ok" style={{ width: '100%', justifyContent: 'center' }}>
                  Start Free Session
                </button>
              </div>
              {/* Square */}
              <div className="gg-card" style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>1 Session — $1.00</h3>
                <p style={{ marginBottom: 16, fontSize: 13 }}>Pay securely with Square on this iPad.</p>
                <button
                  onClick={() => {
                    const SQUARE_APP_ID = '' // Set in production
                    if (!SQUARE_APP_ID) { toast.error('Payment not configured'); return }
                    const params = new URLSearchParams({
                      'amount_money[amount]': '100',
                      'amount_money[currency_code]': 'USD',
                      callback_url: `${location.origin}/kiosk/access#paid=1`,
                      client_id: SQUARE_APP_ID,
                      version: '1.3',
                      notes: 'Photobooth Session',
                    })
                    window.location.href = `square-commerce-v1://payment/create?${params}`
                  }}
                  className="gg-btn gg-btn--primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Pay with Square
                </button>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  After payment, you'll return here automatically.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
