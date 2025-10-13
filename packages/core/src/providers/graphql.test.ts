import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  GraphQLDataProvider,
  createGraphQLDataProvider,
  type GraphQLDataProviderConfig,
} from './graphql'
import { DataProviderError } from './types'

describe('GraphQLDataProvider', () => {
  let mockFetch: ReturnType<typeof vi.fn>
  let provider: GraphQLDataProvider
  let config: GraphQLDataProviderConfig

  beforeEach(() => {
    mockFetch = vi.fn()
    config = {
      endpoint: 'https://api.example.com/graphql',
      headers: {
        Authorization: 'Bearer token123',
      },
      fetchFn: mockFetch,
    }
  })

  describe('Construction', () => {
    it('should create provider with config', () => {
      provider = new GraphQLDataProvider(config)
      expect(provider).toBeInstanceOf(GraphQLDataProvider)
    })

    it('should create provider with factory function', () => {
      provider = createGraphQLDataProvider(config)
      expect(provider).toBeInstanceOf(GraphQLDataProvider)
    })

    it('should use default field mappings', () => {
      provider = new GraphQLDataProvider(config)
      expect(provider).toBeDefined()
    })

    it('should accept custom field mappings', () => {
      const customConfig = {
        ...config,
        fieldMappings: {
          id: '_id',
          data: 'items',
          total: 'count',
          pageInfo: 'pagination',
        },
      }
      provider = new GraphQLDataProvider(customConfig)
      expect(provider).toBeDefined()
    })
  })

  describe('getList', () => {
    beforeEach(() => {
      provider = new GraphQLDataProvider(config)
    })

    it('should fetch list of records', async () => {
      const mockData = {
        data: {
          users: {
            data: [
              { id: '1', name: 'Alice' },
              { id: '2', name: 'Bob' },
            ],
            total: 2,
            pageInfo: {
              page: 1,
              perPage: 10,
              pageCount: 1,
            },
          },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await provider.getList('user', {
        pagination: { page: 1, perPage: 10 },
      })

      expect(result.data).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ])
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
    })

    it('should send pagination params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { users: { data: [], total: 0, pageInfo: {} } },
        }),
      })

      await provider.getList('user', {
        pagination: { page: 2, perPage: 20 },
      })

      expect(mockFetch).toHaveBeenCalled()
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables).toEqual({
        page: 2,
        perPage: 20,
      })
    })

    it('should send cursor pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { users: { data: [], total: 0, pageInfo: {} } },
        }),
      })

      await provider.getList('user', {
        pagination: { cursor: 'abc123' },
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.cursor).toBe('abc123')
    })

    it('should send sort params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { users: { data: [], total: 0, pageInfo: {} } },
        }),
      })

      await provider.getList('user', {
        sort: { field: 'name', order: 'asc' },
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.orderBy).toEqual([{ name: 'ASC' }])
    })

    it('should send multiple sorts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { users: { data: [], total: 0, pageInfo: {} } },
        }),
      })

      await provider.getList('user', {
        sort: [
          { field: 'name', order: 'asc' },
          { field: 'email', order: 'desc' },
        ],
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.orderBy).toEqual([
        { name: 'ASC' },
        { email: 'DESC' },
      ])
    })

    it('should send filter params with eq operator', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { users: { data: [], total: 0, pageInfo: {} } },
        }),
      })

      await provider.getList('user', {
        filter: { field: 'status', operator: 'eq', value: 'active' },
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.where).toEqual({ status: 'active' })
    })

    it('should send filter params with contains operator', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { users: { data: [], total: 0, pageInfo: {} } },
        }),
      })

      await provider.getList('user', {
        filter: { field: 'name', operator: 'contains', value: 'alice' },
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.where).toEqual({ name_contains: 'alice' })
    })

    it('should send search params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { users: { data: [], total: 0, pageInfo: {} } },
        }),
      })

      await provider.getList('user', {
        search: 'john',
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.search).toBe('john')
    })

    it('should handle GraphQL errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [
            { message: 'Field "users" not found' },
          ],
        }),
      })

      await expect(
        provider.getList('user', {})
      ).rejects.toThrow(DataProviderError)
    })

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      })

      await expect(
        provider.getList('user', {})
      ).rejects.toThrow('HTTP 500: Internal Server Error')
    })
  })

  describe('getOne', () => {
    beforeEach(() => {
      provider = new GraphQLDataProvider(config)
    })

    it('should fetch single record', async () => {
      const mockData = {
        data: {
          user: { id: '1', name: 'Alice', email: 'alice@example.com' },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await provider.getOne('user', '1')

      expect(result).toEqual({ id: '1', name: 'Alice', email: 'alice@example.com' })
    })

    it('should send id variable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { user: { id: '1', name: 'Alice' } },
        }),
      })

      await provider.getOne('user', '1')

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.id).toBe('1')
    })
  })

  describe('create', () => {
    beforeEach(() => {
      provider = new GraphQLDataProvider(config)
    })

    it('should create a record', async () => {
      const mockData = {
        data: {
          createUser: { id: '3', name: 'Charlie', email: 'charlie@example.com' },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await provider.create('user', {
        data: { name: 'Charlie', email: 'charlie@example.com' },
      })

      expect(result).toEqual({ id: '3', name: 'Charlie', email: 'charlie@example.com' })
    })

    it('should send data variable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { createUser: { id: '3', name: 'Charlie' } },
        }),
      })

      await provider.create('user', {
        data: { name: 'Charlie', email: 'charlie@example.com' },
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.data).toEqual({
        name: 'Charlie',
        email: 'charlie@example.com',
      })
    })
  })

  describe('update', () => {
    beforeEach(() => {
      provider = new GraphQLDataProvider(config)
    })

    it('should update a record', async () => {
      const mockData = {
        data: {
          updateUser: { id: '1', name: 'Alice Updated', email: 'alice@example.com' },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await provider.update('user', {
        id: '1',
        data: { name: 'Alice Updated' },
      })

      expect(result).toEqual({ id: '1', name: 'Alice Updated', email: 'alice@example.com' })
    })

    it('should send id and data variables', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { updateUser: { id: '1', name: 'Alice Updated' } },
        }),
      })

      await provider.update('user', {
        id: '1',
        data: { name: 'Alice Updated' },
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables).toEqual({
        id: '1',
        data: { name: 'Alice Updated' },
      })
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      provider = new GraphQLDataProvider(config)
    })

    it('should delete a record', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { deleteUser: true },
        }),
      })

      await provider.delete('user', { id: '1' })

      expect(mockFetch).toHaveBeenCalled()
    })

    it('should send id variable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { deleteUser: true },
        }),
      })

      await provider.delete('user', { id: '1' })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.variables.id).toBe('1')
    })
  })

  describe('deleteMany', () => {
    beforeEach(() => {
      provider = new GraphQLDataProvider(config)
    })

    it('should delete multiple records with fallback', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { deleteUser: true } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { deleteUser: true } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { deleteUser: true } }),
        })

      await provider.deleteMany('user', { ids: ['1', '2', '3'] })

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should use custom deleteMany mutation if provided', async () => {
      const customConfig = {
        ...config,
        mutations: {
          deleteMany: () => `
            mutation DeleteMany($ids: [ID!]!) {
              deleteUserMany(ids: $ids)
            }
          `,
        },
      }

      provider = new GraphQLDataProvider(customConfig)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { deleteUserMany: true } }),
      })

      await provider.deleteMany('user', { ids: ['1', '2', '3'] })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateMany', () => {
    beforeEach(() => {
      provider = new GraphQLDataProvider(config)
    })

    it('should update multiple records with fallback', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { updateUser: { id: '1', status: 'active' } } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { updateUser: { id: '2', status: 'active' } } }),
        })

      const result = await provider.updateMany('user', {
        ids: ['1', '2'],
        data: { status: 'active' },
      })

      expect(result).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should use custom updateMany mutation if provided', async () => {
      const customConfig = {
        ...config,
        mutations: {
          updateMany: () => `
            mutation UpdateMany($ids: [ID!]!, $data: UserInput!) {
              updateUserMany(ids: $ids, data: $data) {
                id
                status
              }
            }
          `,
        },
      }

      provider = new GraphQLDataProvider(customConfig)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            updateUserMany: [
              { id: '1', status: 'active' },
              { id: '2', status: 'active' },
            ],
          },
        }),
      })

      const result = await provider.updateMany('user', {
        ids: ['1', '2'],
        data: { status: 'active' },
      })

      expect(result).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('custom', () => {
    beforeEach(() => {
      provider = new GraphQLDataProvider(config)
    })

    it('should throw error for custom operations without custom builders', async () => {
      await expect(
        provider.custom('user', 'customMethod', {})
      ).rejects.toThrow('Custom operations require custom query/mutation builders')
    })
  })

  describe('Custom query builders', () => {
    it('should use custom getList query builder', async () => {
      const customConfig = {
        ...config,
        queries: {
          getList: () => `
            query CustomGetList {
              allUsers {
                nodes {
                  id
                  name
                }
                totalCount
              }
            }
          `,
        },
        fieldMappings: {
          id: 'id',
          data: 'nodes',
          total: 'totalCount',
        },
      }

      provider = new GraphQLDataProvider(customConfig as any)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            users: {
              nodes: [{ id: '1', name: 'Alice' }],
              totalCount: 1,
            },
          },
        }),
      })

      const result = await provider.getList('user', {})

      expect(result.data).toEqual([{ id: '1', name: 'Alice' }])
      expect(result.total).toBe(1)
    })

    it('should use custom getOne query builder', async () => {
      const customConfig = {
        ...config,
        queries: {
          getOne: () => `
            query CustomGetOne($id: ID!) {
              userById(id: $id) {
                id
                name
              }
            }
          `,
        },
      }

      provider = new GraphQLDataProvider(customConfig as any)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: { id: '1', name: 'Alice' },
          },
        }),
      })

      const result = await provider.getOne('user', '1')

      expect(result).toEqual({ id: '1', name: 'Alice' })
    })
  })

  describe('Headers and authentication', () => {
    it('should send custom headers', async () => {
      provider = new GraphQLDataProvider(config)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { users: { data: [], total: 0, pageInfo: {} } },
        }),
      })

      await provider.getList('user', {})

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/graphql',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      )
    })
  })
})
