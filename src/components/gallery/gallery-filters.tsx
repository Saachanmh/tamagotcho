'use client'

interface GalleryFiltersProps {
  availableLevels: number[]
  availableStates: readonly string[]
  selectedLevel: number | undefined
  selectedState: string
  sortBy: 'newest' | 'oldest'
  onLevelChange: (level: number | undefined) => void
  onStateChange: (state: string) => void
  onSortChange: (sort: 'newest' | 'oldest') => void
  onReset: () => void
}

/**
 * Barre de filtres pour la galerie
 *
 * Responsabilité : Interface de filtrage (niveau, état, tri)
 */
export function GalleryFilters ({
  availableLevels,
  availableStates,
  selectedLevel,
  selectedState,
  sortBy,
  onLevelChange,
  onStateChange,
  onSortChange,
  onReset
}: GalleryFiltersProps): React.ReactNode {
  const hasActiveFilters = selectedLevel !== undefined || selectedState !== '' || sortBy !== 'newest'

  const stateLabels: Record<string, string> = {
    happy: '😊 Joyeux',
    sad: '😢 Triste',
    angry: '😠 En colère',
    hungry: '🍕 Affamé',
    sleepy: '😴 Endormi'
  }

  return (
    <div className='mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl ring-2 ring-amber-200/50'>
      <div className='flex flex-wrap gap-4 items-end'>
        {/* Filtre par niveau */}
        <div className='flex-1 min-w-[200px]'>
          <label className='block text-sm font-bold text-gray-700 mb-2'>
            🎯 Niveau
          </label>
          <select
            value={selectedLevel ?? ''}
            onChange={(e) => { onLevelChange(e.target.value !== '' ? Number(e.target.value) : undefined) }}
            className='w-full px-4 py-3 rounded-xl bg-white border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 font-bold text-gray-800 transition-all duration-200'
          >
            <option value=''>Tous les niveaux</option>
            {availableLevels.map((level) => (
              <option key={level} value={level}>
                Niveau {level}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par humeur */}
        <div className='flex-1 min-w-[200px]'>
          <label className='block text-sm font-bold text-gray-700 mb-2'>
            😊 Humeur
          </label>
          <select
            value={selectedState}
            onChange={(e) => { onStateChange(e.target.value) }}
            className='w-full px-4 py-3 rounded-xl bg-white border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 font-bold text-gray-800 transition-all duration-200'
          >
            <option value=''>Toutes les humeurs</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {stateLabels[state] ?? state}
              </option>
            ))}
          </select>
        </div>

        {/* Tri par date */}
        <div className='flex-1 min-w-[200px]'>
          <label className='block text-sm font-bold text-gray-700 mb-2'>
            📅 Tri par date
          </label>
          <select
            value={sortBy}
            onChange={(e) => { onSortChange(e.target.value as 'newest' | 'oldest') }}
            className='w-full px-4 py-3 rounded-xl bg-white border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 font-bold text-gray-800 transition-all duration-200'
          >
            <option value='newest'>Plus récents</option>
            <option value='oldest'>Plus anciens</option>
          </select>
        </div>

        {/* Bouton reset */}
        {hasActiveFilters && (
          <div>
            <button
              onClick={onReset}
              className='px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-black rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95'
            >
              🔄 Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

