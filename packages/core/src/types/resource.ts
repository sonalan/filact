/**
 * Resource type definitions
 * Defines the core Resource system for CRUD interfaces
 */

import type { z } from 'zod'

/**
 * Base model interface - all models must have an id
 */
export interface BaseModel {
  id: string | number
  [key: string]: unknown
}

/**
 * Model definition configuration
 */
export interface ModelDefinition<TModel extends BaseModel = BaseModel> {
  /** Name of the model (e.g., 'User', 'Post') */
  name: string

  /** Plural name for display (e.g., 'Users', 'Posts') */
  pluralName?: string

  /** API endpoint for this model (e.g., '/api/users') */
  endpoint: string

  /** Primary key field name */
  primaryKey?: keyof TModel

  /** Optional Zod schema for validation */
  schema?: z.ZodType<TModel>

  /** Optional display field for showing model instances */
  displayField?: keyof TModel

  /** Optional timestamp fields */
  timestamps?: {
    createdAt?: keyof TModel
    updatedAt?: keyof TModel
  }
}

/**
 * Navigation configuration for a resource
 */
export interface NavigationConfig {
  /** Display label in navigation */
  label: string

  /** Icon component or icon name */
  icon?: React.ReactNode | string

  /** Navigation group */
  group?: string

  /** Sort order in navigation */
  sort?: number

  /** Whether to show in navigation */
  visible?: boolean

  /** Badge content (e.g., count) */
  badge?: string | number
}

/**
 * Policy/Authorization configuration
 */
export interface ResourcePolicies<TModel extends BaseModel = BaseModel> {
  /** Can view list of records */
  viewAny?: (user?: unknown) => boolean | Promise<boolean>

  /** Can view a single record */
  view?: (record: TModel, user?: unknown) => boolean | Promise<boolean>

  /** Can create new records */
  create?: (user?: unknown) => boolean | Promise<boolean>

  /** Can update a record */
  update?: (record: TModel, user?: unknown) => boolean | Promise<boolean>

  /** Can delete a record */
  delete?: (record: TModel, user?: unknown) => boolean | Promise<boolean>

  /** Can restore a soft-deleted record */
  restore?: (record: TModel, user?: unknown) => boolean | Promise<boolean>

  /** Can permanently delete a record */
  forceDelete?: (record: TModel, user?: unknown) => boolean | Promise<boolean>
}

/**
 * Lifecycle hooks for resource operations
 */
export interface ResourceLifecycleHooks<TModel extends BaseModel = BaseModel> {
  /** Before creating a new record */
  beforeCreate?: (data: Partial<TModel>) => void | Promise<void> | Partial<TModel> | Promise<Partial<TModel>>

  /** After creating a new record */
  afterCreate?: (record: TModel) => void | Promise<void>

  /** Before updating a record */
  beforeUpdate?: (record: TModel, data: Partial<TModel>) => void | Promise<void> | Partial<TModel> | Promise<Partial<TModel>>

  /** After updating a record */
  afterUpdate?: (record: TModel) => void | Promise<void>

  /** Before deleting a record */
  beforeDelete?: (record: TModel) => void | Promise<void> | boolean | Promise<boolean>

  /** After deleting a record */
  afterDelete?: (id: string | number) => void | Promise<void>

  /** Before fetching records */
  beforeFetch?: () => void | Promise<void>

  /** After fetching records */
  afterFetch?: (records: TModel[]) => void | Promise<void> | TModel[] | Promise<TModel[]>
}

/**
 * Resource metadata
 */
export interface ResourceMetadata {
  /** Resource identifier */
  id: string

  /** Resource version */
  version?: string

  /** Resource description */
  description?: string

  /** Custom metadata */
  [key: string]: unknown
}

/**
 * Extract model type from ModelDefinition
 */
export type InferModel<T> = T extends ModelDefinition<infer M> ? M : never

/**
 * Extract schema type from Zod schema
 */
export type InferSchema<T> = T extends z.ZodType<infer S> ? S : never
