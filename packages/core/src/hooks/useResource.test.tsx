import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useResourceList, useResourceOne, useResourceCreate, useResourceUpdate, useResourceDelete } from './useResource'
import type { ResourceConfig } from '../resources/builder'
import type { DataProvider } from '../providers/types'

interface TestModel {
  id: number
  name: string
  email: string
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useResource Hooks', () => {
  let mockProvider: DataProvider
  let resourceConfig: ResourceConfig<TestModel>

  beforeEach(() => {
    mockProvider = {
      getList: vi.fn().mockResolvedValue({
        data: [
          { id: 1, name: 'User 1', email: 'user1@test.com' },
          { id: 2, name: 'User 2', email: 'user2@test.com' },
        ],
        total: 2,
      }),
      getOne: vi.fn().mockResolvedValue({ id: 1, name: 'User 1', email: 'user1@test.com' }),
      create: vi.fn().mockImplementation((_, params) => Promise.resolve({ id: 3, ...params.data })),
      update: vi.fn().mockImplementation((_, params) => Promise.resolve({ id: 1, ...params.data })),
      delete: vi.fn().mockResolvedValue(undefined),
      deleteMany: vi.fn().mockResolvedValue(undefined),
      updateMany: vi.fn().mockResolvedValue(undefined),
    }

    resourceConfig = {
      model: {
        name: 'User',
        endpoint: '/users',
        primaryKey: 'id',
      },
      provider: mockProvider,
    }
  })

  describe('useResourceList', () => {
    it('should fetch list of records', async () => {
      const { result } = renderHook(() => useResourceList(resourceConfig), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockProvider.getList).toHaveBeenCalledWith('/users', {})
      expect(result.current.data?.data).toHaveLength(2)
      expect(result.current.data?.total).toBe(2)
    })

    it('should pass params to provider', async () => {
      const params = { pagination: { page: 1, perPage: 10 } }
      const { result } = renderHook(() => useResourceList(resourceConfig, params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockProvider.getList).toHaveBeenCalledWith('/users', params)
    })
  })

  describe('useResourceOne', () => {
    it('should fetch single record', async () => {
      const { result } = renderHook(() => useResourceOne(resourceConfig, 1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockProvider.getOne).toHaveBeenCalledWith('/users', 1)
      expect(result.current.data).toEqual({ id: 1, name: 'User 1', email: 'user1@test.com' })
    })

    it('should not fetch if id is undefined', () => {
      const { result } = renderHook(() => useResourceOne(resourceConfig, undefined), {
        wrapper: createWrapper(),
      })

      expect(result.current.isPending).toBe(true)
      expect(mockProvider.getOne).not.toHaveBeenCalled()
    })
  })

  describe('useResourceCreate', () => {
    it('should create a record', async () => {
      const { result } = renderHook(() => useResourceCreate(resourceConfig), {
        wrapper: createWrapper(),
      })

      const newUser = { name: 'New User', email: 'new@test.com' }
      result.current.mutate(newUser)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockProvider.create).toHaveBeenCalledWith('/users', { data: newUser })
      expect(result.current.data).toEqual({ id: 3, ...newUser })
    })

    it('should run beforeCreate hook', async () => {
      const beforeCreate = vi.fn().mockResolvedValue({ name: 'Modified', email: 'modified@test.com' })
      const configWithHook = {
        ...resourceConfig,
        hooks: { beforeCreate },
      }

      const { result } = renderHook(() => useResourceCreate(configWithHook), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ name: 'Original', email: 'original@test.com' })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(beforeCreate).toHaveBeenCalled()
      expect(mockProvider.create).toHaveBeenCalledWith('/users', { data: { name: 'Modified', email: 'modified@test.com' } })
    })

    it('should run afterCreate hook', async () => {
      const afterCreate = vi.fn()
      const configWithHook = {
        ...resourceConfig,
        hooks: { afterCreate },
      }

      const { result } = renderHook(() => useResourceCreate(configWithHook), {
        wrapper: createWrapper(),
      })

      const newUser = { name: 'New User', email: 'new@test.com' }
      result.current.mutate(newUser)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(afterCreate).toHaveBeenCalledWith({ id: 3, ...newUser })
    })
  })

  describe('useResourceUpdate', () => {
    it('should update a record', async () => {
      const { result } = renderHook(() => useResourceUpdate(resourceConfig), {
        wrapper: createWrapper(),
      })

      const updates = { id: 1, data: { name: 'Updated Name' } }
      result.current.mutate(updates)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockProvider.update).toHaveBeenCalledWith('/users', {
        id: 1,
        data: { name: 'Updated Name' },
      })
    })

    it('should run beforeUpdate hook', async () => {
      const beforeUpdate = vi.fn().mockResolvedValue({ name: 'Hook Modified' })
      const configWithHook = {
        ...resourceConfig,
        hooks: { beforeUpdate },
      }

      const { result } = renderHook(() => useResourceUpdate(configWithHook), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: 1, data: { name: 'Original' } })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(beforeUpdate).toHaveBeenCalled()
      expect(mockProvider.update).toHaveBeenCalledWith('/users', {
        id: 1,
        data: { name: 'Hook Modified' },
      })
    })
  })

  describe('useResourceDelete', () => {
    it('should delete a record', async () => {
      const { result } = renderHook(() => useResourceDelete(resourceConfig), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockProvider.delete).toHaveBeenCalledWith('/users', { id: 1 })
    })

    it('should run beforeDelete hook', async () => {
      const beforeDelete = vi.fn().mockResolvedValue(true)
      const configWithHook = {
        ...resourceConfig,
        hooks: { beforeDelete },
      }

      const { result } = renderHook(() => useResourceDelete(configWithHook), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(beforeDelete).toHaveBeenCalled()
      expect(mockProvider.delete).toHaveBeenCalled()
    })

    it('should cancel delete if beforeDelete returns false', async () => {
      const beforeDelete = vi.fn().mockResolvedValue(false)
      const configWithHook = {
        ...resourceConfig,
        hooks: { beforeDelete },
      }

      const { result } = renderHook(() => useResourceDelete(configWithHook), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(beforeDelete).toHaveBeenCalled()
      expect(mockProvider.delete).not.toHaveBeenCalled()
    })

    it('should run afterDelete hook', async () => {
      const afterDelete = vi.fn()
      const configWithHook = {
        ...resourceConfig,
        hooks: { afterDelete },
      }

      const { result } = renderHook(() => useResourceDelete(configWithHook), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(afterDelete).toHaveBeenCalledWith(1)
    })
  })
})
