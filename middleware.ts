import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Check if the user has an auth token (cookie, session, etc.)
  const token = request.cookies.get('auth_token')?.value 
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')

  // 2. If they are logged in and trying to access an auth page, send them to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. If they aren't logged in and trying to access dashboard, send them to login
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// 4. Configure which paths this middleware runs on
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}