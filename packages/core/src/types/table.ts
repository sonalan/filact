/**
 * Table type definitions
 * Defines the Table Builder system
 */

import type { ReactNode } from 'react'
import type { BaseModel } from './resource'

/**
 * Column alignment
 */
export type ColumnAlignment = 'left' | 'center' | 'right'

/**
 * Base column configuration
 */
export interface BaseColumnConfig<TModel extends BaseModel = BaseModel> {
  /** Column key/accessor */
  accessor: keyof TModel | string

  /** Column header label */
  label?: string

  /** Column alignment */
  align?: ColumnAlignment

  /** Column width */
  width?: string | number

  /** Whether column is sortable */
  sortable?: boolean

  /** Whether column is searchable */
  searchable?: boolean

  /** Whether column is visible */
  visible?: boolean

  /** Whether column can be hidden */
  hideable?: boolean

  /** Custom CSS class */
  className?: string

  /** Custom header CSS class */
  headerClassName?: string
}

/**
 * Column types
 */
export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'badge'
  | 'icon'
  | 'image'
  | 'color'
  | 'select'
  | 'toggle'
  | 'relationship'
  | 'custom'

/**
 * Text column configuration
 */
export interface TextColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'text'
  truncate?: boolean
  maxLength?: number
  copyable?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
  transform?: (value: string, record: TModel) => string
}

/**
 * Number column configuration
 */
export interface NumberColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'number'
  format?: 'number' | 'currency' | 'percentage'
  decimals?: number
  currency?: string
  locale?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

/**
 * Date column configuration
 */
export interface DateColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'date' | 'datetime'
  format?: string
  relative?: boolean
  timezone?: string
}

/**
 * Boolean column configuration
 */
export interface BooleanColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'boolean'
  trueLabel?: string
  falseLabel?: string
  trueIcon?: ReactNode
  falseIcon?: ReactNode
  showLabel?: boolean
}

/**
 * Badge column configuration
 */
export interface BadgeColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'badge'
  colors?: Record<string, string>
  icons?: Record<string, ReactNode>
  variant?: 'default' | 'outline' | 'secondary'
}

/**
 * Icon column configuration
 */
export interface IconColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'icon'
  icons: Record<string, ReactNode>
  size?: number
  tooltip?: boolean
}

/**
 * Image column configuration
 */
export interface ImageColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'image'
  size?: number
  rounded?: boolean
  fallback?: ReactNode
  preview?: boolean
}

/**
 * Color column configuration
 */
export interface ColorColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'color'
  showLabel?: boolean
}

/**
 * Custom column configuration
 */
export interface CustomColumnConfig<TModel extends BaseModel = BaseModel> extends BaseColumnConfig<TModel> {
  type: 'custom'
  render: (record: TModel) => ReactNode
}

/**
 * Column union type
 */
export type Column<TModel extends BaseModel = BaseModel> =
  | TextColumnConfig<TModel>
  | NumberColumnConfig<TModel>
  | DateColumnConfig<TModel>
  | BooleanColumnConfig<TModel>
  | BadgeColumnConfig<TModel>
  | IconColumnConfig<TModel>
  | ImageColumnConfig<TModel>
  | ColorColumnConfig<TModel>
  | CustomColumnConfig<TModel>

/**
 * Filter types
 */
export type FilterType =
  | 'text'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'daterange'
  | 'number'
  | 'boolean'
  | 'custom'

/**
 * Filter configuration
 */
export interface Filter {
  name: string
  label: string
  type: FilterType
  options?: SelectOption[]
  default?: unknown
  multiple?: boolean
  component?: React.ComponentType<{
    value: unknown
    onChange: (value: unknown) => void
  }>
}

/**
 * Select option for filters
 */
export interface SelectOption {
  value: string | number
  label: string
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Sort configuration
 */
export interface Sort<TModel extends BaseModel = BaseModel> {
  field: keyof TModel | string
  direction: SortDirection
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Pagination type */
  type?: 'offset' | 'cursor'

  /** Page size options */
  pageSizeOptions?: number[]

  /** Default page size */
  defaultPageSize?: number

  /** Show page size selector */
  showPageSize?: boolean

  /** Show page info (e.g., "1-10 of 100") */
  showPageInfo?: boolean
}

/**
 * Table header action
 */
export interface TableHeaderAction {
  /** Action identifier */
  id: string

  /** Action label */
  label: string

  /** Action icon */
  icon?: ReactNode

  /** Action handler */
  onClick: () => void | Promise<void>

  /** Action variant */
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'ghost'

  /** Whether action is disabled */
  disabled?: boolean

  /** Action tooltip */
  tooltip?: string

  /** Custom CSS class */
  className?: string
}

/**
 * Table schema - the complete table definition
 */
export interface TableSchema<TModel extends BaseModel = BaseModel> {
  columns: Column<TModel>[]
  filters?: Filter[]
  defaultSort?: Sort<TModel>
  pagination?: PaginationConfig
  selectable?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyState?: ReactNode
  loadingState?: ReactNode
  headerActions?: TableHeaderAction[]
}
