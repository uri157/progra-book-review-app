import { describe, it, expect } from 'vitest'
import { POST } from './login/route'
import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { hashPassword } from '../../../lib/auth'

// helper to create request
const req = (body: any) => new Request('http://test', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

describe('login route', () => {
  it('logs in with valid credentials', async () => {
    await connectDB()
    await User.create({
      email: 'login@a.com',
      password: await hashPassword('secret'),
      name: 'Login User',
    })

    const res = await POST(req({ email: 'login@a.com', password: 'secret' }))
    expect(res.status).toBe(200)
    const data: any = await res.json()
    expect(data.token).toBeDefined()
    expect(data.user.email).toBe('login@a.com')
  })

  it('rejects invalid credentials', async () => {
    await connectDB()
    await User.create({
      email: 'wrong@a.com',
      password: await hashPassword('secret'),
      name: 'Wrong User',
    })

    const res = await POST(req({ email: 'wrong@a.com', password: 'badpass' }))
    expect(res.status).toBe(401)
  })
})