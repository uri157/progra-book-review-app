'use client'
import { useState } from 'react'
import { StarRating } from './StarRating'
import { authHeader } from '@/lib/session'

export default function ReviewForm({ bookId, onCreated }: { bookId: string; onCreated?: ()=>void }) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
  const canSend = rating>=1 && content.trim().length>=10

  async function submit() {
    if (!canSend) return
    setLoading(true)
    const res = await fetch(`/api/books/${bookId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ rating, content })
    })
    setLoading(false)
    if (res.status === 401) {
      setError('Iniciá sesión para reseñar')
      return
    }
    if (res.ok) {
      setRating(0); setContent('')
      onCreated?.()
      setError('')
    }
  }

  return (
    <div className="space-y-2 p-4 border rounded-xl">
      <div className="font-semibold">Escribir reseña</div>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        className="w-full border rounded p-2 min-h-24"
        placeholder="Contá tu experiencia (mín. 10 caracteres)"
        value={content}
        onChange={e=>setContent(e.target.value)}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        onClick={submit}
        disabled={!canSend || loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >{loading? 'Enviando…' : 'Publicar'}</button>
    </div>
  )
}