'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
type PageState = 'idle' | 'loading' | 'success' | 'error'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<PageState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const supabase = createClient()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setState('loading')

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      setState('error')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      console.error('[forgot-password]', error.message)
      setErrorMessage(
        error.message.includes('rate limit')
          ? 'Too many requests. Please wait a moment before trying again.'
          : 'Something went wrong. Please try again.',
      )
      setState('error')
      return
    }

    setState('success')
  }

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------
  if (state === 'success') {
    return (
      <main className="auth-page">
        <div className="auth-card gg-card">
          <div className="auth-card__success-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>

          <h1 className="auth-card__title">Check your inbox</h1>
          <p className="auth-card__subtitle">
            We sent a password reset link to{' '}
            <strong style={{ color: 'var(--text)' }}>{email}</strong>.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Click the link in the email to reset your password. The link expires in 1 hour. If
            you don&rsquo;t see it, check your spam folder.
          </p>

          <button
            onClick={() => { setState('idle'); setEmail('') }}
            className="gg-btn gg-btn--ghost"
            style={{ width: '100%', marginTop: '1.75rem' }}
          >
            Send another link
          </button>

          <Link href="/login" className="auth-card__back-link">
            ← Back to login
          </Link>
        </div>
        <AuthPageStyles />
      </main>
    )
  }

  // ---------------------------------------------------------------------------
  // Form state
  // ---------------------------------------------------------------------------
  return (
    <main className="auth-page">
      <div className="auth-card gg-card">
        {/* Logo / Brand */}
        <div className="auth-card__brand">
          <span className="gg-pill gg-pill--gold" style={{ fontSize: '0.65rem', marginBottom: '0.75rem' }}>
            GLO GANG WORLDWIDE
          </span>
          <h1 className="auth-card__title">Reset Password</h1>
          <p className="auth-card__subtitle">
            Enter your account email and we&rsquo;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-card__form" noValidate>
          <div>
            <label htmlFor="forgot-email" className="gg-label">
              Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              className="gg-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={state === 'loading'}
              autoComplete="email"
              required
              aria-describedby={state === 'error' ? 'forgot-error' : undefined}
            />
          </div>

          {state === 'error' && errorMessage && (
            <div
              id="forgot-error"
              role="alert"
              className="auth-card__error"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMessage}
            </div>
          )}

          <button
            id="forgot-submit"
            type="submit"
            className="gg-btn gg-btn--primary"
            disabled={state === 'loading'}
            style={{ width: '100%' }}
          >
            {state === 'loading' ? (
              <span className="auth-card__spinner" aria-label="Sending…" />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <Link href="/login" className="auth-card__back-link">
          ← Back to login
        </Link>
      </div>

      <AuthPageStyles />
    </main>
  )
}

// ---------------------------------------------------------------------------
// Styles (scoped via class names)
// ---------------------------------------------------------------------------
function AuthPageStyles() {
  return (
    <style>{`
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        background: var(--bg);
        background-image:
          radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,193,7,0.06) 0%, transparent 70%);
      }
      .auth-card {
        width: 100%;
        max-width: 420px;
        padding: 2.5rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .auth-card__brand {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .auth-card__title {
        font-family: var(--font-sans);
        font-size: 1.75rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text);
        margin: 0;
        line-height: 1.1;
      }
      .auth-card__subtitle {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin: 0.4rem 0 0;
        line-height: 1.5;
      }
      .auth-card__form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .auth-card__error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: #f87171;
      }
      .auth-card__back-link {
        display: block;
        text-align: center;
        font-size: 0.85rem;
        color: var(--text-muted);
        text-decoration: none;
        transition: color 0.15s;
        margin-top: 0.25rem;
      }
      .auth-card__back-link:hover {
        color: var(--accent);
      }
      .auth-card__success-icon {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        background: rgba(255,193,7,0.08);
        border: 1px solid rgba(255,193,7,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent);
        margin: 0 auto 0.5rem;
      }
      .auth-card__title:has(+ .auth-card__subtitle) {
        text-align: center;
      }
      .auth-card__spinner {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 2px solid rgba(0,0,0,0.3);
        border-top-color: #000;
        border-radius: 50%;
        animation: auth-spin 0.7s linear infinite;
      }
      @keyframes auth-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  )
}
