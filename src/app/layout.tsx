import './globals.css'
import type { Metadata } from 'next'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'App de Reseñas de Libros',
  description: 'Google Books + Reseñas + Votos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <NavBar />
        {children}
      </body>
    </html>
  )
}