'use client'

import { useEffect, useState, useRef } from 'react'
import type { MonsterTraits, DBMonster } from '@/types/monster'
import type { MonsterAction } from '@/hooks/monsters'
import { parseMonsterTraits } from '@/lib/utils'
import { CreatureMonsterDisplay } from './creature-monster-display'
import { CreatureStatsPanel } from './creature-stats-panel'
import { LevelUpAnimation } from './level-up-animation'
import { ShopModal } from './shop-modal'
import { WardrobeModal } from './wardrobe-modal'
import { useRouter } from 'next/navigation'
import { SHOP_CATALOG } from '@/services/shop'
import { toast } from 'react-toastify'
import type { ShopActionResult } from '@/actions/shop.actions'
import { initOwnership } from '@/services/shop'

/**
 * Props pour le composant CreaturePageClient
 */
interface CreaturePageClientProps {
  /** Données du monstre à afficher */
  monster: DBMonster
}

/**
 * Composant client de la page de détail d'une créature - Version Jeu Vidéo Fun
 *
 * Responsabilité unique : orchestrer l'affichage de toutes les sections
 * de la page de détail (header, monstre animé, stats, traits, couleurs).
 *
 * Nouveau design :
 * - Fond ultra coloré avec animations
 * - Mise en avant du monstre
 * - Panels fun et engageants
 *
 * @param {CreaturePageClientProps} props - Props du composant
 * @returns {React.ReactNode} Page complète de détail de la créature
 */
export function CreaturePageClient ({ monster }: CreaturePageClientProps): React.ReactNode {
  console.log('🎮 CreaturePageClient mounted with monster:', { id: monster._id, isPublic: monster.isPublic })

  const [currentAction, setCurrentAction] = useState<MonsterAction>(null)
  const [currentMonster, setCurrentMonster] = useState<DBMonster>(monster)
  const [showXpGain, setShowXpGain] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showWardrobe, setShowWardrobe] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Parse des traits depuis le JSON stocké en base
  const traits: MonsterTraits = parseMonsterTraits(monster.traits) ?? {
    bodyColor: '#FFB5E8',
    accentColor: '#FF9CEE',
    eyeColor: '#2C2C2C',
    antennaColor: '#FFE66D',
    bobbleColor: '#FFE66D',
    cheekColor: '#FFB5D5',
    bodyStyle: 'round',
    eyeStyle: 'big',
    antennaStyle: 'single',
    accessory: 'none'
  }

  useEffect(() => {
    const fetchMonster = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/monster?id=${monster._id}`)
        if (response.ok) {
          const updatedMonster: DBMonster = await response.json()

          setCurrentMonster(prev => {
            // Détection du gain d'XP
            if (updatedMonster.xp !== prev.xp || updatedMonster.level !== prev.level) {
              // Calcul du gain d'XP
              const xpDiff = updatedMonster.level > prev.level
                ? updatedMonster.xp + (updatedMonster.level - prev.level - 1) * prev.maxXp + (prev.maxXp - prev.xp)
                : updatedMonster.xp - prev.xp

              if (xpDiff > 0) {
                setXpGained(xpDiff)
                setShowXpGain(true)

                // Masquer l'animation après 2 secondes
                setTimeout(() => {
                  setShowXpGain(false)
                }, 2000)
              }

              // Détection du level-up
              if (updatedMonster.level > prev.level) {
                setShowLevelUp(true)
              }
            }

            // ✅ CORRECTION: On synchronise isPublic depuis la DB SAUF si on est en train de le modifier
            return {
              ...updatedMonster,
              isPublic: isUpdatingVisibility ? prev.isPublic : updatedMonster.isPublic
            }
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du monstre :', error)
      }
    }

    const interval = setInterval(() => {
      void fetchMonster()
    }, 1000)

    return () => clearInterval(interval)
  }, [monster._id, isUpdatingVisibility])

  // Synchroniser l’inventaire possédé pour ce monstre/utilisateur
  useEffect(() => {
    void initOwnership(monster._id)
  }, [monster._id])

  // Nettoyage du timer d'action au démontage du composant
  useEffect(() => {
    return () => {
      if (actionTimerRef.current !== null) {
        clearTimeout(actionTimerRef.current)
      }
    }
  }, [])

  /**
   * Gère le déclenchement d'une action sur le monstre
   * @param {MonsterAction} action - Action déclenchée
   */
  const handleAction = (action: MonsterAction): void => {
    // Nettoyer le timer précédent si existant
    if (actionTimerRef.current !== null) {
      clearTimeout(actionTimerRef.current)
    }

    setCurrentAction(action)

    // Réinitialiser l'action après l'animation (doit correspondre au délai de useMonsterAction)
    const timer = setTimeout(() => {
      setCurrentAction(null)
      actionTimerRef.current = null
    }, 2500)

    actionTimerRef.current = timer
  }

  /**
   * Gère l'achat d'un accessoire depuis la boutique (utilise le résultat structuré ShopActionResult)
   */
  const handleBuyItem = async (creatureId: string, itemId: string): Promise<void> => {
    try {
      console.log(`Achat de l'accessoire ${itemId} pour la créature ${creatureId}`)
      const { buyAccessory: buyAccessoryAction } = await import('@/actions/shop.actions')
      const { buyAccessory: buyAccessoryClient } = await import('@/services/shop')
      const result: ShopActionResult = await buyAccessoryAction(creatureId, itemId)
      if (!result.ok) {
        toast.error(result.error ?? 'Erreur lors de l\'achat 😢', { position: 'top-center', autoClose: 5000 })
        return
      }
      const item = SHOP_CATALOG.find(i => i.id === itemId)
      if (item) {
        await buyAccessoryClient(item)
      }
      toast.success('Accessoire acheté avec succès ! 🎉', { position: 'top-center', autoClose: 3000 })
    } catch (error) {
      console.error('Erreur lors de l\'achat de l\'accessoire:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'achat 😢'
      toast.error(errorMessage, { position: 'top-center', autoClose: 5000 })
    }
  }

  /**
   * Gère la fermeture du modal de la boutique
   */
  const handleCloseShop = (): void => {
    setShowShop(false)
  }

  /**
   * Gère la fermeture du modal de la garde-robe
   */
  const handleCloseWardrobe = (): void => {
    setShowWardrobe(false)
  }

  /**
   * Gère la mise à jour de la visibilité du monstre
   * @param {boolean} isVisible - Nouvelle visibilité du monstre
   */
  const handleVisibilityChange = async (isVisible: boolean): Promise<void> => {
    setIsUpdatingVisibility(true)

    try {
      // Appel à l'API pour mettre à jour la visibilité du monstre
      const response = await fetch('/api/monster/updateVisibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: monster._id,
          isPublic: isVisible
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la visibilité')
      }

      // Mise à jour réussie, on peut mettre à jour l'état local
      setCurrentMonster(prev => ({
        ...prev,
        isPublic: isVisible
      }))

      toast.success(`Monstre ${isVisible ? 'rendu public' : 'caché'} avec succès !`, {
        position: 'top-center',
        autoClose: 3000
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la visibilité:', error)

      toast.error('Erreur lors de la mise à jour de la visibilité 😢', {
        position: 'top-center',
        autoClose: 5000
      })
    } finally {
      setIsUpdatingVisibility(false)
    }
  }

  const togglePublic = async (): Promise<void> => {
    const newVisibility = !currentMonster.isPublic
    setIsUpdatingVisibility(true)

    try {
      // Appel à l'API pour mettre à jour la visibilité du monstre
      const response = await fetch('/api/monster/updateVisibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: monster._id,
          isPublic: newVisibility
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la visibilité')
      }

      // Mise à jour réussie, on peut mettre à jour l'état local
      setCurrentMonster(prev => ({
        ...prev,
        isPublic: newVisibility
      }))

      toast.success(`Monstre ${newVisibility ? 'rendu public' : 'caché'} avec succès !`, {
        position: 'top-center',
        autoClose: 3000
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la visibilité:', error)

      toast.error('Erreur lors de la mise à jour de la visibilité 😢', {
        position: 'top-center',
        autoClose: 5000
      })
    } finally {
      setIsUpdatingVisibility(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 relative pb-20 md:pb-0'>
      {/* Header mobile sticky */}
      <div className='md:hidden sticky top-0 z-50 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 shadow-lg'>
        <div className='flex items-center justify-between px-3 py-2.5 gap-2 border-b border-white/20'>
          <button
            onClick={() => { void router.push('/app') }}
            className='flex items-center gap-1.5 bg-white/90 text-purple-700 font-black px-3 py-1.5 rounded-lg shadow-md hover:bg-white transition-all duration-300 active:scale-95 text-sm'
          >
            <span className='text-base'>←</span>
            <span className='text-xs'>Retour</span>
          </button>
          <h1 className='text-sm font-black text-white truncate max-w-[120px] text-center flex-1'>{currentMonster.name}</h1>
          <button
            onClick={() => { void togglePublic() }}
            disabled={isUpdatingVisibility}
            className={`flex items-center px-2 py-1.5 rounded-lg shadow-md font-bold text-xs transition-all duration-300 active:scale-95 ${currentMonster.isPublic ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <span className='text-base'>{currentMonster.isPublic ? '🌐' : '🔒'}</span>
          </button>
        </div>
        <div className='flex items-center justify-around px-3 py-2 gap-2'>
          <button
            onClick={() => { setShowWardrobe(true) }}
            className='flex flex-col items-center gap-0.5 bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-md hover:bg-indigo-600 transition-all duration-300 active:scale-95 flex-1'
          >
            <span className='text-lg'>👔</span>
            <span className='text-[10px] uppercase'>Placard</span>
          </button>
          <button
            onClick={() => { setShowShop(true) }}
            className='flex flex-col items-center gap-0.5 bg-green-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-md hover:bg-green-600 transition-all duration-300 active:scale-95 flex-1'
          >
            <span className='text-lg'>🛍️</span>
            <span className='text-[10px] uppercase'>Boutique</span>
          </button>
        </div>
      </div>

      <div className='py-4 sm:py-6'>
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute -right-16 sm:-right-32 top-20 h-48 w-48 sm:h-96 sm:w-96 rounded-full bg-gradient-to-br from-yellow-300/30 to-orange-400/30 blur-3xl animate-float' />
          <div className='absolute -left-16 sm:-left-32 bottom-20 h-48 w-48 sm:h-96 sm:w-96 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-400/30 blur-3xl animate-float-delayed' />
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-60 w-60 sm:h-80 sm:w-80 rounded-full bg-gradient-to-br from-blue-300/20 to-indigo-400/20 blur-3xl animate-pulse-slow' />
        </div>
        <div className='pointer-events-none absolute top-20 right-40 text-6xl animate-twinkle hidden lg:block'>⭐</div>
        <div className='pointer-events-none absolute top-40 left-20 text-5xl animate-twinkle-delayed hidden lg:block'>✨</div>
        <div className='pointer-events-none absolute bottom-40 right-60 text-4xl animate-twinkle hidden lg:block'>💫</div>

        <div className='container relative z-10 mx-auto px-4 max-w-7xl'>
          <div className='hidden md:flex justify-between items-center mb-6 gap-4'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => { void router.push('/app') }}
                className='group inline-flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-black px-4 py-2 rounded-xl shadow-lg ring-2 ring-purple-200/50 transition-all duration-300 hover:scale-105 active:scale-95'
              >
                <span className='text-xl'>←</span>
                <span className='hidden sm:inline'>Retour</span>
              </button>
              <div className='flex items-center gap-2'>
                <span className='text-3xl'>👋</span>
                <h1 className='text-3xl sm:text-4xl font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text'>{currentMonster.name}</h1>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => { setShowWardrobe(true) }}
                className='inline-flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-black px-4 py-2 rounded-xl shadow-lg ring-2 ring-indigo-200/50 transition-all duration-300 hover:scale-105 active:scale-95'
              >
                <span className='text-xl'>👔</span>
                <span className='hidden sm:inline'>Placard</span>
              </button>
              <button
                onClick={() => { setShowShop(true) }}
                className='inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black px-4 py-2 rounded-xl shadow-lg ring-2 ring-green-200/50 transition-all duration-300 hover:scale-105 active:scale-95'
              >
                <span className='text-xl'>🛍️</span>
                <span className='hidden sm:inline'>Boutique</span>
              </button>
              <button
                onClick={() => { void togglePublic() }}
                disabled={isUpdatingVisibility}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ring-2 transition-all duration-300 active:scale-95 font-black ${currentMonster.isPublic ? 'bg-green-600 text-white ring-green-300/50' : 'bg-gray-300 text-gray-800 ring-gray-400/50'}`}
              >
                <span className='text-xl'>{currentMonster.isPublic ? '🌐' : '🔒'}</span>
                <span className='hidden sm:inline'>{currentMonster.isPublic ? 'Public' : 'Privé'}</span>
                {isUpdatingVisibility && <span className='text-xs animate-pulse'>...</span>}
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start'>
            <div className='space-y-6'>
              <CreatureMonsterDisplay
                traits={traits}
                state={currentMonster.state}
                level={currentMonster.level}
                currentAction={currentAction}
                onAction={handleAction}
                monsterId={currentMonster._id}
              />
            </div>
            <div>
              <CreatureStatsPanel
                level={currentMonster.level}
                xp={currentMonster.xp ?? 0}
                maxXp={currentMonster.maxXp ?? currentMonster.level * 100}
                state={currentMonster.state}
                createdAt={currentMonster.createdAt}
                updatedAt={currentMonster.updatedAt}
                showXpGain={showXpGain}
                xpGained={xpGained}
              />
            </div>
          </div>
        </div>
      </div>

      <LevelUpAnimation
        newLevel={currentMonster.level}
        show={showLevelUp}
        onComplete={() => setShowLevelUp(false)}
      />

      {showWardrobe && (
        <WardrobeModal
          onClose={() => { setShowWardrobe(false) }}
          creatureName={currentMonster.name}
          creatureId={currentMonster._id}
          open={showWardrobe}
        />
      )}

      {showShop && (
        <ShopModal
          onClose={() => { setShowShop(false) }}
          creatureName={currentMonster.name}
          creatureId={currentMonster._id}
          open={showShop}
        />
      )}

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-30px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-25px); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.3) rotate(180deg); } }
        @keyframes twinkle-delayed { 0%, 100% { opacity: 0.4; transform: scale(0.9) rotate(0deg); } 50% { opacity: 1; transform: scale(1.2) rotate(-180deg); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-twinkle-delayed { animation: twinkle-delayed 4s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
