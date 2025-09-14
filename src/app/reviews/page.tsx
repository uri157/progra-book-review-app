'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StarRating } from '@/components/StarRating'
import { authHeader, clearToken, getToken } from '@/lib/session'

interface Review {
  id: string
  bookId: string
  rating: number
  content: string
  createdAt: string
  book?: {
    title: string
    thumbnail?: string
  }
}

export default function MyReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editContent, setEditContent] = useState('')

  async function load() {
    const t = getToken()
    if (!t) { router.replace('/auth/login'); return }
    const res = await fetch('/api/users/me', { headers: authHeader(), cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const list: Review[] = await Promise.all(
        (data.user.reviews ?? []).map(async (r: any) => {
          let book
          try {
            const bRes = await fetch(`/api/books/${r.bookId}`)
            book = bRes.ok ? await bRes.json() : undefined
          } catch {}
          return {
            id: r._id || r.id,
            bookId: r.bookId,
            rating: r.rating,
            content: r.content,
            createdAt: r.createdAt,
            book,
          }
        })
      )
      setReviews(list)
    } else {
      clearToken()
      router.replace('/auth/login')
    }
  }

  useEffect(() => { load() }, [])

  function startEdit(r: Review) {
    setEditingId(r.id)
    setEditRating(r.rating)
    setEditContent(r.content)
  }

  async function saveEdit() {
    if (!editingId) return
    const res = await fetch(`/api/reviews/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ rating: editRating, content: editContent })
    })
    if (res.ok) {
      setEditingId(null)
      await load()
    }
  }

  async function deleteReview(id: string) {
    await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: authHeader() })
    await load()
  }

  return (
    <main className="max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mis reseñas</h1>
      {reviews.length === 0 && <p>No tenés reseñas.</p>}
      {reviews.map(r => (
        <div key={r.id} className="border rounded-xl p-4 space-y-2">
          <Link href={`/book/${r.bookId}`} className="flex items-center gap-2">
            {r.book?.thumbnail && (
              <img
                src={r.book.thumbnail}
                alt={r.book.title}
                className="w-12 h-16 object-cover"
              />
            )}
            <span className="font-semibold">{r.book?.title ?? 'Ver libro'}</span>
          </Link>
          {editingId === r.id ? (
            <>
              <StarRating value={editRating} onChange={setEditRating} />
              <textarea
                className="w-full border rounded p-2"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
              />
              <div className="flex gap-2 text-sm">
                <button onClick={saveEdit} className="px-2 py-1 bg-blue-600 text-white rounded">Guardar</button>
                <button onClick={() => setEditingId(null)} className="px-2 py-1 border rounded">Cancelar</button>
              </div>
            </>
          ) : (
            <>
              <div className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
              <p className="whitespace-pre-wrap">{r.content}</p>
              <div className="flex gap-2 text-sm">
                <button onClick={() => startEdit(r)} className="px-2 py-1 border rounded">Editar</button>
                <button onClick={() => deleteReview(r.id)} className="px-2 py-1 border rounded">Eliminar</button>
              </div>
            </>
          )}
        </div>
      ))}
    </main>
  )
}