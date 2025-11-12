import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DASHBOARD = '/app'
const LANDING = '/'
const SIGN_IN = '/sign-in'

// Routes protégées (nécessitent une authentification)
const protectedRoutes = [
  '/app/wallet',
  '/app/boutique',
  '/app/shop',
  '/app/monsters'
]

function isProtectedRoute (path: string): boolean {
  return protectedRoutes.some(route => path.startsWith(route))
}

export function middleware (req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl
  const sessionToken = req.cookies.get('better-auth.session_token')?.value
  const isAuthenticated = Boolean(sessionToken)

  // Si l'utilisateur est authentifié
  if (isAuthenticated) {
    // Rediriger depuis les pages publiques vers le dashboard
    if (pathname === LANDING || pathname === SIGN_IN || pathname === '/sign-up') {
      return NextResponse.redirect(new URL(DASHBOARD, req.url))
    }
    return NextResponse.next()
  }

  // Si l'utilisateur n'est PAS authentifié
  // Rediriger depuis /app vers la landing page
  if (pathname === DASHBOARD) {
    return NextResponse.redirect(new URL(LANDING, req.url))
  }

  // Rediriger depuis les routes protégées vers sign-in
  if (isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL(SIGN_IN, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/app',
    '/app/:path*',
    '/sign-in',
    '/sign-up'
  ]
}
