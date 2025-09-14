import { describe, it, expect } from 'vitest'
import { POST as createReview } from '../books/[id]/reviews/route'
import { PUT as updateReview, DELETE as removeReview } from './[id]/route'
import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import Review from '../../../models/Review'
import { hashPassword, signToken } from '../../../lib/auth'

const reqCtx = (id: string) => ({ params: Promise.resolve({ id }) })

describe('review routes', () => {
  it('allows owner to update and delete review', async () => {
    await connectDB()
    const user = await User.create({ email: 'a@a.com', password: await hashPassword('secret'), name: 'Alice' })
    const token = signToken({ id: user._id, email: user.email, name: user.name })

    const createReq = new Request('http://test', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating: 4, content: 'Great book indeed!!' }),
    })
    const createRes = await createReview(createReq, reqCtx('book1'))
    const created: any = await createRes.json()

    const updateReq = new Request('http://test', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating: 5, content: 'Updated content is wonderful and long enough' }),
    })
    const updateRes = await updateReview(updateReq, reqCtx(created._id))
    expect(updateRes.status).toBe(200)
    const updated: any = await updateRes.json()
    expect(updated.rating).toBe(5)

    const deleteReq = new Request('http://test', {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    })
    const deleteRes = await removeReview(deleteReq, reqCtx(created._id))
    expect(deleteRes.status).toBe(204)
    const remaining = await Review.findById(created._id)
    expect(remaining).toBeNull()
  })

  it('prevents non-owner from updating', async () => {
    await connectDB()
    const user1 = await User.create({ email: 'a1@a.com', password: await hashPassword('secret'), name: 'User1' })
    const token1 = signToken({ id: user1._id, email: user1.email, name: user1.name })
    const createRes = await createReview(
      new Request('http://test', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token1}` },
        body: JSON.stringify({ rating: 4, content: 'User1 review content is long enough to pass validation' }),
      }),
      reqCtx('book2')
    )
    const created: any = await createRes.json()

    const user2 = await User.create({ email: 'b@b.com', password: await hashPassword('secret'), name: 'Bob' })
    const token2 = signToken({ id: user2._id, email: user2.email, name: user2.name })

    const updateRes = await updateReview(
      new Request('http://test', {
        method: 'PUT',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token2}` },
        body: JSON.stringify({ rating: 5, content: 'Trying to modify another review which is also long enough' }),
      }),
      reqCtx(created._id)
    )
    expect(updateRes.status).toBe(403)
  })
})