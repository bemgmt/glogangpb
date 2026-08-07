'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function PhotoPrivacyControls({ userId }: { userId: string }) {
  const [deleting, setDeleting] = useState(false)

  async function deleteSavedPhotos() {
    if (!window.confirm('Permanently delete every photobooth image saved to your account?')) return

    setDeleting(true)
    try {
      const supabase = createClient()
      const { data: files, error: listError } = await supabase.storage
        .from('photos')
        .list(userId, { limit: 1000 })
      if (listError) throw listError

      const paths = (files ?? [])
        .filter((file) => file.name && file.name !== '.emptyFolderPlaceholder')
        .map((file) => `${userId}/${file.name}`)

      if (paths.length === 0) {
        toast.info('No saved photos were found.')
        return
      }

      const { error: removeError } = await supabase.storage.from('photos').remove(paths)
      if (removeError) throw removeError
      toast.success(`${paths.length} saved photo${paths.length === 1 ? '' : 's'} deleted.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete saved photos.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <aside className="gg-container" aria-labelledby="photo-privacy-title" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div className="gg-card" style={{ maxWidth: 760, margin: '0 auto' }}>
        <h2 id="photo-privacy-title" style={{ fontSize: '1rem', marginBottom: 8 }}>Photo privacy</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          Your camera starts only after you choose Enable camera. Member photos are stored privately in your account until you delete them; kiosk photos stay only in that browser session.
        </p>
        <button
          type="button"
          className="gg-btn gg-btn--ghost"
          onClick={deleteSavedPhotos}
          disabled={deleting}
          aria-label="Delete all of my saved photobooth photos"
        >
          <Trash2 size={18} aria-hidden="true" />
          {deleting ? 'Deleting…' : 'Delete my saved photos'}
        </button>
      </div>
    </aside>
  )
}
