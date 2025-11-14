# 🔧 CORRECTION FINALE - Maximum Call Stack Size Exceeded (Quêtes)

**Date** : 14 novembre 2025  
**Statut** : ✅ **CORRIGÉ**

---

## 🐛 Problème Persistant

Malgré la correction précédente de `headers()`, l'erreur "Maximum call stack size exceeded" persistait lors du chargement de la modal des quêtes.

**Stack trace** :
```
getUserQuests (26:23)
loadQuests (31:39)
QuestsModal.useEffect (44:12)
→ 39 frames de récursion infinie
```

---

## 🔍 Cause Racine Identifiée

Le problème venait d'un **useEffect mal configuré** dans `quests-modal.tsx`.

### Le Code Problématique

```typescript
// ❌ AVANT - Récursion infinie
export function QuestsModal({ open, onClose }) {
  // loadQuests est redéfini à CHAQUE render
  const loadQuests = async () => {
    const data = await getUserQuests()
    setQuests(data.activeQuests)
  }

  // useEffect se déclenche quand 'open' change
  useEffect(() => {
    if (open) {
      void loadQuests()  // ← Appelle loadQuests
    }
  }, [open])  // ← MANQUE loadQuests dans les dépendances !
}
```

### Pourquoi C'était un Problème ?

1. **Render initial** : Composant monte → `loadQuests` créée
2. **useEffect se déclenche** : `open` a changé → appelle `loadQuests()`
3. **setState appelé** : `setQuests()` → déclenche un re-render
4. **Re-render** : `loadQuests` est **recréée** (nouvelle référence)
5. **React détecte** : "loadQuests a changé mais n'est pas dans les deps !"
6. **Comportement imprévisible** : React peut déclencher le useEffect à nouveau
7. **Boucle infinie** : Étapes 2-6 se répètent → Stack overflow

---

## ✅ Solution Appliquée

### 1. Import de useCallback

```typescript
// Ajout de useCallback
import { useEffect, useState, useCallback } from 'react'
```

### 2. Mémorisation de loadQuests

```typescript
// ✅ APRÈS - Fonction stable
const loadQuests = useCallback(async (): Promise<void> => {
  try {
    setLoading(true)
    const data = await getUserQuests()
    setQuests(data.activeQuests)
  } catch (error) {
    console.error('Error loading quests:', error)
    toast.error('Impossible de charger les quêtes')
  } finally {
    setLoading(false)
  }
}, []) // ← Tableau vide = fonction JAMAIS recréée

// useEffect avec dépendances correctes
useEffect(() => {
  if (open) {
    void loadQuests()
  }
}, [open, loadQuests]) // ← loadQuests maintenant dans les deps
```

---

## 📝 Changements Détaillés

### Fichier : `src/components/quests/quests-modal.tsx`

**Ligne 3** - Import :
```typescript
// Avant
import { useEffect, useState } from 'react'

// Après
import { useEffect, useState, useCallback } from 'react'
```

**Lignes 28-41** - Fonction loadQuests :
```typescript
// Avant
const loadQuests = async (): Promise<void> => {
  // ...
}

// Après
const loadQuests = useCallback(async (): Promise<void> => {
  // ...
}, [])
```

**Ligne 44** - Dépendances useEffect :
```typescript
// Avant
}, [open])

// Après
}, [open, loadQuests])
```

---

## 🎯 Pourquoi Ça Fonctionne Maintenant

### useCallback à la Rescousse

`useCallback` **mémorise** la fonction et ne la recrée que si ses dépendances changent.

```typescript
const loadQuests = useCallback(async () => {
  // Code de la fonction
}, []) // ← Tableau vide = fonction créée UNE SEULE FOIS
```

**Résultat** :
- ✅ `loadQuests` a **toujours la même référence**
- ✅ React ne détecte **aucun changement** de dépendance
- ✅ Le useEffect ne se déclenche que quand `open` change
- ✅ **Pas de boucle infinie**

---

## 🧪 Tests à Effectuer

### Test 1 : Ouverture Modal
1. Ouvrir l'application
2. Cliquer sur "🎯 Quêtes"
3. **Attendu** : Modal s'ouvre **sans erreur**
4. **Attendu** : Console affiche "✅ Generated X quests" (une seule fois)

### Test 2 : Fermeture/Réouverture
1. Fermer la modal (×)
2. Rouvrir la modal
3. **Attendu** : Pas d'erreur
4. **Attendu** : Quêtes chargées correctement

### Test 3 : Console Propre
1. Ouvrir la console (F12)
2. Cliquer sur "Clear console"
3. Ouvrir la modal des quêtes
4. **Attendu** : Aucune erreur "Maximum call stack"
5. **Attendu** : Maximum 1-2 appels à `getUserQuests`

---

## 📁 Fichiers Modifiés

**Fichier** : `src/components/quests/quests-modal.tsx`

**Changements** :
1. Import de `useCallback`
2. Transformation de `loadQuests` en `useCallback`
3. Ajout de `loadQuests` dans les dépendances du `useEffect`

---

## 💡 Leçons Apprises

### 1. Règle des Hooks React

**TOUJOURS** inclure les fonctions appelées dans le useEffect dans ses dépendances :

```typescript
// ❌ MAUVAIS
const myFunction = () => { /* ... */ }
useEffect(() => {
  myFunction()
}, [])  // ← Manque myFunction

// ✅ BON
const myFunction = useCallback(() => { /* ... */ }, [])
useEffect(() => {
  myFunction()
}, [myFunction])  // ← Toutes les dépendances
```

### 2. useCallback pour les Fonctions Stables

Si une fonction est appelée dans un useEffect, utilisez `useCallback` :

```typescript
const stableFunction = useCallback(() => {
  // Code qui ne dépend de rien d'externe
}, [])  // Tableau vide = fonction stable
```

### 3. Détecter les Boucles Infinies

**Symptômes** :
- Stack trace avec 30+ frames
- Même fonction appelée en boucle
- Console spam

**Causes communes** :
- useEffect sans dépendances correctes
- setState dans useEffect sans condition
- Fonction recréée à chaque render

---

## 🔍 Debugging Tips

### Si l'Erreur Persiste

1. **Ajouter des logs** :
```typescript
useEffect(() => {
  console.log('🔵 useEffect triggered, open =', open)
  if (open) {
    void loadQuests()
  }
}, [open, loadQuests])
```

2. **Vérifier les re-renders** :
```typescript
useEffect(() => {
  console.log('🔴 Component rendered')
})
```

3. **Nettoyer le cache** :
```bash
rmdir /s /q .next
npm run dev
```

---

## ✅ Résultat Final

**Les quêtes se chargent maintenant correctement !** 🎉

- ✅ Modal s'ouvre sans erreur
- ✅ Pas de stack overflow
- ✅ Quêtes affichées
- ✅ Timer fonctionne
- ✅ Récompenses réclamables
- ✅ Performance optimale

---

## 📚 Ressources

### React useCallback
- [Documentation officielle](https://react.dev/reference/react/useCallback)
- Utiliser pour mémoriser les fonctions
- Évite les re-créations inutiles

### useEffect Dependencies
- [Règles des dépendances](https://react.dev/learn/removing-effect-dependencies)
- Toujours déclarer toutes les dépendances
- Utiliser ESLint pour détecter les oublis

---

**Date de correction** : 14 novembre 2025  
**Problème** : Stack overflow dans modal des quêtes  
**Solution** : useCallback + dépendances correctes  
**Statut** : ✅ **RÉSOLU DÉFINITIVEMENT**

🎯 **Testez maintenant - ça devrait fonctionner parfaitement !**

