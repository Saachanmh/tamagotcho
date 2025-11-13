'use server'

import { connectMongooseToDatabase } from '@/db'
import Monster from '@/db/models/monster.model'

export interface PublicMonster {
  _id: string
  name: string
  level: number
  state: string
  traits: string
  createdAt: Date
  ownerName: string
  ownerAnonymous: boolean
  ownerId: string
}

export interface GalleryData {
  monsters: PublicMonster[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Récupère les monstres publics avec filtres et pagination
 */
export async function getPublicMonsters (
  page: number = 1,
  limit: number = 12,
  filters?: {
    level?: number
    state?: string
    sortBy?: 'newest' | 'oldest'
  }
): Promise<GalleryData> {
  try {
    await connectMongooseToDatabase()

    // Construction du filtre
    const filter: any = { isPublic: true }

    if (filters?.level != null) {
      filter.level = filters.level
    }

    if (filters?.state != null && filters.state !== '') {
      filter.state = filters.state
    }

    // Construction du tri
    const sort: any = {}
    if (filters?.sortBy === 'oldest') {
      sort.createdAt = 1
    } else {
      sort.createdAt = -1 // newest par défaut
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit

    // Récupération des monstres
    const [monsters, total] = await Promise.all([
      Monster.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Monster.countDocuments(filter).exec()
    ])

    // Pour l'instant, on affiche "Créateur" pour tous
    // Better-auth ne fournit pas d'API simple pour récupérer les users par ID
    const monstersWithOwners: PublicMonster[] = monsters.map((monster: any) => ({
      _id: monster._id.toString(),
      name: monster.name,
      level: monster.level,
      state: monster.state,
      traits: monster.traits,
      createdAt: monster.createdAt,
      ownerName: 'Créateur', // Anonymisé par défaut
      ownerAnonymous: true,
      ownerId: monster.ownerId.toString()
    }))

    const totalPages = Math.ceil(total / limit)

    return {
      monsters: monstersWithOwners,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }
  } catch (error) {
    console.error('❌ Error fetching public monsters:', error)
    return {
      monsters: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }
}

/**
 * Récupère les niveaux disponibles pour le filtre
 */
export async function getAvailableLevels (): Promise<number[]> {
  try {
    await connectMongooseToDatabase()

    const levels = await Monster.distinct('level', { isPublic: true }).exec()
    return levels.sort((a, b) => a - b)
  } catch (error) {
    console.error('❌ Error fetching available levels:', error)
    return []
  }
}

