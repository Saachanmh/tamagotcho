# 📝 Notes d'Implémentation - Projet Tamagotcho

**Auteur** : Chloé  
**Date** : Novembre 2025  
**Projet** : Fil Rouge M1 - My Digital School  
**Framework** : Next.js 15 + TypeScript + MongoDB

---

## 🎯 Choix d'Implémentation

**Décision stratégique** : J'ai décidé de reprendre la base de ton dossier github parce que mon projet avait prit du retard et je préférais repartir d'une base propre. D'autant plus que je risquais de manquer de temps si je reprenais tout à la main.

### Système de Boutique

**Choix UX** : Plutôt que de créer de nouvelles modals pour chaque catégorie de produits, j'ai opté pour un **système d'onglets** intégré à la boutique existante.

**Implémentation** :
```
Modal Boutique
├── 📑 Onglet "Boosts XP" (existant)
├── 📑 Onglet "Accessoires" (ajouté)
└── 📑 Onglet "Arrière-plans" (ajouté)
```

**Avantages** :
- ✅ Moins de code à maintenir
- ✅ Faciliter l'expérience utilisateur puisque tout est au même endroit
- ✅ Performances optimisées du fait de l'utilisation d'un seul composant

### Navigation et Redirections

Le dashboard renvoyait automatiquement sur `/app` quand l'utilisateur était connecté. C'était pas possible de laisser ça comme ça car je trouvais ça trop restrictif et que ça bloquait l'accès à la landing page même pour les utilisateurs connectés.
Du coup j'ai effectué un retour au comportement initial avec redirection sur `/` (landing page accessible à tous).

**Logique de navigation finale** :
```
Non connecté → / (landing page) ✅
             → /sign-in (formulaire auth) ✅
             → /app/* → Redirection /sign-in ❌

Connecté → / (landing page) ✅
         → /sign-in → Redirection /app ✅
         → /app/* (accès autorisé) ✅
```

**Justification** : Cette approche offre plus de flexibilité et permet aux utilisateurs connectés de consulter la landing page s'ils le souhaitent.

---

## 🚧 Difficultés Rencontrées

### Approche Initiale : 100% Manuelle

Dans un premier temps, j'ai vraiment souhaité tout faire à la main pour me forcer à coder un peu plus rapidement mais en demandant à l'IA de me fournir un planning détaillé mais clairement ça n'était possible de tout faire à la main, c'est pour ça que j'ai demandé de l'aide à l'IA pour le code mais également pour quand même me donner un emploi du temps pour savoir par quoi et comment commencer.

**Leçon apprise** : L'IA est un **outil d'accélération**, pas un remplacement de la réflexion. L'important est de comprendre ce qu'elle génère et de valider les choix techniques. Clairement créer les bons prompts c'est avéré plus difficile que je ne le pensais

---

## ⚡ Optimisations Appliquées

### 1. Modularité des Composants

J'ai essayé de décomposer au maximum les composants pour qu'ils soient réutilisables et testables individuellement. Vu que c'est un des points les plus intéressant avec React.

```typescript
// ✅ BON : Composants petits et réutilisables
<MonsterCard monster={monster} />
<XPBoostCard boost={boost} />
<QuestCard quest={quest} />

// ❌ ÉVITÉ : Gros composants monolithiques
<MegaDashboardWithEverything />
```

**Avantages** :
- ✅ Maintenance facilitée
- ✅ Tests plus simples
- ✅ Réutilisation dans différents contextes
- ✅ Bundles JS plus petits (code splitting)

### 2. Limitation des Dépendances

J'ai également éviter d'ajouter 40000 lib qui alourdiraient l'application. Il y a toujours moyen de faire sans.


### 3. Réutilisation des Composants Existants

Au lieu de créer un nouveau composants pour chaque fonctionnalité, j'ai essayé de réutiliser les composants déjà existants le plus possible comme c'est le cas avec le composant `Button` générique avec des variants.

```typescript
// Réutilisé partout dans l'app
<Button variant="primary" size="lg">Créer</Button>
<Button variant="outline" size="sm">Annuler</Button>
<Button variant="ghost">Détails</Button>
```

---

## 🚀 Améliorations Futures Possibles

Pour le moment tous les tests sont manuels. Je ne suis pas très à l'aise avec les tests automatisés, mais je reconnais leur importance. Et cela pourrait faire partie de mon apprentissage que de les intégrer dans le projet.
