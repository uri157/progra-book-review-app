import { describe, it, expect } from 'vitest'
import { POST } from './[id]/vote/route'
import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import Review from '../../../models/Review'
import { hashPassword, signToken } from '../../../lib/auth'

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
const req = (value: 1 | -1, token?: string) => new Request('http://test', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify({ value }),
})

describe('review vote route', () => {
  it('handles new vote, change and removal', async () => {
    await connectDB()
    const user = await User.create({
      email: 'voter@a.com',
      password: await hashPassword('secret'),
      name: 'Voter',
    })
    const token = signToken({ id: user._id, email: user.email, name: user.name })
    const review = await Review.create({
      bookId: 'book1',
      userId: user._id,
      userName: user.name,
      rating: 4,
      content: 'This is a very nice and long enough review content',
    })

    const res1 = await POST(req(1, token), ctx(review._id.toString()))
    expect(res1.status).toBe(200)
    let data: any = await res1.json()
    expect(data.upVotes).toBe(1)
    expect(data.downVotes).toBe(0)

    const res2 = await POST(req(-1, token), ctx(review._id.toString()))
    expect(res2.status).toBe(200)
    data = await res2.json()
    expect(data.upVotes).toBe(0)
    expect(data.downVotes).toBe(1)

    const res3 = await POST(req(-1, token), ctx(review._id.toString()))
    expect(res3.status).toBe(200)
    data = await res3.json()
    expect(data.upVotes).toBe(0)
    expect(data.downVotes).toBe(0)
  })

  it('returns 401 without token', async () => {
    await connectDB()
    const review = await Review.create({
      bookId: 'book2',
      userId: '507f1f77bcf86cd799439011',
      userName: 'Author',
      rating: 3,
      content: 'Another long enough review content for testing',
    })
    const res = await POST(req(1), ctx(review._id.toString()))
    expect(res.status).toBe(401)
  })
})