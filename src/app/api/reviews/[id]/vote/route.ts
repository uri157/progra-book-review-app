import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import { verifyToken } from '@/lib/auth'
import { wilsonScore } from '@/lib/ranking'

type Ctx = { params: Promise<{ id: string }> }

const schema = z.object({ value: z.union([z.literal(1), z.literal(-1)]) })

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
  const { value } = schema.parse(body)
  const review = await Review.findById(id)
  if (!review) return NextResponse.json({ error: 'review not found' }, { status: 404 })
  const prev = review.votes.get(user.id)
  if (prev === value) {
    review.votes.delete(user.id)
    if (value === 1) review.upVotes -= 1; else review.downVotes -= 1
  } else if (prev && prev !== value) {
    review.votes.set(user.id, value)
    if (value === 1) { review.upVotes += 1; review.downVotes -= 1 }
    else { review.downVotes += 1; review.upVotes -= 1 }
  } else {
    review.votes.set(user.id, value)
    if (value === 1) review.upVotes += 1; else review.downVotes += 1
  }
  review.score = wilsonScore(review.upVotes, review.downVotes)
  review.updatedAt = new Date()
  await review.save()
  return NextResponse.json(review)
}
