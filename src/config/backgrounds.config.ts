/**
 * Configuration des arrière-plans disponibles dans la boutique
 *
 * Principe SRP: Responsabilité unique de configuration des backgrounds
 * Principe OCP: Facile à étendre avec de nouveaux backgrounds
 */

export interface Background {
  id: string
  name: string
  price: number
  emoji: string
  description: string
  gradient: string
  popular?: boolean
}

/**
 * Catalogue complet des arrière-plans
 */
export const backgrounds: Background[] = [
  {
    id: 'sunset',
    name: 'Coucher de Soleil',
    price: 25,
    emoji: '🌅',
    description: 'Un magnifique coucher de soleil',
    gradient: 'from-orange-400 via-pink-500 to-purple-600',
    popular: true
  },
  {
    id: 'ocean',
    name: 'Océan',
    price: 20,
    emoji: '🌊',
    description: 'Les profondeurs de l\'océan',
    gradient: 'from-blue-400 via-cyan-500 to-teal-600'
  },
  {
    id: 'forest',
    name: 'Forêt',
    price: 20,
    emoji: '🌲',
    description: 'Une forêt mystérieuse',
    gradient: 'from-green-400 via-emerald-500 to-green-700'
  },
  {
    id: 'galaxy',
    name: 'Galaxie',
    price: 35,
    emoji: '🌌',
    description: 'L\'espace infini',
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    popular: true
  },
  {
    id: 'candy',
    name: 'Bonbons',
    price: 30,
    emoji: '🍭',
    description: 'Un monde de sucreries',
    gradient: 'from-pink-300 via-purple-300 to-blue-300'
  },
  {
    id: 'fire',
    name: 'Flammes',
    price: 28,
    emoji: '🔥',
    description: 'Des flammes ardentes',
    gradient: 'from-red-500 via-orange-500 to-yellow-500'
  },
  {
    id: 'ice',
    name: 'Glace',
    price: 28,
    emoji: '❄️',
    description: 'Un paysage glacé',
    gradient: 'from-blue-200 via-cyan-300 to-blue-400'
  },
  {
    id: 'rainbow',
    name: 'Arc-en-ciel',
    price: 40,
    emoji: '🌈',
    description: 'Toutes les couleurs',
    gradient: 'from-red-400 via-yellow-400 to-purple-500',
    popular: true
  }
]

/**
 * Récupère un background par son ID
 */
export function getBackgroundById (id: string): Background | undefined {
  return backgrounds.find(bg => bg.id === id)
}

/**
 * Récupère tous les backgrounds populaires
 */
export function getPopularBackgrounds (): Background[] {
  return backgrounds.filter(bg => bg.popular === true)
}

/**
 * Prix des backgrounds (utilisé pour l'achat)
 */
export const BACKGROUND_PRICES: Record<string, number> = {
  sunset: 25,
  ocean: 20,
  forest: 20,
  galaxy: 35,
  candy: 30,
  fire: 28,
  ice: 28,
  rainbow: 40
}

