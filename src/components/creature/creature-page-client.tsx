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
   * Gère l'achat d'un accessoire depuis la boutique
   * @param {string} creatureId - ID de la créature
   * @param {string} itemId - ID de l'accessoire à acheter
   */
  const handleBuyItem = async (creatureId: string, itemId: string): Promise<void> => {
    try {
      console.log(`Achat de l'accessoire ${itemId} pour la créature ${creatureId}`)

      // Import dynamique pour éviter les problèmes de server actions
      const { buyAccessory: buyAccessoryAction } = await import('@/actions/shop.actions')
      const { buyAccessory: buyAccessoryClient } = await import('@/services/shop')

      // 1. Débit des Koins via l'action serveur (lance une erreur si solde insuffisant)
      await buyAccessoryAction(creatureId, itemId)

      // 2. Mise à jour du state côté client (localStorage)
      const item = SHOP_CATALOG.find((i) => i.id === itemId)
      if (item) {
        await buyAccessoryClient(item)
      }

      toast.success('Accessoire acheté avec succès ! 🎉', {
        position: 'top-center',
        autoClose: 3000
      })
    } catch (error) {
      console.error('Erreur lors de l\'achat de l\'accessoire:', error)

      // Messages d'erreur personnalisés selon le type d'erreur
      let errorMessage = 'Erreur lors de l\'achat 😢'

      if (error instanceof Error) {
        if (error.message.includes('Insufficient balance')) {
          errorMessage = '💰 Solde insuffisant ! Vous n\'avez pas assez de Koins pour acheter cet accessoire.'
        } else if (error.message.includes('not authenticated')) {
          errorMessage = '🔒 Vous devez être connecté pour acheter des accessoires.'
        } else if (error.message.includes('Monster not found')) {
          errorMessage = '👾 Monstre introuvable.'
        } else if (error.message.includes('Item not found')) {
          errorMessage = '🛍️ Accessoire introuvable dans le catalogue.'
        } else {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000
      })
    }
  }

  async function togglePublic (): Promise<void> {
    if (isUpdatingVisibility) return
    setIsUpdatingVisibility(true)
    try {
      const desired = !currentMonster.isPublic
      console.log('🔄 Toggle public clicked:', { currentState: currentMonster.isPublic, desiredState: desired, monsterId: currentMonster._id })

      const res = await fetch('/api/monsters/toggle-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentMonster._id, isPublic: desired })
      })

      console.log('📡 Response status:', res.status)
      const data = await res.json()
      console.log('📦 Response data:', data)

      if (res.ok && data?.monster != null) {
        console.log('✅ Updating local state:', { newIsPublic: data.monster.isPublic })
        setCurrentMonster(prev => ({ ...prev, isPublic: data.monster.isPublic }))
        toast.success(data.monster.isPublic ? 'Monstre rendu public 🌐' : 'Monstre redevenu privé 🔒')
      } else {
        console.error('❌ Toggle failed:', data.error)
        toast.error(data.error ?? 'Échec de mise à jour de la visibilité')
      }
    } catch (e) {
      console.error('❌ Toggle error:', e)
      toast.error('Erreur lors du changement de visibilité')
    } finally {
      setIsUpdatingVisibility(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 py-6 relative overflow-hidden'>
      {/* Bulles décoratives animées */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -right-32 top-20 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-300/30 to-orange-400/30 blur-3xl animate-float' />
        <div className='absolute -left-32 bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-400/30 blur-3xl animate-float-delayed' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gradient-to-br from-blue-300/20 to-indigo-400/20 blur-3xl animate-pulse-slow' />
      </div>

      {/* Étoiles décoratives */}
      <div className='pointer-events-none absolute top-20 right-40 text-6xl animate-twinkle'>⭐</div>
      <div className='pointer-events-none absolute top-40 left-20 text-5xl animate-twinkle-delayed'>✨</div>
      <div className='pointer-events-none absolute bottom-40 right-60 text-4xl animate-twinkle'>💫</div>

      <div className='container relative z-10 mx-auto px-4 max-w-7xl'>
        {/* Barre de navigation - Plus compacte */}
        <div className='flex justify-between items-center mb-6 gap-4'>
          {/* Bouton retour + nom */}
          <div className='flex items-center gap-4'>
            <button
              onClick={() => { void router.push('/app') }}
              className='group relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-black px-4 py-2 rounded-xl shadow-lg ring-2 ring-purple-200/50 transition-all duration-300 hover:scale-105 active:scale-95'
            >
              <span className='text-xl'>←</span>
              <span className='hidden sm:inline'>Retour</span>
            </button>

            {/* Nom du monstre inline */}
            <div className='flex items-center gap-2'>
              <span className='text-3xl'>👋</span>
              <h1 className='text-3xl sm:text-4xl font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text'>
                {currentMonster.name}
              </h1>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className='flex items-center gap-3'>
            {/* Bouton placard */}
            <button
              onClick={() => { setShowWardrobe(true) }}
              className='group relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white font-black px-4 py-2 rounded-xl shadow-lg ring-2 ring-indigo-200/50 transition-all duration-300 hover:scale-105 active:scale-95'
            >
              <span className='text-xl'>👔</span>
              <span className='hidden sm:inline'>Placard</span>
            </button>

            {/* Bouton boutique */}
            <button
              onClick={() => { setShowShop(true) }}
              className='group relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black px-4 py-2 rounded-xl shadow-lg ring-2 ring-green-200/50 transition-all duration-300 hover:scale-105 active:scale-95'
            >
              <span className='text-xl'>🛍️</span>
              <span className='hidden sm:inline'>Boutique</span>
            </button>

            {/* Bouton public/privé */}
            <button
              onClick={() => { void togglePublic() }}
              disabled={isUpdatingVisibility}
              className={`group relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ring-2 transition-all duration-300 active:scale-95 font-black ${currentMonster.isPublic ? 'bg-green-600 hover:bg-green-700 text-white ring-green-300/50' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 ring-gray-400/50'}`}
            >
              <span className='text-xl'>{currentMonster.isPublic ? '🌐' : '🔒'}</span>
              <span className='hidden sm:inline'>{currentMonster.isPublic ? 'Public' : 'Privé'}</span>
              {isUpdatingVisibility && <span className='text-xs animate-pulse'>...</span>}
            </button>
          </div>
        </div>

        {/* Grille principale - Alignée */}
        <div className='grid lg:grid-cols-2 gap-6 items-start'>
          {/* Colonne gauche : Monstre animé + Actions */}
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

          {/* Colonne droite : Statistiques */}
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

      {/* Animation de level-up */}
      <LevelUpAnimation
        newLevel={currentMonster.level}
        show={showLevelUp}
        onComplete={() => setShowLevelUp(false)}
      />

      {/* Modal du placard */}
      {showWardrobe && (
        <WardrobeModal
          onClose={() => { setShowWardrobe(false) }}
          creatureName={currentMonster.name}
          creatureId={currentMonster._id}
          open={showWardrobe}
        />
      )}


      {/* Modal de la boutique */}
      {showShop && (
        <ShopModal
          onClose={() => { setShowShop(false) }}
          creatureName={currentMonster.name}
          creatureId={currentMonster._id}
          open={showShop}
        />
      )}

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(180deg); }
        }

        @keyframes twinkle-delayed {
          0%, 100% { opacity: 0.4; transform: scale(0.9) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(-180deg); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-twinkle-delayed { animation: twinkle-delayed 4s ease-in-out infinite; }
        .animate-shine { animation: shine 1.5s ease-in-out; }
      `}
      </style>
    </div>
  )
}
