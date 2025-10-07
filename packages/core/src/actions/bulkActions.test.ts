import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBulkDeleteAction, createBulkExportAction, createBulkAction } from './bulkActions'
import type { ResourceConfig } from '../resources/builder'
import type { DataProvider } from '../providers/types'

interface TestModel {
  id: number
  name: string
  email: string
}

describe('Bulk Actions Helpers', () => {
  let mockProvider: DataProvider
  let resourceConfig: ResourceConfig<TestModel>

  beforeEach(() => {
    mockProvider = {
      getList: vi.fn(),
      getOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue(undefined),
      updateMany: vi.fn(),
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

  describe('createBulkDeleteAction', () => {
    it('should create a bulk delete action with default options', () => {
      const action = createBulkDeleteAction(resourceConfig)

      expect(action.label).toBe('Delete Selected')
      expect(action.destructive).toBe(true)
      expect(action.requireConfirmation).toBe(true)
      expect(action.confirmTitle).toBe('Delete Records')
      expect(action.handler).toBeDefined()
    })

    it('should allow custom options', () => {
      const action = createBulkDeleteAction(resourceConfig, {
        label: 'Remove Items',
        confirmTitle: 'Remove Confirmation',
        confirmMessage: 'Custom message',
        requireConfirmation: false,
      })

      expect(action.label).toBe('Remove Items')
      expect(action.confirmTitle).toBe('Remove Confirmation')
      expect(action.confirmMessage).toBe('Custom message')
      expect(action.requireConfirmation).toBe(false)
    })

    it('should delete multiple records', async () => {
      const action = createBulkDeleteAction(resourceConfig)
      const records: TestModel[] = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' },
      ]

      await action.handler!(records)

      expect(mockProvider.deleteMany).toHaveBeenCalledWith('/users', {
        filter: {
          id: { in: [1, 2] },
        },
      })
    })

    it('should run beforeDelete hook for each record', async () => {
      const beforeDelete = vi.fn().mockResolvedValue(true)
      const configWithHook: ResourceConfig<TestModel> = {
        ...resourceConfig,
        hooks: { beforeDelete },
      }

      const action = createBulkDeleteAction(configWithHook)
      const records: TestModel[] = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' },
      ]

      await action.handler!(records)

      expect(beforeDelete).toHaveBeenCalledTimes(2)
      expect(beforeDelete).toHaveBeenCalledWith(records[0])
      expect(beforeDelete).toHaveBeenCalledWith(records[1])
    })

    it('should throw error if beforeDelete returns false', async () => {
      const beforeDelete = vi.fn().mockResolvedValue(false)
      const configWithHook: ResourceConfig<TestModel> = {
        ...resourceConfig,
        hooks: { beforeDelete },
      }

      const action = createBulkDeleteAction(configWithHook)
      const records: TestModel[] = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
      ]

      await expect(action.handler!(records)).rejects.toThrow('Delete operation cancelled by hook')
    })

    it('should run afterDelete hook for each record', async () => {
      const afterDelete = vi.fn()
      const configWithHook: ResourceConfig<TestModel> = {
        ...resourceConfig,
        hooks: { afterDelete },
      }

      const action = createBulkDeleteAction(configWithHook)
      const records: TestModel[] = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' },
      ]

      await action.handler!(records)

      expect(afterDelete).toHaveBeenCalledTimes(2)
      expect(afterDelete).toHaveBeenCalledWith(1)
      expect(afterDelete).toHaveBeenCalledWith(2)
    })

    it('should use custom primary key', async () => {
      const customConfig: ResourceConfig<TestModel> = {
        ...resourceConfig,
        model: {
          ...resourceConfig.model,
          primaryKey: 'email',
        },
      }

      const action = createBulkDeleteAction(customConfig)
      const records: TestModel[] = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
      ]

      await action.handler!(records)

      expect(mockProvider.deleteMany).toHaveBeenCalledWith('/users', {
        filter: {
          email: { in: ['user1@test.com'] },
        },
      })
    })
  })

  describe('createBulkExportAction', () => {
    it('should create CSV export action', () => {
      const action = createBulkExportAction<TestModel>('csv')

      expect(action.label).toBe('Export as CSV')
      expect(action.handler).toBeDefined()
    })

    it('should create JSON export action', () => {
      const action = createBulkExportAction<TestModel>('json', {
        label: 'Download JSON',
      })

      expect(action.label).toBe('Download JSON')
    })

    it('should export records as CSV', async () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()

      // Create a real link element and spy on it
      const mockClick = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          const link = originalCreateElement('a')
          link.click = mockClick
          return link
        }
        return originalCreateElement(tagName as any)
      })

      const action = createBulkExportAction<TestModel>('csv')
      const records: TestModel[] = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' },
      ]

      await action.handler!(records)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()

      createElementSpy.mockRestore()
    })

    it('should export records as JSON', async () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()

      // Create a real link element and spy on it
      const mockClick = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          const link = originalCreateElement('a')
          link.click = mockClick
          return link
        }
        return originalCreateElement(tagName as any)
      })

      const action = createBulkExportAction<TestModel>('json')
      const records: TestModel[] = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
      ]

      await action.handler!(records)

      expect(mockClick).toHaveBeenCalled()

      createElementSpy.mockRestore()
    })
  })

  describe('createBulkAction', () => {
    it('should create a custom bulk action', () => {
      const handler = vi.fn().mockResolvedValue(undefined)
      const action = createBulkAction('Archive', handler)

      expect(action.label).toBe('Archive')
      expect(action.handler).toBe(handler)
    })

    it('should support options', () => {
      const handler = vi.fn().mockResolvedValue(undefined)
      const action = createBulkAction('Delete', handler, {
        destructive: true,
        requireConfirmation: true,
        confirmTitle: 'Delete Confirmation',
        confirmMessage: 'Are you sure?',
      })

      expect(action.destructive).toBe(true)
      expect(action.requireConfirmation).toBe(true)
      expect(action.confirmTitle).toBe('Delete Confirmation')
      expect(action.confirmMessage).toBe('Are you sure?')
    })

    it('should execute handler with records', async () => {
      const handler = vi.fn().mockResolvedValue(undefined)
      const action = createBulkAction('Process', handler)
      const records: TestModel[] = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
      ]

      await action.handler!(records)

      expect(handler).toHaveBeenCalledWith(records)
    })
  })
})
