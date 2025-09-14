import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T
}

export function requireUser<T = any>(req: Request): T {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) throw new Error('auth required')
  try {
    return verifyToken<T>(token)
  } catch {
    throw new Error('invalid token')
  }
}