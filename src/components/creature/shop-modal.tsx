import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { xpBoosts } from '@/config/shop.config'
import { XPBoostCard } from './xp-boost-card'
import { buyXpBoost, buyAccessory as buyAccessoryAction, buyBackgroundAction, type ShopActionResult } from '@/actions/shop.actions'
import {
    getCatalogWithOwnership,
    getBackgroundCatalogWithOwnership,
    buyAccessory as buyAccessoryLocal,
    buyBackground as buyBackgroundLocal,
    type ShopItem as AccessoryShopItem,
    type BackgroundItem,
    initOwnership
} from '@/services/shop'

interface ShopModalProps {
    onClose: () => void
    creatureName: string
    creatureId: string
    open?: boolean
}

export function ShopModal ({
                               onClose,
                               creatureName,
                               creatureId,
                               open = true
}: ShopModalProps): React.ReactElement | null {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [accessories, setAccessories] = useState<AccessoryShopItem[]>([])
  const [backgrounds, setBackgrounds] = useState<BackgroundItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'xp' | 'accessories' | 'backgrounds'>('xp')

  if (!open) return null

  // Charger les accessoires et backgrounds disponibles
  useEffect(() => {
    const loadShopItems = () => {
      const accessoryCatalog = getCatalogWithOwnership()
      const backgroundCatalog = getBackgroundCatalogWithOwnership()

      // Filtrer pour ne montrer que les items non possédés
      const availableAccessories = accessoryCatalog.filter(item => !item.owned)
      const availableBackgrounds = backgroundCatalog.filter(item => !item.owned)

      setAccessories(availableAccessories)
      setBackgrounds(availableBackgrounds)
    }

    async function initAndLoad() {
      try {
        await initOwnership(creatureId)
      } catch {}
      loadShopItems()
    }

    if (open) { void initAndLoad() } else { loadShopItems() }
  }, [open, creatureId])

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
            const result: ShopActionResult = await buyXpBoost(creatureId, boostId)
            if (!result.ok) {
                toast.error(result.code === 'INSUFFICIENT_BALANCE' ? result.error : (result.error ?? 'Erreur lors de l\'achat du boost 😢'), { position: 'top-center', autoClose: 5000 })
                return
            }
            toast.success('Boost d\'XP acheté avec succès ! 🎉', { position: 'top-center', autoClose: 3000 })
            setTimeout(() => { onClose() }, 500)
        } catch (error) {
            // Ne devrait plus arriver mais on garde un fallback
            const message = error instanceof Error ? error.message : 'Erreur lors de l\'achat du boost 😢'
            toast.error(message, { position: 'top-center', autoClose: 5000 })
        } finally {
            setIsPurchasing(false)
        }
    }

    const handleAccessoryPurchase = async (item: AccessoryShopItem): Promise<void> => {
        setIsPurchasing(true)
        try {
            const result: ShopActionResult = await buyAccessoryAction(creatureId, item.id)
            if (!result.ok) {
                toast.error(result.code === 'INSUFFICIENT_BALANCE' ? result.error : (result.error ?? 'Erreur lors de l\'achat 😢'), { position: 'top-center', autoClose: 5000 })
                return
            }

            // Si succès, recharger depuis le serveur au lieu du localStorage
            await initOwnership(creatureId)

            toast.success(`${item.name} acheté avec succès ! 🎉`, { position: 'top-center', autoClose: 3000 })

            // Recharger le catalogue
            const accessoryCatalog = getCatalogWithOwnership()
            const availableAccessories = accessoryCatalog.filter(i => !i.owned)
            setAccessories(availableAccessories)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur lors de l\'achat 😢'
            toast.error(message, { position: 'top-center', autoClose: 5000 })
        } finally {
            setIsPurchasing(false)
        }
    }

    const handleBackgroundPurchase = async (item: BackgroundItem): Promise<void> => {
        setIsPurchasing(true)
        try {
            const result: ShopActionResult = await buyBackgroundAction(creatureId, item.id)
            if (!result.ok) {
                toast.error(result.code === 'INSUFFICIENT_BALANCE' ? result.error : (result.error ?? 'Erreur lors de l\'achat 😢'), { position: 'top-center', autoClose: 5000 })
                return
            }

            // Si succès, recharger depuis le serveur au lieu du localStorage
            await initOwnership(creatureId)

            toast.success(`${item.name} acheté avec succès ! 🖼️`, { position: 'top-center', autoClose: 3000 })

            // Recharger le catalogue
            const backgroundCatalog = getBackgroundCatalogWithOwnership()
            const availableBackgrounds = backgroundCatalog.filter(i => !i.owned)
            setBackgrounds(availableBackgrounds)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur lors de l\'achat 😢'
            toast.error(message, { position: 'top-center', autoClose: 5000 })
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
            <div className='fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto'>
                <div className='relative max-w-7xl w-full animate-scale-in max-h-[calc(100vh-4rem)] overflow-auto' onClick={(e) => e.stopPropagation()}>
                    {/* changed overflow-hidden -> overflow-visible to avoid clipping item cards */}
                    <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 relative'>
                        <div className='absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-300/20 to-orange-400/20 rounded-full blur-3xl pointer-events-none' />
                        <div className='absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none' />

                        <button
                            onClick={onClose}
                            type="button"
                            className='absolute top-4 right-4 z-[100] w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 text-white font-bold text-xl hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 cursor-pointer'
                            aria-label='Fermer'
                        >
                            ✕
                        </button>

                        <div className='relative z-10 text-center mb-6'>
                            <h2 className='text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2'>
                                🛍️ Boutique de {creatureName}
                            </h2>
                            <p className='text-gray-600 text-lg'>
                                Boostez l'XP, achetez des accessoires ou des arrière-plans !
                            </p>
                        </div>

                        {/* Onglets de catégories */}
                        <div className='relative z-10 flex justify-center gap-3 mb-6 flex-wrap'>
                            <button
                                onClick={() => setSelectedCategory('xp')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedCategory === 'xp'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md'
                                }`}
                            >
                                ⚡ Boosts XP
                            </button>
                            <button
                                onClick={() => setSelectedCategory('accessories')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedCategory === 'accessories'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md'
                                }`}
                            >
                                👔 Accessoires ({accessories.length})
                            </button>
                            <button
                                onClick={() => setSelectedCategory('backgrounds')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedCategory === 'backgrounds'
                                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-105'
                                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md'
                                }`}
                            >
                                🖼️ Arrière-plans ({backgrounds.length})
                            </button>
                        </div>

                        <div className='relative z-10'>
                            {/* Section Boosts XP */}
                            {selectedCategory === 'xp' && (
                                <>
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

                            <div className='mt-6 p-4 bg-blue-100/50 rounded-xl border-2 border-blue-200'>
                                <p className='text-sm text-blue-800 text-center font-semibold'>
                                    💡 Astuce : Plus le boost est gros, plus votre créature gagnera d'XP !
                                </p>
                            </div>
                                </>
                            )}

                            {/* Section Accessoires */}
                            {selectedCategory === 'accessories' && (
                                <>
                                    <div className='mb-6 text-center'>
                                        <h3 className='text-2xl font-black text-indigo-700 mb-2'>👔 Accessoires</h3>
                                        <p className='text-sm text-gray-600'>Personnalisez votre monstre avec des chapeaux, lunettes et chaussures !</p>
                                    </div>

                                    {accessories.length === 0 ? (
                                        <div className='py-12 text-center'>
                                            <div className='text-6xl mb-4'>🎉</div>
                                            <p className='text-gray-600 text-lg font-semibold'>
                                                Vous possédez déjà tous les accessoires !
                                            </p>
                                        </div>
                                    ) : (
                                        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 py-4'>
                                            {accessories.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className='bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300'
                                                >
                                                    <div
                                                        className='w-full h-24 rounded-xl mb-3 flex items-center justify-center text-4xl'
                                                        style={{ backgroundColor: item.color ?? '#e2e8f0' }}
                                                    />
                                                    <div className='mb-3'>
                                                        <h4 className='text-lg font-bold text-gray-800'>{item.name}</h4>
                                                        <p className='text-xs text-gray-500 mt-1'>{item.description}</p>
                                                    </div>
                                                    <div className='flex items-center justify-between gap-2'>
                                                        <span className='text-indigo-700 font-bold text-lg'>{item.price} 🪙</span>
                                                        <button
                                                            className='px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 active:scale-95'
                                                            onClick={() => { void handleAccessoryPurchase(item) }}
                                                            disabled={isPurchasing}
                                                        >
                                                            {isPurchasing ? 'Achat...' : 'Acheter'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Section Backgrounds */}
                            {selectedCategory === 'backgrounds' && (
                                <>
                                    <div className='mb-6 text-center'>
                                        <h3 className='text-2xl font-black text-indigo-700 mb-2'>🖼️ Arrière-plans</h3>
                                        <p className='text-sm text-gray-600'>Changez le décor derrière votre monstre !</p>
                                    </div>

                                    {backgrounds.length === 0 ? (
                                        <div className='py-12 text-center'>
                                            <div className='text-6xl mb-4'>🎉</div>
                                            <p className='text-gray-600 text-lg font-semibold'>
                                                Vous possédez déjà tous les arrière-plans !
                                            </p>
                                        </div>
                                    ) : (
                                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 py-4'>
                                            {backgrounds.map((bg) => (
                                                <div
                                                    key={bg.id}
                                                    className='bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300'
                                                >
                                                    <div
                                                        className='w-full h-32 rounded-xl mb-3 bg-cover bg-center'
                                                        style={{ backgroundImage: `url(${bg.imageUrl})` }}
                                                    />
                                                    <div className='mb-3'>
                                                        <h4 className='text-lg font-bold text-gray-800'>{bg.name}</h4>
                                                        <p className='text-xs text-gray-500 mt-1'>{bg.description}</p>
                                                    </div>
                                                    <div className='flex items-center justify-between gap-2'>
                                                        <span className='text-blue-700 font-bold text-lg'>{bg.price} 🪙</span>
                                                        <button
                                                            className='px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 transition-all duration-300 active:scale-95'
                                                            onClick={() => { void handleBackgroundPurchase(bg) }}
                                                            disabled={isPurchasing}
                                                        >
                                                            {isPurchasing ? 'Achat...' : 'Acheter'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
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
