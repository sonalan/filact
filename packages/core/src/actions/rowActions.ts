/**
 * Row Actions
 * Helper functions for creating common row actions
 */

import type { BaseModel } from '../types/resource'
import type { ResourceConfig } from '../resources/builder'
import type { ButtonActionConfig } from '../types/action'

/**
 * Create an edit action for a record
 */
export function createEditAction<TModel extends BaseModel>(
  config: ResourceConfig<TModel>,
  options?: {
    label?: string
    icon?: React.ReactNode
    onNavigate?: (record: TModel) => void
  }
): ButtonActionConfig<TModel> {
  return {
    id: 'edit',
    type: 'button',
    label: options?.label || 'Edit',
    icon: options?.icon,
    variant: 'ghost',
    size: 'sm',
    onClick: (record?: TModel) => {
      if (!record) return

      if (options?.onNavigate) {
        options.onNavigate(record)
      } else {
        // Default navigation - in a real app this would use router
        const id = record[config.model.primaryKey || 'id']
        console.log(`Navigate to edit page for ${config.model.name} ${id}`)
      }
    },
  }
}

/**
 * Create a view action for a record
 */
export function createViewAction<TModel extends BaseModel>(
  config: ResourceConfig<TModel>,
  options?: {
    label?: string
    icon?: React.ReactNode
    onNavigate?: (record: TModel) => void
  }
): ButtonActionConfig<TModel> {
  return {
    id: 'view',
    type: 'button',
    label: options?.label || 'View',
    icon: options?.icon,
    variant: 'ghost',
    size: 'sm',
    onClick: (record?: TModel) => {
      if (!record) return

      if (options?.onNavigate) {
        options.onNavigate(record)
      } else {
        // Default navigation - in a real app this would use router
        const id = record[config.model.primaryKey || 'id']
        console.log(`Navigate to view page for ${config.model.name} ${id}`)
      }
    },
  }
}

/**
 * Create a delete action for a record
 */
export function createDeleteAction<TModel extends BaseModel>(
  config: ResourceConfig<TModel>,
  options?: {
    label?: string
    icon?: React.ReactNode
    confirmTitle?: string
    confirmMessage?: string | ((record: TModel) => string)
    requireConfirmation?: boolean
  }
): ButtonActionConfig<TModel> {
  return {
    id: 'delete',
    type: 'button',
    label: options?.label || 'Delete',
    icon: options?.icon,
    variant: 'ghost',
    size: 'sm',
    requiresConfirmation: options?.requireConfirmation !== false,
    confirmation: (record?: TModel) => {
      const recordName = record
        ? String(record[config.model.primaryKey || 'id'])
        : 'this record'

      const message =
        options?.confirmMessage &&
        typeof options.confirmMessage === 'function' &&
        record
          ? options.confirmMessage(record)
          : options?.confirmMessage ||
            `Are you sure you want to delete ${recordName}? This action cannot be undone.`

      return {
        title: options?.confirmTitle || 'Delete Record',
        message,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      }
    },
    onClick: async (record?: TModel) => {
      if (!record) return

      // Run beforeDelete hook
      if (config.hooks?.beforeDelete) {
        const canDelete = await config.hooks.beforeDelete(record)
        if (canDelete === false) {
          throw new Error('Delete operation cancelled by hook')
        }
      }

      const id = record[config.model.primaryKey || 'id']
      await config.provider.delete(config.model.endpoint, { id })

      // Run afterDelete hook
      if (config.hooks?.afterDelete) {
        await config.hooks.afterDelete(id)
      }
    },
  }
}

/**
 * Create a custom row action
 */
export function createRowAction<TModel extends BaseModel>(
  config: Omit<ButtonActionConfig<TModel>, 'type'>
): ButtonActionConfig<TModel> {
  return {
    type: 'button',
    size: 'sm',
    variant: 'ghost',
    ...config,
  }
}
