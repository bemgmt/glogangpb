'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, LogIn } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirectTo') || '/member/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
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
        <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Welcome Back</h1>
        <p>Log in to your fan account.</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="gg-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <Link href="/forgot" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Forgot?
              </Link>
            </div>
            <div className="gg-field">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
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
              <LogIn size={16} />
            )}
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <div className="gg-divider" />

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Join free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
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
      <Suspense fallback={
        <div style={{ width: '100%', maxWidth: 420, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p>Loading form…</p>
        </div>
      }>
        <LoginForm />
      </Suspense>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
