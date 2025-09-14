"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { authHeader, clearToken, getToken } from '@/lib/session'
import { useRouter } from 'next/navigation'

export default function NavBar() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    async function verify() {
      const t = getToken()
      if (!t) {
        setToken(null)
        return
      }
      const res = await fetch('/api/users/me', { headers: authHeader() })
      if (res.ok) {
        setToken(t)
      } else {
        clearToken()
        setToken(null)
      }
    }
    verify()
    window.addEventListener('token', verify)
    return () => window.removeEventListener('token', verify)
  }, [])

  return (
    <nav className="bg-white border-b">
      <div className="max-w-3xl mx-auto p-4 flex items-center justify-between">
        <div className="flex gap-4">
          <Link href="/">Inicio</Link>
          <Link href="/favorites">Favoritos</Link>
          {token && <Link href="/reviews">Mis reseñas</Link>}
          {token && <Link href="/profile">Perfil</Link>}
        </div>
        <div className="flex gap-4">
          {token ? (
            <button
              onClick={() => {
                clearToken()
                setToken(null)
                router.push('/')
              }}
              className="text-red-600"
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link href="/auth/login">Iniciar sesión</Link>
              <Link href="/auth/register">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}