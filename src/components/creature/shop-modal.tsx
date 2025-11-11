// typescript
'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { xpBoosts } from '@/config/shop.config'
import { XPBoostCard } from './xp-boost-card'
import { buyXpBoost } from '@/actions/shop.actions'

interface ShopItem {
    id: string
    name: string
    description?: string
    price: number
    type?: string
}

interface ShopModalProps {
    onClose: () => void
    creatureName: string
    creatureId: string
    open?: boolean
    items?: ShopItem[]
    onBuyItem?: (creatureId: string, itemId: string) => Promise<void>
}

export function ShopModal ({
                               onClose,
                               creatureName,
                               creatureId,
                               open = true,
                               items = [],
                               onBuyItem
}: ShopModalProps): React.ReactElement | null {
  const [isPurchasing, setIsPurchasing] = useState(false)

  if (!open) return null

  // Debug: vérifier que les items sont bien passés
  useEffect(() => {
    console.log('🛍️ ShopModal - Items reçus:', items.length, 'accessoires')
    if (items.length > 0) {
      console.log('Premier item:', items[0])
    }
  }, [items])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

    const handleXpPurchase = async (boostId: string): Promise<void> => {
        setIsPurchasing(true)
        try {
            await buyXpBoost(creatureId, boostId)
            toast.success('Boost d\'XP acheté avec succès ! 🎉', { position: 'top-center', autoClose: 3000 })
            setTimeout(() => { onClose() }, 500)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'achat du boost 😢'
            toast.error(errorMessage, { position: 'top-center', autoClose: 5000 })
        } finally {
            setIsPurchasing(false)
        }
    }

    const handleItemPurchase = async (itemId: string): Promise<void> => {
        setIsPurchasing(true)
        try {
            if (typeof onBuyItem === 'function') {
                await onBuyItem(creatureId, itemId)
                toast.success('Objet acheté avec succès ! 🎉', { position: 'top-center', autoClose: 3000 })
                setTimeout(() => { onClose() }, 500)
            } else {
                toast.error('Achat non implémenté pour cet objet. Connectez `onBuyItem`.', { position: 'top-center', autoClose: 5000 })
                console.warn('ShopModal: onBuyItem not provided, cannot complete purchase for', itemId)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'achat de l\'objet 😢'
            toast.error(errorMessage, { position: 'top-center', autoClose: 5000 })
        } finally {
            setIsPurchasing(false)
        }
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className='fixed inset-0 z-50 bg-black/60 backdrop-blur-md animate-fade-in'
            onClick={handleBackdropClick}
        >
            <div className='fixed inset-0 z-[70] flex items-start md:items-center justify-center p-4 overflow-y-auto'>
                <div className='relative max-w-7xl w-full animate-scale-in max-h-[calc(100vh-4rem)] overflow-auto'>
                    {/* changed overflow-hidden -> overflow-visible to avoid clipping item cards */}
                    <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 relative overflow-visible'>
                        <div className='absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-300/20 to-orange-400/20 rounded-full blur-3xl' />
                        <div className='absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-3xl' />

                        <button
                            onClick={onClose}
                            className='absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 text-white font-bold text-xl hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95'
                            aria-label='Fermer'
                        >
                            ✕
                        </button>

                        <div className='relative z-10 text-center mb-6'>
                            <h2 className='text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2'>
                                🛍️ Boutique de {creatureName}
                            </h2>
                            <p className='text-gray-600 text-lg'>
                                Boostez l'XP ou achetez des objets pour votre créature !
                            </p>
                        </div>

                        <div className='relative z-10'>
                            <div className='mb-6 text-center'>
                                <h3 className='text-2xl font-black text-indigo-700 mb-2 inline-flex items-center gap-2'>
                                    <span className='text-3xl'>⚡</span>
                                    Boosts d'XP
                                    <span className='text-3xl'>⚡</span>
                                </h3>
                                <p className='text-sm text-gray-600'>
                                    Faites progresser votre créature plus rapidement !
                                </p>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 px-2 py-8 pb-2'>
                                {xpBoosts.map((boost) => (
                                    <XPBoostCard
                                        key={boost.id}
                                        boost={boost}
                                        isPurchasing={isPurchasing}
                                        onPurchase={(boostId) => { void handleXpPurchase(boostId) }}
                                    />
                                ))}
                            </div>

                            {/* Nouvelle section pour les objets, avec fallback si vide */}
                            <div className='mt-6 text-center'>
                                <h3 className='text-2xl font-black text-indigo-700 mb-2'>🧸 Objets</h3>
                                <p className='text-sm text-gray-600 mb-4'>Achetez des items pour personnaliser ou aider votre créature.</p>

                                {items.length === 0 ? (
                                    <div className='py-8'>
                                        <p className='text-sm text-gray-500'>Aucun objet disponible pour le moment.</p>
                                        <p className='text-xs text-gray-400 mt-2'>Vérifie que le parent passe bien la prop `items` (tableau non vide).</p>
                                    </div>
                                ) : (
                                    <div className='grid grid-cols-1 md:grid-cols-4 gap-6 px-2 py-4'>
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className='bg-white rounded-2xl p-4 shadow-md flex flex-col justify-between'
                                                aria-hidden={isPurchasing}
                                            >
                                                <div>
                                                    <h4 className='text-lg font-bold text-gray-800'>{item.name}</h4>
                                                    {item.description && <p className='text-sm text-gray-500 mt-2'>{item.description}</p>}
                                                </div>
                                                <div className='mt-4 flex items-center justify-between gap-4'>
                                                    <span className='text-indigo-700 font-semibold'>{item.price} 🪙</span>
                                                    <button
                                                        className='px-3 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60'
                                                        onClick={() => { void handleItemPurchase(item.id) }}
                                                        disabled={isPurchasing}
                                                    >
                                                        {isPurchasing ? 'Achat...' : 'Acheter'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className='mt-6 p-4 bg-blue-100/50 rounded-xl border-2 border-blue-200'>
                                <p className='text-sm text-blue-800 text-center font-semibold'>
                                    💡 Astuce : Plus le boost est gros, plus votre créature gagnera d'XP !
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; } to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
                .animate-scale-in { animation: scale-in 0.3s ease-out; }
            `}</style>
        </div>
    )
}
