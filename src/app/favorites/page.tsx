'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authHeader, clearToken, getToken } from '@/lib/session'

interface Book {
  id: string
  title: string
  thumbnail?: string
}

export default function FavoritesPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/auth/login')
      return
    }
    async function load() {
      const res = await fetch('/api/users/me', { headers: authHeader() })
      if (res.ok) {
        const data = await res.json()
        const ids: string[] = data.user.favorites || []
        const items = await Promise.all(
          ids.map(async (id: string) => {
            const r = await fetch(`/api/books/${id}`)
            if (!r.ok) return null
            return r.json()
          })
        )
        setBooks(items.filter(Boolean))
      } else if (res.status === 401) {
        clearToken()
        router.replace('/auth/login')
        return
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="p-6">Cargando…</div>

  return (
    <main className="max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mis favoritos</h1>
      {books.length === 0 ? (
        <p>No tenés libros favoritos.</p>
      ) : (
        <ul className="space-y-4">
          {books.map(b => (
            <li key={b.id} className="flex items-center gap-4">
              {b.thumbnail && (
                <img
                  src={b.thumbnail}
                  alt={b.title}
                  className="w-12 h-auto rounded shadow"
                />
              )}
              <Link href={`/book/${b.id}`} className="text-blue-600">
                {b.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}