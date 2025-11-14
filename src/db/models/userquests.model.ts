import mongoose from 'mongoose'
import type { QuestType } from '@/config/quests.config'

/**
 * Interface pour une quête active
 */
export interface ActiveQuest {
  /** Type de quête (référence au catalogue) */
  questId: QuestType
  /** Progression actuelle */
  progress: number
  /** Objectif à atteindre */
  target: number
  /** Quête complétée ? */
  completed: boolean
  /** Récompense réclamée ? */
  claimed: boolean
  /** Date de complétion */
  completedAt?: Date
}

/**
 * Interface pour le document UserQuests
 */
export interface IUserQuests {
  /** Identifiant de l'utilisateur */
  userId: string
  /** Liste des quêtes actives du jour */
  activeQuests: ActiveQuest[]
  /** Date de la dernière génération de quêtes */
  lastResetDate: Date
  /** Date de création du document */
  createdAt: Date
  /** Date de dernière mise à jour */
  updatedAt: Date
}

const activeQuestSchema = new mongoose.Schema<ActiveQuest>({
  questId: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    required: true,
    default: 0
  },
  target: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  claimed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    required: false
  }
}, { _id: false })

const userQuestsSchema = new mongoose.Schema<IUserQuests>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  activeQuests: {
    type: [activeQuestSchema],
    default: []
  },
  lastResetDate: {
    type: Date,
    required: true,
    default: () => new Date()
  }
}, {
  timestamps: true,
  collection: 'userquests'
})

// Index pour optimiser les requêtes
userQuestsSchema.index({ lastResetDate: 1 })

const UserQuests = mongoose.models.UserQuests ?? mongoose.model<IUserQuests>('UserQuests', userQuestsSchema)

export default UserQuests

