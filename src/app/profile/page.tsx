'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authHeader, clearToken, getToken } from '@/lib/session'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null)

  useEffect(() => {
    async function load() {
      const t = getToken()
      if (!t) {
        router.replace('/auth/login')
        return
      }
      const res = await fetch('/api/users/me', { headers: authHeader() })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        clearToken()
        router.replace('/auth/login')
      }
    }
    load()
  }, [router])

  if (!user) return <div className="p-6">Redirigiendo…</div>

  return (
    <main className="max-w-md p-6 space-y-4 ml-4">
      <h1 className="text-2xl font-bold">Perfil</h1>
      {user.name && <p>Nombre: {user.name}</p>}
      {user.email && <p>Email: {user.email}</p>}
    </main>
  )
}
