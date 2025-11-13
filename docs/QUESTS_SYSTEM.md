# 🎯 Système de Quêtes Journalières - Documentation Complète

## 📋 Vue d'ensemble

Le système de quêtes journalières permet aux utilisateurs de compléter des objectifs quotidiens pour gagner des koins. 3 quêtes sont assignées aléatoirement chaque jour à minuit (heure serveur UTC).

## ✨ Fonctionnalités

### Quêtes disponibles

| Quête | Description | Objectif | Récompense | Icône |
|-------|-------------|----------|------------|-------|
| **Chef cuisinier** | Nourris 5 fois ton monstre aujourd'hui | 5 actions | 20 koins | 🍕 |
| **Évolution** | Fais évoluer un monstre d'un niveau | 1 level up | 50 koins | ⭐ |
| **Socialisation** | Interagis avec 3 monstres différents | 3 interactions | 30 koins | 💖 |
| **Shopping** | Achète un accessoire dans la boutique | 1 achat | 40 koins | 🛍️ |
| **Partage** | Rends un monstre public | 1 toggle | 15 koins | 🌐 |

### Caractéristiques

- ✅ **3 quêtes par jour** sélectionnées aléatoirement
- ✅ **Renouvellement automatique** à minuit UTC
- ✅ **Suivi en temps réel** de la progression
- ✅ **Récompenses en koins** à réclamer manuellement
- ✅ **Timer de reset** visible dans la modal
- ✅ **Tracking automatique** des actions

## 🏗️ Architecture

### Fichiers créés

```
src/
├── config/
│   └── quests.config.ts              # Configuration centralisée
├── db/
│   └── models/
│       └── userquests.model.ts       # Modèle MongoDB
├── actions/
│   └── quests.actions.ts             # Server actions
└── components/
    └── quests/
        ├── quests-modal.tsx          # Modal de suivi
        └── quests-button.tsx         # Bouton d'ouverture
```

### Fichiers modifiés

```
src/
├── actions/
│   ├── monsters.actions.ts           # Tracking feed/interact/level_up/make_public
│   └── shop.actions.ts               # Tracking buy_accessory
└── components/
    └── navigation/
        ├── app-header.tsx            # Bouton Quêtes (desktop)
        └── bottom-nav.tsx            # Bouton Quêtes (mobile)
```

## 📊 Schéma de base de données

### Collection `userquests`

```typescript
{
  _id: ObjectId,
  userId: string,              // ID de l'utilisateur
  activeQuests: [              // 3 quêtes actives
    {
      questId: string,         // 'feed_monster_5', 'level_up_monster', etc.
      progress: number,        // Progression actuelle (0-target)
      target: number,          // Objectif à atteindre
      completed: boolean,      // Quête complétée ?
      claimed: boolean,        // Récompense réclamée ?
      completedAt: Date        // Date de complétion
    }
  ],
  lastResetDate: Date,         // Date de dernière génération
  createdAt: Date,
  updatedAt: Date
}
```

### Index

- `userId` (unique)
- `lastResetDate` (pour le cron de reset)

## 🔧 Configuration (`quests.config.ts`)

### Types de quêtes

```typescript
export type QuestType =
  | 'feed_monster_5'
  | 'level_up_monster'
  | 'interact_3_monsters'
  | 'buy_accessory'
  | 'make_monster_public'
```

### Définition d'une quête

```typescript
interface QuestDefinition {
  id: QuestType
  title: string
  description: string
  icon: string
  reward: number
  target: number
  category: 'interaction' | 'progression' | 'social' | 'shop'
  color: { from: string, to: string }
}
```

### Catalogue complet

```typescript
export const QUEST_CATALOG: Record<QuestType, QuestDefinition>
```

### Fonctions utilitaires

- `selectRandomQuests(count)` - Sélectionne N quêtes aléatoires
- `isToday(date)` - Vérifie si une date est aujourd'hui
- `getNextResetDate()` - Calcule la prochaine heure de reset
- `getQuestDefinition(id)` - Récupère une définition

## 🎮 Server Actions (`quests.actions.ts`)

### `getUserQuests()`

Récupère les quêtes actives de l'utilisateur. Génère de nouvelles quêtes si nécessaire.

```typescript
const { activeQuests, lastResetDate } = await getUserQuests()
```

**Responsabilité** :
- Vérifier l'authentification
- Récupérer les quêtes existantes
- Générer de nouvelles quêtes si minuit est passé
- Retourner les données formatées

### `updateQuestProgress(questId, increment)`

Met à jour la progression d'une quête.

```typescript
const result = await updateQuestProgress('feed_monster_5', 1)
// { success: true, completed: true }
```

**Responsabilité** :
- Incrémenter le compteur de progression
- Marquer comme complétée si objectif atteint
- Ne rien faire si déjà complétée

### `claimQuestReward(questId)`

Réclame la récompense d'une quête complétée.

```typescript
const result = await claimQuestReward('feed_monster_5')
// { success: true, reward: 20 }
```

**Responsabilité** :
- Vérifier que la quête est complétée
- Vérifier qu'elle n'est pas déjà réclamée
- Ajouter les koins au wallet
- Marquer comme réclamée

### `trackQuestAction(action, monsterId?)`

Fonction utilitaire pour tracker automatiquement les actions.

```typescript
await trackQuestAction('feed', monsterId)
await trackQuestAction('level_up', monsterId)
await trackQuestAction('interact', monsterId)
await trackQuestAction('buy_accessory', monsterId)
await trackQuestAction('make_public', monsterId)
```

**Mapping des actions** :
- `feed` → `feed_monster_5`
- `level_up` → `level_up_monster`
- `interact` → `interact_3_monsters`
- `buy_accessory` → `buy_accessory`
- `make_public` → `make_monster_public`

## 🎨 Composant Modal (`quests-modal.tsx`)

### Props

```typescript
interface QuestsModalProps {
  open: boolean
  onClose: () => void
  onKoinsUpdated?: () => void
}
```

### Fonctionnalités

- ✅ Affichage des 3 quêtes actives
- ✅ Barre de progression pour chaque quête
- ✅ Bouton "Réclamer" pour les quêtes complétées
- ✅ Timer de reset en temps réel
- ✅ Stats (complétées/réclamées)
- ✅ Design cohérent avec le reste de l'app

### Design

- Header violet/rose avec texture étoiles
- Timer orange en haut
- Cartes de quêtes avec gradient selon la catégorie
- Bouton vert pour réclamer
- Footer avec statistiques

## 🔗 Intégration du tracking

### Dans `monsters.actions.ts`

#### Action "Nourrir" (feed)

```typescript
if (action === 'feed') {
  await trackQuestAction('feed', id)
}
```

#### Action "Interagir" (toutes les actions)

```typescript
await trackQuestAction('interact', id)
```

#### Level Up

```typescript
if (leveledUp) {
  await trackQuestAction('level_up', id)
}
```

#### Rendre public

```typescript
if (value === true) {
  await trackQuestAction('make_public', id)
}
```

### Dans `shop.actions.ts`

#### Achat d'accessoire

```typescript
const { trackQuestAction } = await import('./quests.actions')
await trackQuestAction('buy_accessory', creatureId)
```

## 🔘 Bouton Quêtes

### Desktop (app-header.tsx)

Bouton cyan/bleu entre le wallet et le bouton de déconnexion.

```tsx
<QuestsButton />
```

### Mobile (bottom-nav.tsx)

Icône 🎯 dans la grille de navigation (5 colonnes).

```tsx
{ href: '#quests', label: 'Quêtes', icon: '🎯', action: 'quests', color: 'from-cyan-400 to-blue-500' }
```

## 🕐 Renouvellement automatique

### Logique

Les quêtes sont renouvelées automatiquement lorsque l'utilisateur :
1. Ouvre la modal des quêtes
2. Effectue une action trackée

### Vérification

```typescript
if (userQuests == null || !isToday(userQuests.lastResetDate)) {
  userQuests = await generateNewDailyQuests(session.user.id)
}
```

### Heure de reset

**Minuit UTC** (`00:00:00 UTC`)

### Timer visible

Le composant affiche un compte à rebours jusqu'au prochain reset :
```
⏰ Nouvelles quêtes dans : 12h 34m 56s
```

## 📈 Flux de données

```
┌─────────────────────────────────────────────────────┐
│              Action utilisateur                      │
│  (feed, level_up, interact, buy, make_public)       │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  trackQuestAction()   │
        │  (dans action serveur)│
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ updateQuestProgress() │
        │  +1 sur la progression│
        └───────────┬───────────┘
                    │
                    ▼
           ┌────────────────┐
           │ Objectif atteint? │
           └────┬────────┬───┘
                │        │
            OUI │        │ NON
                │        │
                ▼        ▼
           ┌─────┐   ┌──────┐
           │✅   │   │ Fin  │
           │Comp-│   └──────┘
           │lété │
           └──┬──┘
              │
              ▼
    ┌──────────────────────┐
    │ Utilisateur ouvre    │
    │ la modal             │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Bouton "Réclamer"    │
    │ devient disponible   │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ claimQuestReward()   │
    │ +N koins au wallet   │
    └──────────────────────┘
```

## 🎯 Exemples d'utilisation

### Utilisateur ouvre la modal

```tsx
import { QuestsButton } from '@/components/quests/quests-button'

<QuestsButton />
```

### Tracking manuel d'une action

```typescript
import { trackQuestAction } from '@/actions/quests.actions'

// Après avoir nourri le monstre
await trackQuestAction('feed', monsterId)
```

### Récupérer les quêtes actives

```typescript
import { getUserQuests } from '@/actions/quests.actions'

const { activeQuests, lastResetDate } = await getUserQuests()
```

## 🧪 Tests à effectuer

### Test 1 : Génération de quêtes
1. Se connecter
2. Ouvrir la modal Quêtes
3. Vérifier que 3 quêtes sont affichées
4. Vérifier qu'elles sont toutes à 0/N

### Test 2 : Progression feed_monster_5
1. Aller sur une créature
2. Nourrir 5 fois le monstre (quand il a faim)
3. Ouvrir la modal Quêtes
4. Vérifier la progression (devrait être 5/5)
5. Bouton "Réclamer" devrait être visible

### Test 3 : Réclamer une récompense
1. Compléter une quête
2. Ouvrir la modal
3. Cliquer sur "Réclamer"
4. Vérifier que les koins sont ajoutés
5. Vérifier que le bouton devient "Récompense réclamée"

### Test 4 : Level Up
1. Faire monter un monstre de niveau
2. Ouvrir la modal
3. Vérifier que la quête "Évolution" est à 1/1

### Test 5 : Rendre public
1. Toggle un monstre en public
2. Ouvrir la modal
3. Vérifier que la quête "Partage" est à 1/1

### Test 6 : Achat accessoire
1. Acheter un accessoire dans la boutique
2. Ouvrir la modal
3. Vérifier que la quête "Shopping" est à 1/1

### Test 7 : Reset quotidien
1. Compléter des quêtes
2. Modifier manuellement `lastResetDate` dans MongoDB (date d'hier)
3. Ouvrir la modal
4. Vérifier que de nouvelles quêtes sont générées

## 🔒 Sécurité

- ✅ Authentification obligatoire (via Better Auth)
- ✅ Vérification de propriété des monstres
- ✅ Validation côté serveur (pas de triche possible)
- ✅ Transactions atomiques pour les koins
- ✅ Pas de double-réclamation possible

## 📊 Performance

### Optimisations
- Index sur `userId` pour requêtes rapides
- Génération lazy des quêtes (seulement quand nécessaire)
- Pas de polling (timer côté client uniquement)
- Requêtes MongoDB optimisées avec `.lean()`

### Recommandations futures
- [ ] Ajouter un cache Redis pour les quêtes actives
- [ ] Implémenter un vrai cron pour le reset (au lieu de lazy)
- [ ] Ajouter des analytics sur les quêtes complétées
- [ ] Système de streaks (jours consécutifs)

## 🎨 Design System

### Couleurs par catégorie

| Catégorie | Gradient | Exemple |
|-----------|----------|---------|
| Interaction | `orange-400 → red-500` | 🍕 Chef cuisinier |
| Progression | `yellow-400 → amber-600` | ⭐ Évolution |
| Social | `green-400 → emerald-600` | 🌐 Partage |
| Shop | `purple-400 → indigo-600` | 🛍️ Shopping |

### Animations

- `animate-bounce-slow` - Icône des quêtes complétées
- `animate-fade-in` - Ouverture de la modal
- `animate-slide-up` - Animation de la carte
- `animate-shine` - Effet de brillance sur les boutons

## 🚀 Prochaines évolutions possibles

### Court terme
- [ ] Badge de notification (nombre de quêtes complétées non réclamées)
- [ ] Son de validation à la complétion
- [ ] Confettis à la réclamation

### Moyen terme
- [ ] Quêtes hebdomadaires (plus difficiles, meilleures récompenses)
- [ ] Système de streaks avec bonus
- [ ] Historique des quêtes complétées

### Long terme
- [ ] Quêtes spéciales événementielles
- [ ] Achievements déblocables
- [ ] Classement entre joueurs
- [ ] Récompenses cosmétiques en plus des koins

---

**Date de création** : 2025-01-13  
**Version** : 1.0.0  
**Statut** : ✅ **IMPLÉMENTÉ ET FONCTIONNEL**

