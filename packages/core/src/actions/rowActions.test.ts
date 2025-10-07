import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createEditAction,
  createViewAction,
  createDeleteAction,
  createRowAction,
} from './rowActions'
import type { ResourceConfig } from '../resources/builder'
import { createRestDataProvider } from '../providers/rest'

interface TestModel {
  id: number
  name: string
}

describe('Row Actions', () => {
  const provider = createRestDataProvider({ baseUrl: 'http://localhost' })
  const config: ResourceConfig<TestModel> = {
    model: {
      name: 'Test',
      endpoint: '/api/tests',
      primaryKey: 'id',
    },
    provider,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createEditAction', () => {
    it('should create edit action with default values', () => {
      const action = createEditAction(config)

      expect(action.id).toBe('edit')
      expect(action.type).toBe('button')
      expect(action.label).toBe('Edit')
      expect(action.variant).toBe('ghost')
      expect(action.size).toBe('sm')
    })

    it('should accept custom label and icon', () => {
      const icon = 'icon'
      const action = createEditAction(config, {
        label: 'Update',
        icon,
      })

      expect(action.label).toBe('Update')
      expect(action.icon).toBe(icon)
    })

    it('should call onNavigate when provided', () => {
      const onNavigate = vi.fn()
      const action = createEditAction(config, { onNavigate })
      const record: TestModel = { id: 1, name: 'Test' }

      action.onClick(record)

      expect(onNavigate).toHaveBeenCalledWith(record)
    })

    it('should log default navigation when no onNavigate provided', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const action = createEditAction(config)
      const record: TestModel = { id: 1, name: 'Test' }

      action.onClick(record)

      expect(consoleSpy).toHaveBeenCalledWith('Navigate to edit page for Test 1')
      consoleSpy.mockRestore()
    })

    it('should handle undefined record', () => {
      const onNavigate = vi.fn()
      const action = createEditAction(config, { onNavigate })

      action.onClick(undefined)

      expect(onNavigate).not.toHaveBeenCalled()
    })
  })

  describe('createViewAction', () => {
    it('should create view action with default values', () => {
      const action = createViewAction(config)

      expect(action.id).toBe('view')
      expect(action.type).toBe('button')
      expect(action.label).toBe('View')
      expect(action.variant).toBe('ghost')
      expect(action.size).toBe('sm')
    })

    it('should accept custom label and icon', () => {
      const icon = 'icon'
      const action = createViewAction(config, {
        label: 'Show',
        icon,
      })

      expect(action.label).toBe('Show')
      expect(action.icon).toBe(icon)
    })

    it('should call onNavigate when provided', () => {
      const onNavigate = vi.fn()
      const action = createViewAction(config, { onNavigate })
      const record: TestModel = { id: 1, name: 'Test' }

      action.onClick(record)

      expect(onNavigate).toHaveBeenCalledWith(record)
    })

    it('should log default navigation when no onNavigate provided', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const action = createViewAction(config)
      const record: TestModel = { id: 1, name: 'Test' }

      action.onClick(record)

      expect(consoleSpy).toHaveBeenCalledWith('Navigate to view page for Test 1')
      consoleSpy.mockRestore()
    })
  })

  describe('createDeleteAction', () => {
    it('should create delete action with default values', () => {
      const action = createDeleteAction(config)

      expect(action.id).toBe('delete')
      expect(action.type).toBe('button')
      expect(action.label).toBe('Delete')
      expect(action.variant).toBe('ghost')
      expect(action.size).toBe('sm')
      expect(action.requiresConfirmation).toBe(true)
    })

    it('should generate confirmation config with record data', () => {
      const action = createDeleteAction(config)
      const record: TestModel = { id: 1, name: 'Test' }

      const confirmConfig =
        typeof action.confirmation === 'function'
          ? action.confirmation(record)
          : action.confirmation

      expect(confirmConfig).toMatchObject({
        title: 'Delete Record',
        message: expect.stringContaining('1'),
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      })
    })

    it('should use custom confirmation message', () => {
      const action = createDeleteAction(config, {
        confirmTitle: 'Custom Title',
        confirmMessage: 'Custom message',
      })
      const record: TestModel = { id: 1, name: 'Test' }

      const confirmConfig =
        typeof action.confirmation === 'function'
          ? action.confirmation(record)
          : action.confirmation

      expect(confirmConfig).toMatchObject({
        title: 'Custom Title',
        message: 'Custom message',
      })
    })

    it('should use dynamic confirmation message', () => {
      const action = createDeleteAction(config, {
        confirmMessage: (record) => `Delete ${record.name}?`,
      })
      const record: TestModel = { id: 1, name: 'Test' }

      const confirmConfig =
        typeof action.confirmation === 'function'
          ? action.confirmation(record)
          : action.confirmation

      expect(confirmConfig?.message).toBe('Delete Test?')
    })

    it('should delete record when executed', async () => {
      const deleteSpy = vi.spyOn(provider, 'delete').mockResolvedValue(undefined)
      const action = createDeleteAction(config)
      const record: TestModel = { id: 1, name: 'Test' }

      await action.onClick(record)

      expect(deleteSpy).toHaveBeenCalledWith('/api/tests', { id: 1 })
    })

    it('should call beforeDelete hook', async () => {
      const beforeDelete = vi.fn().mockResolvedValue(true)
      const configWithHooks = {
        ...config,
        hooks: { beforeDelete },
      }
      vi.spyOn(provider, 'delete').mockResolvedValue(undefined)
      const action = createDeleteAction(configWithHooks)
      const record: TestModel = { id: 1, name: 'Test' }

      await action.onClick(record)

      expect(beforeDelete).toHaveBeenCalledWith(record)
    })

    it('should cancel delete if beforeDelete returns false', async () => {
      const beforeDelete = vi.fn().mockResolvedValue(false)
      const configWithHooks = {
        ...config,
        hooks: { beforeDelete },
      }
      const deleteSpy = vi.spyOn(provider, 'delete').mockResolvedValue(undefined)
      const action = createDeleteAction(configWithHooks)
      const record: TestModel = { id: 1, name: 'Test' }

      await expect(action.onClick(record)).rejects.toThrow('Delete operation cancelled by hook')
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    it('should call afterDelete hook', async () => {
      const afterDelete = vi.fn()
      const configWithHooks = {
        ...config,
        hooks: { afterDelete },
      }
      vi.spyOn(provider, 'delete').mockResolvedValue(undefined)
      const action = createDeleteAction(configWithHooks)
      const record: TestModel = { id: 1, name: 'Test' }

      await action.onClick(record)

      expect(afterDelete).toHaveBeenCalledWith(1)
    })

    it('should handle undefined record', async () => {
      const deleteSpy = vi.spyOn(provider, 'delete').mockResolvedValue(undefined)
      const action = createDeleteAction(config)

      await action.onClick(undefined)

      expect(deleteSpy).not.toHaveBeenCalled()
    })

    it('should allow disabling confirmation', () => {
      const action = createDeleteAction(config, {
        requireConfirmation: false,
      })

      expect(action.requiresConfirmation).toBe(false)
    })
  })

  describe('createRowAction', () => {
    it('should create custom action with defaults', () => {
      const onClick = vi.fn()
      const action = createRowAction({
        id: 'custom',
        label: 'Custom',
        onClick,
      })

      expect(action.type).toBe('button')
      expect(action.id).toBe('custom')
      expect(action.label).toBe('Custom')
      expect(action.size).toBe('sm')
      expect(action.variant).toBe('ghost')
      expect(action.onClick).toBe(onClick)
    })

    it('should accept custom properties', () => {
      const onClick = vi.fn()
      const action = createRowAction({
        id: 'custom',
        label: 'Custom',
        onClick,
        variant: 'destructive',
        size: 'lg',
        disabled: true,
      })

      expect(action.variant).toBe('destructive')
      expect(action.size).toBe('lg')
      expect(action.disabled).toBe(true)
    })

    it('should accept visibility function', () => {
      const onClick = vi.fn()
      const visible = vi.fn().mockReturnValue(true)
      const action = createRowAction({
        id: 'custom',
        label: 'Custom',
        onClick,
        visible,
      })

      expect(action.visible).toBe(visible)
    })
  })
})
