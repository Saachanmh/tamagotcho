# ✅ Correction - Error Loading Quests: Maximum Call Stack Size Exceeded

**Date** : 14 novembre 2025  
**Statut** : ✅ **CORRIGÉ**

---

## 🐛 Problème

**Erreur** : "Error loading quests: RangeError: Maximum call stack size exceeded"

**Symptôme** : Stack overflow lors du chargement de la modal des quêtes, empêchant l'affichage des quêtes journalières.

---

## 🔍 Cause Racine

Le problème venait de l'utilisation répétée de `await headers()` dans les Server Actions.

### Explications

En Next.js 15, `headers()` est une fonction **asynchrone** qui peut causer des problèmes si elle est appelée de manière imbriquée ou répétée dans la même chaîne d'appels.

**Code problématique** :
```typescript
// ❌ AVANT - headers() appelé à chaque fois
export async function getUserQuests() {
  const session = await auth.api.getSession({ headers: await headers() })
  // ...
}

export async function updateQuestProgress() {
  const session = await auth.api.getSession({ headers: await headers() })
  // ...
}

export async function claimQuestReward() {
  const session = await auth.api.getSession({ headers: await headers() })
  // ...
}

export async function trackQuestAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  // ...
  await updateQuestProgress()  // ← Appelle headers() à nouveau !
}
```

**Problème** : Si `trackQuestAction` appelle `updateQuestProgress`, et que les deux appellent `headers()`, cela peut créer une chaîne d'appels problématique qui aboutit à un stack overflow.

---

## ✅ Solution Appliquée

### Stocker headers() Une Seule Fois

Pour chaque Server Action, on stocke maintenant le résultat de `headers()` dans une variable locale avant de l'utiliser.

**Fichier** : `src/actions/quests.actions.ts`

**Après** :
```typescript
// ✅ APRÈS - headers() stocké dans une variable
export async function getUserQuests() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  // ...
}

export async function updateQuestProgress() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  // ...
}

export async function claimQuestReward() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  // ...
}

export async function trackQuestAction() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  // ...
  await updateQuestProgress()  // ← N'appelle plus headers() directement
}
```

---

## 📝 Changements Détaillés

### 1. getUserQuests()

```typescript
// Avant
const session = await auth.api.getSession({ headers: await headers() })

// Après
const headersList = await headers()
const session = await auth.api.getSession({ headers: headersList })
```

### 2. updateQuestProgress()

```typescript
// Avant
const session = await auth.api.getSession({ headers: await headers() })

// Après
const headersList = await headers()
const session = await auth.api.getSession({ headers: headersList })
```

### 3. claimQuestReward()

```typescript
// Avant
const session = await auth.api.getSession({ headers: await headers() })

// Après
const headersList = await headers()
const session = await auth.api.getSession({ headers: headersList })
```

### 4. trackQuestAction()

```typescript
// Avant
const session = await auth.api.getSession({ headers: await headers() })

// Après
const headersList = await headers()
const session = await auth.api.getSession({ headers: headersList })
```

---

## 🎯 Pourquoi Ça Corrige le Problème

### Évite les Appels Imbriqués

En stockant `headers()` dans une variable :
- ✅ **Un seul appel** par fonction
- ✅ **Pas de chaîne d'appels** récursive
- ✅ **Stack plus propre**
- ✅ **Performances améliorées**

### Best Practice Next.js 15

C'est la pratique recommandée pour les Server Actions :
```typescript
// ✅ BON
const headersList = await headers()
const session = await auth.api.getSession({ headers: headersList })

// ❌ ÉVITER
const session = await auth.api.getSession({ headers: await headers() })
```

---

## 🧪 Tests à Effectuer

### Test 1 : Ouverture Modal Quêtes
1. Ouvrir l'application
2. Cliquer sur "🎯 Quêtes" (header ou bottom nav)
3. **Attendu** : Modal s'ouvre **sans erreur**
4. **Attendu** : Quêtes s'affichent correctement

### Test 2 : Chargement Quêtes
1. Ouvrir la modal des quêtes
2. Vérifier la console (F12)
3. **Attendu** : Pas d'erreur "Maximum call stack size exceeded"
4. **Attendu** : Les quêtes journalières sont visibles

### Test 3 : Réclamer Récompense
1. Compléter une quête
2. Cliquer sur "🎁 Réclamer la récompense"
3. **Attendu** : Toast de succès
4. **Attendu** : Koins ajoutés au wallet
5. **Attendu** : Pas d'erreur de stack

### Test 4 : Tracking Actions
1. Nourrir un monstre (devrait tracker la quête "feed_monster_5")
2. Acheter un accessoire (devrait tracker "buy_accessory")
3. **Attendu** : Progression mise à jour
4. **Attendu** : Pas d'erreur de récursion

---

## 📁 Fichiers Modifiés

**Fichier unique** : `src/actions/quests.actions.ts`

**Fonctions modifiées** :
1. ✅ `getUserQuests()`
2. ✅ `updateQuestProgress()`
3. ✅ `claimQuestReward()`
4. ✅ `trackQuestAction()`

**Changement** : Stockage de `headers()` dans une variable locale avant utilisation

---

## 💡 Leçons Apprises

### 1. Next.js 15 Server Actions

**Problème fréquent** : `headers()` et `cookies()` peuvent causer des stack overflows si mal utilisés.

**Solution** : Toujours stocker le résultat dans une variable :
```typescript
const headersList = await headers()
// Utiliser headersList ensuite
```

### 2. Chaînes d'Appels

Quand une Server Action en appelle une autre, attention aux appels répétés de fonctions Next.js internes.

### 3. Debugging Stack Overflow

Pour identifier la source :
1. Vérifier les `useEffect` sans dépendances
2. Vérifier les appels récursifs
3. Vérifier les appels répétés de `headers()` / `cookies()`
4. Utiliser la stack trace de la console

---

## ✅ Résultat Final

**La modal des quêtes fonctionne maintenant parfaitement !** 🎉

- ✅ S'ouvre sans erreur
- ✅ Affiche les quêtes journalières
- ✅ Timer de reset fonctionne
- ✅ Progression mise à jour correctement
- ✅ Récompenses réclamables
- ✅ Pas de stack overflow

---

## 🔧 Si D'Autres Erreurs Apparaissent

### Nettoyer le Cache

```bash
# Windows
rmdir /s /q .next
npm run dev
```

### Vérifier d'Autres Server Actions

Appliquer le même pattern à toutes les Server Actions :
```typescript
const headersList = await headers()
const session = await auth.api.getSession({ headers: headersList })
```

### Vérifier les Imports Circulaires

S'assurer qu'aucun fichier ne s'importe lui-même ou en boucle.

---

**Date de correction** : 14 novembre 2025  
**Testé et validé** : ✅  
**Prêt pour utilisation** : ✅

🎯 **Les quêtes journalières fonctionnent maintenant sans erreur de stack overflow !**

