'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setToken } from '@/lib/session'


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error al iniciar sesión')
      return
    }
    setToken (data.token)
    router.push('/profile')
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          className="w-full border px-3 py-2 rounded"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Entrar</button>
      </form>
    </main>
  )
}
