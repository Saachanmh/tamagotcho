'use client'
import React from 'react'
import { toast } from 'react-toastify'
import { type MonsterActionType } from '@/services/rewards'
import { useKoins } from '@/context/koin-context'

interface RewardPayload {
    success: boolean
    delta: number
    balance: number
}

interface UseMonsterActionsReturn {
    triggerMonsterAction: (action: MonsterActionType, monsterId: string) => Promise<void>
    runWithReward: <T>(action: MonsterActionType, monsterId: string, actionFn: () => Promise<T>) => Promise<T | undefined>
    pending: boolean
}

async function callRewardApi (action: MonsterActionType, monsterId: string): Promise<RewardPayload | null> {
    const res = await fetch('/api/monster-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, monsterId })
    })
    if (!res.ok) return null
    return await res.json() as RewardPayload
}

export function useMonsterActions (): UseMonsterActionsReturn {
    const { setBalance } = useKoins()
    const [pending, setPending] = React.useState(false)

    // Mode "direct": appelle juste l'API de récompense (si ton endpoint réalise aussi l'action côté serveur)
    async function triggerMonsterAction (action: MonsterActionType, monsterId: string): Promise<void> {
        setPending(true)
        try {
            const data = await callRewardApi(action, monsterId)
            if (data == null || data.success !== true) {
                toast.error('Action échouée')
                return
            }
            setBalance(data.balance)
            toast.success(`+${data.delta} koin${data.delta > 1 ? 's' : ''} (solde: ${data.balance})`)
        } catch {
            toast.error('Erreur serveur')
        } finally {
            setPending(false)
        }
    }

    // Mode "lien léger": exécute ton action existante, puis crédite les koins
    async function runWithReward<T> (
        action: MonsterActionType,
        monsterId: string,
        actionFn: () => Promise<T>
    ): Promise<T | undefined> {
        setPending(true)
        try {
            const result = await actionFn() // ton appel existant (feed/cuddle/play/clean)
            const data = await callRewardApi(action, monsterId)
            if (data == null || data.success !== true) {
                toast.error('Récompense non appliquée')
                return result
            }
            setBalance(data.balance)
            toast.success(`+${data.delta} koin${data.delta > 1 ? 's' : ''} (solde: ${data.balance})`)
            return result
        } catch {
            toast.error('Erreur lors de l’action')
            return undefined
        } finally {
            setPending(false)
        }
    }

    return { triggerMonsterAction, runWithReward, pending }
}

// Exemple d’usage minimal à brancher sur un bouton existant:
//
// import { useMonsterActions } from '@/lib/monster-actions'
//
// function FeedButton ({ monsterId }: { monsterId: string }): React.ReactNode {
//   const { runWithReward, pending } = useMonsterActions()
//   async function feedMonster (): Promise<void> {
//     // ton appel actuel (ex. fetch('/api/monsters/feed', { ... }))
//   }
//   return (
//     <button
//       disabled={pending}
//       onClick={() => { void runWithReward('feed', monsterId, feedMonster) }}
//       className='px-4 py-2 rounded-lg bg-moccaccino-500 hover:bg-moccaccino-600 disabled:opacity-50 text-white transition-all duration-300 active:scale-95'
//     >
//       {pending ? '...' : 'Nourrir 🍖'}
//     </button>
//   )
// }
