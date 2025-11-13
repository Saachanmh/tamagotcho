'use server'

import { connectMongooseToDatabase } from '@/db'
import Monster from '@/db/models/monster.model'
import { auth } from '@/lib/auth'
import type { CreateMonsterFormValues } from '@/types/forms/create-monster-form'
import type { DBMonster } from '@/types/monster'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { Types } from 'mongoose'
import { MonsterAction } from '@/hooks/monsters'
import { trackQuestAction } from './quests.actions'

/**
 * Crée un nouveau monstre pour l'utilisateur authentifié
 *
 * Cette server action :
 * 1. Vérifie l'authentification de l'utilisateur
 * 2. Crée un nouveau document Monster dans MongoDB
 * 3. Revalide le cache de la page dashboard
 *
 * Responsabilité unique : orchestrer la création d'un monstre
 * en coordonnant l'authentification, la persistence et le cache.
 *
 * @async
 * @param {CreateMonsterFormValues} monsterData - Données validées du monstre à créer
 * @returns {Promise<void>} Promise résolue une fois le monstre créé
 * @throws {Error} Si l'utilisateur n'est pas authentifié
 *
 * @example
 * await createMonster({
 *   name: "Pikachu",
 *   traits: '{"bodyColor": "#FFB5E8", ...}',
 *   state: "happy",
 *   level: 1
 * })
 */
export async function createMonster (monsterData: CreateMonsterFormValues): Promise<void> {
  // Connexion à la base de données
  await connectMongooseToDatabase()

  // Vérification de l'authentification
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session === null || session === undefined) {
    throw new Error('User not authenticated')
  }

  // Création et sauvegarde du monstre
  const monster = new Monster({
    ownerId: session.user.id,
    name: monsterData.name,
    traits: monsterData.traits,
    state: monsterData.state,
    level: monsterData.level,
    xp: monsterData.xp,
    maxXp: monsterData.maxXp,
    isPublic: false // ✅ initialisation
  })

  await monster.save()

  // Revalidation du cache pour rafraîchir le dashboard
  revalidatePath('/dashboard')
}

/**
 * Récupère tous les monstres de l'utilisateur authentifié
 *
 * Cette server action :
 * 1. Vérifie l'authentification de l'utilisateur
 * 2. Récupère tous les monstres appartenant à l'utilisateur
 * 3. Retourne un tableau vide en cas d'erreur (résilience)
 *
 * Responsabilité unique : récupérer la liste complète des monstres
 * de l'utilisateur depuis la base de données.
 *
 * @async
 * @returns {Promise<DBMonster[]>} Liste des monstres ou tableau vide en cas d'erreur
 *
 * @example
 * const monsters = await getMonsters()
 * // [{ _id: "...", name: "Pikachu", ... }, ...]
 */
export async function getMonsters (): Promise<DBMonster[]> {
  try {
    // Connexion à la base de données
    await connectMongooseToDatabase()

    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (session === null || session === undefined) {
      throw new Error('User not authenticated')
    }

    const { user } = session

    // Récupération des monstres de l'utilisateur
    const monsters = await Monster.find({ ownerId: user.id }).exec()

    // Sérialisation JSON pour éviter les problèmes de typage Next.js
    return JSON.parse(JSON.stringify(monsters))
  } catch (error) {
    console.error('Error fetching monsters:', error)
    return []
  }
}

/**
 * Récupère un monstre spécifique par son identifiant
 *
 * Cette server action :
 * 1. Vérifie l'authentification de l'utilisateur
 * 2. Valide le format de l'identifiant MongoDB
 * 3. Récupère le monstre s'il appartient à l'utilisateur
 * 4. Retourne null si le monstre n'existe pas ou n'appartient pas à l'utilisateur
 *
 * Responsabilité unique : récupérer un monstre spécifique
 * en garantissant la propriété et l'existence.
 *
 * @async
 * @param {string} id - Identifiant du monstre (premier élément du tableau de route dynamique)
 * @returns {Promise<DBMonster | null>} Le monstre trouvé ou null
 * @throws {Error} Si l'utilisateur n'est pas authentifié
 *
 * @example
 * const monster = await getMonsterById("507f1f77bcf86cd799439011")
 * // { _id: "507f1f77bcf86cd799439011", name: "Pikachu", ... }
 *
 * const notFound = await getMonsterById("invalid-id")
 * // null
 */
export async function getMonsterById (id: string): Promise<DBMonster | null> {
  try {
    // Connexion à la base de données
    await connectMongooseToDatabase()

    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (session === null || session === undefined) {
      throw new Error('User not authenticated')
    }

    const { user } = session

    // Extraction de l'ID depuis le tableau de route dynamique
    const _id = id

    // Validation du format ObjectId MongoDB
    if (!Types.ObjectId.isValid(_id)) {
      console.error('Invalid monster ID format')
      return null
    }

    // Récupération du monstre avec vérification de propriété
    const monster = await Monster.findOne({ ownerId: user.id, _id }).exec()

    if (monster !== null && monster !== undefined) {
      // Initialiser les champs XP s'ils sont manquants (migration automatique)
      let needsUpdate = false

      if (monster.xp === undefined || monster.xp === null) {
        monster.xp = 0
        needsUpdate = true
      }

      if (monster.maxXp === undefined || monster.maxXp === null) {
        monster.maxXp = (monster.level ?? 1) * 100
        needsUpdate = true
      }

      if (needsUpdate) {
        monster.markModified('xp')
        monster.markModified('maxXp')
        await monster.save()
      }
    }

    // Sérialisation JSON pour éviter les problèmes de typage Next.js
    return JSON.parse(JSON.stringify(monster))
  } catch (error) {
    console.error('Error fetching monster by ID:', error)
    return null
  }
}

const actionsStatesMap: Record<Exclude<MonsterAction, null>, string> = {
  feed: 'hungry',
  comfort: 'angry',
  hug: 'sad',
  wake: 'sleepy'
}

export async function doActionOnMonster (id: string, action: MonsterAction): Promise<void> {
  try {
    // Connexion à la base de données
    await connectMongooseToDatabase()

    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (session === null || session === undefined) {
      throw new Error('User not authenticated')
    }

    const { user } = session

    // Validation du format ObjectId MongoDB
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid monster ID format')
    }

    // Récupération du monstre avec vérification de propriété
    const monster = await Monster.findOne({ ownerId: user.id, _id: id }).exec()

    if (monster === null || monster === undefined) {
      throw new Error('Monster not found')
    }

    // Initialisation des champs XP si nécessaires
    if (monster.xp === undefined || monster.xp === null) {
      monster.xp = 0
    }
    if (monster.maxXp === undefined || monster.maxXp === null) {
      monster.maxXp = monster.level * 100
    }

    // Mise à jour de l'état du monstre en fonction de l'action
    if (action !== null && action !== undefined && action in actionsStatesMap) {
      if (monster.state === actionsStatesMap[action]) {
        // Action correcte : passer à l'état happy
        monster.state = 'happy'

        // Gain d'XP pour action correcte (25 XP)
        const xpGain = 25
        const oldLevel = Number(monster.level)
        const currentXp = Number(monster.xp)

        monster.xp = currentXp + xpGain

        let leveledUp = false
        // Vérification du passage de niveau
        while (Number(monster.xp) >= Number(monster.maxXp)) {
          // Passage au niveau supérieur
          monster.level = Number(monster.level) + 1
          monster.xp = Number(monster.xp) - Number(monster.maxXp)
          // Nouveau palier d'XP : level * 100
          leveledUp = true
          monster.maxXp = Number(monster.level) * 100
        }

        monster.markModified('state')
        monster.markModified('xp')
        monster.markModified('maxXp')
        monster.markModified('level')

        // 🎯 Tracking des quêtes
        // Quête "nourris 5 fois ton monstre"
        if (action === 'feed') {
          await trackQuestAction('feed', id)
        }

        // Quête "interagis avec 3 monstres différents"
        await trackQuestAction('interact', id)

        // Quête "fais évoluer un monstre d'un niveau"
        if (leveledUp) {
          await trackQuestAction('level_up', id)
        }
        await monster.save()
      }
    }
  } catch (error) {
    console.error('Error updating monster state:', error)
    // 🎯 Tracking de la quête "rends un monstre public"
    if (value === true) {
      await trackQuestAction('make_public', id)
    }

  }
}

// ✅ Nouvelle action: bascule visibilité publique
export async function toggleMonsterPublic (id: string, value: boolean): Promise<DBMonster | null> {
  try {
    await connectMongooseToDatabase()
    const session = await auth.api.getSession({ headers: await headers() })
    if (session === null || session === undefined) throw new Error('User not authenticated')
    if (!Types.ObjectId.isValid(id)) throw new Error('Invalid monster ID format')

    const monster = await Monster.findOne({ ownerId: session.user.id, _id: id }).exec()
    if (monster === null || monster === undefined) throw new Error('Monster not found')

    monster.isPublic = value
    monster.markModified('isPublic')
    await monster.save()

    // Revalidate detail + dashboard
    revalidatePath(`/app/creatures/${id}`)
    revalidatePath('/app')

    return JSON.parse(JSON.stringify(monster))
  } catch (error) {
    console.error('Error toggling monster public flag:', error)
    return null
  }
}

// Fonction utilitaire pour mettre à jour le flag public d'un monstre
export async function updateMonsterPublicFlag (ownerId: string, monsterId: string, value: boolean): Promise<DBMonster | null> {
  try {
    console.log('📝 updateMonsterPublicFlag called:', { ownerId, monsterId, value })
    await connectMongooseToDatabase()

    if (!Types.ObjectId.isValid(monsterId)) {
      console.log('❌ Invalid ObjectId')
      return null
    }

    console.log('🔍 Searching for monster...')
    const monster = await Monster.findOne({ ownerId, _id: monsterId }).exec()

    if (monster == null) {
      console.log('❌ Monster not found')
      return null
    }

    console.log('📄 Monster found:', { id: monster._id, currentIsPublic: monster.isPublic })
    monster.isPublic = value
    monster.markModified('isPublic')
    console.log('💾 Saving monster with isPublic =', value)
    await monster.save()
    console.log('✅ Monster saved successfully')

    const result = JSON.parse(JSON.stringify(monster))
    console.log('📤 Returning monster:', { id: result._id, isPublic: result.isPublic })
    return result
  } catch (e) {
    console.error('❌ updateMonsterPublicFlag error', e)
    return null
  }
}
