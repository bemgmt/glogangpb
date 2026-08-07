'use client'

import { useState } from 'react'
import { Copy, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

type IssuedPass = { token: string; expiresAt: string }

export function KioskPassIssuer() {
  const [label, setLabel] = useState('')
  const [issuedPass, setIssuedPass] = useState<IssuedPass | null>(null)
  const [loading, setLoading] = useState(false)

  async function issuePass() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/kiosk-passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() || undefined, ttlMinutes: 10 }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to issue pass.')
      setIssuedPass(payload)
      toast.success('Single-use kiosk pass issued.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to issue pass.')
    } finally {
      setLoading(false)
    }
  }

  async function copyToken() {
    if (!issuedPass) return
    await navigator.clipboard.writeText(issuedPass.token)
    toast.success('Pass copied.')
  }

  return (
    <section className="gg-card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <KeyRound size={20} />
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Issue Kiosk Pass</h2>
          <p style={{ fontSize: 13, margin: 0 }}>Passes expire after 10 minutes and work once.</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          className="gg-field"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Optional attendee or event label"
          maxLength={120}
          style={{ flex: '1 1 260px' }}
        />
        <button className="gg-btn gg-btn--primary" onClick={issuePass} disabled={loading}>
          {loading ? 'Issuing…' : 'Issue Pass'}
        </button>
      </div>
      {issuedPass && (
        <div style={{ marginTop: 16, padding: 14, background: 'var(--surface)', borderRadius: 10 }}>
          <code style={{ overflowWrap: 'anywhere' }}>{issuedPass.token}</code>
          <button className="gg-btn gg-btn--ghost gg-btn--sm" onClick={copyToken} style={{ marginLeft: 10 }}>
            <Copy size={14} /> Copy
          </button>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            Expires {new Date(issuedPass.expiresAt).toLocaleString()}. This token is shown only now.
          </p>
        </div>
      )}
    </section>
  )
}
