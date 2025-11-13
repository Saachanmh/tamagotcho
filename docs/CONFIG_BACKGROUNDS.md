# Configuration des Arrière-plans - src/config/backgrounds.config.ts

## 📋 Objectif
Centraliser le catalogue des arrière-plans achetables pour personnaliser l'environnement du monstre.

## 🎯 Fichier à créer
`src/config/backgrounds.config.ts`

## 📝 Contenu suggéré

```typescript
/**
 * Configuration du catalogue d'arrière-plans
 * Principe SRP: Responsabilité unique de définition des backgrounds
 * Principe OCP: Facile à étendre avec de nouveaux arrière-plans
 */

import type { BackgroundItem } from '@/services/shop'

/**
 * Catalogue complet des arrière-plans disponibles
 */
export const BACKGROUNDS_CATALOG: BackgroundItem[] = [
  {
    id: 'bg-forest',
    type: 'background',
    name: 'Forêt Enchantée',
    price: 250,
    category: 'background',
    imageUrl: '/assets/Screenshot 2025-11-12 at 13-58-19 A whimsical forest scene with glowing lights and fantastical creatures Premium Photo.png',
    description: 'Une forêt magique avec des lumières scintillantes'
  },
  {
    id: 'bg-watercolor',
    type: 'background',
    name: 'Aquarelle Kawaii',
    price: 200,
    category: 'background',
    imageUrl: '/assets/pngtree-cartoon-cute-watercolor-background-image_2141603.jpg',
    description: 'Fond aquarelle coloré et mignon'
  },
  {
    id: 'bg-abstract',
    type: 'background',
    name: 'Abstrait Coloré',
    price: 220,
    category: 'background',
    imageUrl: '/assets/ba16333ff50edfda47a243bba6e1fe0b.jpg',
    description: 'Design abstrait vibrant et moderne'
  },
  {
    id: 'bg-pastel',
    type: 'background',
    name: 'Pastel Doux',
    price: 210,
    category: 'background',
    imageUrl: '/assets/istockphoto-1840438197-612x612.jpg',
    description: 'Fond pastel doux et apaisant'
  }
]

/**
 * Configuration des prix pour les arrière-plans
 */
export const BACKGROUND_PRICE_RANGE = {
  min: 200,
  max: 250
} as const

/**
 * Types de thèmes d'arrière-plans
 */
export const BACKGROUND_THEMES = [
  'nature',
  'abstract',
  'artistic',
  'minimal'
] as const

export type BackgroundTheme = typeof BACKGROUND_THEMES[number]

/**
 * Clés de stockage pour les arrière-plans
 * Centralisé pour éviter les valeurs magiques dans le code
 */
export const BACKGROUND_STORAGE_KEYS = {
  equipped: 'tamagotcho:background',
  owned: 'tamagotcho:owned-backgrounds'
} as const
```

## 💡 Utilisation

### Afficher le catalogue de backgrounds
```typescript
import { BACKGROUNDS_CATALOG } from '@/config/backgrounds.config'

function BackgroundShop() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {BACKGROUNDS_CATALOG.map(bg => (
        <div key={bg.id} className="card">
          <img src={bg.imageUrl} alt={bg.name} />
          <h3>{bg.name}</h3>
          <p>{bg.description}</p>
          <p>{bg.price} Koins</p>
          <button>Acheter</button>
        </div>
      ))}
    </div>
  )
}
```

### Utiliser les clés de stockage
```typescript
import { BACKGROUND_STORAGE_KEYS } from '@/config/backgrounds.config'

function saveEquippedBackground(background: BackgroundItem) {
  localStorage.setItem(
    BACKGROUND_STORAGE_KEYS.equipped, 
    JSON.stringify(background)
  )
}

function loadEquippedBackground(): BackgroundItem | null {
  const data = localStorage.getItem(BACKGROUND_STORAGE_KEYS.equipped)
  return data ? JSON.parse(data) : null
}
```

## 📊 Inventaire actuel

- **Forêt Enchantée** : 250 Koins
- **Aquarelle Kawaii** : 200 Koins
- **Abstrait Coloré** : 220 Koins
- **Pastel Doux** : 210 Koins

**TOTAL** : 4 arrière-plans

## ✅ Avantages

- Images stockées dans `/public/assets/`
- Prix cohérents (200-250 Koins)
- Descriptions explicites
- Clés de stockage centralisées

## 🔗 Intégration

Export depuis `src/config/index.ts` :
```typescript
export * from './backgrounds.config'
```

