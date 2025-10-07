/**
 * List Page Component
 * Auto-generated CRUD list page with table, filters, and actions
 */

import type { BaseModel } from '../types/resource'
import type { ResourceConfig } from '../resources/builder'
import { ResourceTable } from '../tables/ResourceTable'
import type { ColumnDef } from '@tanstack/react-table'

export interface ListPageProps<TModel extends BaseModel> {
  /** Resource configuration */
  config: ResourceConfig<TModel>

  /** Initial pagination params */
  initialPage?: number
  initialPerPage?: number

  /** Custom header actions */
  headerActions?: React.ReactNode

  /** Custom empty state */
  emptyState?: React.ReactNode

  /** Loading state component */
  loadingState?: React.ReactNode

  /** Custom columns */
  columns?: ColumnDef<TModel>[]

  /** Enable row selection */
  enableRowSelection?: boolean

  /** Row click handler */
  onRowClick?: (row: TModel) => void
}

/**
 * List Page Component
 * Displays a paginated, filterable table of records
 */
export function ListPage<TModel extends BaseModel>({
  config,
  initialPage = 1,
  initialPerPage = 10,
  headerActions,
  emptyState,
  loadingState,
  columns,
  enableRowSelection = false,
  onRowClick,
}: ListPageProps<TModel>) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.model.name}</h1>
        </div>
        {headerActions && <div className="flex gap-2">{headerActions}</div>}
      </div>

      {/* Table */}
      <ResourceTable
        config={config}
        initialPage={initialPage}
        initialPageSize={initialPerPage}
        columns={columns}
        enableRowSelection={enableRowSelection}
        emptyState={emptyState}
        loadingState={loadingState}
        onRowClick={onRowClick}
      />
    </div>
  )
}
