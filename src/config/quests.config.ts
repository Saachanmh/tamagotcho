/**
 * Configuration centralisée des quêtes journalières
 *
 * Responsabilité : Définir toutes les quêtes disponibles avec leurs
 * critères de validation et récompenses
 */

export type QuestType =
  | 'feed_monster_5'
  | 'level_up_monster'
  | 'interact_3_monsters'
  | 'buy_accessory'
  | 'make_monster_public'

export interface QuestDefinition {
  /** Identifiant unique de la quête */
  id: QuestType
  /** Titre affiché à l'utilisateur */
  title: string
  /** Description détaillée */
  description: string
  /** Emoji pour la quête */
  icon: string
  /** Nombre de koins gagnés à la complétion */
  reward: number
  /** Objectif à atteindre (nombre d'actions) */
  target: number
  /** Catégorie de la quête */
  category: 'interaction' | 'progression' | 'social' | 'shop'
  /** Couleur du gradient pour l'affichage */
  color: {
    from: string
    to: string
  }
}

/**
 * Catalogue complet des quêtes disponibles
 */
export const QUEST_CATALOG: Record<QuestType, QuestDefinition> = {
  feed_monster_5: {
    id: 'feed_monster_5',
    title: 'Chef cuisinier',
    description: 'Nourris 5 fois ton monstre aujourd\'hui',
    icon: '🍕',
    reward: 20,
    target: 5,
    category: 'interaction',
    color: {
      from: 'orange-400',
      to: 'red-500'
    }
  },

  level_up_monster: {
    id: 'level_up_monster',
    title: 'Évolution',
    description: 'Fais évoluer un monstre d\'un niveau',
    icon: '⭐',
    reward: 50,
    target: 1,
    category: 'progression',
    color: {
      from: 'yellow-400',
      to: 'amber-600'
    }
  },

  interact_3_monsters: {
    id: 'interact_3_monsters',
    title: 'Socialisation',
    description: 'Interagis avec 3 monstres différents',
    icon: '💖',
    reward: 30,
    target: 3,
    category: 'interaction',
    color: {
      from: 'pink-400',
      to: 'rose-600'
    }
  },

  buy_accessory: {
    id: 'buy_accessory',
    title: 'Shopping',
    description: 'Achète un accessoire dans la boutique',
    icon: '🛍️',
    reward: 40,
    target: 1,
    category: 'shop',
    color: {
      from: 'purple-400',
      to: 'indigo-600'
    }
  },

  make_monster_public: {
    id: 'make_monster_public',
    title: 'Partage',
    description: 'Rends un monstre public',
    icon: '🌐',
    reward: 15,
    target: 1,
    category: 'social',
    color: {
      from: 'green-400',
      to: 'emerald-600'
    }
  }
}

/**
 * Liste de tous les types de quêtes disponibles
 */
export const ALL_QUEST_TYPES: QuestType[] = Object.keys(QUEST_CATALOG) as QuestType[]

/**
 * Nombre de quêtes quotidiennes par utilisateur
 */
export const DAILY_QUESTS_COUNT = 3

/**
 * Heure de renouvellement des quêtes (minuit serveur)
 */
export const QUEST_RESET_HOUR = 0

/**
 * Sélectionne 3 quêtes aléatoires parmi le catalogue
 */
export function selectRandomQuests (count: number = DAILY_QUESTS_COUNT): QuestType[] {
  const shuffled = [...ALL_QUEST_TYPES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Vérifie si une date est aujourd'hui (UTC)
 */
export function isToday (date: Date): boolean {
  const today = new Date()
  return (
    date.getUTCDate() === today.getUTCDate() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCFullYear() === today.getUTCFullYear()
  )
}

/**
 * Calcule la prochaine date de reset (minuit UTC)
 */
export function getNextResetDate (): Date {
  const tomorrow = new Date()
  tomorrow.setUTCHours(24, 0, 0, 0)
  return tomorrow
}

/**
 * Récupère la définition d'une quête par son ID
 */
export function getQuestDefinition (questId: QuestType): QuestDefinition {
  return QUEST_CATALOG[questId]
}

