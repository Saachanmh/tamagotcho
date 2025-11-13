# Configuration des Accessoires - src/config/accessories.config.ts

## 📋 Objectif
Centraliser le catalogue complet de tous les accessoires achetables dans la boutique.

## 🎯 Fichier à créer
`src/config/accessories.config.ts`

## 📝 Contenu suggéré

```typescript
/**
 * Configuration du catalogue d'accessoires
 * Principe SRP: Responsabilité unique de définition des accessoires
 * Principe OCP: Facile à étendre avec de nouveaux accessoires
 */

import type { ShopItem } from '@/services/shop'

/**
 * Chapeaux disponibles dans la boutique
 */
export const HATS_CATALOG: ShopItem[] = [
  {
    id: 'hat-red',
    type: 'hat',
    name: 'Chapeau Rouge',
    price: 150,
    color: '#e53e3e',
    category: 'hat',
    description: 'Un élégant chapeau rouge'
  },
  {
    id: 'hat-blue',
    type: 'hat',
    name: 'Chapeau Bleu',
    price: 180,
    color: '#3182ce',
    category: 'hat',
    description: 'Chapeau bleu océan'
  },
  {
    id: 'hat-purple',
    type: 'hat',
    name: 'Chapeau Violet',
    price: 200,
    color: '#805ad5',
    category: 'hat',
    description: 'Chapeau violet royal'
  }
]

/**
 * Lunettes disponibles dans la boutique
 */
export const GLASSES_CATALOG: ShopItem[] = [
  {
    id: 'glasses-black',
    type: 'glasses',
    name: 'Lunettes Noires',
    price: 100,
    color: '#2d3748',
    category: 'glasses',
    description: 'Lunettes de soleil stylées'
  },
  {
    id: 'glasses-gold',
    type: 'glasses',
    name: 'Lunettes Dorées',
    price: 250,
    color: '#d69e2e',
    category: 'glasses',
    description: 'Lunettes dorées de luxe'
  },
  {
    id: 'glasses-pink',
    type: 'glasses',
    name: 'Lunettes Roses',
    price: 120,
    color: '#ed64a6',
    category: 'glasses',
    description: 'Lunettes roses tendance'
  }
]

/**
 * Chaussures classiques
 */
export const SHOES_CATALOG: ShopItem[] = [
  {
    id: 'shoes-red',
    type: 'shoes',
    name: 'Chaussures Rouges',
    price: 80,
    color: '#e53e3e',
    category: 'footwear',
    description: 'Chaussures classiques rouges'
  },
  {
    id: 'shoes-green',
    type: 'shoes',
    name: 'Chaussures Vertes',
    price: 85,
    color: '#38a169',
    category: 'footwear',
    description: 'Chaussures vertes écologiques'
  }
]

/**
 * Baskets sportives (sneakers)
 */
export const SNEAKERS_CATALOG: ShopItem[] = [
  {
    id: 'sneakers-white',
    type: 'sneakers',
    name: 'Baskets Blanches',
    price: 95,
    color: '#ffffff',
    category: 'footwear',
    description: 'Baskets de sport blanches'
  },
  {
    id: 'sneakers-blue',
    type: 'sneakers',
    name: 'Baskets Bleues',
    price: 105,
    color: '#3182ce',
    category: 'footwear',
    description: 'Baskets sportives bleues'
  }
]

/**
 * Bottes
 */
export const BOOTS_CATALOG: ShopItem[] = [
  {
    id: 'boots-brown',
    type: 'boots',
    name: 'Bottes Marron',
    price: 150,
    color: '#8b4513',
    category: 'footwear',
    description: 'Bottes robustes marron'
  },
  {
    id: 'boots-black',
    type: 'boots',
    name: 'Bottes Noires',
    price: 160,
    color: '#2d3748',
    category: 'footwear',
    description: 'Bottes noires élégantes'
  }
]

/**
 * Pantoufles (slippers)
 */
export const SLIPPERS_CATALOG: ShopItem[] = [
  {
    id: 'slippers-pink',
    type: 'slippers',
    name: 'Pantoufles Roses',
    price: 60,
    color: '#ed64a6',
    category: 'footwear',
    description: 'Pantoufles confortables roses'
  },
  {
    id: 'slippers-gray',
    type: 'slippers',
    name: 'Pantoufles Grises',
    price: 65,
    color: '#718096',
    category: 'footwear',
    description: 'Pantoufles douillettes grises'
  }
]

/**
 * Catalogue complet de tous les accessoires
 */
export const ACCESSORIES_CATALOG: ShopItem[] = [
  ...HATS_CATALOG,
  ...GLASSES_CATALOG,
  ...SHOES_CATALOG,
  ...SNEAKERS_CATALOG,
  ...BOOTS_CATALOG,
  ...SLIPPERS_CATALOG
]

/**
 * Configuration des prix par catégorie
 */
export const ACCESSORY_PRICE_RANGES = {
  hat: { min: 150, max: 200 },
  glasses: { min: 100, max: 250 },
  shoes: { min: 80, max: 110 },
  sneakers: { min: 95, max: 105 },
  boots: { min: 150, max: 160 },
  slippers: { min: 60, max: 65 }
} as const
```

## 💡 Utilisation

### Afficher tous les accessoires
```typescript
import { ACCESSORIES_CATALOG } from '@/config/accessories.config'

function ShopComponent() {
  return (
    <div>
      {ACCESSORIES_CATALOG.map(item => (
        <ShopItem key={item.id} {...item} />
      ))}
    </div>
  )
}
```

### Afficher uniquement les chapeaux
```typescript
import { HATS_CATALOG } from '@/config/accessories.config'

function HatsSection() {
  return (
    <div>
      <h2>Chapeaux</h2>
      {HATS_CATALOG.map(hat => <ShopItem key={hat.id} {...hat} />)}
    </div>
  )
}
```

## 📊 Inventaire actuel

- **Chapeaux** : 3 modèles
- **Lunettes** : 3 modèles
- **Chaussures classiques** : 2 modèles
- **Baskets** : 2 modèles
- **Bottes** : 2 modèles
- **Pantoufles** : 2 modèles
- **TOTAL** : 14 accessoires

## ✅ Avantages

- Ajout facile de nouveaux accessoires
- Prix configurables par catégorie
- Catalogues séparés pour un filtrage facile
- Type-safe avec TypeScript

## 🔗 Intégration

Export depuis `src/config/index.ts` :
```typescript
export * from './accessories.config'
```

