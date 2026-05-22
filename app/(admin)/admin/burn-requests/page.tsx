import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function BurnRequestsAdmin() {
  const supabase = await createClient()

  const { data: requests, error } = await supabase
    .from('burn_requests')
    .select('*, profiles(email, current_tier), digital_closet(product_name, sku_id)')
    .order('created_at', { ascending: false })

  async function approveRequest(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const closetId = formData.get('closetId') as string
    const supabaseServer = await createClient()

    await supabaseServer.from('burn_requests').update({ status: 'approved', admin_notes: 'Credit issued.' }).eq('id', id)
    await supabaseServer.from('digital_closet').update({ is_burned: true }).eq('id', closetId)
    revalidatePath('/admin/burn-requests')
  }

  async function rejectRequest(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabaseServer = await createClient()
    await supabaseServer.from('burn_requests').update({ status: 'rejected' }).eq('id', id)
    revalidatePath('/admin/burn-requests')
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Burn Protocol Requests</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
        Review manual trade-in requests. Approving a request will mark the item as burned in the user's digital closet.
      </p>

      {error && <div className="gg-card gg-card--danger">Failed to load requests: {error.message}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {requests?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No burn requests found.</p>
        ) : (
          requests?.map((req: any) => (
            <div key={req.id} className="gg-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{req.profiles?.email}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Item: <strong style={{ color: 'var(--text)' }}>{req.digital_closet?.product_name}</strong> (SKU: {req.digital_closet?.sku_id})
                </p>
                <span className="gg-pill" style={{ 
                  background: req.status === 'pending' ? 'var(--warning-alpha)' : req.status === 'approved' ? 'var(--success-alpha)' : 'var(--danger-alpha)',
                  color: req.status === 'pending' ? 'var(--warning)' : req.status === 'approved' ? 'var(--success)' : 'var(--danger)',
                }}>
                  {req.status.toUpperCase()}
                </span>
              </div>
              
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <form action={approveRequest}>
                    <input type="hidden" name="id" value={req.id} />
                    <input type="hidden" name="closetId" value={req.digital_closet_id} />
                    <button type="submit" className="gg-btn gg-btn--primary gg-btn--sm">Approve</button>
                  </form>
                  <form action={rejectRequest}>
                    <input type="hidden" name="id" value={req.id} />
                    <button type="submit" className="gg-btn gg-btn--ghost gg-btn--sm">Reject</button>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
