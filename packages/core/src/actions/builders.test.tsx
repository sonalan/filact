import { describe, it, expect, vi } from 'vitest'
import { ButtonAction, LinkAction, ActionGroup, BulkAction, ActionSeparator } from './builders'

describe('Action Builders', () => {
  describe('ButtonAction', () => {
    it('should create button action', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick).build()

      expect(action.type).toBe('button')
      expect(action.id).toBe('edit')
      expect(action.label).toBe('Edit')
      expect(action.onClick).toBe(onClick)
    })

    it('should set icon', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick).icon('<EditIcon />').build()

      expect(action.icon).toBe('<EditIcon />')
    })

    it('should set variant', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('delete', 'Delete', onClick).variant('destructive').build()

      expect(action.variant).toBe('destructive')
    })

    it('should set size', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick).size('sm').build()

      expect(action.size).toBe('sm')
    })

    it('should set color', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('custom', 'Custom', onClick).color('blue').build()

      expect(action.color).toBe('blue')
    })

    it('should set tooltip', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick)
        .tooltip('Edit this record')
        .build()

      expect(action.tooltip).toBe('Edit this record')
    })

    it('should set visible with boolean', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick).visible(false).build()

      expect(action.visible).toBe(false)
    })

    it('should set visible with function', () => {
      const onClick = vi.fn()
      const visibleFn = (record: any) => record.canEdit
      const action = ButtonAction.make('edit', 'Edit', onClick).visible(visibleFn).build()

      expect(action.visible).toBe(visibleFn)
    })

    it('should set disabled with boolean', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick).disabled(true).build()

      expect(action.disabled).toBe(true)
    })

    it('should set disabled with function', () => {
      const onClick = vi.fn()
      const disabledFn = (record: any) => !record.canEdit
      const action = ButtonAction.make('edit', 'Edit', onClick).disabled(disabledFn).build()

      expect(action.disabled).toBe(disabledFn)
    })

    it('should set confirmation', () => {
      const onClick = vi.fn()
      const confirmation = {
        title: 'Confirm Delete',
        message: 'Are you sure?',
        variant: 'destructive' as const,
      }
      const action = ButtonAction.make('delete', 'Delete', onClick)
        .confirmation(confirmation)
        .build()

      expect(action.confirmation).toEqual(confirmation)
      expect(action.requiresConfirmation).toBe(true)
    })

    it('should set confirmation with function', () => {
      const onClick = vi.fn()
      const confirmationFn = (record: any) => ({
        title: 'Delete',
        message: `Delete ${record.name}?`,
      })
      const action = ButtonAction.make('delete', 'Delete', onClick)
        .confirmation(confirmationFn)
        .build()

      expect(action.confirmation).toBe(confirmationFn)
      expect(action.requiresConfirmation).toBe(true)
    })

    it('should set requires confirmation', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('delete', 'Delete', onClick)
        .requiresConfirmation()
        .build()

      expect(action.requiresConfirmation).toBe(true)
    })

    it('should set modal', () => {
      const onClick = vi.fn()
      const modal = {
        title: 'Edit User',
        size: 'md' as const,
        fields: [],
      }
      const action = ButtonAction.make('edit', 'Edit', onClick).modal(modal).build()

      expect(action.modal).toEqual(modal)
    })

    it('should set shortcut', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick).shortcut('Ctrl+E').build()

      expect(action.shortcut).toBe('Ctrl+E')
    })

    it('should set className', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick).className('custom-class').build()

      expect(action.className).toBe('custom-class')
    })

    it('should set show loading', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('save', 'Save', onClick).showLoading().build()

      expect(action.showLoading).toBe(true)
    })

    it('should chain methods', () => {
      const onClick = vi.fn()
      const action = ButtonAction.make('edit', 'Edit', onClick)
        .icon('<EditIcon />')
        .variant('default')
        .size('md')
        .tooltip('Edit record')
        .visible(true)
        .disabled(false)
        .shortcut('Ctrl+E')
        .className('edit-btn')
        .showLoading(true)
        .build()

      expect(action.type).toBe('button')
      expect(action.id).toBe('edit')
      expect(action.label).toBe('Edit')
      expect(action.icon).toBe('<EditIcon />')
      expect(action.variant).toBe('default')
      expect(action.size).toBe('md')
      expect(action.tooltip).toBe('Edit record')
      expect(action.visible).toBe(true)
      expect(action.disabled).toBe(false)
      expect(action.shortcut).toBe('Ctrl+E')
      expect(action.className).toBe('edit-btn')
      expect(action.showLoading).toBe(true)
    })
  })

  describe('LinkAction', () => {
    it('should create link action', () => {
      const action = LinkAction.make('view', 'View', '/users/1').build()

      expect(action.type).toBe('link')
      expect(action.id).toBe('view')
      expect(action.label).toBe('View')
      expect(action.href).toBe('/users/1')
    })

    it('should create link action with function href', () => {
      const hrefFn = (record: any) => `/users/${record.id}`
      const action = LinkAction.make('view', 'View', hrefFn).build()

      expect(action.href).toBe(hrefFn)
    })

    it('should set newTab', () => {
      const action = LinkAction.make('view', 'View', '/users/1').newTab().build()

      expect(action.newTab).toBe(true)
    })

    it('should set icon', () => {
      const action = LinkAction.make('view', 'View', '/users/1').icon('<ViewIcon />').build()

      expect(action.icon).toBe('<ViewIcon />')
    })

    it('should support dynamic label', () => {
      const labelFn = (record: any) => `View ${record.name}`
      const action = LinkAction.make('view', labelFn, '/users/1').build()

      expect(action.label).toBe(labelFn)
    })

    it('should support dynamic icon', () => {
      const iconFn = (record: any) => record.isActive ? '<ActiveIcon />' : '<InactiveIcon />'
      const action = LinkAction.make('view', 'View', '/users/1').icon(iconFn).build()

      expect(action.icon).toBe(iconFn)
    })

    it('should set variant', () => {
      const action = LinkAction.make('view', 'View', '/users/1').variant('outline').build()

      expect(action.variant).toBe('outline')
    })

    it('should chain methods', () => {
      const action = LinkAction.make('view', 'View', '/users/1')
        .icon('<ViewIcon />')
        .variant('link')
        .size('sm')
        .tooltip('View details')
        .newTab(true)
        .visible(true)
        .disabled(false)
        .build()

      expect(action.type).toBe('link')
      expect(action.id).toBe('view')
      expect(action.label).toBe('View')
      expect(action.href).toBe('/users/1')
      expect(action.icon).toBe('<ViewIcon />')
      expect(action.variant).toBe('link')
      expect(action.size).toBe('sm')
      expect(action.tooltip).toBe('View details')
      expect(action.newTab).toBe(true)
      expect(action.visible).toBe(true)
      expect(action.disabled).toBe(false)
    })
  })

  describe('ActionGroup', () => {
    it('should create action group', () => {
      const onClick = vi.fn()
      const actions = [
        ButtonAction.make('edit', 'Edit', onClick).build(),
        ButtonAction.make('delete', 'Delete', onClick).build(),
      ]
      const group = ActionGroup.make('more', 'More Actions').actions(actions).build()

      expect(group.id).toBe('more')
      expect(group.label).toBe('More Actions')
      expect(group.actions).toEqual(actions)
    })

    it('should set icon', () => {
      const onClick = vi.fn()
      const actions = [ButtonAction.make('edit', 'Edit', onClick).build()]
      const group = ActionGroup.make('more', 'More')
        .icon('<MoreIcon />')
        .actions(actions)
        .build()

      expect(group.icon).toBe('<MoreIcon />')
    })

    it('should set visible', () => {
      const onClick = vi.fn()
      const actions = [ButtonAction.make('edit', 'Edit', onClick).build()]
      const group = ActionGroup.make('more', 'More').actions(actions).visible(false).build()

      expect(group.visible).toBe(false)
    })

    it('should throw error if no actions', () => {
      const group = ActionGroup.make('more', 'More')
      expect(() => group.build()).toThrow('Action group must have at least one action')
    })

    it('should chain methods', () => {
      const onClick = vi.fn()
      const actions = [
        ButtonAction.make('edit', 'Edit', onClick).build(),
        ButtonAction.make('delete', 'Delete', onClick).build(),
      ]
      const group = ActionGroup.make('more', 'More Actions')
        .icon('<MoreIcon />')
        .actions(actions)
        .visible(true)
        .build()

      expect(group.id).toBe('more')
      expect(group.label).toBe('More Actions')
      expect(group.icon).toBe('<MoreIcon />')
      expect(group.actions).toEqual(actions)
      expect(group.visible).toBe(true)
    })
  })

  describe('BulkAction', () => {
    it('should create bulk action', () => {
      const actionFn = vi.fn()
      const action = BulkAction.make('delete', 'Delete Selected', actionFn).build()

      expect(action.id).toBe('delete')
      expect(action.label).toBe('Delete Selected')
      expect(action.action).toBe(actionFn)
    })

    it('should set icon', () => {
      const actionFn = vi.fn()
      const action = BulkAction.make('delete', 'Delete', actionFn).icon('<DeleteIcon />').build()

      expect(action.icon).toBe('<DeleteIcon />')
    })

    it('should set variant', () => {
      const actionFn = vi.fn()
      const action = BulkAction.make('delete', 'Delete', actionFn).variant('destructive').build()

      expect(action.variant).toBe('destructive')
    })

    it('should set requires confirmation', () => {
      const actionFn = vi.fn()
      const action = BulkAction.make('delete', 'Delete', actionFn).requiresConfirmation().build()

      expect(action.requiresConfirmation).toBe(true)
    })

    it('should set confirmation', () => {
      const actionFn = vi.fn()
      const confirmation = {
        title: 'Delete Records',
        message: 'Are you sure you want to delete the selected records?',
        variant: 'destructive' as const,
      }
      const action = BulkAction.make('delete', 'Delete', actionFn)
        .confirmation(confirmation)
        .build()

      expect(action.confirmation).toEqual(confirmation)
      expect(action.requiresConfirmation).toBe(true)
    })

    it('should set confirmation with function', () => {
      const actionFn = vi.fn()
      const confirmationFn = (selected: any[]) => ({
        title: 'Delete',
        message: `Delete ${selected.length} records?`,
      })
      const action = BulkAction.make('delete', 'Delete', actionFn)
        .confirmation(confirmationFn)
        .build()

      expect(action.confirmation).toBe(confirmationFn)
      expect(action.requiresConfirmation).toBe(true)
    })

    it('should set visible', () => {
      const actionFn = vi.fn()
      const action = BulkAction.make('export', 'Export', actionFn).visible(false).build()

      expect(action.visible).toBe(false)
    })

    it('should set disabled', () => {
      const actionFn = vi.fn()
      const action = BulkAction.make('export', 'Export', actionFn).disabled(true).build()

      expect(action.disabled).toBe(true)
    })

    it('should support dynamic label', () => {
      const actionFn = vi.fn()
      const labelFn = (selected: any[]) => `Delete ${selected.length} items`
      const action = BulkAction.make('delete', labelFn, actionFn).build()

      expect(action.label).toBe(labelFn)
    })

    it('should support dynamic icon', () => {
      const actionFn = vi.fn()
      const iconFn = (selected: any[]) => selected.length > 5 ? '<BulkIcon />' : '<SmallIcon />'
      const action = BulkAction.make('export', 'Export', actionFn).icon(iconFn).build()

      expect(action.icon).toBe(iconFn)
    })

    it('should update label dynamically', () => {
      const actionFn = vi.fn()
      const newLabelFn = (selected: any[]) => `Export ${selected.length} records`
      const action = BulkAction.make('export', 'Export', actionFn)
        .label(newLabelFn)
        .build()

      expect(action.label).toBe(newLabelFn)
    })

    it('should chain methods', () => {
      const actionFn = vi.fn()
      const action = BulkAction.make('delete', 'Delete Selected', actionFn)
        .icon('<DeleteIcon />')
        .variant('destructive')
        .requiresConfirmation()
        .visible(true)
        .disabled(false)
        .build()

      expect(action.id).toBe('delete')
      expect(action.label).toBe('Delete Selected')
      expect(action.action).toBe(actionFn)
      expect(action.icon).toBe('<DeleteIcon />')
      expect(action.variant).toBe('destructive')
      expect(action.requiresConfirmation).toBe(true)
      expect(action.visible).toBe(true)
      expect(action.disabled).toBe(false)
    })
  })

  describe('ActionSeparator', () => {
    it('should create action separator', () => {
      const separator = ActionSeparator.make('sep-1').build()

      expect(separator.type).toBe('separator')
      expect(separator.id).toBe('sep-1')
    })

    it('should generate id if not provided', () => {
      const separator = ActionSeparator.make().build()

      expect(separator.type).toBe('separator')
      expect(separator.id).toMatch(/^separator-/)
    })

    it('should create multiple separators with unique ids', () => {
      const sep1 = ActionSeparator.make().build()
      const sep2 = ActionSeparator.make().build()

      expect(sep1.id).not.toBe(sep2.id)
    })
  })
})
