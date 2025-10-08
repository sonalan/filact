/**
 * Table Builder
 * Provides fluent API for building table schemas
 */

import type { BaseModel } from '../types/resource'
import type { TableSchema, Column, Filter, Sort, PaginationConfig } from '../types/table'

/**
 * Table Builder class
 */
export class TableBuilder<TModel extends BaseModel = BaseModel> {
  private columnList: Column<TModel>[] = []
  private filters?: Filter[]
  private defaultSort?: Sort<TModel>
  private paginationConfig?: PaginationConfig
  private selectableRows = false
  private searchableTable = false
  private searchPlaceholderText?: string
  private emptyStateContent?: React.ReactNode
  private loadingStateContent?: React.ReactNode

  /**
   * Set table columns
   */
  columns(columns: Column<TModel>[]): this {
    this.columnList = columns
    return this
  }

  /**
   * Add columns to the existing column list
   */
  addColumns(...columns: Column<TModel>[]): this {
    this.columnList.push(...columns)
    return this
  }

  /**
   * Remove a column by accessor
   */
  removeColumn(accessor: keyof TModel | string): this {
    this.columnList = this.columnList.filter((col) => col.accessor !== accessor)
    return this
  }

  /**
   * Get a column by accessor
   */
  getColumn(accessor: keyof TModel | string): Column<TModel> | undefined {
    return this.columnList.find((col) => col.accessor === accessor)
  }

  /**
   * Add filters to the table
   */
  withFilters(filters: Filter[]): this {
    this.filters = filters
    return this
  }

  /**
   * Set default sort
   */
  sort(field: keyof TModel | string, direction: 'asc' | 'desc' = 'asc'): this {
    this.defaultSort = { field, direction }
    return this
  }

  /**
   * Configure pagination
   */
  paginate(config?: PaginationConfig): this {
    this.paginationConfig = config ?? {
      type: 'offset',
      defaultPageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
      showPageSize: true,
      showPageInfo: true,
    }
    return this
  }

  /**
   * Enable row selection
   */
  selectable(selectable = true): this {
    this.selectableRows = selectable
    return this
  }

  /**
   * Enable table search
   */
  searchable(searchable = true): this {
    this.searchableTable = searchable
    return this
  }

  /**
   * Set search placeholder
   */
  searchPlaceholder(placeholder: string): this {
    this.searchPlaceholderText = placeholder
    return this
  }

  /**
   * Set empty state content
   */
  emptyState(content: React.ReactNode): this {
    this.emptyStateContent = content
    return this
  }

  /**
   * Set loading state content
   */
  loadingState(content: React.ReactNode): this {
    this.loadingStateContent = content
    return this
  }

  /**
   * Build the final table schema
   */
  build(): TableSchema<TModel> {
    return {
      columns: this.columnList,
      filters: this.filters,
      defaultSort: this.defaultSort,
      pagination: this.paginationConfig,
      selectable: this.selectableRows,
      searchable: this.searchableTable,
      searchPlaceholder: this.searchPlaceholderText,
      emptyState: this.emptyStateContent,
      loadingState: this.loadingStateContent,
    }
  }
}

/**
 * Factory function to create a table builder
 */
export function createTableBuilder<TModel extends BaseModel = BaseModel>(): TableBuilder<TModel> {
  return new TableBuilder<TModel>()
}
