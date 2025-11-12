import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DASHBOARD = '/app'
const LANDING = '/'
const SIGN_IN = '/sign-in'
const SIGN_UP = '/sign-up'

// Routes protégées redirigent vers /sign-in si non connecté
const protectedDeep = [
    '/app/wallet',
    '/app/boutique',
    '/app/shop'
]

function isProtectedDeep (path: string): boolean {
    return protectedDeep.some(p => path.startsWith(p))
}

export function middleware (req: NextRequest) {
    const { pathname } = req.nextUrl
    const session = req.cookies.get('better-auth.session')?.value // Adapter si autre nom
    const isAuth = Boolean(session)

    // Déjà connecté: éviter pages publiques
    if (isAuth) {
        if (pathname === LANDING || pathname === SIGN_IN || pathname === SIGN_UP) {
            return NextResponse.redirect(new URL(DASHBOARD, req.url))
        }
        return NextResponse.next()
    }

    // Non connecté:
    if (pathname === DASHBOARD) {
        return NextResponse.redirect(new URL(LANDING, req.url))
    }
    if (isProtectedDeep(pathname)) {
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
