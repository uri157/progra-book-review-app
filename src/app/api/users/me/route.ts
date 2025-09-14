import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import Review from '@/models/Review'
import User from '@/models/User'

export interface IUser {
  _id: unknown
  __v: number
  email?: string
  name?: string
  favorites?: string[]
  // add other fields as needed
}

export async function GET(req: Request) {
  let user
  try {
    user = requireUser<{ id: string }>(req)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
  await connectDB()
  const u = await User.findById(user.id).lean() as IUser | null
  const reviews = await Review.find({ userId: user.id }).lean()
  return NextResponse.json({
    user: {
      id: u?._id,
      email: u?.email,
      name: u?.name,
      favorites: u?.favorites || [],
      reviews,
    },
  })
}