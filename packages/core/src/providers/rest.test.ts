import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  RestDataProvider,
  createRestDataProvider,
  type RestDataProviderConfig,
} from './rest'
import { DataProviderError } from './types'
import type { BaseModel } from '../types'

describe('REST Data Provider', () => {
  interface User extends BaseModel {
    name: string
    email: string
    role: string
  }

  const mockFetch = vi.fn()
  global.fetch = mockFetch

  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createRestDataProvider', () => {
    it('should create a data provider instance', () => {
      const provider = createRestDataProvider({
        baseURL: 'https://api.example.com',
      })

      expect(provider).toBeDefined()
      expect(provider.getList).toBeDefined()
      expect(provider.getOne).toBeDefined()
    })
  })

  describe('getList', () => {
    it('should fetch list of records', async () => {
      const mockData = {
        data: [
          { id: 1, name: 'John', email: 'john@example.com', role: 'admin' },
          { id: 2, name: 'Jane', email: 'jane@example.com', role: 'user' },
        ],
        total: 2,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      const result = await provider.getList<User>('users', {})

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'GET',
        })
      )
    })

    it('should include pagination parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.getList('users', {
        pagination: {
          page: 2,
          perPage: 25,
        },
      })

      const callUrl = mockFetch.mock.calls[0][0]
      expect(callUrl).toContain('page=2')
      expect(callUrl).toContain('perPage=25')
    })

    it('should include sort parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.getList('users', {
        sort: {
          field: 'createdAt',
          order: 'desc',
        },
      })

      const callUrl = mockFetch.mock.calls[0][0]
      expect(callUrl).toContain('sortBy=createdAt')
      expect(callUrl).toContain('order=desc')
    })

    it('should include multiple sort parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.getList('users', {
        sort: [
          { field: 'role', order: 'asc' },
          { field: 'createdAt', order: 'desc' },
        ],
      })

      const callUrl = mockFetch.mock.calls[0][0]
      // URL encoding converts commas to %2C
      expect(callUrl).toContain('sortBy=role%2CcreatedAt')
      expect(callUrl).toContain('order=asc%2Cdesc')
    })

    it('should include filter parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.getList('users', {
        filter: {
          field: 'status',
          operator: 'eq',
          value: 'active',
        },
      })

      const callUrl = mockFetch.mock.calls[0][0]
      expect(callUrl).toContain('filter.status.eq=active')
    })

    it('should include search parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.getList('users', {
        search: 'john',
      })

      const callUrl = mockFetch.mock.calls[0][0]
      expect(callUrl).toContain('q=john')
    })

    it('should handle cursor pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.getList('users', {
        pagination: {
          cursor: 'eyJpZCI6MTAwfQ',
        },
      })

      const callUrl = mockFetch.mock.calls[0][0]
      expect(callUrl).toContain('cursor=eyJpZCI6MTAwfQ')
    })
  })

  describe('getOne', () => {
    it('should fetch a single record', async () => {
      const mockUser = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        role: 'admin',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      const result = await provider.getOne<User>('users', 1)

      expect(result.id).toBe(1)
      expect(result.name).toBe('John')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'GET',
        })
      )
    })

    it('should accept string IDs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'abc123' }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.getOne('users', 'abc123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/abc123'),
        expect.anything()
      )
    })
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const newUser = {
        name: 'Alice',
        email: 'alice@example.com',
        role: 'user',
      }

      const createdUser = { id: 3, ...newUser }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdUser,
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      const result = await provider.create<User>('users', { data: newUser })

      expect(result.id).toBe(3)
      expect(result.name).toBe('Alice')

      const callOptions = mockFetch.mock.calls[0][1]
      expect(callOptions.method).toBe('POST')
      const body = JSON.parse(callOptions.body)
      expect(body.name).toBe('Alice')
    })
  })

  describe('update', () => {
    it('should update an existing record', async () => {
      const updates = {
        name: 'John Updated',
      }

      const updatedUser = {
        id: 1,
        name: 'John Updated',
        email: 'john@example.com',
        role: 'admin',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedUser,
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      const result = await provider.update<User>('users', {
        id: 1,
        data: updates,
      })

      expect(result.name).toBe('John Updated')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })
  })

  describe('delete', () => {
    it('should delete a record', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.delete('users', { id: 1 })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('deleteMany', () => {
    it('should delete multiple records', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await provider.deleteMany('users', { ids: [1, 2, 3] })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/batch'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )

      const callOptions = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callOptions.body)
      expect(body.ids).toEqual([1, 2, 3])
    })
  })

  describe('updateMany', () => {
    it('should update multiple records', async () => {
      const mockResult = [
        { id: 1, name: 'User 1', email: 'user1@example.com', role: 'admin' },
        { id: 2, name: 'User 2', email: 'user2@example.com', role: 'admin' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      const result = await provider.updateMany<User>('users', {
        ids: [1, 2],
        data: { role: 'admin' },
      })

      expect(result).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/batch'),
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })
  })

  describe('custom', () => {
    it('should call custom method', async () => {
      const mockResponse = { success: true, message: 'Operation completed' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      const result = await provider.custom('users', 'export', {
        format: 'csv',
      })

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/export'),
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })

  describe('error handling', () => {
    it('should throw DataProviderError on HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      await expect(provider.getOne('users', 999)).rejects.toThrow(
        DataProviderError
      )
      await expect(provider.getOne('users', 999)).rejects.toThrow(
        'HTTP 404: Not Found'
      )
    })

    it('should include status code in error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
      })

      try {
        await provider.getOne('users', 1)
      } catch (error) {
        expect(error).toBeInstanceOf(DataProviderError)
        expect((error as DataProviderError).statusCode).toBe(500)
      }
    })
  })

  describe('configuration', () => {
    it('should use custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
        headers: {
          Authorization: 'Bearer token123',
        },
      })

      await provider.getList('users', {})

      const callOptions = mockFetch.mock.calls[0][1]
      expect(callOptions.headers.Authorization).toBe('Bearer token123')
    })

    it('should use custom parameter names', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })

      const provider = new RestDataProvider({
        baseURL: 'https://api.example.com',
        pagination: {
          pageParam: 'p',
          perPageParam: 'limit',
        },
        sort: {
          fieldParam: 'orderBy',
          orderParam: 'direction',
        },
        searchParam: 'search',
      })

      await provider.getList('users', {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'name', order: 'asc' },
        search: 'test',
      })

      const callUrl = mockFetch.mock.calls[0][0]
      expect(callUrl).toContain('p=1')
      expect(callUrl).toContain('limit=10')
      expect(callUrl).toContain('orderBy=name')
      expect(callUrl).toContain('direction=asc')
      expect(callUrl).toContain('search=test')
    })
  })
})
