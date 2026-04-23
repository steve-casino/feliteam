import { NextResponse, type NextRequest } from 'next/server'

// Routes that are temporarily disabled. Any request to these paths (or
// subpaths) gets redirected to /intake. Keep this list in sync with the
// `disabled: true` flags in src/components/layout/Sidebar.tsx.
const DISABLED_ROUTES = ['/dashboard', '/cases', '/team', '/leaderboard']

// Testing mode: no auth required. Middleware passes most requests through,
// but rewrites disabled section URLs so typing them into the address bar
// still lands the user on Intake.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDisabled = DISABLED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  if (isDisabled) {
    const url = request.nextUrl.clone()
    url.pathname = '/intake'
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
