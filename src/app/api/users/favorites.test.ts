import { describe, it, expect } from 'vitest'
import { POST, DELETE, GET } from './[id]/favorites/route'
import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { hashPassword, signToken } from '../../../lib/auth'
import { IUser } from './me/route'

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

describe('favorites route', () => {
  it('adds and removes favorites for owner', async () => {
    await connectDB()
    const user = await User.create({ email: 'fav@a.com', password: await hashPassword('secret'), name: 'Fav' })
    const token = signToken({ id: user._id, email: user.email, name: user.name })

    const addRes = await POST(
      new Request('http://test', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId: 'book123' }),
      }),
      ctx(user._id.toString())
    )
    expect(addRes.status).toBe(200)
    let doc = await User.findById(user._id).lean() as IUser | null
    expect(doc?.favorites).toContain('book123')

    const delRes = await DELETE(
      new Request('http://test', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId: 'book123' }),
      }),
      ctx(user._id.toString())
    )
    expect(delRes.status).toBe(200)
    doc = await User.findById(user._id).lean() as IUser | null
    expect(doc?.favorites).not.toContain('book123')

    const getRes = await GET(
      new Request('http://test', { headers: { authorization: `Bearer ${token}` } }),
      ctx(user._id.toString())
    )
    const data: any = await getRes.json()
    expect(data.favorites).toEqual([])
  })
})