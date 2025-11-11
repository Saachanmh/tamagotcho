// src/app/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import DashboardContent from '@/components/dashboard/dashboard-content'
import { getMonsters } from '@/actions/monsters.actions'
import { useSession } from '@/lib/auth-client'

function AppPage (): React.ReactNode {
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

    if (isPending === true || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-moccaccino-500">Chargement...</p>
            </div>
        )
    }

    if (session == null) {
        throw new Error('Session absente')
    }

    return <DashboardContent session={session} monsters={monsters} />
}

export default AppPage
