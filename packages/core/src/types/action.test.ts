import { describe, it, expect } from 'vitest'
import type {
  ButtonActionConfig,
  LinkActionConfig,
  ActionGroupConfig,
  BulkAction,
  ModalConfig,
  ConfirmationConfig,
} from './action'
import type { BaseModel } from './resource'

describe('Action Types', () => {
  interface User extends BaseModel {
    name: string
    email: string
    role: string
  }

  describe('ButtonActionConfig', () => {
    it('should accept button action', () => {
      const action: ButtonActionConfig<User> = {
        type: 'button',
        id: 'edit',
        label: 'Edit',
        variant: 'default',
        onClick: async (record) => {
          console.log('Editing', record?.id)
        },
      }

      expect(action.type).toBe('button')
      expect(action.label).toBe('Edit')
    })

    it('should accept destructive action', () => {
      const action: ButtonActionConfig<User> = {
        type: 'button',
        id: 'delete',
        label: 'Delete',
        variant: 'destructive',
        requiresConfirmation: true,
        onClick: async (record) => {
          // Delete logic
        },
      }

      expect(action.variant).toBe('destructive')
      expect(action.requiresConfirmation).toBe(true)
    })

    it('should accept conditional visibility and disabled', () => {
      const action: ButtonActionConfig<User> = {
        type: 'button',
        id: 'promote',
        label: 'Promote to Admin',
        visible: (record) => record?.role !== 'admin',
        disabled: (record) => record?.id === 1,
        onClick: async () => {},
      }

      expect(typeof action.visible).toBe('function')
      expect(typeof action.disabled).toBe('function')
    })

    it('should accept action with keyboard shortcut', () => {
      const action: ButtonActionConfig<User> = {
        type: 'button',
        id: 'save',
        label: 'Save',
        shortcut: 'Ctrl+S',
        onClick: async () => {},
      }

      expect(action.shortcut).toBe('Ctrl+S')
    })
  })

  describe('LinkActionConfig', () => {
    it('should accept link action with static href', () => {
      const action: LinkActionConfig<User> = {
        type: 'link',
        id: 'view',
        label: 'View Details',
        href: '/users/123',
        newTab: false,
      }

      expect(action.type).toBe('link')
      expect(action.href).toBe('/users/123')
    })

    it('should accept link action with dynamic href', () => {
      const action: LinkActionConfig<User> = {
        type: 'link',
        id: 'edit',
        label: 'Edit',
        href: (record) => `/users/${record?.id}/edit`,
        newTab: true,
      }

      expect(typeof action.href).toBe('function')
      expect(action.newTab).toBe(true)
    })
  })

  describe('ModalConfig', () => {
    it('should accept complete modal config', () => {
      const modal: ModalConfig = {
        title: 'Edit User',
        description: 'Update user information',
        size: 'lg',
        fields: [
          {
            type: 'text',
            name: 'name',
            label: 'Name',
          },
          {
            type: 'email',
            name: 'email',
            label: 'Email',
          },
        ],
        submitLabel: 'Save Changes',
        cancelLabel: 'Cancel',
        closeOnSuccess: true,
      }

      expect(modal.title).toBe('Edit User')
      expect(modal.fields).toHaveLength(2)
    })
  })

  describe('ConfirmationConfig', () => {
    it('should accept confirmation config', () => {
      const confirmation: ConfirmationConfig = {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this user?',
        confirmLabel: 'Yes, delete',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      }

      expect(confirmation.title).toBe('Confirm Delete')
      expect(confirmation.variant).toBe('destructive')
    })

    it('should accept default confirmation', () => {
      const confirmation: ConfirmationConfig = {
        title: 'Confirm Action',
        message: 'Please confirm this action',
      }

      expect(confirmation.title).toBe('Confirm Action')
    })
  })

  describe('ActionGroupConfig', () => {
    it('should accept action group', () => {
      const group: ActionGroupConfig<User> = {
        id: 'more',
        label: 'More Actions',
        actions: [
          {
            type: 'button',
            id: 'archive',
            label: 'Archive',
            onClick: async () => {},
          },
          {
            type: 'button',
            id: 'export',
            label: 'Export',
            onClick: async () => {},
          },
        ],
        visible: true,
      }

      expect(group.actions).toHaveLength(2)
      expect(group.label).toBe('More Actions')
    })

    it('should accept conditional group visibility', () => {
      const group: ActionGroupConfig<User> = {
        id: 'admin',
        label: 'Admin Actions',
        actions: [],
        visible: (record) => record?.role === 'admin',
      }

      expect(typeof group.visible).toBe('function')
    })
  })

  describe('BulkAction', () => {
    it('should accept bulk action', () => {
      const action: BulkAction<User> = {
        id: 'delete',
        label: 'Delete Selected',
        variant: 'destructive',
        requiresConfirmation: true,
        action: async (selected) => {
          console.log('Deleting', selected.length, 'users')
        },
      }

      expect(action.label).toBe('Delete Selected')
      expect(action.requiresConfirmation).toBe(true)
    })

    it('should accept bulk action with dynamic confirmation', () => {
      const action: BulkAction<User> = {
        id: 'export',
        label: 'Export Selected',
        confirmation: (selected) => ({
          title: 'Confirm Export',
          message: `Export ${selected.length} users?`,
        }),
        action: async (selected) => {
          // Export logic
        },
      }

      expect(typeof action.confirmation).toBe('function')
    })

    it('should accept conditional bulk action', () => {
      const action: BulkAction<User> = {
        id: 'promote',
        label: 'Promote to Admin',
        visible: (selected) => selected.every((u) => u.role === 'user'),
        disabled: (selected) => selected.length === 0,
        action: async () => {},
      }

      expect(typeof action.visible).toBe('function')
      expect(typeof action.disabled).toBe('function')
    })
  })
})
