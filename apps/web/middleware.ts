import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── DEMO MODE ─────────────────────────────────────────────────────────────
  // In demo mode, skip Supabase auth — just check onboarding via cookie
  if (IS_DEMO) {
    const isProtected = pathname.startsWith('/dashboard') ||
      pathname.startsWith('/document') || pathname.startsWith('/settings')

    if (isProtected) {
      // In demo mode we allow access — onboarding is checked client-side via localStorage
      return NextResponse.next()
    }
    return NextResponse.next()
  }

  // ── PRODUCTION MODE ────────────────────────────────────────────────────────
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

  const isProtected = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/document') ||
    pathname.startsWith('/settings')
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isOnboarding = pathname === '/onboarding'

  // Not logged in → redirect to /login
  if ((isProtected || isOnboarding) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in on auth pages → redirect to dashboard (onboarding check below)
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check onboarding status for logged-in users hitting protected routes
  if (user && (isProtected || isOnboarding)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    const onboardingDone = profile?.onboarding_completed === true

    // Not onboarded → redirect to /onboarding (unless already there)
    if (!onboardingDone && !isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Already onboarded + trying to access /onboarding → allow (they're changing their niche)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/document/:path*',
    '/settings/:path*',
    '/onboarding',
    '/login',
    '/register',
  ],
}
