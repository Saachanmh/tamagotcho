# 🚀 Plan d'Optimisation des Performances - Tamagotcho

> Objectif: Réduire le coût des re-renders React, accélérer les requêtes serveur, diminuer le bundle initial et améliorer la réactivité perçue.
> Date: 2025-11-13

---
## 1. Synthèse Actuelle

| Axe | Implémenté | Restant | Priorité suivante |
|-----|------------|---------|-------------------|
| useMemo | 4 | 6 | Liste / tri / dérivations complexes |
| useCallback | 8 | 7 | Handlers secondaires (navigation, formulaires) |
| React.memo | 1 | 4 | Composants de liste / sections statiques |
| Lazy Loading | 1 | 4 | Modales restantes + PixelMonster |
| Code Splitting | Partiel (modal) | Routes shop/wallet | Découper modules volumineux |
| Cache données | Catalogues (static) | Monsters, wallet, quests | Introduire React Query / SWR |
| DB Index | Monsters + Wallet | Vérif. sessions/email (Better Auth interne) | Audit projection / lean |
| Images | Aucun (hors assets existants) | Conversion WebP / next/image | Optimisation progressive |

---
## 2. Composants à Optimiser avec `useMemo`

Critères: Calcul coûteux, agrégations, parsing JSON, mapping volumineux.

| Composant | Fichier | Calcul ciblé | Coût estimé | Statut | Action |
|-----------|---------|-------------|------------|--------|--------|
| DashboardContent | `dashboard-content.tsx` | Stats globales (total, niveau max, humeur) | Moyen | ✅ FAIT | RAS |
| DashboardContent | `dashboard-content.tsx` | Génération des quêtes | Moyen | ✅ FAIT | RAS |
| CreaturePageClient | `creature-page-client.tsx` | Parsing des traits JSON | Élevé | ✅ FAIT | RAS |
| MonstersList | `monsters-list.tsx` | `monsters.map` + éventuel tri/filtre | Moyen | ⏳ À FAIRE | Ajouter useMemo sur vue dérivée |
| WalletClient | `wallet-client.tsx` | Tri packages / filtrage promos | Faible | ⏳ À FAIRE | Préparer structure dérivée |
| QuestsSection | `quests-section.tsx` | Classement / filtrage quêtes actives | Faible | ⏳ À FAIRE | Mémo si taille > N |
| MoodTipSection | `mood-tip-section.tsx` | Message dynamique formaté | Très faible | ❌ Optionnel | Ignorer sauf chaînes complexes |
| MonsterCard | `monster-card.tsx` | Format date / label niveau | Très faible | ❌ Optionnel | Pas nécessaire |
| CreatureStatsPanel | `creature-stats-panel.tsx` | Progression XP calculée | Faible | ⏳ À FAIRE | Regrouper calculs dans useMemo |
| ShopModal | `shop-modal.tsx` | Filtrage accessoires par catégorie | Moyen | ⏳ À FAIRE | Préparer catalogue dérivé |

Exemple à appliquer (MonstersList):
```tsx
const renderedMonsters = useMemo(() => {
  return monsters
    // .filter(...) // futur filtrage
    .map(m => ({ ...m, createdLabel: formatDate(m.createdAt) }))
}, [monsters])
```

---
## 3. Fonctions à Mémoriser avec `useCallback`

Critères: Passées en props, re-créées souvent, déclenchent re-renders enfants.

| Fonction | Contexte | Statut | Action |
|----------|----------|--------|--------|
| handleCreateMonster | DashboardContent | ✅ FAIT | RAS |
| handleCloseModal | DashboardContent | ✅ FAIT | RAS |
| handleMonsterSubmit | DashboardContent | ✅ FAIT | RAS |
| handleAction | CreaturePageClient | ✅ FAIT | RAS |
| handleBuyItem | CreaturePageClient | ✅ FAIT | RAS |
| openWardrobe / closeWardrobe | CreaturePageClient | ✅ FAIT | RAS |
| openShop / closeShop | CreaturePageClient | ✅ FAIT | RAS |
| navigateToMonster | MonstersList | ⏳ À FAIRE | Ajout useCallback |
| handleEquipItem | WardrobeModal | ⏳ À FAIRE | Stabiliser props |
| handleSelectCategory | ShopModal | ⏳ À FAIRE | Stabiliser filtre |
| handlePayment | PaymentModal | ⏳ À FAIRE | Stabiliser avant ajout Stripe lazy |
| onQuestClick | QuestsSection | ⏳ À FAIRE | Si interactions ajoutées |
| onFormChange | Future forms | ⏳ À FAIRE | Généralisation |
| onWalletRefresh | WalletClient | ⏳ À FAIRE | Mémoriser et invalider cache |

Patron recommandé:
```tsx
const handleSelectCategory = useCallback((cat: ShopCategory) => {
  setActiveCategory(cat)
}, [])
```

---
## 4. Données à Mettre en Cache

| Domaine | Données | Stratégie | Durée / Politique | Outil | Statut |
|---------|---------|-----------|-------------------|-------|--------|
| Monsters | Liste des monstres utilisateur | React Query / SWR | staleTime 30s | React Query | 🔄 À implémenter |
| Wallet | Solde + historique achats | React Query + invalidation | staleTime 60s | React Query | 🔄 À implémenter |
| Boutique | Catalogue accessoires / backgrounds | Singleton en mémoire | Permanent | Module statique | ✅ FAIT |
| Quêtes | Quêtes calculées (daily/weekly) | Cache mémoire + timestamp | Reset 24h/7j | LocalStorage + service | 🔄 À implémenter |
| Auth | Session utilisateur | Fournisseur Better Auth | Géré par lib | Better Auth | ✅ Interne |
| Config | Fichiers `src/config/*` | Import ES modules | Permanent | Bundler | ✅ FAIT |
| Stats dérivées | Stats dashboard | useMemo + éventuel cache léger | Recalcul sur changement data | useMemo | ✅ FAIT |
| Background équipé | localStorage + état | Persistant | Manuel | Service shop | ✅ FAIT |

React Query exemple (monsters):
```tsx
const monstersQuery = useQuery({
  queryKey: ['monsters'],
  queryFn: getMonsters,
  staleTime: 30_000,
  refetchOnWindowFocus: true,
})
```
SWR alternative:
```tsx
const { data: monsters } = useSWR('/api/monsters', fetcher, {
  refreshInterval: 30_000,
})
```

---
## 5. Lazy Loading & Code Splitting

| Cible | Type | Justification | Action | Statut |
|-------|------|---------------|--------|--------|
| CreateMonsterModal | Modal | Ne doit charger qu'à l'ouverture | `lazy()` + Suspense | ✅ FAIT |
| ShopModal | Modal | Catalogue secondaire | `lazy()` | 🔄 À FAIRE |
| WardrobeModal | Modal | Accessoires secondaires | `lazy()` | 🔄 À FAIRE |
| PaymentModal (Stripe) | Modal / SDK | Stripe lourd (~50KB) | Import dynamique conditionnel | 🔄 À FAIRE |
| PixelMonster | Canvas rendering | Animation lourde | Lazy si hors viewport | 🔄 À FAIRE |
| Heavy charts (futur) | Visualisation | Charge additionnelle | Dynamic import | ❌ Futur |

Exemples:
```tsx
const ShopModal = lazy(() => import('./shop-modal'))
<Suspense fallback={<Spinner/>}>{isShopOpen && <ShopModal />}</Suspense>
```

### Code Splitting Routes
- `/app/wallet`: split Stripe + wallet actions.
- `/app/shop`: différer chargement des assets visuels lourds.

### Prefetch (Next.js)
Utiliser `<Link prefetch>` + hover programmatique:
```tsx
<Link href={`/app/creatures/${id}`} prefetch>{name}</Link>
```

---
## 6. Optimisation DB & Accès Serveur

| Action | Type | Gain | Statut | Suivant |
|--------|------|------|--------|---------|
| Index ownerId (monsters) | Index simple | Lookup -70% | ✅ FAIT | Vérif analyse requêtes |
| Index ownerId+createdAt | Index composé | Tri réactif | ✅ FAIT | OK |
| Index level | Index simple | Classements | ✅ FAIT | OK |
| Index ownerId (wallet) | Index unique | Accès O(log n) | ✅ FAIT | OK |
| Projection requêtes | Champ ciblés `select()` | Moins de transfert / parsing | 🔄 À FAIRE | Implémenter lean |
| `.lean()` sur find | Objet JS pur | - Overhead Mongoose | 🔄 À FAIRE | Appliquer sur listes |
| SSE / WebSocket | Temps réel vs polling | - CPU / réseau | 🔄 Étude | Remplacer setInterval |
| Batching requêtes | Groupement d'accès | - Round trips | ❌ Futur | Regrouper stats |

Projection exemple:
```ts
Monster.find({ ownerId }).select('name level xp state traits createdAt').lean()
```

---
## 7. Optimisation Images & Assets

| Asset | Action | Outil | Bénéfice | Statut |
|-------|--------|-------|----------|--------|
| Backgrounds JPG/PNG | Conversion WebP | sharp | - Taille 30–60% | 🔄 À FAIRE |
| Logo | `next/image` | Next.js | Lazy + responsive | 🔄 À FAIRE |
| Décors CSS | Regrouper classes | Tailwind | - règles inutiles | 🔄 Audit |
| PixelMonster | Canvas | Déjà optimisé | Rendu vectoriel | ✅ FAIT |

Conversion batch (exemple script):
```bash
npx sharp input.png -o output.webp --quality=80
```

---
## 8. Stratégie de Mesure & Suivi

| Outil | Métrique | Fréquence | Objectif |
|-------|----------|-----------|----------|
| Lighthouse | FCP / TTI / LCP | Hebdo | FCP < 1s / LCP < 2.5s |
| React Profiler | Re-renders | Avant/après modif | -60% liste cartes |
| MongoDB profiler | Requêtes lente > 50ms | Mensuel | < 20ms moyenne |
| Bundle Analyzer | Poids JS initial | Après ajout features | < 120KB |

Commandes:
```bash
npm run build
# (ajouter analyzer si configuré)
```

---
## 9. Checklist d'Implémentation (Prochain Sprint)

- [ ] Ajouter useMemo sur `MonstersList` (vue dérivée)
- [ ] Mémoriser handlers navigation monster card
- [ ] Lazy load `ShopModal` & `WardrobeModal`
- [ ] Introduire React Query pour monsters & wallet
- [ ] Ajouter projections `.select()` + `.lean()` dans actions serveur
- [ ] Ajouter index vérification (audit final dans MongoDB Compass)
- [ ] Implémenter conversion WebP des backgrounds
- [ ] Prefetch routes critiques (wallet, shop, creature detail)
- [ ] Mesurer avant/après avec React Profiler

---
## 10. Risques & Précautions

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Sur-usage useMemo/useCallback | Overhead / complexité | Limiter aux coûts réels |
| Lazy loading sans fallback UX | Flash / confusion utilisateur | Suspense + skeleton |
| Index excessifs | Plus d'espace + writes plus lentes | Limiter aux champs d'accès critique |
| Cache stale | Affichage données périmées | Durées courtes + invalidation ciblée |
| Découpage trop fin du bundle | Multiplication de requêtes | Regrouper par feature |

---
## 11. Exemples Concrets Consolidés

### useMemo (tri + dérivation)
```tsx
const sortedVisible = useMemo(() => {
  return monsters
    .filter(m => !filter || m.state === filter)
    .sort((a, b) => b.level - a.level)
}, [monsters, filter])
```
### useCallback (navigation)
```tsx
const goToMonster = useCallback((id: string) => {
  router.push(`/app/creatures/${id}`)
}, [router])
```
### Lazy modal
```tsx
const WardrobeModal = lazy(() => import('./wardrobe-modal'))
<Suspense fallback={<div>Chargement...</div>}>
  {showWardrobe && <WardrobeModal onClose={closeWardrobe} />}
</Suspense>
```
### React.memo (card)
```tsx
export const MonsterCard = memo(MonsterCardComponent, (prev, next) => (
  prev.updatedAt === next.updatedAt && prev.id === next.id
))
```

---
## 12. Roadmap Résumée

| Sprint | Objectifs principaux |
|--------|----------------------|
| S1 | useMemo MonstersList + lazy modales + projections DB |
| S2 | Cache React Query + WebP + memo sections statiques |
| S3 | WebSocket/SSE remplacement polling + Bundle refine |
| S4 | PWA + Service Worker + audits finaux |

---
## 13. Résultat Attendu Global

| KPI | Actuel (estimé) | Cible |
|-----|-----------------|-------|
| FCP | ~1.2s | < 0.9s |
| TTI | ~2.5s | < 1.5s |
| Bundle initial | ~150KB | < 120KB |
| Requête monsters | ~50ms | < 20ms |
| Re-renders liste | 8–10 | 3–4 |

---
## 14. Conclusion
Le projet possède déjà de bonnes bases (config centralisée, séparation des couches, premières optimisations). Ce plan structure la montée en puissance de la performance sans sacrifier la maintenabilité. Prioriser d'abord les listes & sources de vérité (monsters, wallet), puis lUX (lazy modales), ensuite la distribution (code splitting / cache), enfin le temps réel & PWA.

> Étape suivante recommandée immédiate: Introduire `useMemo` sur `MonstersList` + lazy load des modales Shop/Wardrobe pour un gain rapide.

---
**Auteur:** GitHub Copilot  
**Version:** 2.0 (refonte)  
**Date:** 2025-11-13

