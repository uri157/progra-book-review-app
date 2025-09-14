// src/components/ReviewList.tsx
'use client'
import { useEffect, useState } from 'react'
import { authHeader, getToken } from '@/lib/session'
import { StarRating } from './StarRating'

type Review = {
  id: string
  userId: string,
  userName: string
  rating: number
  content: string
  upVotes: number
  downVotes: number
  score: number
  createdAt: string
}

export default function ReviewList({
  bookId,
  refreshKey = 0,
}: {
  bookId: string
  refreshKey?: number
}) {
  const [items, setItems] = useState<Review[]>([])
  const [sort, setSort] = useState<'best' | 'new' | 'rating'>('best')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editContent, setEditContent] = useState('')

  function parseToken() {
    const token = getToken()
    if (!token) return null
    try {
      return JSON.parse(atob(token.split('.')[1])).id as string
    } catch {
      return null
    }
  }

  async function load() {
    const res = await fetch(`/api/books/${bookId}/reviews?sort=${sort}`, {
      cache: 'no-store',
      headers: authHeader(),
    })
    if (res.status === 401) {
      setError('Iniciá sesión para ver las reseñas')
      setItems([])
      return
    }
    const data = await res.json()
    const list = (data.items ?? []).map((r: any) => ({
      id: r._id || r.id,
      userId: r.userId,
      userName: r.userName,
      rating: r.rating,
      content: r.content,
      upVotes: r.upVotes,
      downVotes: r.downVotes,
      score: r.score,
      createdAt: r.createdAt,
    }))
    setItems(list)
    setError('')
  }

  useEffect(() => { load() }, [sort, refreshKey])
  useEffect(() => {
    setUserId(parseToken())
    const handler = () => setUserId(parseToken())
    if (typeof window !== 'undefined') {
      window.addEventListener('token', handler)
    }
    return () => window.removeEventListener('token', handler)
  }, [])

  async function vote(id: string, value: 1 | -1) {
    const res = await fetch(`/api/reviews/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ value }),
    })

    if (res.status === 401) {
      setError('Iniciá sesión para votar')
      return
    }

    await load()
  }

  async function saveEdit() {
    if (!editingId) return
    const res = await fetch(`/api/reviews/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ rating: editRating, content: editContent }),
    })
    if (res.status === 401) {
      setError('Iniciá sesión para editar')
      return
    }
    if (res.ok) {
      setEditingId(null)
      await load()
    }
  }

  async function deleteReview(id: string) {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    })
    if (res.status === 401) {
      setError('Iniciá sesión para eliminar')
      return
    }
    await load()
  }

  return (
    <div className="space-y-3">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Ordenar:</span>
        <select value={sort} onChange={e=>setSort(e.target.value as any)} className="border rounded p-1">
          <option value="best">Mejores</option>
          <option value="new">Más nuevas</option>
          <option value="rating">Mayor rating</option>
        </select>
      </div>

      {items.length === 0 && <div className="text-gray-500">Sé el primero en reseñar ✍️</div>}

      {items.map(r => (
        <div key={r.id} className="border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">{r.userName}</div>
            <div className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
          </div>
          
          {editingId === r.id ? (
            <div className="mt-2 space-y-2">
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
            </div>
          ) : (
            <>
              <p className="mt-2 whitespace-pre-wrap">{r.content}</p>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <button onClick={()=>vote(r.id, 1)} className="px-2 py-1 rounded border">👍 {r.upVotes}</button>
                <button onClick={()=>vote(r.id, -1)} className="px-2 py-1 rounded border">👎 {r.downVotes}</button>
                <span className="text-gray-500">Score: {r.score.toFixed(3)}</span>
                <span className="text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              {r.userId === userId && (
                <div className="mt-2 flex gap-2 text-sm">
                  <button onClick={() => { setEditingId(r.id); setEditRating(r.rating); setEditContent(r.content) }} className="px-2 py-1 border rounded">Editar</button>
                  <button onClick={() => deleteReview(r.id)} className="px-2 py-1 border rounded">Eliminar</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}