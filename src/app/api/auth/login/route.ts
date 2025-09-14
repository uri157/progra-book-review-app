import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { verifyPassword, signToken } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json().catch(() => ({}))
  const { email, password } = schema.parse(body)
  const user = await User.findOne({ email })
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const ok = await verifyPassword(password, user.password)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const token = signToken({ id: user._id, email: user.email, name: user.name })
  return NextResponse.json({ token, user: { id: user._id, email: user.email, name: user.name } })
}