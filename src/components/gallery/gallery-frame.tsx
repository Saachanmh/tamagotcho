'use client'

import { useState } from 'react'
import { PixelMonster } from '@/components/monsters'
import { parseMonsterTraits } from '@/lib/utils'
import type { PublicMonster } from '@/actions/gallery.actions'
import type { MonsterState } from '@/types/monster'

interface GalleryFrameProps {
  monster: PublicMonster
  currentUserId: string
}

/**
 * Cadre doré de galerie pour afficher un monstre public
 *
 * Responsabilité : Afficher un monstre dans un cadre style galerie d'art
 * avec plaque de musée et toggle d'anonymat
 */
export function GalleryFrame ({ monster, currentUserId }: GalleryFrameProps): React.ReactNode {
  const [showOwner, setShowOwner] = useState(false)
  const traits = parseMonsterTraits(monster.traits)
  const isOwnMonster = monster.ownerId === currentUserId

  // Format de la date
  const createdDate = new Date(monster.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Emoji pour l'état
  const stateEmojis: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    hungry: '🍕',
    sleepy: '😴'
  }

  const stateLabels: Record<string, string> = {
    happy: 'Joyeux',
    sad: 'Triste',
    angry: 'En colère',
    hungry: 'Affamé',
    sleepy: 'Endormi'
  }

  return (
    <div className='group relative'>
      {/* Cadre doré avec texture bois */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-700 via-amber-600 to-yellow-800 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0_30px_90px_rgba(0,0,0,0.5)] hover:scale-[1.02]'>
        {/* Texture bois sur le cadre */}
        <div
          className='absolute inset-0 opacity-20'
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(139, 69, 19, 0.3) 10px,
              rgba(139, 69, 19, 0.3) 20px
            )`
          }}
        />

        {/* Lumière muséale (effet de projecteur au hover) */}
        <div className='absolute -top-40 left-1/2 -translate-x-1/2 h-40 w-3/4 bg-gradient-to-b from-yellow-300/30 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

        {/* Canvas avec texture toile */}
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-100 via-amber-50 to-orange-50 p-8 shadow-inner'>
          {/* Texture toile */}
          <div
            className='absolute inset-0 opacity-10'
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)
              `
            }}
          />

          {/* Badges */}
          <div className='absolute top-3 left-3 z-10'>
            <span className='inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-black text-gray-800 shadow-lg ring-2 ring-amber-200'>
              {stateEmojis[monster.state] ?? '😊'} {stateLabels[monster.state] ?? monster.state}
            </span>
          </div>

          <div className='absolute top-3 right-3 z-10'>
            <span className='inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-black text-amber-700 shadow-lg ring-2 ring-amber-200'>
              ⭐ Niveau {monster.level}
            </span>
          </div>

          {isOwnMonster && (
            <div className='absolute bottom-3 right-3 z-10'>
              <span className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm font-black text-white shadow-lg ring-2 ring-purple-300'>
                ✨ Ma création
              </span>
            </div>
          )}

          {/* Monstre */}
          <div className='relative flex items-center justify-center min-h-[200px] transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1'>
            {traits !== null && (
              <PixelMonster
                traits={traits}
                state={monster.state as MonsterState}
                level={monster.level}
              />
            )}
          </div>
        </div>

        {/* Plaque de musée (Cartel) */}
        <div className='relative mt-4 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 p-4 shadow-lg'>
          <div className='space-y-2'>
            {/* Titre */}
            <h3 className='text-xl font-black text-amber-100 text-center border-b border-stone-700 pb-2'>
              {monster.name}
            </h3>

            {/* Créateur */}
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-bold text-stone-400 uppercase tracking-wider mb-1'>
                  Créateur
                </p>
                <p className='text-sm font-bold text-stone-200'>
                  {showOwner ? monster.ownerName : 'Artiste Anonyme'}
                </p>
              </div>
              <button
                onClick={() => { setShowOwner(!showOwner) }}
                className='ml-2 text-2xl hover:scale-125 transition-transform duration-200'
                title={showOwner ? 'Masquer le créateur' : 'Afficher le créateur'}
              >
                {showOwner ? '👁️' : '🕶️'}
              </button>
            </div>

            {/* Date */}
            <div>
              <p className='text-xs font-bold text-stone-400 uppercase tracking-wider mb-1'>
                Date de création
              </p>
              <p className='text-sm font-bold text-stone-300'>
                {createdDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

