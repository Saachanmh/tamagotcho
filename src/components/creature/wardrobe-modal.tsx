// Modal "Placard" pour gérer les accessoires possédés
'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import type { AccessoryType, AccessoryItem } from '@/components/monsters/pixel-monster'
import { getCatalogWithOwnership, equipAccessory, unequipAccessory, subscribeShop, type ShopItem, getBackgroundCatalogWithOwnership, equipBackground, type BackgroundItem, initOwnership } from '@/services/shop'

interface WardrobeModalProps {
  onClose: () => void
  creatureName: string
  creatureId: string
  open?: boolean
}

export function WardrobeModal ({
  onClose,
  creatureName,
  creatureId,
  open = true
}: WardrobeModalProps): React.ReactElement | null {
  const [ownedItems, setOwnedItems] = useState<ShopItem[]>([])
  const [ownedBgs, setOwnedBgs] = useState<BackgroundItem[]>([])
  const [equippedAccessories, setEquippedAccessories] = useState<Partial<Record<AccessoryType, AccessoryItem | null>>>({})
  const [equippedBg, setEquippedBg] = useState<BackgroundItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hat' | 'glasses' | 'footwear' | 'background'>('all')

  useEffect(() => {
    // Charger les accessoires et backgrounds possédés et équipés
    const unsubscribe = subscribeShop((state: any) => {
      const catalog = getCatalogWithOwnership()
      const filtered = catalog.filter((item) => state.owned?.has?.(item.id))
      setOwnedItems(filtered)
      setEquippedAccessories(state.equipped ?? {})

      const bgCatalog = getBackgroundCatalogWithOwnership()
      const filteredBgs = bgCatalog.filter((bg) => state.ownedBackgrounds?.has?.(bg.id))
      setOwnedBgs(filteredBgs)
      setEquippedBg(state.background ?? null)
    })

    // Initialiser depuis le serveur à l'ouverture, pour le monstre courant
    if (open) { void initOwnership(creatureId) }

    return unsubscribe
  }, [creatureId, open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!open) return null

  const handleEquip = (item: ShopItem): void => {
    try {
      const accessoryItem: AccessoryItem = {
        id: item.id,
        type: item.type as AccessoryType,
        color: item.color
      }
      equipAccessory(accessoryItem)
      toast.success(`${item.name} équipé ! ✨`, { position: 'top-center', autoClose: 2000 })
    } catch (error) {
      toast.error('Erreur lors de l\'équipement', { position: 'top-center', autoClose: 3000 })
    }
  }

  const handleUnequip = (type: AccessoryType): void => {
    try {
      unequipAccessory(type)
      toast.success('Accessoire retiré !', { position: 'top-center', autoClose: 2000 })
    } catch (error) {
      toast.error('Erreur lors du retrait', { position: 'top-center', autoClose: 3000 })
    }
  }

  const handleEquipBackground = (bg: BackgroundItem): void => {
    try {
      equipBackground(bg)
      toast.success(`${bg.name} équipé ! 🖼️`, { position: 'top-center', autoClose: 2000 })
    } catch (error) {
      toast.error('Erreur lors de l\'équipement du background', { position: 'top-center', autoClose: 3000 })
    }
  }

  const handleUnequipBackground = (): void => {
    try {
      equipBackground(null)
      toast.success('Background retiré !', { position: 'top-center', autoClose: 2000 })
    } catch (error) {
      toast.error('Erreur lors du retrait du background', { position: 'top-center', autoClose: 3000 })
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose()
  }

  const isEquipped = (itemId: string): boolean => {
    return Object.values(equippedAccessories).some(acc => acc?.id === itemId)
  }

  const isBackgroundEquipped = (bgId: string): boolean => {
    return equippedBg?.id === bgId
  }

  const filteredItems = selectedCategory === 'all'
    ? ownedItems
    : ownedItems.filter(item => item.category === selectedCategory)

  const showBgs = selectedCategory === 'background' || selectedCategory === 'all'

  const categories = [
    { id: 'all', label: 'Tout', icon: '🎨' },
    { id: 'hat', label: 'Chapeaux', icon: '🎩' },
    { id: 'glasses', label: 'Lunettes', icon: '🕶️' },
    { id: 'footwear', label: 'Chaussures', icon: '👟' },
    { id: 'background', label: 'Arrière-plans', icon: '🖼️' }
  ] as const

  return (
    <div
      className='fixed inset-0 z-50 bg-black/60 backdrop-blur-md animate-fade-in'
      onClick={handleBackdropClick}
    >
      <div className='fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto'>
        <div className='relative max-w-6xl w-full animate-scale-in max-h-[calc(100vh-4rem)] overflow-auto' onClick={(e) => e.stopPropagation()}>
          <div className='bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-2xl p-8 relative'>
            {/* Decorations */}
            <div className='absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-300/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none' />
            <div className='absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-300/20 to-indigo-400/20 rounded-full blur-3xl pointer-events-none' />

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              className='absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 text-white font-bold text-xl hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 cursor-pointer'
              aria-label='Fermer'
            >
              ✕
            </button>

            {/* Header */}
            <div className='relative z-10 text-center mb-6'>
              <h2 className='text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-2'>
                👔 Placard de {creatureName}
              </h2>
              <p className='text-gray-600 text-lg'>
                Gérez vos accessoires possédés
              </p>
            </div>

            {/* Category Filters */}
            <div className='relative z-10 flex justify-center gap-3 mb-6 flex-wrap'>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className='relative z-10'>
              {filteredItems.length === 0 && ownedBgs.length === 0 && selectedCategory === 'all' ? (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>🎁</div>
                  <p className='text-gray-600 text-lg font-semibold'>
                    Vous ne possédez aucun accessoire
                  </p>
                  <p className='text-gray-500 text-sm mt-2'>
                    Visitez la boutique pour acheter des accessoires !
                  </p>
                </div>
              ) : selectedCategory === 'background' && ownedBgs.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>🖼️</div>
                  <p className='text-gray-600 text-lg font-semibold'>
                    Vous ne possédez aucun arrière-plan
                  </p>
                  <p className='text-gray-500 text-sm mt-2'>
                    Visitez la boutique pour acheter des backgrounds !
                  </p>
                </div>
              ) : selectedCategory !== 'background' && filteredItems.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>🎁</div>
                  <p className='text-gray-600 text-lg font-semibold'>
                    Vous ne possédez aucun accessoire dans cette catégorie
                  </p>
                  <p className='text-gray-500 text-sm mt-2'>
                    Visitez la boutique pour acheter des accessoires !
                  </p>
                </div>
              ) : (
                <>
                  {/* Backgrounds Section */}
                  {showBgs && ownedBgs.length > 0 && (
                    <div className='mb-6'>
                      <h3 className='text-xl font-bold text-gray-800 mb-4'>🖼️ Arrière-plans</h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 py-4'>
                        {ownedBgs.map((bg: BackgroundItem) => {
                          const equipped = isBackgroundEquipped(bg.id)
                          return (
                            <div
                              key={bg.id}
                              className={`bg-white rounded-2xl p-4 shadow-md transition-all duration-300 ${
                                equipped ? 'ring-2 ring-green-500 shadow-green-200' : 'hover:shadow-lg'
                              }`}
                            >
                              {/* Preview Image */}
                              <div
                                className='w-full h-32 rounded-xl mb-3 bg-cover bg-center relative'
                                style={{ backgroundImage: `url(${bg.imageUrl})` }}
                              >
                                {equipped && (
                                  <div className='absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center'>
                                    <span className='text-white text-5xl drop-shadow-lg'>✓</span>
                                  </div>
                                )}
                              </div>

                              {/* Item Info */}
                              <div className='mb-3'>
                                <h4 className='text-lg font-bold text-gray-800'>{bg.name}</h4>
                                <p className='text-xs text-gray-500 mt-1'>{bg.description}</p>
                                {equipped && (
                                  <span className='inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full'>
                                    Équipé
                                  </span>
                                )}
                              </div>

                              {/* Action Button */}
                              <button
                                onClick={() => equipped ? handleUnequipBackground() : handleEquipBackground(bg)}
                                className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 active:scale-95 ${
                                  equipped
                                    ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-red-500 hover:to-pink-600'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                                }`}
                              >
                                {equipped ? 'Retirer' : 'Équiper'}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accessories Section */}
                  {selectedCategory !== 'background' && filteredItems.length > 0 && (
                    <div>
                      {selectedCategory === 'all' && <h3 className='text-xl font-bold text-gray-800 mb-4'>🎭 Accessoires</h3>}
                      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 py-4'>
                  {filteredItems.map((item) => {
                    const equipped = isEquipped(item.id)
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl p-4 shadow-md transition-all duration-300 ${
                          equipped ? 'ring-2 ring-green-500 shadow-green-200' : 'hover:shadow-lg'
                        }`}
                      >
                        {/* Preview Color */}
                        <div
                          className='w-full h-24 rounded-xl mb-3 flex items-center justify-center text-4xl'
                          style={{ backgroundColor: item.color ?? '#e2e8f0' }}
                        >
                          {equipped && <span className='text-white drop-shadow-lg'>✓</span>}
                        </div>

                        {/* Item Info */}
                        <div className='mb-3'>
                          <h4 className='text-lg font-bold text-gray-800'>{item.name}</h4>
                          <p className='text-xs text-gray-500 mt-1'>{item.description}</p>
                          {equipped && (
                            <span className='inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full'>
                              Équipé
                            </span>
                          )}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => equipped ? handleUnequip(item.type as AccessoryType) : handleEquip(item)}
                          className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 active:scale-95 ${
                            equipped
                              ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-red-500 hover:to-pink-600'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                          }`}
                        >
                          {equipped ? 'Retirer' : 'Équiper'}
                        </button>
                      </div>
                    )
                  })}
                </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Tip */}
            <div className='relative z-10 mt-6 p-4 bg-indigo-100/50 rounded-xl border-2 border-indigo-200'>
              <p className='text-sm text-indigo-800 text-center font-semibold'>
                💡 Astuce : Les accessoires équipés apparaissent sur votre monstre en temps réel !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
