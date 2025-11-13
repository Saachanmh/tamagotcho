'use server'

import { xpBoosts } from '@/config/shop.config'
import { connectMongooseToDatabase } from '@/db'
import Monster from '@/db/models/monster.model'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { SHOP_CATALOG } from '@/services/shop'
import { subtractKoins } from './wallet.actions'

export async function buyXpBoost (creatureId: string, boostId: string): Promise<void> {
  console.log(`Achat du boost ${boostId} pour la créature ${creatureId}`)
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session === null || session === undefined) {
    throw new Error('User not authenticated')
  }
  const { user } = session

  await connectMongooseToDatabase()

  const monster = await Monster.findOne({ _id: creatureId, ownerId: user.id })

  if (monster === null || monster === undefined) {
    throw new Error('Monster not found')
  }

  const boost = xpBoosts.find((boost) => boost.id === boostId)

  if (boost === undefined || boost === null) {
    throw new Error('Boost not found')
  }

  // Débit des Koins AVANT d'appliquer le boost
  // Si solde insuffisant, subtractKoins lancera une erreur
  await subtractKoins(boost.price)

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
}

/**
 * Action serveur pour acheter un accessoire :
 * - Vérifie la session
 * - Vérifie l'existence du monstre
 * - Vérifie l'accessoire dans le catalogue
 * - Débite les Koins de l'utilisateur (via subtractKoins)
 * - Revalide les routes concernées
 */
export async function buyAccessory (creatureId: string, itemId: string): Promise<void> {
  console.log(`Achat de l'accessoire ${itemId} pour la créature ${creatureId}`)
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('User not authenticated')
  const { user } = session

  await connectMongooseToDatabase()

  const monster = await Monster.findOne({ _id: creatureId, ownerId: user.id })
  if (!monster) throw new Error('Monster not found')

  const item = SHOP_CATALOG.find((i) => i.id === itemId)
  if (!item) throw new Error('Item not found')

  // Débit des Koins : si solde insuffisant, subtractKoins lancera une erreur
  await subtractKoins(item.price)

  // 🎯 Tracking de la quête "achète un accessoire dans la boutique"
  const { trackQuestAction } = await import('./quests.actions')
  await trackQuestAction('buy_accessory', creatureId)

  // Pas d'enregistrement serveur d'accessoires (gestion côté client/localStorage)
  // On revalide les chemins pour rafraîchir le wallet et la page créature
  revalidatePath(`/creature/${creatureId}`)
  revalidatePath('/wallet')
}

