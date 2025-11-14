import mongoose from 'mongoose'

const { Schema } = mongoose

const ownedBackgroundSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  monsterId: { type: Schema.Types.ObjectId, ref: 'Monster', required: false },
  itemId: { type: String, required: true }
}, {
  timestamps: true
})

ownedBackgroundSchema.index({ ownerId: 1, monsterId: 1, itemId: 1 }, { unique: true })

export default mongoose.models.OwnedBackground ?? mongoose.model('OwnedBackground', ownedBackgroundSchema)

