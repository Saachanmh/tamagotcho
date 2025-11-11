'use client'

import { createAuthClient } from 'better-auth/react'

// Utiliser l'URL absolue (window.location.origin) pour éviter l'erreur "Invalid base URL"
const baseURL = typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth`
    : '/api/auth'

export const authClient = createAuthClient({
    baseURL
})

export const { useSession, signIn, signOut } = authClient
