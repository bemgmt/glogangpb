import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ─── /member/* — requires any authenticated user ────────────────
  if (pathname.startsWith('/member')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Tier Gatekeeping
    if (pathname.startsWith('/member/vault') || pathname.startsWith('/member/early-access')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_tier, role')
        .eq('id', user.id)
        .single()
      
      const tier = profile?.current_tier || 'the_block'
      const role = profile?.role || 'user'
      
      if (role !== 'admin') {
        if (pathname.startsWith('/member/vault') && tier !== 'glory_circle') {
          return NextResponse.redirect(new URL('/member/dashboard?error=tier_required', request.url))
        }
        if (pathname.startsWith('/member/early-access') && tier !== 'frontline' && tier !== 'glory_circle') {
          return NextResponse.redirect(new URL('/member/dashboard?error=tier_required', request.url))
        }
      }
      
      // Log vault access
      if (pathname.startsWith('/member/vault')) {
        await supabase.from('vault_access_logs').insert({
          profile_id: user.id,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          action_taken: 'page_view'
        })
      }
    }
  }

  // ─── /admin/* — requires role = 'admin' ─────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin role via profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/member/dashboard', request.url))
    }
  }

  // ─── /kiosk/* — always public, no auth check ────────────────────
  // Nothing to do — kiosk is open access

  return supabaseResponse
}

export const config = {
  matcher: [
    '/member/:path*',
    '/admin/:path*',
  ],
}
