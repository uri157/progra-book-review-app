import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { requireUser } from '@/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

const schema = z.object({ bookId: z.string() })

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params
  let user
  try { user = requireUser<{ id: string }>(req) } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
  if (user.id !== id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  await connectDB()
  const u = await User.findById(id).lean() as { favorites?: string[] } | null
  return NextResponse.json({ favorites: u?.favorites || [] })
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
  let user
  try { user = requireUser<{ id: string }>(req) } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
  if (user.id !== id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { bookId } = schema.parse(body)
  await connectDB()
  await User.findByIdAndUpdate(id, { $addToSet: { favorites: bookId } })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params
  let user
  try { user = requireUser<{ id: string }>(req) } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
  if (user.id !== id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { bookId } = schema.parse(body)
  await connectDB()
  await User.findByIdAndUpdate(id, { $pull: { favorites: bookId } })
  return NextResponse.json({ ok: true })
}