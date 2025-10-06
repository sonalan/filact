/**
 * Form type definitions
 * Defines the Form Builder system
 */

import type { ReactNode } from 'react'
import type { z } from 'zod'
import type { BaseModel } from './resource'

/**
 * Base field configuration
 */
export interface BaseFieldConfig {
  /** Field name/key */
  name: string

  /** Field label */
  label?: string

  /** Placeholder text */
  placeholder?: string

  /** Helper text */
  helperText?: string

  /** Whether field is required */
  required?: boolean

  /** Whether field is disabled */
  disabled?: boolean | ((values: Record<string, unknown>) => boolean)

  /** Whether field is readonly */
  readonly?: boolean | ((values: Record<string, unknown>) => boolean)

  /** Whether field is visible */
  visible?: boolean | ((values: Record<string, unknown>) => boolean)

  /** Default value */
  default?: unknown

  /** Validation schema */
  validation?: z.ZodType

  /** Column span in grid layout */
  columnSpan?: number

  /** Custom CSS class */
  className?: string
}

/**
 * Field types
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'date'
  | 'datetime'
  | 'time'
  | 'daterange'
  | 'file'
  | 'image'
  | 'color'
  | 'slider'
  | 'richtext'
  | 'markdown'
  | 'repeater'
  | 'relationship'
  | 'keyvalue'
  | 'custom'

/**
 * Text input field configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'email' | 'password' | 'textarea'
  minLength?: number
  maxLength?: number
  pattern?: string
  autocomplete?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

/**
 * Number input field configuration
 */
export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number'
  min?: number
  max?: number
  step?: number
  prefix?: ReactNode
  suffix?: ReactNode
}

/**
 * Select field option
 */
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: ReactNode
}

/**
 * Select field configuration
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select' | 'multiselect'
  options: SelectOption[] | ((values: Record<string, unknown>) => SelectOption[] | Promise<SelectOption[]>)
  searchable?: boolean
  clearable?: boolean
  createable?: boolean
  multiple?: boolean
}

/**
 * Checkbox field configuration
 */
export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox' | 'switch'
  label: string
  description?: string
}

/**
 * Radio field configuration
 */
export interface RadioFieldConfig extends BaseFieldConfig {
  type: 'radio'
  options: SelectOption[]
  inline?: boolean
}

/**
 * Date field configuration
 */
export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date' | 'datetime' | 'time' | 'daterange'
  minDate?: Date
  maxDate?: Date
  format?: string
  showTime?: boolean
  timeZone?: string
}

/**
 * File upload field configuration
 */
export interface FileFieldConfig extends BaseFieldConfig {
  type: 'file' | 'image'
  accept?: string[]
  maxSize?: number
  multiple?: boolean
  maxFiles?: number
  preview?: boolean
  uploadEndpoint?: string
}

/**
 * Repeater field configuration
 */
export interface RepeaterFieldConfig extends BaseFieldConfig {
  type: 'repeater'
  fields: Field[]
  min?: number
  max?: number
  addLabel?: string
  removeLabel?: string
  collapsible?: boolean
  orderable?: boolean
}

/**
 * Relationship field configuration
 */
export interface RelationshipFieldConfig extends BaseFieldConfig {
  type: 'relationship'
  resource: string
  displayField?: string
  searchable?: boolean
  createable?: boolean
  multiple?: boolean
  preload?: boolean
}

/**
 * Custom field configuration
 */
export interface CustomFieldConfig extends BaseFieldConfig {
  type: 'custom'
  component: React.ComponentType<{
    value: unknown
    onChange: (value: unknown) => void
    error?: string
    [key: string]: unknown
  }>
}

/**
 * Field union type
 */
export type Field =
  | TextFieldConfig
  | NumberFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | RadioFieldConfig
  | DateFieldConfig
  | FileFieldConfig
  | RepeaterFieldConfig
  | RelationshipFieldConfig
  | CustomFieldConfig

/**
 * Form layout section
 */
export interface FormSection {
  title?: string
  description?: string
  fields: Field[]
  columns?: number
  collapsible?: boolean
  collapsed?: boolean
}

/**
 * Form tab
 */
export interface FormTab {
  id: string
  label: string
  icon?: ReactNode
  badge?: string | number
  fields: Field[]
  columns?: number
}

/**
 * Wizard step
 */
export interface WizardStep {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  fields: Field[]
  columns?: number
  validate?: boolean
}

/**
 * Form schema - the complete form definition
 */
export interface FormSchema<TModel extends BaseModel = BaseModel> {
  fields: Field[]
  sections?: FormSection[]
  tabs?: FormTab[]
  wizard?: WizardStep[]
  columns?: number
  submitLabel?: string
  cancelLabel?: string
  onSubmit?: (data: Partial<TModel>) => void | Promise<void>
  onCancel?: () => void
}
