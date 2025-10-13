/**
 * Mock Service Worker Server Setup
 * For mocking API requests in integration tests
 */

import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock data
export const mockUsers = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', status: 'active' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive' },
]

export const mockPosts = [
  { id: '1', title: 'First Post', content: 'Hello world', userId: '1' },
  { id: '2', title: 'Second Post', content: 'Another post', userId: '1' },
  { id: '3', title: 'Third Post', content: 'Yet another', userId: '2' },
]

// API handlers
export const handlers = [
  // Users endpoints
  http.get('https://api.example.com/users', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('perPage') || url.searchParams.get('limit') || '10')

    return HttpResponse.json({
      data: mockUsers,
      total: mockUsers.length,
      page,
      perPage,
      pageCount: Math.ceil(mockUsers.length / perPage),
    })
  }),

  http.get('https://api.example.com/users/:id', ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id)
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(user)
  }),

  http.post('https://api.example.com/users', async ({ request }) => {
    const body = await request.json() as any
    const newUser = {
      id: String(mockUsers.length + 1),
      ...body,
    }
    mockUsers.push(newUser)
    return HttpResponse.json(newUser, { status: 201 })
  }),

  http.put('https://api.example.com/users/:id', async ({ params, request }) => {
    const body = await request.json() as any
    const index = mockUsers.findIndex((u) => u.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    mockUsers[index] = { ...mockUsers[index], ...body }
    return HttpResponse.json(mockUsers[index])
  }),

  http.delete('https://api.example.com/users/:id', ({ params }) => {
    const index = mockUsers.findIndex((u) => u.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    mockUsers.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Posts endpoints
  http.get('https://api.example.com/posts', () => {
    return HttpResponse.json({
      data: mockPosts,
      total: mockPosts.length,
      page: 1,
      perPage: 10,
      pageCount: 1,
    })
  }),

  http.get('https://api.example.com/posts/:id', ({ params }) => {
    const post = mockPosts.find((p) => p.id === params.id)
    if (!post) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(post)
  }),

  http.post('https://api.example.com/posts', async ({ request }) => {
    const body = await request.json() as any
    const newPost = {
      id: String(mockPosts.length + 1),
      ...body,
    }
    mockPosts.push(newPost)
    return HttpResponse.json(newPost, { status: 201 })
  }),

  // GraphQL endpoint
  http.post('https://api.example.com/graphql', async ({ request }) => {
    const body = await request.json() as any
    const { query } = body

    if (query.includes('users')) {
      return HttpResponse.json({
        data: {
          users: {
            data: mockUsers,
            total: mockUsers.length,
            pageInfo: {
              page: 1,
              perPage: 10,
              pageCount: 1,
            },
          },
        },
      })
    }

    return HttpResponse.json({
      errors: [{ message: 'Query not recognized' }],
    })
  }),
]

// Create server instance
export const server = setupServer(...handlers)

// Helper to reset mock data
export function resetMockData() {
  mockUsers.length = 0
  mockUsers.push(
    { id: '1', name: 'Alice Smith', email: 'alice@example.com', status: 'active' },
    { id: '2', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive' }
  )

  mockPosts.length = 0
  mockPosts.push(
    { id: '1', title: 'First Post', content: 'Hello world', userId: '1' },
    { id: '2', title: 'Second Post', content: 'Another post', userId: '1' },
    { id: '3', title: 'Third Post', content: 'Yet another', userId: '2' }
  )
}
