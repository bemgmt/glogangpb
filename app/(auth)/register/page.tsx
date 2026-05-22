'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'radial-gradient(900px 600px at 50% 0%, rgba(255,209,0,0.06), transparent), var(--bg)',
      }}>
        <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⭐</div>
          <h2 style={{ marginBottom: 12 }}>Check Your Email</h2>
          <p style={{ marginBottom: 24, lineHeight: 1.7 }}>
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your Glo Gang account.
          </p>
          <Link href="/login" className="gg-btn gg-btn--primary">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'radial-gradient(900px 600px at 50% 0%, rgba(255,209,0,0.06), transparent), var(--bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 900,
            fontSize: '1.2rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            marginBottom: 8,
          }}>
            <span style={{ display: 'inline-block', width: 28, height: 28, background: 'var(--accent)', borderRadius: 6 }} />
            GLO GANG
          </Link>
          <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Join the Glo</h1>
          <p>Create your free fan account.</p>
        </div>

        {/* Card */}
        <div className="gg-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(255,90,95,0.10)',
                border: '1px solid rgba(255,90,95,0.30)',
                borderRadius: 12,
                color: '#fca5a5',
                fontSize: 14,
                fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <div>
              <label className="gg-label" htmlFor="displayName">Display Name</label>
              <div className="gg-field">
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name or alias"
                />
              </div>
            </div>

            <div>
              <label className="gg-label" htmlFor="email">Email</label>
              <div className="gg-field">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="gg-label" htmlFor="password">Password</label>
              <div className="gg-field">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gg-btn gg-btn--primary"
              style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}
            >
              {loading ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
              By joining, you agree to our Terms of Service.
            </p>
          </form>

          <div className="gg-divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Already a member?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              Log in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
