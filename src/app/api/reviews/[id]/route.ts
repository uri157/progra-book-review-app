import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import { requireUser } from '@/lib/auth'

const schema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(10),
})

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params
  await connectDB()
  const review = await Review.findById(id)
  if (!review) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(review)
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  let user
  try {
    user = requireUser<{ id: string }>(req)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
  await connectDB()
  const review = await Review.findById(id)
  if (!review) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (review.userId.toString() !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const { rating, content } = schema.parse(body)
  review.rating = rating
  review.content = content
  review.updatedAt = new Date()
  await review.save()
  return NextResponse.json(review)
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params
  let user
  try {
    user = requireUser<{ id: string }>(req)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
  await connectDB()
  const review = await Review.findById(id)
  if (!review) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (review.userId.toString() !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  await review.deleteOne()
  return new NextResponse(null, { status: 204 })
}