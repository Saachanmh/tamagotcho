# Configuration des Quêtes - src/config/quests.config.ts

## 📋 Objectif
Mettre en place un système de quêtes journalières et hebdomadaires pour encourager l'engagement des joueurs.

## 🎯 Fichier à créer
`src/config/quests.config.ts`

## 📝 Contenu suggéré

```typescript
/**
 * Configuration des quêtes journalières et hebdomadaires
 * Principe SRP: Responsabilité unique de définition des quêtes
 * Principe OCP: Facile à étendre avec de nouvelles quêtes
 */

export type QuestType = 'feed' | 'cuddle' | 'play' | 'clean' | 'shop' | 'login'

export interface Quest {
  id: string
  type: QuestType
  title: string
  description: string
  target: number // Nombre de fois à accomplir l'action
  reward: {
    koins?: number
    xp?: number
  }
  emoji: string
  difficulty: 'easy' | 'medium' | 'hard'
}

/**
 * Quêtes quotidiennes disponibles
 */
export const DAILY_QUESTS: Quest[] = [
  {
    id: 'quest-feed-3',
    type: 'feed',
    title: 'Repas Quotidien',
    description: 'Nourrir votre monstre 3 fois',
    target: 3,
    reward: { koins: 10, xp: 50 },
    emoji: '🍖',
    difficulty: 'easy'
  },
  {
    id: 'quest-cuddle-5',
    type: 'cuddle',
    title: 'Câlins Affectueux',
    description: 'Faire 5 câlins à votre monstre',
    target: 5,
    reward: { koins: 15, xp: 75 },
    emoji: '💕',
    difficulty: 'easy'
  },
  {
    id: 'quest-play-5',
    type: 'play',
    title: 'Temps de Jeu',
    description: 'Jouer 5 fois avec votre monstre',
    target: 5,
    reward: { koins: 20, xp: 100 },
    emoji: '🎮',
    difficulty: 'medium'
  },
  {
    id: 'quest-clean-3',
    type: 'clean',
    title: 'Hygiène Parfaite',
    description: 'Nettoyer votre monstre 3 fois',
    target: 3,
    reward: { koins: 12, xp: 60 },
    emoji: '🧼',
    difficulty: 'easy'
  },
  {
    id: 'quest-shop-1',
    type: 'shop',
    title: 'Petit Shopping',
    description: 'Acheter 1 article dans la boutique',
    target: 1,
    reward: { koins: 25, xp: 150 },
    emoji: '🛍️',
    difficulty: 'medium'
  },
  {
    id: 'quest-login-daily',
    type: 'login',
    title: 'Connexion Quotidienne',
    description: 'Se connecter au jeu',
    target: 1,
    reward: { koins: 5, xp: 25 },
    emoji: '🌟',
    difficulty: 'easy'
  }
]

/**
 * Quêtes hebdomadaires (objectifs plus difficiles)
 */
export const WEEKLY_QUESTS: Quest[] = [
  {
    id: 'quest-feed-20',
    type: 'feed',
    title: 'Gourmet de la Semaine',
    description: 'Nourrir votre monstre 20 fois cette semaine',
    target: 20,
    reward: { koins: 100, xp: 500 },
    emoji: '🍽️',
    difficulty: 'hard'
  },
  {
    id: 'quest-play-15',
    type: 'play',
    title: 'Joueur Assidu',
    description: 'Jouer 15 fois cette semaine',
    target: 15,
    reward: { koins: 120, xp: 600 },
    emoji: '🎯',
    difficulty: 'hard'
  },
  {
    id: 'quest-shop-5',
    type: 'shop',
    title: 'Fashionista',
    description: 'Acheter 5 articles dans la boutique',
    target: 5,
    reward: { koins: 200, xp: 1000 },
    emoji: '👔',
    difficulty: 'hard'
  }
]

/**
 * Configuration des récompenses de quêtes
 */
export const QUEST_REWARD_MULTIPLIERS = {
  easy: 1,
  medium: 1.5,
  hard: 2
} as const

/**
 * Durée de validité des quêtes (en millisecondes)
 */
export const QUEST_DURATION = {
  daily: 24 * 60 * 60 * 1000, // 24 heures
  weekly: 7 * 24 * 60 * 60 * 1000 // 7 jours
} as const

/**
 * Nombre maximum de quêtes actives simultanément
 */
export const MAX_ACTIVE_QUESTS = {
  daily: 3,
  weekly: 1
} as const

/**
 * Clés de stockage pour les quêtes
 */
export const QUEST_STORAGE_KEYS = {
  active: 'tamagotcho:active-quests',
  completed: 'tamagotcho:completed-quests',
  lastReset: 'tamagotcho:quests-last-reset'
} as const

/**
 * Messages de notification pour les quêtes
 */
export const QUEST_MESSAGES = {
  completed: '✅ Quête complétée !',
  newDaily: '📋 Nouvelles quêtes quotidiennes disponibles !',
  newWeekly: '📅 Nouvelle quête hebdomadaire disponible !',
  rewardClaimed: '🎁 Récompense réclamée !'
} as const
```

## 💡 Utilisation

### Afficher les quêtes actives
```typescript
import { DAILY_QUESTS } from '@/config/quests.config'

function QuestsPanel() {
  return (
    <div>
      <h2>Quêtes du Jour</h2>
      {DAILY_QUESTS.slice(0, 3).map(quest => (
        <div key={quest.id} className="quest-card">
          <span className="text-2xl">{quest.emoji}</span>
          <h3>{quest.title}</h3>
          <p>{quest.description}</p>
          <div className="rewards">
            {quest.reward.koins && <span>💰 {quest.reward.koins} Koins</span>}
            {quest.reward.xp && <span>⭐ {quest.reward.xp} XP</span>}
          </div>
          <progress value={progress} max={quest.target} />
        </div>
      ))}
    </div>
  )
}
```

### Vérifier la progression
```typescript
import { DAILY_QUESTS, QUEST_MESSAGES } from '@/config/quests.config'

function checkQuestProgress(questId: string, currentProgress: number) {
  const quest = DAILY_QUESTS.find(q => q.id === questId)
  
  if (!quest) return
  
  if (currentProgress >= quest.target) {
    toast.success(QUEST_MESSAGES.completed)
    giveReward(quest.reward)
  }
}
```

## 📊 Système de quêtes

### Quêtes quotidiennes (6)
- **Repas Quotidien** : Nourrir 3x (10 Koins + 50 XP)
- **Câlins Affectueux** : Câliner 5x (15 Koins + 75 XP)
- **Temps de Jeu** : Jouer 5x (20 Koins + 100 XP)
- **Hygiène Parfaite** : Nettoyer 3x (12 Koins + 60 XP)
- **Petit Shopping** : Acheter 1 article (25 Koins + 150 XP)
- **Connexion Quotidienne** : Se connecter (5 Koins + 25 XP)

### Quêtes hebdomadaires (3)
- **Gourmet de la Semaine** : Nourrir 20x (100 Koins + 500 XP)
- **Joueur Assidu** : Jouer 15x (120 Koins + 600 XP)
- **Fashionista** : Acheter 5 articles (200 Koins + 1000 XP)

## ✅ Bénéfices

- Encourage l'engagement quotidien
- Diversifie les sources de Koins
- Système de progression clair
- Récompenses équilibrées

## 🔗 Intégration

Export depuis `src/config/index.ts` :
```typescript
export * from './quests.config'
```

