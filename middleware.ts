import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin = request.nextUrl.pathname.startsWith('/admin')
  const isPortail = request.nextUrl.pathname.startsWith('/portail')
  const isPortailLogin = request.nextUrl.pathname === '/portail/login'
  const isAdminLogin = request.nextUrl.pathname === '/login'

  // Non connecté → redirige vers login approprié
  if (!user) {
    if (isAdmin) return NextResponse.redirect(new URL('/login', request.url))
    if (isPortail && !isPortailLogin) return NextResponse.redirect(new URL('/portail/login', request.url))
    return supabaseResponse
  }

  // Connecté → vérifie le rôle pour /admin
  if (isAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Utilisateur non-admin : redirige vers le portail
      return NextResponse.redirect(new URL('/portail', request.url))
    }
  }

  // Déjà connecté sur les pages de login → redirige vers la bonne app
  if (isAdminLogin) return NextResponse.redirect(new URL('/admin', request.url))
  if (isPortailLogin) return NextResponse.redirect(new URL('/portail', request.url))

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/portail/:path*'],
}
