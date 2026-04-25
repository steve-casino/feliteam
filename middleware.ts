import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware handles two concerns:
 *
 * 1. Disabled sections — grey/non-existent yet, so bounce URL-typed visits
 *    to a route that works. Keep DISABLED_ROUTES in sync with the
 *    `disabled: true` flags in src/components/layout/Sidebar.tsx.
 *
 * 2. Role gating — reads the `injuryflow_role` cookie written by
 *    src/lib/auth.ts after a Supabase sign-in. Case managers belong on
 *    /dashboard, case reps on /rep-intake, logged-out visitors on /.
 *
 * We keep a lightweight `injuryflow_role` cookie instead of querying
 * Supabase on every request — it's a middleware, it runs a lot. The
 * Supabase session itself still lives in the sb-* cookies written by
 * @supabase/ssr; we just mirror the role for fast gating.
 */

const DISABLED_ROUTES = ['/cases', '/team', '/leaderboard', '/admin']

const ROLE_COOKIE = 'injuryflow_role'

type Role = 'case_manager' | 'case_rep'

const MANAGER_ROUTES = ['/dashboard', '/calendar', '/intake', '/cases', '/admin']
const REP_ROUTES = ['/rep-intake']

function parseRoleCookie(raw: string | undefined): Role | null {
  if (!raw) return null
  if (raw === 'case_manager' || raw === 'case_rep') return raw
  return null
}

function matchesAny(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // (1) Redirect disabled sections to a safe spot.
  if (matchesAny(pathname, DISABLED_ROUTES)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // (2) Role gating.
  const role = parseRoleCookie(request.cookies.get(ROLE_COOKIE)?.value)

  // Case rep trying to access manager-only pages → bounce to rep-intake.
  if (role === 'case_rep' && matchesAny(pathname, MANAGER_ROUTES)) {
    const url = request.nextUrl.clone()
    url.pathname = '/rep-intake'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Case manager trying to access rep-only pages → bounce to dashboard.
  if (role === 'case_manager' && matchesAny(pathname, REP_ROUTES)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Logged-out users hitting any gated route → bounce to landing.
  if (
    !role &&
    (matchesAny(pathname, MANAGER_ROUTES) || matchesAny(pathname, REP_ROUTES))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
