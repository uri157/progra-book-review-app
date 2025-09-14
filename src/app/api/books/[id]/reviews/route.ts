import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import { verifyToken } from '@/lib/auth'
import { wilsonScore } from '@/lib/ranking'
import { SortOrder } from 'mongoose'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params
  await connectDB()
  const { searchParams } = new URL(req.url)
  const sort = (searchParams.get('sort') || 'best') as 'best' | 'new' | 'rating'
  const sortOpt: { [key: string]: SortOrder } =
  sort === 'new'
    ? { createdAt: -1 as SortOrder }
    : sort === 'rating'
    ? { rating: -1 as SortOrder }
    : { score: -1 as SortOrder }
  const items = await Review.find({ bookId: id }).sort(sortOpt).lean()
  return NextResponse.json({ items })
}

const schema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(10)
})


export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
await connectDB()
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return NextResponse.json({ error: 'auth required' }, { status: 401 })
  let user: any
  try {
    user = verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 })
  }
    const body = await req.json().catch(() => ({}))
  const { rating, content } = schema.parse(body)
  const review = await Review.create({
    bookId: id,
    userId: user.id,
    userName: user.name,
    rating,
    content,
    score: wilsonScore(0,0)
  })
  return NextResponse.json(review, { status: 201 })
}