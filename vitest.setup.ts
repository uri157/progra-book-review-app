import '@testing-library/jest-dom'

import { vi } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo: MongoMemoryServer | null = null

vi.mock('./src/lib/db', () => {
  return {
    connectDB: async () => {
      if (!mongo) {
        mongo = await MongoMemoryServer.create()
        const uri = mongo.getUri()
        await mongoose.connect(uri)
      }
      return mongoose
    },
  }
})

afterAll(async () => {
  await mongoose.disconnect()
    if (mongo) await mongo.stop()
})
