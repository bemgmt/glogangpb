'use client'

import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { User, Mail, Award, Clock } from 'lucide-react'

interface Profile {
  id: string
  email: string
  display_name: string | null
  membership_tier: string
  membership_status: string
  role: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        console.error('[profile-save] DB Error:', error.message)
        toast.error('Failed to update profile settings.')
      } else {
        toast.success('Profile settings updated successfully!')
      }
    } catch (err) {
      console.error('[profile-save] Unexpected Error:', err)
      toast.error('An unexpected error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="profile-layout">
      {/* Sidebar Overview */}
      <div className="profile-aside gg-card">
        <div className="profile-avatar-wrap">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="profile-avatar-preview" />
          ) : (
            <div className="profile-avatar-placeholder">
              <User size={48} />
            </div>
          )}
        </div>

        <h2 className="profile-aside__name">{displayName || profile.email.split('@')[0]}</h2>
        <span className="gg-pill gg-pill--gold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 900 }}>
          {profile.membership_tier} Member
        </span>

        <hr className="gg-divider" style={{ width: '100%', margin: '1.5rem 0' }} />

        <div className="meta-list">
          <div className="meta-item">
            <Mail size={16} className="meta-icon" />
            <div>
              <p className="meta-label">Email Address</p>
              <p className="meta-val">{profile.email}</p>
            </div>
          </div>
          <div className="meta-item">
            <Award size={16} className="meta-icon" />
            <div>
              <p className="meta-label">Account Role</p>
              <p className="meta-val" style={{ textTransform: 'capitalize' }}>{profile.role}</p>
            </div>
          </div>
          <div className="meta-item">
            <Clock size={16} className="meta-icon" />
            <div>
              <p className="meta-label">Joined Date</p>
              <p className="meta-val">{joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="profile-main gg-card">
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.75rem', letterSpacing: '0.04em', margin: '0 0 1.5rem', color: 'var(--text)' }}>
          Profile Settings
        </h1>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="display-name" className="gg-label">Display Name</label>
            <input
              id="display-name"
              type="text"
              placeholder="Your screen name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="gg-field"
              maxLength={50}
              required
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Your display name is visible to other fans in community spaces.
            </p>
          </div>

          <div>
            <label htmlFor="avatar-url" className="gg-label">Avatar Image URL</label>
            <input
              id="avatar-url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="gg-field"
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Link to an external image or avatar. Hosted files must be public.
            </p>
          </div>

          <div>
            <label htmlFor="profile-bio" className="gg-label">Profile Bio</label>
            <textarea
              id="profile-bio"
              placeholder="Tell other fans about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="gg-field"
              style={{ minHeight: 100, resize: 'vertical' }}
              maxLength={300}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              A brief bio displayed on your community card (max 300 characters).
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="gg-btn gg-btn--primary"
              style={{ minWidth: 150 }}
            >
              {saving ? 'Saving changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .profile-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        .profile-aside {
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .profile-avatar-wrap {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--bg);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .profile-avatar-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-avatar-placeholder {
          color: var(--text-muted);
        }
        .profile-aside__name {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text);
          margin: 0 0 0.5rem;
        }
        .meta-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
          text-align: left;
        }
        .meta-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .meta-icon {
          color: var(--accent);
          margin-top: 0.2rem;
        }
        .meta-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .meta-val {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
          margin: 0.15rem 0 0;
          word-break: break-all;
        }
        .profile-main {
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 2.5rem;
        }
      `}</style>
    </div>
  )
}
