import { NextResponse, type NextRequest } from 'next/server'

// Testing mode: no auth required. Middleware just passes every request
// through so anyone can poke at the dashboard without a Supabase session.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
