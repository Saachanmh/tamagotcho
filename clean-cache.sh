#!/bin/bash

echo "🧹 Nettoyage du projet Tamagotcho..."

# Arrêter tous les processus Node
echo "⏹️ Arrêt des processus Node.js..."
pkill -f "next dev" || true

# Nettoyer le cache Next.js
echo "🗑️ Suppression du cache Next.js..."
rm -rf .next

# Nettoyer le cache de node_modules
echo "🗑️ Suppression du cache node_modules..."
rm -rf node_modules/.cache

# Nettoyer le cache TypeScript
echo "🗑️ Suppression du cache TypeScript..."
rm -rf tsconfig.tsbuildinfo

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "🚀 Pour redémarrer le serveur :"
echo "   npm run dev"
echo ""

