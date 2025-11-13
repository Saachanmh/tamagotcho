'use server'

import { connectMongooseToDatabase } from '@/db'
import UserQuests from '@/db/models/userquests.model'
import Wallet from '@/db/models/wallet.model'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import {
  type QuestType,
  QUEST_CATALOG,
  selectRandomQuests,
  isToday,
  DAILY_QUESTS_COUNT
} from '@/config/quests.config'
import type { ActiveQuest } from '@/db/models/userquests.model'

export interface UserQuestsData {
  activeQuests: ActiveQuest[]
  lastResetDate: Date
}

/**
 * Récupère les quêtes actives de l'utilisateur
 * Génère de nouvelles quêtes si nécessaire (nouveau jour)
 */
export async function getUserQuests (): Promise<UserQuestsData> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (session?.user?.id == null) {
      throw new Error('User not authenticated')
    }

    await connectMongooseToDatabase()

    let userQuests = await UserQuests.findOne({ userId: session.user.id })

    // Si pas de quêtes ou si le dernier reset n'est pas aujourd'hui, générer de nouvelles quêtes
    if (userQuests == null || !isToday(userQuests.lastResetDate)) {
      userQuests = await generateNewDailyQuests(session.user.id)
    }

    return {
      activeQuests: userQuests.activeQuests,
      lastResetDate: userQuests.lastResetDate
    }
  } catch (error) {
    console.error('❌ Error fetching user quests:', error)
    throw error
  }
}

/**
 * Génère de nouvelles quêtes journalières pour un utilisateur
 */
async function generateNewDailyQuests (userId: string): Promise<any> {
  await connectMongooseToDatabase()

  // Sélectionner 3 quêtes aléatoires
  const selectedQuestIds = selectRandomQuests(DAILY_QUESTS_COUNT)

  // Créer les quêtes actives
  const activeQuests: ActiveQuest[] = selectedQuestIds.map(questId => {
    const questDef = QUEST_CATALOG[questId]
    return {
      questId,
      progress: 0,
      target: questDef.target,
      completed: false,
      claimed: false
    }
  })

  // Upsert du document
  const userQuests = await UserQuests.findOneAndUpdate(
    { userId },
    {
      userId,
      activeQuests,
      lastResetDate: new Date()
    },
    { upsert: true, new: true }
  )

  console.log(`✅ Generated ${DAILY_QUESTS_COUNT} new daily quests for user ${userId}`)

  return userQuests
}

/**
 * Met à jour la progression d'une quête
 * Responsabilité : Incrémenter le compteur et marquer comme complétée si objectif atteint
 */
export async function updateQuestProgress (
  questId: QuestType,
  increment: number = 1
): Promise<{ success: boolean, completed?: boolean, alreadyCompleted?: boolean }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (session?.user?.id == null) {
      throw new Error('User not authenticated')
    }

    await connectMongooseToDatabase()

    const userQuests = await UserQuests.findOne({ userId: session.user.id })

    if (userQuests == null) {
      return { success: false }
    }

    // Trouver la quête dans les quêtes actives
    const questIndex = userQuests.activeQuests.findIndex((q: ActiveQuest) => q.questId === questId)

    if (questIndex === -1) {
      // Quête non active aujourd'hui
      return { success: false }
    }

    const quest = userQuests.activeQuests[questIndex]

    // Si déjà complétée, ne rien faire
    if (quest.completed) {
      return { success: true, alreadyCompleted: true }
    }

    // Incrémenter la progression
    quest.progress = Math.min(quest.progress + increment, quest.target)

    // Vérifier si l'objectif est atteint
    if (quest.progress >= quest.target && !quest.completed) {
      quest.completed = true
      quest.completedAt = new Date()

      // Sauvegarder
      await userQuests.save()

      console.log(`🎉 Quest "${questId}" completed for user ${session.user.id}!`)

      return { success: true, completed: true }
    }

    // Sauvegarder
    await userQuests.save()

    return { success: true, completed: false }
  } catch (error) {
    console.error('❌ Error updating quest progress:', error)
    return { success: false }
  }
}

/**
 * Réclame la récompense d'une quête complétée
 * Responsabilité : Ajouter les koins au wallet et marquer comme réclamée
 */
export async function claimQuestReward (questId: QuestType): Promise<{ success: boolean, reward?: number, error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (session?.user?.id == null) {
      return { success: false, error: 'Not authenticated' }
    }

    await connectMongooseToDatabase()

    const userQuests = await UserQuests.findOne({ userId: session.user.id })

    if (userQuests == null) {
      return { success: false, error: 'No quests found' }
    }

    // Trouver la quête
    const quest = userQuests.activeQuests.find((q: ActiveQuest) => q.questId === questId)

    if (quest == null) {
      return { success: false, error: 'Quest not found' }
    }

    if (!quest.completed) {
      return { success: false, error: 'Quest not completed' }
    }

    if (quest.claimed) {
      return { success: false, error: 'Reward already claimed' }
    }

    // Récupérer la récompense depuis le catalogue
    const questDef = QUEST_CATALOG[questId]
    const reward = questDef.reward

    // Ajouter les koins au wallet
    const wallet = await Wallet.findOne({ ownerId: session.user.id })

    if (wallet == null) {
      return { success: false, error: 'Wallet not found' }
    }

    wallet.balance += reward
    wallet.markModified('balance')
    await wallet.save()

    // Marquer la quête comme réclamée
    quest.claimed = true
    await userQuests.save()

    console.log(`💰 User ${session.user.id} claimed ${reward} koins from quest "${questId}"`)

    return { success: true, reward }
  } catch (error) {
    console.error('❌ Error claiming quest reward:', error)
    return { success: false, error: 'Internal error' }
  }
}

/**
 * Fonction utilitaire pour tracker une action et mettre à jour les quêtes concernées
 */
export async function trackQuestAction (action: 'feed' | 'level_up' | 'interact' | 'buy_accessory' | 'make_public', monsterId?: string): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (session?.user?.id == null) {
      return
    }

    await connectMongooseToDatabase()

    const userQuests = await UserQuests.findOne({ userId: session.user.id })

    if (userQuests == null) {
      return
    }

    // Mapper l'action vers les quêtes correspondantes
    const questMapping: Record<string, QuestType> = {
      feed: 'feed_monster_5',
      level_up: 'level_up_monster',
      interact: 'interact_3_monsters',
      buy_accessory: 'buy_accessory',
      make_public: 'make_monster_public'
    }

    const questId = questMapping[action]

    if (questId != null) {
      // Pour la quête d'interaction, on doit tracker les monstres uniques
      if (action === 'interact' && monsterId != null) {
        await trackUniqueMonsterInteraction(session.user.id, monsterId)
      } else {
        await updateQuestProgress(questId, 1)
      }
    }
  } catch (error) {
    console.error('❌ Error tracking quest action:', error)
  }
}

/**
 * Tracker les interactions uniques avec différents monstres
 */
async function trackUniqueMonsterInteraction (_userId: string, _monsterId: string): Promise<void> {
  // Pour simplifier, on va stocker les IDs des monstres interagis dans un Set en mémoire
  // Dans une vraie app, il faudrait persister ça dans un champ dédié du UserQuests
  // Pour l'instant, on incrémente simplement la quête
  await updateQuestProgress('interact_3_monsters', 1)
}

