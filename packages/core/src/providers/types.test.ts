import { describe, it, expect } from 'vitest'
import {
  DataProviderError,
  type DataProvider,
  type GetListParams,
  type GetListResult,
  type Sort,
  type Filter,
  type Pagination,
} from './types'
import type { BaseModel } from '../types'

describe('Data Provider Types', () => {
  interface User extends BaseModel {
    name: string
    email: string
  }

  describe('Sort', () => {
    it('should accept valid sort configuration', () => {
      const sort: Sort = {
        field: 'createdAt',
        order: 'desc',
      }

      expect(sort.field).toBe('createdAt')
      expect(sort.order).toBe('desc')
    })

    it('should accept asc order', () => {
      const sort: Sort = {
        field: 'name',
        order: 'asc',
      }

      expect(sort.order).toBe('asc')
    })
  })

  describe('Filter', () => {
    it('should accept equals filter', () => {
      const filter: Filter = {
        field: 'status',
        operator: 'eq',
        value: 'active',
      }

      expect(filter.operator).toBe('eq')
      expect(filter.value).toBe('active')
    })

    it('should accept in filter', () => {
      const filter: Filter = {
        field: 'role',
        operator: 'in',
        value: ['admin', 'user'],
      }

      expect(filter.operator).toBe('in')
      expect(Array.isArray(filter.value)).toBe(true)
    })

    it('should accept contains filter', () => {
      const filter: Filter = {
        field: 'email',
        operator: 'contains',
        value: '@example.com',
      }

      expect(filter.operator).toBe('contains')
    })

    it('should accept range filters', () => {
      const gtFilter: Filter = {
        field: 'age',
        operator: 'gt',
        value: 18,
      }

      const lteFilter: Filter = {
        field: 'price',
        operator: 'lte',
        value: 100,
      }

      expect(gtFilter.operator).toBe('gt')
      expect(lteFilter.operator).toBe('lte')
    })

    it('should accept null filters', () => {
      const nullFilter: Filter = {
        field: 'deletedAt',
        operator: 'null',
        value: null,
      }

      expect(nullFilter.operator).toBe('null')
    })
  })

  describe('Pagination', () => {
    it('should accept offset pagination', () => {
      const pagination: Pagination = {
        page: 2,
        perPage: 25,
      }

      expect(pagination.page).toBe(2)
      expect(pagination.perPage).toBe(25)
    })

    it('should accept cursor pagination', () => {
      const pagination: Pagination = {
        cursor: 'eyJpZCI6MTAwfQ',
      }

      expect(pagination.cursor).toBeDefined()
    })
  })

  describe('GetListParams', () => {
    it('should accept complete params', () => {
      const params: GetListParams = {
        pagination: {
          page: 1,
          perPage: 10,
        },
        sort: {
          field: 'createdAt',
          order: 'desc',
        },
        filter: {
          field: 'status',
          operator: 'eq',
          value: 'active',
        },
        search: 'john',
      }

      expect(params.pagination?.page).toBe(1)
      expect(params.search).toBe('john')
    })

    it('should accept multiple sorts', () => {
      const params: GetListParams = {
        sort: [
          { field: 'status', order: 'asc' },
          { field: 'createdAt', order: 'desc' },
        ],
      }

      expect(Array.isArray(params.sort)).toBe(true)
    })

    it('should accept multiple filters', () => {
      const params: GetListParams = {
        filter: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'role', operator: 'in', value: ['admin', 'user'] },
        ],
      }

      expect(Array.isArray(params.filter)).toBe(true)
    })
  })

  describe('GetListResult', () => {
    it('should accept result with offset pagination', () => {
      const result: GetListResult<User> = {
        data: [
          { id: 1, name: 'John', email: 'john@example.com' },
          { id: 2, name: 'Jane', email: 'jane@example.com' },
        ],
        total: 100,
        page: 1,
        perPage: 10,
        pageCount: 10,
      }

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(100)
      expect(result.pageCount).toBe(10)
    })

    it('should accept result with cursor pagination', () => {
      const result: GetListResult<User> = {
        data: [{ id: 1, name: 'John', email: 'john@example.com' }],
        total: 100,
        cursor: 'current_cursor',
        nextCursor: 'next_cursor',
        prevCursor: 'prev_cursor',
      }

      expect(result.cursor).toBe('current_cursor')
      expect(result.nextCursor).toBe('next_cursor')
    })

    it('should accept minimal result', () => {
      const result: GetListResult<User> = {
        data: [],
        total: 0,
      }

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('DataProvider interface', () => {
    it('should define all required methods', () => {
      const provider: DataProvider = {
        getList: async () => ({ data: [], total: 0 }),
        getOne: async () => ({ id: 1 }),
        create: async () => ({ id: 1 }),
        update: async () => ({ id: 1 }),
        delete: async () => {},
        deleteMany: async () => {},
        updateMany: async () => [],
      }

      expect(provider.getList).toBeDefined()
      expect(provider.getOne).toBeDefined()
      expect(provider.create).toBeDefined()
      expect(provider.update).toBeDefined()
      expect(provider.delete).toBeDefined()
      expect(provider.deleteMany).toBeDefined()
      expect(provider.updateMany).toBeDefined()
    })

    it('should support optional custom method', () => {
      const provider: DataProvider = {
        getList: async () => ({ data: [], total: 0 }),
        getOne: async () => ({ id: 1 }),
        create: async () => ({ id: 1 }),
        update: async () => ({ id: 1 }),
        delete: async () => {},
        deleteMany: async () => {},
        updateMany: async () => [],
        custom: async () => ({ success: true }),
      }

      expect(provider.custom).toBeDefined()
    })
  })

  describe('DataProviderError', () => {
    it('should create error with message', () => {
      const error = new DataProviderError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.name).toBe('DataProviderError')
    })

    it('should include status code', () => {
      const error = new DataProviderError('Not found', 404)

      expect(error.statusCode).toBe(404)
    })

    it('should include response data', () => {
      const errorResponse = { error: 'Invalid data' }
      const error = new DataProviderError('Bad request', 400, errorResponse)

      expect(error.statusCode).toBe(400)
      expect(error.response).toEqual(errorResponse)
    })

    it('should be instanceof Error', () => {
      const error = new DataProviderError('Test')

      expect(error instanceof Error).toBe(true)
      expect(error instanceof DataProviderError).toBe(true)
    })
  })
})
