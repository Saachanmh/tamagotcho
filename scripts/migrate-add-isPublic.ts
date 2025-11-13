/**
 * Script de migration pour ajouter le champ isPublic aux monstres existants
 *
 * Usage: npx ts-node scripts/migrate-add-isPublic.ts
 */

import mongoose from 'mongoose'
import Monster from '../src/db/models/monster.model'

const MONGODB_URI = process.env.MONGODB_URI ?? ''

async function migrateAddIsPublic (): Promise<void> {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connecté à MongoDB')

    // Trouver tous les monstres qui n'ont pas le champ isPublic
    console.log('🔍 Recherche des monstres sans champ isPublic...')
    const monstersWithoutIsPublic = await Monster.find({
      isPublic: { $exists: false }
    }).exec()

    console.log(`📊 Trouvé ${monstersWithoutIsPublic.length} monstre(s) à mettre à jour`)

    if (monstersWithoutIsPublic.length === 0) {
      console.log('✅ Tous les monstres ont déjà le champ isPublic')
      return
    }

    // Mettre à jour chaque monstre
    let updated = 0
    for (const monster of monstersWithoutIsPublic) {
      monster.isPublic = false
      monster.markModified('isPublic')
      await monster.save()
      updated++
      console.log(`✅ Mis à jour: ${monster.name} (${monster._id})`)
    }

    console.log(`\n🎉 Migration terminée! ${updated} monstre(s) mis à jour`)

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Connexion MongoDB fermée')
  }
}

// Exécution du script
if (require.main === module) {
  void migrateAddIsPublic()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default migrateAddIsPublic

