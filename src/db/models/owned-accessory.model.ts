// filepath: c:\Users\chloe\Documents\MDS\M1\tamagotcho\src\db\models\owned-accessory.model.ts
import mongoose from 'mongoose'

const { Schema } = mongoose

const ownedAccessorySchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  monsterId: { type: Schema.Types.ObjectId, ref: 'Monster', required: false },
  itemId: { type: String, required: true }
}, {
  timestamps: true
})

ownedAccessorySchema.index({ ownerId: 1, monsterId: 1, itemId: 1 }, { unique: true })

export default mongoose.models.OwnedAccessory ?? mongoose.model('OwnedAccessory', ownedAccessorySchema)

