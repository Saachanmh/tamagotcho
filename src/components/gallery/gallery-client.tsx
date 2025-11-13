'use client'

import { useState, useEffect } from 'react'
import { getPublicMonsters, getAvailableLevels } from '@/actions/gallery.actions'
import type { GalleryData } from '@/actions/gallery.actions'
import { GalleryFrame } from './gallery-frame'
import { GalleryFilters } from './gallery-filters'
import { GalleryPagination } from './gallery-pagination'

const AVAILABLE_STATES = ['happy', 'sad', 'angry', 'hungry', 'sleepy'] as const

interface GalleryClientProps {
  userId: string
}

/**
 * Composant principal de la galerie communautaire
 *
 * Responsabilité : Orchestrer l'affichage des monstres publics
 * avec filtres et pagination
 */
export function GalleryClient ({ userId }: GalleryClientProps): React.ReactNode {
  const [data, setData] = useState<GalleryData>({
    monsters: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 12,
      hasNextPage: false,
      hasPreviousPage: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [availableLevels, setAvailableLevels] = useState<number[]>([])

  // États des filtres
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined)
  const [selectedState, setSelectedState] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  // Charger les niveaux disponibles au montage
  useEffect(() => {
    const loadLevels = async (): Promise<void> => {
      const levels = await getAvailableLevels()
      setAvailableLevels(levels)
    }
    void loadLevels()
  }, [])

  // Charger les monstres à chaque changement de filtre ou page
  useEffect(() => {
    const loadMonsters = async (): Promise<void> => {
      setLoading(true)
      const result = await getPublicMonsters(currentPage, 12, {
        level: selectedLevel,
        state: selectedState,
        sortBy
      })
      setData(result)
      setLoading(false)
    }
    void loadMonsters()
  }, [currentPage, selectedLevel, selectedState, sortBy])

  const handleReset = (): void => {
    setSelectedLevel(undefined)
    setSelectedState('')
    setSortBy('newest')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'>
      {/* Header avec texture bois */}
      <div className='relative overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-rose-900 py-12 shadow-2xl'>
        {/* Texture bois */}
        <div
          className='absolute inset-0 opacity-20'
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 69, 19, 0.3) 2px,
              rgba(139, 69, 19, 0.3) 4px
            )`
          }}
        />
        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <h1 className='text-center text-5xl font-black text-transparent bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300 bg-clip-text mb-4'>
            🖼️ Galerie Communautaire
          </h1>
          <p className='text-center text-xl font-bold text-amber-100'>
            {data.pagination.totalItems} {data.pagination.totalItems > 1 ? 'œuvres exposées' : 'œuvre exposée'}
          </p>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
        {/* Filtres */}
        <GalleryFilters
          availableLevels={availableLevels}
          availableStates={AVAILABLE_STATES}
          selectedLevel={selectedLevel}
          selectedState={selectedState}
          sortBy={sortBy}
          onLevelChange={setSelectedLevel}
          onStateChange={setSelectedState}
          onSortChange={setSortBy}
          onReset={handleReset}
        />

        {/* État de chargement */}
        {loading && (
          <div className='flex items-center justify-center py-20'>
            <div className='text-center'>
              <div className='text-6xl mb-4 animate-bounce'>🎨</div>
              <p className='text-2xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text'>
                Chargement des œuvres...
              </p>
            </div>
          </div>
        )}

        {/* Grille de monstres */}
        {!loading && data.monsters.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12'>
            {data.monsters.map((monster) => (
              <GalleryFrame
                key={monster._id}
                monster={monster}
                currentUserId={userId}
              />
            ))}
          </div>
        )}

        {/* État vide */}
        {!loading && data.monsters.length === 0 && (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='text-8xl mb-6'>🎨</div>
            <h2 className='text-3xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-4'>
              Aucune œuvre trouvée
            </h2>
            <p className='text-xl text-gray-600 mb-6'>
              Aucun monstre public ne correspond à ces critères
            </p>
            <button
              onClick={handleReset}
              className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-xl'
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && data.monsters.length > 0 && (
          <GalleryPagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}

