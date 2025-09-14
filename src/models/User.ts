import { Schema, model, models } from 'mongoose'

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  favorites: [{ type: String }],
}, { timestamps: true })

export default models.User || model('User', userSchema)