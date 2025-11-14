'use server'

import { xpBoosts } from '@/config/shop.config'
import { connectMongooseToDatabase } from '@/db'
import Monster from '@/db/models/monster.model'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { SHOP_CATALOG } from '@/services/shop'
import { subtractKoins } from './wallet.actions'
import Wallet from '@/db/models/wallet.model'

type ActionOk = { ok: true }
type ActionErr = { ok: false, error: string, code?:
  | 'UNAUTHENTICATED'
  | 'MONSTER_NOT_FOUND'
  | 'ITEM_NOT_FOUND'
  | 'BOOST_NOT_FOUND'
  | 'BACKGROUND_NOT_FOUND'
  | 'INSUFFICIENT_BALANCE'
  | 'UNKNOWN'
}
export type ShopActionResult = ActionOk | ActionErr

function mapErrorToResult (err: unknown): ActionErr {
  const message = err instanceof Error ? err.message : String(err)
  if (message.includes('User not authenticated')) {
    return { ok: false, error: 'Vous devez être connecté pour effectuer cet achat.', code: 'UNAUTHENTICATED' }
  }
  if (message.includes('Monster not found')) {
    return { ok: false, error: 'Monstre introuvable.', code: 'MONSTER_NOT_FOUND' }
  }
  if (message.includes('Boost not found')) {
    return { ok: false, error: 'Boost introuvable dans le catalogue.', code: 'BOOST_NOT_FOUND' }
  }
  if (message.includes('Item not found')) {
    return { ok: false, error: 'Accessoire introuvable dans le catalogue.', code: 'ITEM_NOT_FOUND' }
  }
  if (message.includes('Background not found')) {
    return { ok: false, error: 'Arrière-plan introuvable dans le catalogue.', code: 'BACKGROUND_NOT_FOUND' }
  }
  if (message.includes('Insufficient balance')) {
    return { ok: false, error: 'Montant de Koins insuffisant.', code: 'INSUFFICIENT_BALANCE' }
  }
  return { ok: false, error: 'Une erreur est survenue lors de l\'achat.', code: 'UNKNOWN' }
}

export async function buyXpBoost (creatureId: string, boostId: string): Promise<ShopActionResult> {
  try {
    console.log(`Achat du boost ${boostId} pour la créature ${creatureId}`)
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (session === null || session === undefined) {
      return mapErrorToResult(new Error('User not authenticated'))
    }
    const { user } = session

    await connectMongooseToDatabase()

    const monster = await Monster.findOne({ _id: creatureId, ownerId: user.id })
    if (monster === null || monster === undefined) {
      return mapErrorToResult(new Error('Monster not found'))
    }

    const boost = xpBoosts.find((b) => b.id === boostId)
    if (boost === undefined || boost === null) {
      return mapErrorToResult(new Error('Boost not found'))
    }

    // Débit des Koins AVANT d'appliquer le boost
    try {
      await subtractKoins(boost.price)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Insufficient balance')) {
        const wallet = await Wallet.findOne({ ownerId: user.id })
        const current = wallet?.balance ?? 0
        return { ok: false, error: `Solde insuffisant: ${current} Koins disponibles, prix ${boost.price} Koins.`, code: 'INSUFFICIENT_BALANCE' }
      }
      return mapErrorToResult(err)
    }

    monster.xp = Number(monster.xp) + Number(boost.xpAmount)
    monster.markModified('xp')
    if (Number(monster.xp) >= Number(monster.maxXp)) {
      monster.level = Number(monster.level) + 1
      monster.maxXp = Number(monster.level) * 100
      monster.markModified('level')
      monster.markModified('maxXp')
      monster.xp = 0
      monster.markModified('xp')
    }
    await monster.save()
    revalidatePath(`/creature/${creatureId}`)
    revalidatePath('/wallet')
    return { ok: true }
  } catch (error) {
    console.error('buyXpBoost error:', error)
    return mapErrorToResult(error)
  }
}

/**
 * Action serveur pour acheter un accessoire :
 * - Vérifie la session
 * - Vérifie l'existence du monstre
 * - Vérifie l'accessoire dans le catalogue
 * - Débite les Koins de l'utilisateur (via subtractKoins)
 * - Revalide les routes concernées
 */
export async function buyAccessory (creatureId: string, itemId: string): Promise<ShopActionResult> {
  try {
    console.log(`Achat de l'accessoire ${itemId} pour la créature ${creatureId}`)
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return mapErrorToResult(new Error('User not authenticated'))
    const { user } = session

    await connectMongooseToDatabase()

    const monster = await Monster.findOne({ _id: creatureId, ownerId: user.id })
    if (!monster) return mapErrorToResult(new Error('Monster not found'))

    const item = SHOP_CATALOG.find((i) => i.id === itemId)
    if (!item) return mapErrorToResult(new Error('Item not found'))

    try {
      await subtractKoins(item.price)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Insufficient balance')) {
        const wallet = await Wallet.findOne({ ownerId: user.id })
        const current = wallet?.balance ?? 0
        return { ok: false, error: `Solde insuffisant: ${current} Koins disponibles, prix ${item.price} Koins.`, code: 'INSUFFICIENT_BALANCE' }
      }
      return mapErrorToResult(err)
    }

    // 🎯 Tracking de la quête "achète un accessoire dans la boutique"
    const { trackQuestAction } = await import('./quests.actions')
    await trackQuestAction('buy_accessory', creatureId)

    // Revalidation des chemins
    revalidatePath(`/creature/${creatureId}`)
    revalidatePath('/wallet')

    return { ok: true }
  } catch (error) {
    console.error('buyAccessory error:', error)
    return mapErrorToResult(error)
  }
}

/**
 * Action serveur pour acheter un arrière-plan :
 * - Vérifie la session
 * - Vérifie l'existence du monstre
 * - Vérifie le background dans le catalogue
 * - Débite les Koins de l'utilisateur (via subtractKoins)
 * - Revalide les routes concernées
 */
export async function buyBackgroundAction (creatureId: string, itemId: string): Promise<ShopActionResult> {
  try {
    console.log(`Achat du background ${itemId} pour la créature ${creatureId}`)
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return mapErrorToResult(new Error('User not authenticated'))
    const { user } = session

    await connectMongooseToDatabase()

    const monster = await Monster.findOne({ _id: creatureId, ownerId: user.id })
    if (!monster) return mapErrorToResult(new Error('Monster not found'))

    const { BACKGROUND_CATALOG } = await import('@/services/shop')
    const item = BACKGROUND_CATALOG.find((i) => i.id === itemId)
    if (!item) return mapErrorToResult(new Error('Background not found'))

    try {
      await subtractKoins(item.price)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Insufficient balance')) {
        const wallet = await Wallet.findOne({ ownerId: user.id })
        const current = wallet?.balance ?? 0
        return { ok: false, error: `Solde insuffisant: ${current} Koins disponibles, prix ${item.price} Koins.`, code: 'INSUFFICIENT_BALANCE' }
      }
      return mapErrorToResult(err)
    }

    revalidatePath(`/creature/${creatureId}`)
    revalidatePath('/wallet')

    return { ok: true }
  } catch (error) {
    console.error('buyBackgroundAction error:', error)
    return mapErrorToResult(error)
  }
}
