import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PhotoboothCore } from '@/components/photobooth/PhotoboothCore'
import { PhotoPrivacyControls } from '@/components/photobooth/PhotoPrivacyControls'

export const metadata = {
  title: 'Photobooth',
  description: 'Glo Gang exclusive photobooth — overlays, face filters & digital props.',
}

export default async function PhotoboothPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/member/photobooth')

  return (
    <>
      <PhotoboothCore userId={user.id} kioskMode={false} />
      <PhotoPrivacyControls userId={user.id} />
    </>
  )
}
