'use client'

interface GalleryPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Pagination intelligente pour la galerie
 *
 * Responsabilité : Navigation entre les pages avec affichage intelligent
 * des numéros de page (max 7 boutons avec ellipsis)
 */
export function GalleryPagination ({
  currentPage,
  totalPages,
  onPageChange
}: GalleryPaginationProps): React.ReactNode {
  if (totalPages <= 1) return null

  // Algorithme pour afficher intelligemment les numéros de page
  const getPageNumbers = (): Array<number | 'ellipsis'> => {
    if (totalPages <= 7) {
      // Afficher tous les numéros si <= 7 pages
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Sinon, afficher avec ellipsis
    const pages: Array<number | 'ellipsis'> = [1] // Toujours afficher la première page

    if (currentPage <= 3) {
      // Si on est au début : 1 2 3 4 ... 20
      pages.push(2, 3, 4, 'ellipsis', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Si on est à la fin : 1 ... 17 18 19 20
      pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      // Au milieu : 1 ... 5 6 7 ... 20
      pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className='flex flex-col items-center gap-6'>
      {/* Indicateur mobile compact */}
      <div className='md:hidden text-center'>
        <p className='text-lg font-bold text-gray-700'>
          Page <span className='text-amber-600'>{currentPage}</span> / {totalPages}
        </p>
      </div>

      {/* Pagination complète */}
      <div className='flex flex-wrap items-center justify-center gap-2'>
        {/* Bouton Précédent */}
        <button
          onClick={() => { onPageChange(currentPage - 1) }}
          disabled={currentPage === 1}
          className='px-4 py-2 bg-white font-bold text-gray-700 rounded-xl border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 transform hover:scale-105 active:scale-95'
        >
          ← Précédent
        </button>

        {/* Numéros de page */}
        <div className='hidden md:flex items-center gap-2'>
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className='px-2 text-gray-400 font-bold'>
                  ...
                </span>
              )
            }

            const isActive = pageNum === currentPage

            return (
              <button
                key={pageNum}
                onClick={() => { onPageChange(pageNum) }}
                className={`min-w-[44px] px-4 py-2 font-black rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg ring-2 ring-amber-300'
                    : 'bg-white text-gray-700 border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => { onPageChange(currentPage + 1) }}
          disabled={currentPage === totalPages}
          className='px-4 py-2 bg-white font-bold text-gray-700 rounded-xl border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 transform hover:scale-105 active:scale-95'
        >
          Suivant →
        </button>
      </div>
    </div>
  )
}

