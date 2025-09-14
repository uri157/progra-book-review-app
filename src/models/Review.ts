import { Schema, model, models } from 'mongoose'

const reviewSchema = new Schema({
  bookId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  upVotes: { type: Number, default: 0 },
  downVotes: { type: Number, default: 0 },
  votes: { type: Map, of: Number, default: {} },
  score: { type: Number, default: 0 },
}, { timestamps: true })

export default models.Review || model('Review', reviewSchema)