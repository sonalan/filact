/**
 * Action type definitions
 * Defines the Action system for buttons and interactions
 */

import type { ReactNode } from 'react'
import type { BaseModel } from './resource'
import type { Field } from './form'

/**
 * Action variant/style
 */
export type ActionVariant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link'

/**
 * Action size
 */
export type ActionSize = 'sm' | 'md' | 'lg'

/**
 * Action position in UI
 */
export type ActionPosition = 'start' | 'end'

/**
 * Modal configuration for action
 */
export interface ModalConfig {
  /** Modal title */
  title: string

  /** Modal description */
  description?: string

  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'

  /** Form fields to show in modal */
  fields?: Field[]

  /** Submit button label */
  submitLabel?: string

  /** Cancel button label */
  cancelLabel?: string

  /** Close modal on success */
  closeOnSuccess?: boolean
}

/**
 * Confirmation configuration
 */
export interface ConfirmationConfig {
  /** Confirmation title */
  title: string

  /** Confirmation message */
  message: string

  /** Confirm button label */
  confirmLabel?: string

  /** Cancel button label */
  cancelLabel?: string

  /** Confirmation variant */
  variant?: 'default' | 'destructive'
}

/**
 * Base action configuration
 */
export interface BaseActionConfig<TModel extends BaseModel = BaseModel> {
  /** Action identifier */
  id: string

  /** Action label */
  label: string

  /** Action icon */
  icon?: ReactNode

  /** Action variant */
  variant?: ActionVariant

  /** Action size */
  size?: ActionSize

  /** Action color */
  color?: string

  /** Action tooltip */
  tooltip?: string

  /** Whether action is visible */
  visible?: boolean | ((record?: TModel, selected?: TModel[]) => boolean)

  /** Whether action is disabled */
  disabled?: boolean | ((record?: TModel, selected?: TModel[]) => boolean)

  /** Whether action requires confirmation */
  requiresConfirmation?: boolean

  /** Confirmation configuration */
  confirmation?: ConfirmationConfig | ((record?: TModel, selected?: TModel[]) => ConfirmationConfig)

  /** Modal configuration */
  modal?: ModalConfig

  /** Keyboard shortcut */
  shortcut?: string

  /** Custom CSS class */
  className?: string
}

/**
 * Button action configuration
 */
export interface ButtonActionConfig<TModel extends BaseModel = BaseModel> extends BaseActionConfig<TModel> {
  type: 'button'

  /** Click handler */
  onClick: (record?: TModel, selected?: TModel[]) => void | Promise<void>

  /** Whether to show loading state */
  showLoading?: boolean
}

/**
 * Link action configuration
 */
export interface LinkActionConfig<TModel extends BaseModel = BaseModel> extends BaseActionConfig<TModel> {
  type: 'link'

  /** Link URL */
  href: string | ((record?: TModel) => string)

  /** Whether to open in new tab */
  newTab?: boolean
}

/**
 * Dropdown action group
 */
export interface ActionGroupConfig<TModel extends BaseModel = BaseModel> {
  /** Group identifier */
  id: string

  /** Group label */
  label: string

  /** Group icon */
  icon?: ReactNode

  /** Actions in group */
  actions: Action<TModel>[]

  /** Whether group is visible */
  visible?: boolean | ((record?: TModel, selected?: TModel[]) => boolean)
}

/**
 * Action union type
 */
export type Action<TModel extends BaseModel = BaseModel> =
  | ButtonActionConfig<TModel>
  | LinkActionConfig<TModel>
  | ActionGroupConfig<TModel>

/**
 * Bulk action configuration
 */
export interface BulkAction<TModel extends BaseModel = BaseModel> {
  /** Action identifier */
  id: string

  /** Action label */
  label: string

  /** Action icon */
  icon?: ReactNode

  /** Action variant */
  variant?: ActionVariant

  /** Whether action requires confirmation */
  requiresConfirmation?: boolean

  /** Confirmation configuration */
  confirmation?: ConfirmationConfig | ((selected: TModel[]) => ConfirmationConfig)

  /** Action handler */
  action: (selected: TModel[]) => void | Promise<void>

  /** Whether action is visible */
  visible?: boolean | ((selected: TModel[]) => boolean)

  /** Whether action is disabled */
  disabled?: boolean | ((selected: TModel[]) => boolean)
}
