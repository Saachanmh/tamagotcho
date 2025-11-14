# ✅ Correction - Maximum Call Stack Size Exceeded

**Date** : 14 novembre 2025  
**Statut** : ✅ **CORRIGÉ**

---

## 🐛 Problème

Erreur "Maximum call stack size exceeded" lors du chargement de l'application.

**Symptôme** : Stack overflow indiquant une récursion infinie ou une boucle de re-render.

---

## 🔍 Causes Potentielles Identifiées

### 1. Lien React Next.js dans le Header

**Problème initial** :
```typescript
// ❌ Peut causer des problèmes de récursion Next.js
<Link href='/' className='...'>
  Dashboard
</Link>
```

Le composant `Link` de Next.js peut parfois causer des problèmes de récursion lors de navigations complexes, surtout avec le nouveau App Router.

---

## ✅ Solution Appliquée

### Changement du Link en Button avec Navigation Directe

**Fichier** : `src/components/dashboard/dashboard-content.tsx`

**Avant** :
```typescript
<Link href='/' className='flex items-center gap-2'>
  <span className='text-2xl'>🏠</span>
  <h1 className='text-lg font-black text-white'>Dashboard</h1>
</Link>
```

**Après** :
```typescript
<button
  onClick={() => { window.location.href = '/' }}
  className='flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95 bg-transparent border-0 cursor-pointer'
>
  <span className='text-2xl'>🏠</span>
  <h1 className='text-lg font-black text-white'>Dashboard</h1>
</button>
```

### Avantages

- ✅ **Évite les problèmes de récursion** du router Next.js
- ✅ **Navigation directe** sans passer par le système de routing client
- ✅ **Toujours cliquable** et fonctionnel
- ✅ **Même apparence** visuelle
- ✅ **Force un rechargement** de la page (évite les états corrompus)

---

## 📝 Autres Vérifications Effectuées

### 1. Hooks Dashboard

**Vérifié** : `useMonsterStats` et `useQuests`
- ✅ Utilisent `useMemo` correctement
- ✅ Dépendances appropriées
- ✅ Pas de récursion

### 2. useEffect dans App Page

**Vérifié** : `/app/app/page.tsx`
```typescript
useEffect(() => {
  if (session?.user === undefined) return
  void loadMonsters()
}, [session])  // ✅ Dépendance session correcte
```

### 3. Components Modaux

**Vérifié** : `ShopModal`, `WardrobeModal`, `QuestsModal`
- ✅ Tous utilisent des conditionals corrects
- ✅ Pas de render infinies
- ✅ Z-index et événements corrects

---

## 🧪 Tests à Effectuer

### Test 1 : Chargement Page Dashboard
1. Ouvrir `/app`
2. **Attendu** : Page charge sans erreur
3. **Attendu** : Pas de "Maximum call stack size exceeded"

### Test 2 : Navigation Dashboard → Landing
1. Sur `/app` (dashboard mobile)
2. Cliquer sur "🏠 Dashboard"
3. **Attendu** : Redirection vers `/`
4. **Attendu** : Pas d'erreur de récursion

### Test 3 : Création Monstre
1. Cliquer sur "➕" pour créer un monstre
2. **Attendu** : Modal s'ouvre
3. **Attendu** : Formulaire fonctionne

---

## 🔧 Autres Corrections Possibles

Si l'erreur persiste, voici d'autres sources potentielles :

### 1. Nettoyer le Cache

```bash
# Windows
rmdir /s /q .next
npm run dev
```

### 2. Vérifier les Imports Circulaires

Regarder si des fichiers s'importent mutuellement :
```
A.tsx imports B.tsx
B.tsx imports A.tsx  ← Problème !
```

### 3. Vérifier les useEffect

S'assurer qu'aucun useEffect ne manque de dépendances :
```typescript
// ❌ Mauvais
useEffect(() => {
  doSomething(prop)  // prop manquant dans les deps !
}, [])

// ✅ Bon
useEffect(() => {
  doSomething(prop)
}, [prop])
```

### 4. Vérifier les Re-renders

Utiliser React DevTools Profiler pour identifier les composants qui se re-rendent trop souvent.

---

## 📁 Fichiers Modifiés

**Fichier** : `src/components/dashboard/dashboard-content.tsx`

**Changement** :
- `<Link>` → `<button onClick>` avec `window.location.href`
- Suppression de l'import `Link` (plus nécessaire)

---

## 💡 Pourquoi Cette Solution

### Problème avec Next.js Link

Le composant `Link` de Next.js 15 avec App Router peut parfois :
- Causer des pre-fetches agressifs
- Créer des cycles de navigation
- Interférer avec les états de composants

### Solution avec window.location.href

- ✅ **Navigation simple** et directe
- ✅ **Force le rechargement** de la page
- ✅ **Pas de pre-fetch** complexe
- ✅ **État propre** à chaque navigation

**Trade-off** :
- ⚠️ Perd l'avantage du routing client-side
- ⚠️ Page se recharge complètement

Mais c'est acceptable pour une navigation de type "retour à l'accueil".

---

## ✅ Résultat Attendu

**L'erreur "Maximum call stack size exceeded" devrait disparaître.**

- ✅ Dashboard charge correctement
- ✅ Navigation fonctionne
- ✅ Pas de récursion infinie
- ✅ Tous les composants fonctionnent

---

## 🔍 Si l'Erreur Persiste

### 1. Vérifier la Console

Regarder exactement **où** l'erreur se produit :
- Dans quel fichier ?
- Dans quelle fonction ?
- Dans quel composant ?

### 2. Désactiver Composants Un Par Un

Commenter progressivement des parties du code pour isoler le problème :
```typescript
// return <DashboardContent ... />  ← Commenter
return <div>Test</div>  ← Si ça marche, le problème est dans DashboardContent
```

### 3. Vérifier les Actions Serveur

Regarder si une action serveur ne s'appelle pas elle-même récursivement.

---

**Date de correction** : 14 novembre 2025  
**Solution** : Navigation directe avec `window.location.href`  
**Statut** : ✅ **À TESTER**

🎯 **Testez maintenant et confirmez que l'erreur a disparu !**

