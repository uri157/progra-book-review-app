import { describe, expect, it, vi } from 'vitest'
import { searchBooks, getBookById } from './googleBooks'

const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('googleBooks api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('searchBooks maps results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          { id: '1', volumeInfo: { title: 't', authors: ['a'], categories: ['c'], imageLinks: { thumbnail: 'img' }, pageCount: 10 } },
        ],
      }),
    })
    const res = await searchBooks('harry')
    expect(mockFetch).toHaveBeenCalled()
    expect(res[0]).toMatchObject({ id: '1', title: 't', authors: ['a'], categories: ['c'] })
  })

  it('searchBooks throws on error status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    await expect(searchBooks('x')).rejects.toThrow('Google Books error: 500')
  })

  it('getBookById returns null on non-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    expect(await getBookById('1')).toBeNull()
  })

  it('getBookById maps volume info', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'a', volumeInfo: { title: 'T', authors: ['A'], imageLinks: { thumbnail: 'x' } } }),
    })
    const book = await getBookById('a')
    expect(book).toMatchObject({ id: 'a', title: 'T', authors: ['A'], categories: [], thumbnail: 'x' })
  })

  it('includes API key when configured', async () => {
    const oldKey = process.env.GOOGLE_BOOKS_API_KEY
    process.env.GOOGLE_BOOKS_API_KEY = 'test-key'
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
    await searchBooks('foo')
    expect(mockFetch.mock.calls[0][0]).toContain('&key=test-key')
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1', volumeInfo: {} }) })
    await getBookById('1')
    expect(mockFetch.mock.calls[1][0]).toContain('?key=test-key')
    process.env.GOOGLE_BOOKS_API_KEY = oldKey
  })

  it('omits API key when not configured', async () => {
    const oldKey = process.env.GOOGLE_BOOKS_API_KEY
    delete process.env.GOOGLE_BOOKS_API_KEY
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
    await searchBooks('bar')
    expect(mockFetch.mock.calls[0][0]).not.toContain('key=')
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: '2', volumeInfo: {} }) })
    await getBookById('2')
    expect(mockFetch.mock.calls[1][0]).not.toContain('key=')
    process.env.GOOGLE_BOOKS_API_KEY = oldKey
  })
})

