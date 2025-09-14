import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { hashPassword, signToken } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
})

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json().catch(() => ({}))
  const { email, password, name } = schema.parse(body)
  const existing = await User.findOne({ email })
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
  }
  const hashed = await hashPassword(password)
  const user = await User.create({ email, password: hashed, name })
  const token = signToken({ id: user._id, email: user.email, name: user.name })
  return NextResponse.json({ token, user: { id: user._id, email: user.email, name: user.name } }, { status: 201 })
}