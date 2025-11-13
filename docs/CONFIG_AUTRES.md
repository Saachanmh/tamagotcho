# Autres Configurations à créer

## 📋 Fichiers de configuration supplémentaires recommandés

### 1. src/config/app.config.ts
**Configuration générale de l'application**

```typescript
/**
 * Configuration générale de l'application
 */
export const APP_CONFIG = {
  name: 'Tamagotcho',
  version: '1.0.0',
  description: 'Tamagotchi-style application',
  author: 'My Digital School'
} as const

/**
 * Routes de l'application
 */
export const ROUTES = {
  home: '/',
  dashboard: '/app',
  signIn: '/sign-in',
  signUp: '/sign-up',
  wallet: '/app/wallet',
  shop: '/app/shop',
  profile: '/app/profile'
} as const

/**
 * Délais et durées (en millisecondes)
 */
export const TIMING = {
  toastDuration: 3000,        // 3 secondes
  animationDuration: 300,     // 0.3 seconde
  autoSaveInterval: 60000,    // 1 minute
  sessionTimeout: 1800000,    // 30 minutes
  cooldownDuration: 5000      // 5 secondes entre actions
} as const

/**
 * Limites et seuils
 */
export const LIMITS = {
  maxCreatures: 10,
  maxInventorySize: 100,
  maxNameLength: 20,
  minNameLength: 3,
  maxDescriptionLength: 200
} as const

/**
 * Messages d'erreur génériques
 */
export const ERROR_MESSAGES = {
  generic: 'Une erreur est survenue',
  network: 'Erreur de connexion au réseau',
  unauthorized: 'Vous devez être connecté',
  forbidden: 'Accès refusé',
  notFound: 'Ressource non trouvée',
  validation: 'Données invalides',
  insufficientFunds: 'Pas assez de Koins'
} as const

/**
 * Messages de succès génériques
 */
export const SUCCESS_MESSAGES = {
  saved: 'Sauvegardé avec succès',
  created: 'Créé avec succès',
  updated: 'Mis à jour avec succès',
  deleted: 'Supprimé avec succès',
  purchased: 'Achat effectué avec succès'
} as const
```

---

### 2. src/config/storage.config.ts
**Clés de stockage local centralisées**

```typescript
/**
 * Clés de stockage pour les accessoires et la boutique
 */
export const SHOP_STORAGE_KEYS = {
  equipped: 'tamagotcho:equipped',
  owned: 'tamagotcho:owned'
} as const

/**
 * Clés de stockage pour les monstres/créatures
 */
export const CREATURE_STORAGE_KEYS = {
  list: 'tamagotcho:creatures',
  active: 'tamagotcho:active-creature',
  stats: 'tamagotcho:creature-stats',
  lastInteraction: 'tamagotcho:last-interaction'
} as const

/**
 * Clés de stockage pour le wallet
 */
export const WALLET_STORAGE_KEYS = {
  balance: 'tamagotcho:wallet-balance',
  transactions: 'tamagotcho:wallet-transactions',
  lastUpdate: 'tamagotcho:wallet-last-update'
} as const

/**
 * Clés de stockage pour l'authentification
 */
export const AUTH_STORAGE_KEYS = {
  token: 'tamagotcho:auth-token',
  user: 'tamagotcho:user',
  sessionId: 'tamagotcho:session-id'
} as const
```

---

### 3. src/config/animations.config.ts
**Configuration des animations et transitions**

```typescript
/**
 * Durées d'animation (en millisecondes)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500
} as const

/**
 * Classes d'animation Tailwind
 */
export const ANIMATIONS = {
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideIn: 'animate-slideIn',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  scaleUp: 'active:scale-95'
} as const

/**
 * Transitions
 */
export const TRANSITIONS = {
  default: 'transition-all duration-300',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-500'
} as const
```

---

### 4. src/config/ui.config.ts
**Configuration de l'interface utilisateur**

```typescript
/**
 * Breakpoints responsive (pixels)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

/**
 * Tailles de composants
 */
export const SIZES = {
  button: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  },
  input: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  }
} as const

/**
 * Espacements
 */
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
} as const

/**
 * Border radius
 */
export const RADIUS = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px'
} as const
```

---

### 5. src/config/xp.config.ts
**Configuration du système d'expérience**

```typescript
/**
 * Points d'XP par action
 */
export const XP_PER_ACTION = {
  feed: 20,
  cuddle: 15,
  play: 25,
  clean: 10
} as const

/**
 * Seuils de niveau
 */
export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  10: 5000,
  20: 20000,
  50: 100000
} as const

/**
 * Calcul du seuil pour un niveau donné
 */
export function thresholdForLevel(level: number): number {
  return Math.max(1, level) * 100
}

/**
 * Récompenses par niveau
 */
export const LEVEL_UP_REWARDS = {
  koins: 50,        // Koins gagnés à chaque niveau
  multiplier: 1.2   // Multiplicateur de récompense par niveau
} as const
```

---

### 6. src/config/validation.config.ts
**Règles de validation centralisées**

```typescript
/**
 * Expressions régulières de validation
 */
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  creatureName: /^[a-zA-Z0-9 éèêëàâäôöûüïî'-]{3,20}$/i
} as const

/**
 * Messages d'erreur de validation
 */
export const VALIDATION_MESSAGES = {
  email: 'Adresse email invalide',
  username: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères',
  password: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  creatureName: 'Le nom de la créature doit contenir entre 3 et 20 caractères',
  required: 'Ce champ est requis',
  minLength: 'Longueur minimale : {min} caractères',
  maxLength: 'Longueur maximale : {max} caractères'
} as const
```

---

## 📝 Fichier d'index centralisé

### src/config/index.ts
**Point d'entrée unique pour toutes les configurations**

```typescript
/**
 * Barrel export pour tous les fichiers de configuration
 * Permet d'importer depuis un seul endroit
 */

// Configuration générale
export * from './app.config'
export * from './storage.config'
export * from './ui.config'
export * from './animations.config'
export * from './validation.config'

// Configuration métier
export * from './monster.constants'
export * from './xp.config'
export * from './rewards'
export * from './quests.config'

// Configuration boutique
export * from './shop.config'
export * from './accessories.config'
export * from './backgrounds.config'

// Configuration paiement
export * from './pricing'
export * from './wallet.constants'
export * from './wallet-packages'
```

---

## ✅ Checklist de migration

- [ ] Créer tous les fichiers de configuration
- [ ] Remplacer les valeurs magiques dans le code
- [ ] Mettre à jour les imports
- [ ] Tester que tout fonctionne
- [ ] Documenter les changements
- [ ] Vérifier avec TypeScript (pas d'erreurs)

## 🎯 Exemple d'utilisation globale

```typescript
import {
  REWARD_AMOUNTS,
  ACCESSORIES_CATALOG,
  DAILY_QUESTS,
  ERROR_MESSAGES,
  ROUTES,
  TIMING
} from '@/config'

// Plus besoin de chercher dans plusieurs fichiers !
```

## 📚 Documentation associée

Consultez aussi :
- `CONFIG_REWARDS.md` - Système de récompenses
- `CONFIG_ACCESSORIES.md` - Catalogue d'accessoires
- `CONFIG_BACKGROUNDS.md` - Arrière-plans
- `CONFIG_QUESTS.md` - Quêtes journalières

