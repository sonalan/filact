/**
 * Resource Builder
 * Provides fluent API for building complete CRUD resources
 */

import type { BaseModel, ModelDefinition, NavigationConfig, ResourcePolicies, ResourceLifecycleHooks } from '../types/resource'
import type { FormSchema } from '../types/form'
import type { TableSchema } from '../types/table'
import type { Action, BulkAction } from '../types/action'
import type { DataProvider } from '../providers/types'

/**
 * Complete Resource configuration
 */
export interface ResourceConfig<TModel extends BaseModel = BaseModel> {
  /** Model definition */
  model: ModelDefinition<TModel>

  /** Data provider */
  provider: DataProvider

  /** Form schema for create/edit */
  form?: FormSchema<TModel>

  /** Table schema for list view */
  table?: TableSchema<TModel>

  /** Page-level actions */
  actions?: Action<TModel>[]

  /** Row-level actions */
  rowActions?: Action<TModel>[]

  /** Bulk actions */
  bulkActions?: BulkAction<TModel>[]

  /** Navigation configuration */
  navigation?: NavigationConfig

  /** Authorization policies */
  policies?: ResourcePolicies<TModel>

  /** Lifecycle hooks */
  hooks?: ResourceLifecycleHooks<TModel>

  /** Enable soft deletes */
  softDeletes?: boolean

  /** Enable timestamps */
  timestamps?: boolean
}

/**
 * Resource Builder class
 */
export class ResourceBuilder<TModel extends BaseModel = BaseModel> {
  private modelDef: ModelDefinition<TModel>
  private dataProvider: DataProvider
  private formSchema?: FormSchema<TModel>
  private tableSchema?: TableSchema<TModel>
  private pageActions?: Action<TModel>[]
  private recordActions?: Action<TModel>[]
  private bulkActionsList?: BulkAction<TModel>[]
  private navigationConfig?: NavigationConfig
  private policiesConfig?: ResourcePolicies<TModel>
  private hooksConfig?: ResourceLifecycleHooks<TModel>
  private softDeletesEnabled = false
  private timestampsEnabled = false

  constructor(model: ModelDefinition<TModel>, provider: DataProvider) {
    this.modelDef = model
    this.dataProvider = provider
  }

  /**
   * Set form schema for create/edit pages
   */
  form(schema: FormSchema<TModel>): this {
    this.formSchema = schema
    return this
  }

  /**
   * Set table schema for list page
   */
  table(schema: TableSchema<TModel>): this {
    this.tableSchema = schema
    return this
  }

  /**
   * Set page-level actions (e.g., "Create New")
   */
  actions(actions: Action<TModel>[]): this {
    this.pageActions = actions
    return this
  }

  /**
   * Set row-level actions (e.g., "Edit", "Delete")
   */
  rowActions(actions: Action<TModel>[]): this {
    this.recordActions = actions
    return this
  }

  /**
   * Set bulk actions for selected records
   */
  bulkActions(actions: BulkAction<TModel>[]): this {
    this.bulkActionsList = actions
    return this
  }

  /**
   * Configure navigation
   */
  navigation(config: NavigationConfig): this {
    this.navigationConfig = config
    return this
  }

  /**
   * Set authorization policies
   */
  policies(policies: ResourcePolicies<TModel>): this {
    this.policiesConfig = policies
    return this
  }

  /**
   * Set lifecycle hooks
   */
  hooks(hooks: ResourceLifecycleHooks<TModel>): this {
    this.hooksConfig = hooks
    return this
  }

  /**
   * Enable soft deletes
   */
  softDeletes(enabled = true): this {
    this.softDeletesEnabled = enabled
    return this
  }

  /**
   * Enable timestamps
   */
  timestamps(enabled = true): this {
    this.timestampsEnabled = enabled
    return this
  }

  /**
   * Build the final resource configuration
   */
  build(): ResourceConfig<TModel> {
    return {
      model: this.modelDef,
      provider: this.dataProvider,
      form: this.formSchema,
      table: this.tableSchema,
      actions: this.pageActions,
      rowActions: this.recordActions,
      bulkActions: this.bulkActionsList,
      navigation: this.navigationConfig,
      policies: this.policiesConfig,
      hooks: this.hooksConfig,
      softDeletes: this.softDeletesEnabled,
      timestamps: this.timestampsEnabled,
    }
  }
}

/**
 * Factory function to create a resource builder
 */
export function createResource<TModel extends BaseModel = BaseModel>(
  model: ModelDefinition<TModel>,
  provider: DataProvider
): ResourceBuilder<TModel> {
  return new ResourceBuilder<TModel>(model, provider)
}
