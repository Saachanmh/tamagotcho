/**
 * Configuration des accessoires disponibles dans la boutique
 *
 * Principe SRP: Responsabilité unique de configuration des accessoires
 * Principe OCP: Facile à étendre avec de nouveaux accessoires
 *
 * Les accessoires sont organisés par catégorie :
 * - Chaussures (footwear)
 * - Têtes (headwear)
 * - Corps (body)
 */

export interface Accessory {
  id: string
  name: string
  category: 'footwear' | 'headwear' | 'body'
  price: number
  emoji: string
  description: string
  traitKey: string
}

/**
 * Catalogue complet des accessoires
 */
export const accessories: Accessory[] = [
  // 👟 Chaussures
  {
    id: 'sneakers',
    name: 'Baskets',
    category: 'footwear',
    price: 15,
    emoji: '👟',
    description: 'Des baskets sportives pour courir',
    traitKey: 'accessories'
  },
  {
    id: 'boots',
    name: 'Bottes',
    category: 'footwear',
    price: 20,
    emoji: '🥾',
    description: 'Des bottes robustes pour l\'aventure',
    traitKey: 'accessories'
  },
  {
    id: 'slippers',
    name: 'Pantoufles',
    category: 'footwear',
    price: 10,
    emoji: '🩴',
    description: 'Des pantoufles confortables',
    traitKey: 'accessories'
  },

  // 🎩 Accessoires de tête
  {
    id: 'horns',
    name: 'Cornes',
    category: 'headwear',
    price: 25,
    emoji: '🤘',
    description: 'Des cornes impressionnantes',
    traitKey: 'accessories'
  },
  {
    id: 'ears',
    name: 'Oreilles',
    category: 'headwear',
    price: 20,
    emoji: '👂',
    description: 'De grandes oreilles mignonnes',
    traitKey: 'accessories'
  },

  // 🎀 Accessoires de corps
  {
    id: 'tail',
    name: 'Queue',
    category: 'body',
    price: 18,
    emoji: '🦊',
    description: 'Une queue qui remue',
    traitKey: 'accessories'
  }
]

/**
 * Récupère un accessoire par son ID
 */
export function getAccessoryById (id: string): Accessory | undefined {
  return accessories.find(acc => acc.id === id)
}

/**
 * Récupère tous les accessoires d'une catégorie
 */
export function getAccessoriesByCategory (category: Accessory['category']): Accessory[] {
  return accessories.filter(acc => acc.category === category)
}

/**
 * Prix des accessoires (utilisé pour l'achat)
 */
export const ACCESSORY_PRICES: Record<string, number> = {
  sneakers: 15,
  boots: 20,
  slippers: 10,
  horns: 25,
  ears: 20,
  tail: 18
}

