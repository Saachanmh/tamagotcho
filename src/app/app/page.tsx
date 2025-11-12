'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardContent from '@/components/dashboard/dashboard-content'
import { getMonsters } from '@/actions/monsters.actions'
import { useSession } from '@/lib/auth-client'

function AppPage (): React.ReactNode {
    const router = useRouter()
    const { data: session, isPending } = useSession()
    const [monsters, setMonsters] = useState<Awaited<ReturnType<typeof getMonsters>>>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        void verifyStripePayment()
    }, [])

    async function verifyStripePayment (): Promise<void> {
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get('session_id')
        if (sessionId == null) return

        try {
            const res = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            })
            const data = await res.json()
            if (data.success === true) {
                window.history.replaceState({}, '', '/app')
                window.location.reload()
            }
        } catch (err) {
            console.error('Échec vérification paiement:', err)
        }
    }

    useEffect(() => {
        if (session?.user === undefined) return
        void loadMonsters()
    }, [session])

    async function loadMonsters (): Promise<void> {
        try {
            const userMonsters = await getMonsters()
            setMonsters(userMonsters)
        } catch (error) {
            console.error('Chargement monstres échoué:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Redirection client si non authentifié (cohérent avec middleware et règles)
    useEffect(() => {
        if (isPending === false && session == null) {
            setIsLoading(false)
            router.replace('/')
        }
    }, [isPending, session, router])

    if (isPending === true || isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <p className='text-moccaccino-500'>Chargement...</p>
            </div>
        )
    }

    // Après redirection, on ne rend rien
    if (session == null) return null

    return <DashboardContent session={session} monsters={monsters} />
}

export default AppPage
