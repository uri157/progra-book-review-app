import { NextResponse } from 'next/server'
import { getBookById } from '@/lib/googleBooks'

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const book = await getBookById(params.id)
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(book) // ← devuelve TODO
}
