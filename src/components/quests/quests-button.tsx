'use client'

interface QuestsButtonProps {
  className?: string
  onClick?: () => void
}

/**
 * Bouton pour ouvrir la modal des quêtes
 *
 * Responsabilité : Bouton simple qui déclenche un callback
 */
export function QuestsButton ({ className, onClick }: QuestsButtonProps): React.ReactNode {
  return (
    <button
      onClick={onClick}
      className={className ?? 'group relative overflow-hidden flex items-center gap-3 px-6 py-3 rounded-2xl text-lg font-black transition-all duration-300 transform hover:scale-110 active:scale-105 bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-xl ring-4 ring-cyan-200/50 hover:from-cyan-500 hover:to-blue-600'}
      title='Quêtes journalières'
    >
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:animate-shine' />
      <span className='text-3xl relative z-10 group-hover:scale-125 transition-transform duration-300'>
        🎯
      </span>
      <span className='relative z-10'>Quêtes</span>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .group:hover .animate-shine { animation: shine 1.5s ease-in-out; }
      `}
      </style>
    </button>
  )
}

