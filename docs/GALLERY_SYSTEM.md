# 🖼️ Galerie Communautaire - Documentation

## 📋 Vue d'ensemble

La galerie communautaire permet aux utilisateurs de partager leurs monstres publics et de découvrir les créations des autres membres de la communauté. Le design s'inspire d'une galerie d'art avec des cadres dorés et une présentation muséale.

## 🎨 Design & UX

### Thème visuel
- **Inspiration** : Galerie d'art / Musée
- **Cadres** : Dorés avec texture bois
- **Toiles** : Fond crème avec texture canvas
- **Plaques** : Style cartel de musée (fond sombre)
- **Lumière** : Effet de projecteur au hover

### Palette de couleurs
- **Header** : Dégradé de bois (amber-900 → orange-800 → rose-900)
- **Fond** : Dégradé subtil (amber-50 → orange-50 → rose-50)
- **Cadres** : Or (yellow-700 → amber-600 → yellow-800)
- **Plaques** : Pierre sombre (stone-800 → stone-900)

## 📂 Architecture des fichiers

```
src/
├── app/
│   └── app/
│       └── gallery/
│           └── page.tsx                    # Page serveur (auth check)
├── actions/
│   └── gallery.actions.ts                  # Server actions (fetch data)
├── components/
│   └── gallery/
│       ├── gallery-client.tsx              # Orchestrateur principal
│       ├── gallery-frame.tsx               # Cadre pour chaque monstre
│       ├── gallery-filters.tsx             # Filtres (niveau, état, tri)
│       └── gallery-pagination.tsx          # Pagination avec numéros
└── api/
    └── gallery/
        └── route.ts                        # API route (alternative non utilisée)
```

## 🔧 Fonctionnalités

### 1. **Affichage des monstres publics**
- Seuls les monstres avec `isPublic: true` sont affichés
- Grille responsive : 1-2-3-4 colonnes selon la taille d'écran
- Design de cadre doré avec effet de musée

### 2. **Filtres**
- **Par niveau** : Dropdown avec tous les niveaux disponibles
- **Par humeur** : Dropdown avec tous les états (happy, sad, angry, hungry, sleepy)
- **Par date** : Tri croissant (oldest) ou décroissant (newest)
- Bouton "Réinitialiser" si des filtres sont actifs

### 3. **Pagination**
- 12 monstres par page
- Affichage intelligent des numéros de page (max 7 boutons)
- Ellipsis (...) pour les grandes listes
- Boutons Précédent/Suivant
- Scroll automatique vers le haut lors du changement de page

### 4. **Anonymisation**
- Nom du créateur affiché par défaut
- Bouton 👁️/🕶️ pour basculer entre nom et "Artiste Anonyme"
- État local (ne persiste pas au reload)
- Badge "Ma création" pour ses propres monstres

### 5. **Informations affichées**
- Nom du monstre
- Niveau (badge doré en haut à droite)
- État/humeur (badge en haut à gauche)
- Nom du créateur (avec toggle anonymat)
- Date de création
- Rendu pixel art du monstre

## 🔌 API & Data Flow

### Server Actions (`gallery.actions.ts`)

#### `getPublicMonsters()`
```typescript
getPublicMonsters(
  page: number = 1,
  limit: number = 12,
  filters?: {
    level?: number
    state?: string
    sortBy?: 'newest' | 'oldest'
  }
): Promise<GalleryData>
```

**Responsabilité** :
- Requête MongoDB avec filtres et pagination
- Enrichissement avec les infos des propriétaires via better-auth
- Retour des données formatées

**Retour** :
```typescript
{
  monsters: PublicMonster[],
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
```

#### `getAvailableLevels()`
```typescript
getAvailableLevels(): Promise<number[]>
```

**Responsabilité** :
- Récupère la liste des niveaux distincts des monstres publics
- Pour peupler le dropdown de filtre niveau

### Type `PublicMonster`
```typescript
interface PublicMonster {
  _id: string
  name: string
  level: number
  state: string
  traits: string
  createdAt: Date
  ownerName: string
  ownerAnonymous: boolean
  ownerId: string
}
```

## 🎯 Composants

### `GalleryClient`
**Responsabilité** : Orchestration générale
- Gestion de l'état (filtres, pagination, données)
- Appels aux server actions
- Coordination des sous-composants

**État** :
```typescript
- data: GalleryData
- loading: boolean
- availableLevels: number[]
- selectedLevel: number | undefined
- selectedState: string
- sortBy: 'newest' | 'oldest'
- currentPage: number
```

### `GalleryFrame`
**Responsabilité** : Affichage d'un monstre en cadre
- Cadre doré avec texture
- Canvas avec texture toile
- Plaque de musée (cartel)
- Badges (niveau, état, "Ma création")
- Toggle anonymat

**Props** :
```typescript
{
  monster: PublicMonster
  currentUserId: string
}
```

### `GalleryFilters`
**Responsabilité** : Interface de filtrage
- 3 dropdowns (niveau, humeur, tri)
- Bouton de réinitialisation
- Callbacks vers le parent

**Props** :
```typescript
{
  availableLevels: number[]
  availableStates: readonly string[]
  selectedLevel: number | undefined
  selectedState: string
  sortBy: 'newest' | 'oldest'
  onLevelChange: (level: number | undefined) => void
  onStateChange: (state: string) => void
  onSortChange: (sort: 'newest' | 'oldest') => void
  onReset: () => void
}
```

### `GalleryPagination`
**Responsabilité** : Navigation entre les pages
- Algorithme intelligent pour afficher 7 boutons max
- Ellipsis pour les grandes listes
- Boutons Précédent/Suivant
- Indicateur mobile compact

**Props** :
```typescript
{
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
}
```

## 🚀 Navigation

### Desktop
- Nouveau bouton dans `AppHeader` :
  - Icône : 🖼️
  - Label : "Galerie"
  - Couleur : `from-amber-400 to-orange-500`
  - Route : `/app/gallery`

### Mobile
- Nouveau bouton dans `BottomNav` :
  - Icône : 🖼️
  - Label : "Galerie"
  - Couleur : `from-amber-400 to-orange-500`
  - Route : `/app/gallery`
  - Grille : 4 colonnes au lieu de 3

## 🔒 Sécurité & Permissions

### Authentification
- Route protégée via middleware
- Vérification de session dans la page serveur
- Redirection vers `/sign-in` si non authentifié

### Visibilité
- Seuls les monstres avec `isPublic: true` sont visibles
- Chaque utilisateur peut voir ses propres monstres publics
- Badge "Ma création" uniquement pour ses monstres

### Anonymat
- Toggle côté client uniquement
- Ne modifie pas la DB
- Valeur par défaut : nom affiché
- Si `ownerAnonymous: true` en DB → pas de toggle possible

## 📊 Performance

### Optimisations
- **Pagination** : Limite à 12 monstres par page
- **Server Actions** : Requêtes optimisées avec `lean()`
- **Count séparé** : `countDocuments()` en parallèle
- **Indexes MongoDB** : Sur `isPublic` et `level` recommandés

### Chargement
- État `loading` affiché pendant le fetch
- Scroll automatique vers le haut au changement de page
- Toast d'erreur en cas de problème

## 🎨 Animations & Effets

### Hover sur cadre
- Scale légère (1.02)
- Ombre amplifiée
- Lumière muséale (projecteur jaune)
- Scale du monstre (1.10)

### Badges
- Ring colorés
- Backdrop blur
- Transitions douces

### Pagination
- Scale actif (1.10)
- Ring sur page active
- Hover scale sur boutons

## 🧪 Tests suggérés

### Cas d'usage
1. ✅ Accès sans authentification → Redirection `/sign-in`
2. ✅ Galerie vide → Message "Aucune œuvre trouvée"
3. ✅ Filtres combinés (niveau + état + tri)
4. ✅ Pagination avec < 12 monstres (pas de pagination)
5. ✅ Pagination avec > 12 monstres
6. ✅ Toggle anonymat sur ses monstres
7. ✅ Toggle anonymat sur monstres des autres
8. ✅ Badge "Ma création" uniquement sur ses monstres
9. ✅ Réinitialisation des filtres
10. ✅ Responsive (mobile, tablette, desktop)

## 🔮 Améliorations futures

### Features potentielles
- [ ] Recherche par nom de monstre
- [ ] Filtre par nom de créateur
- [ ] Vue détaillée (modal ou page dédiée)
- [ ] Bouton "J'aime" / Favoris
- [ ] Commentaires sur les monstres
- [ ] Partage social
- [ ] Classements / Tendances
- [ ] Système de badges/récompenses pour créateurs
- [ ] Export d'image du cadre (PNG/JPEG)

### Optimisations
- [ ] Cache avec React Query / SWR
- [ ] Virtual scrolling pour grandes listes
- [ ] Lazy loading des images
- [ ] Prefetch de la page suivante
- [ ] Filtre par plage de niveau (1-5, 6-10, etc.)

## 📝 Notes de développement

### Dépendances Better Auth
La récupération du nom du propriétaire utilise `auth.api.getUser()`. Si cette API n'est pas disponible ou retourne une erreur, le système affiche "Anonyme" par défaut sans planter.

### MongoDB Queries
Les requêtes utilisent :
- `lean()` pour de meilleures performances
- `sort()` pour le tri
- `skip()` et `limit()` pour la pagination
- `countDocuments()` pour le total

### TypeScript
Tous les composants sont strictement typés avec des interfaces explicites. Pas de `any` sauf pour les filtres MongoDB.

## 🎓 Principes SOLID appliqués

- **SRP** : Chaque composant a une responsabilité unique
- **OCP** : Filtres extensibles sans modifier le code existant
- **LSP** : Props typées et substituables
- **ISP** : Interfaces minimales et ciblées
- **DIP** : Dépendances via props et actions, pas de couplage fort

