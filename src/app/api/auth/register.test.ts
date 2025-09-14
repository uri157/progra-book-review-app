import { describe, it, expect } from 'vitest'
import { POST } from './register/route'
import { connectDB } from '../../../lib/db'

const req = (body: any) => new Request('http://test', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

describe('register route', () => {
  it('registers a new user', async () => {
    await connectDB()
    const res = await POST(req({ email: 'reg@a.com', password: 'secret123', name: 'Reg' }))
    expect(res.status).toBe(201)
    const data: any = await res.json()
    expect(data.token).toBeDefined()
    expect(data.user.email).toBe('reg@a.com')
  })

  it('rejects duplicate email', async () => {
    await connectDB()
    await POST(req({ email: 'dup@a.com', password: 'secret123', name: 'Dup' }))
    const res = await POST(req({ email: 'dup@a.com', password: 'secret123', name: 'Dup2' }))
    expect(res.status).toBe(400)
  })
})