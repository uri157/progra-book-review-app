import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, signToken, verifyToken, requireUser } from './auth'

describe('auth helpers', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('secret')
    expect(await verifyPassword('secret', hash)).toBe(true)
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })

  it('signs and verifies token', () => {
    const token = signToken({ id: '1', name: 'Alice' })
    const payload = verifyToken<{ id: string; name: string }>(token)
    expect(payload.name).toBe('Alice')
  })

    it('extracts user from request', () => {
    const token = signToken({ id: '1', name: 'Alice' })
    const req = new Request('http://test', {
      headers: { authorization: `Bearer ${token}` },
    })
    const user = requireUser<{ id: string; name: string }>(req)
    expect(user.id).toBe('1')
  })

  it('throws on missing token', () => {
    const req = new Request('http://test')
    expect(() => requireUser(req)).toThrow()
  })
})