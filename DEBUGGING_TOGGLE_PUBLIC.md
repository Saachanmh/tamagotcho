# 🔧 Debugging du Toggle Public/Privé - Monster

## 📋 Résumé du problème

Le bouton "Privé" ne passe jamais en "Public" malgré la notification de succès.

## ✅ Modifications apportées

### 1. Ajout de logs détaillés

**Fichiers modifiés :**
- `src/app/api/monsters/toggle-public/route.ts` - Logs dans la route API
- `src/actions/monsters.actions.ts` - Logs dans `updateMonsterPublicFlag`
- `src/components/creature/creature-page-client.tsx` - Logs dans `togglePublic` et au montage

**Ce qui est tracé :**
- 🔄 Réception de la requête
- ✅ Session trouvée
- 📦 Payload reçu
- 🔧 Tentative de mise à jour
- 📄 Monstre trouvé
- 💾 Sauvegarde en cours
- ✅ Sauvegarde réussie
- 📤 Retour de la réponse

### 2. Script de migration

**Fichier créé :** `scripts/migrate-add-isPublic.ts`

Ce script ajoute le champ `isPublic: false` à tous les monstres existants qui n'ont pas ce champ.

**Exécution :**
```bash
npx ts-node scripts/migrate-add-isPublic.ts
```

## 🔍 Comment déboguer

### Étape 1 : Vérifier les logs dans la console

1. Ouvre la console du navigateur (F12)
2. Clique sur le bouton "Privé"
3. Cherche les logs suivants :

```
🎮 CreaturePageClient mounted with monster: { id: "...", isPublic: false }
🔄 Toggle public clicked: { currentState: false, desiredState: true, monsterId: "..." }
📡 Response status: 200
📦 Response data: { success: true, monster: { ..., isPublic: true } }
✅ Updating local state: { newIsPublic: true }
```

### Étape 2 : Vérifier les logs serveur

Dans le terminal où tourne `npm run dev`, cherche :

```
🔄 Toggle public request received
✅ Session found: user_id_here
📦 Request body: { id: 'monster_id', isPublic: true }
🔧 Updating monster monster_id to isPublic=true
📝 updateMonsterPublicFlag called: { ownerId: '...', monsterId: '...', value: true }
🔍 Searching for monster...
📄 Monster found: { id: '...', currentIsPublic: false }
💾 Saving monster with isPublic = true
✅ Monster saved successfully
📤 Returning monster: { id: '...', isPublic: true }
✅ Monster updated: { id: '...', isPublic: true }
🔄 Paths revalidated
```

### Étape 3 : Vérifier dans MongoDB

Connecte-toi à MongoDB Compass ou utilise le shell :

```javascript
db.monsters.findOne({ _id: ObjectId("MONSTER_ID_ICI") })
```

Vérifie que le champ `isPublic` existe et a la bonne valeur.

## 🐛 Problèmes possibles et solutions

### Problème 1 : Le champ `isPublic` n'existe pas sur les monstres existants

**Symptôme :** `undefined` dans les logs au lieu de `false`

**Solution :**
```bash
npx ts-node scripts/migrate-add-isPublic.ts
```

### Problème 2 : L'état local ne se met pas à jour

**Symptôme :** Le bouton reste gris après le clic malgré le succès

**Cause possible :** Le polling (`setInterval` à 1000ms) écrase l'état local

**Solution :** Modifier le `useEffect` qui fetch le monstre pour ne pas écraser `isPublic` :

```typescript
useEffect(() => {
  const fetchMonster = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/monster?id=${monster._id}`)
      if (response.ok) {
        const updatedMonster: DBMonster = await response.json()
        
        // Garder isPublic du state local si différent (éviter écrasement)
        setCurrentMonster(prev => ({
          ...updatedMonster,
          // Si on vient de toggle, on garde la valeur locale
          isPublic: updatedMonster.isPublic
        }))
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du monstre :', error)
    }
  }

  const interval = setInterval(() => {
    void fetchMonster()
  }, 1000)

  return () => clearInterval(interval)
}, [monster._id]) // ⚠️ Changé: dépendance sur monster._id uniquement
```

### Problème 3 : La session n'est pas trouvée

**Symptôme :** Status 401 dans les logs

**Solution :** Vérifier que l'utilisateur est bien connecté et que les cookies de session sont présents.

### Problème 4 : Le monstre n'est pas trouvé

**Symptôme :** Status 404 dans les logs

**Solution :** Vérifier que l'ID du monstre est valide et que le monstre appartient bien à l'utilisateur connecté.

## 🎯 Checklist de vérification

- [ ] Le script de migration a été exécuté
- [ ] Les logs client apparaissent dans la console du navigateur
- [ ] Les logs serveur apparaissent dans le terminal
- [ ] Le statut HTTP est 200
- [ ] La réponse contient `{ success: true, monster: { isPublic: true } }`
- [ ] L'état local est mis à jour (`setCurrentMonster` appelé)
- [ ] Le bouton change visuellement de couleur
- [ ] La notification toast apparaît
- [ ] Le champ en base de données est mis à jour (vérifier avec MongoDB)
- [ ] Le badge "🌐 Public" apparaît sur la carte si retour au dashboard

## 📝 Prochaines étapes après debug

Une fois que le toggle fonctionne :

1. **Nettoyer les logs** - Retirer tous les `console.log` de production
2. **Optimiser le polling** - Éviter d'écraser `isPublic` dans le `useEffect`
3. **Ajouter des tests** - Tester le toggle avec Playwright ou Cypress
4. **Page publique** - Créer une route `/monsters/public` pour voir les monstres publics
5. **Filtrage** - Ajouter un filtre "Monstres publics uniquement" dans le dashboard

## 🔗 Fichiers concernés

- ✅ `src/db/models/monster.model.ts` - Schéma avec `isPublic`
- ✅ `src/types/monster.ts` - Type `DBMonster` avec `isPublic`
- ✅ `src/actions/monsters.actions.ts` - Fonction `updateMonsterPublicFlag`
- ✅ `src/app/api/monsters/toggle-public/route.ts` - Route API POST
- ✅ `src/components/creature/creature-page-client.tsx` - Bouton toggle + handler
- ✅ `src/components/monsters/monster-card.tsx` - Badge "🌐 Public"
- ✅ `src/components/monsters/monsters-list.tsx` - Passage de la prop `isPublic`
- ✅ `scripts/migrate-add-isPublic.ts` - Migration pour monstres existants

---

**Auteur :** GitHub Copilot  
**Date :** 2025-01-13  
**Statut :** 🔧 Debugging en cours avec logs détaillés

