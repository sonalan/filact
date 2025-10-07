/**
 * Resource Table Component
 * TanStack Table integration with resource data management
 */

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useState, useMemo, useEffect } from 'react'
import type { BaseModel } from '../types/resource'
import type { ResourceConfig } from '../resources/builder'
import { useResourceList } from '../hooks/useResource'
import { BulkActionsToolbar } from './BulkActionsToolbar'

export interface ResourceTableProps<TModel extends BaseModel> {
  /** Resource configuration */
  config: ResourceConfig<TModel>

  /** Initial page */
  initialPage?: number

  /** Initial page size */
  initialPageSize?: number

  /** Custom columns (overrides schema) */
  columns?: ColumnDef<TModel>[]

  /** Enable row selection */
  enableRowSelection?: boolean

  /** Selection change handler */
  onSelectionChange?: (selectedRows: TModel[]) => void

  /** Custom empty state */
  emptyState?: React.ReactNode

  /** Custom loading state */
  loadingState?: React.ReactNode

  /** Custom error state */
  errorState?: React.ReactNode

  /** Row click handler */
  onRowClick?: (row: TModel) => void
}

/**
 * Resource Table Component
 * Displays paginated, sortable table data from a resource
 */
export function ResourceTable<TModel extends BaseModel>({
  config,
  initialPage = 1,
  initialPageSize = 10,
  columns: customColumns,
  enableRowSelection = false,
  onSelectionChange,
  emptyState,
  loadingState,
  errorState,
  onRowClick,
}: ResourceTableProps<TModel>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPage - 1,
    pageSize: initialPageSize,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Build query params from table state
  const queryParams = useMemo(() => {
    const params: any = {
      pagination: {
        page: pagination.pageIndex + 1,
        perPage: pagination.pageSize,
      },
    }

    if (sorting.length > 0) {
      const sort = sorting[0]
      params.sort = {
        field: sort.id,
        order: sort.desc ? 'desc' : 'asc',
      }
    }

    return params
  }, [pagination, sorting])

  const { data, isLoading, isError, error, refetch } = useResourceList(
    config,
    queryParams
  )

  // Generate columns from schema if not provided
  const columns = useMemo<ColumnDef<TModel>[]>(() => {
    if (customColumns) return customColumns

    if (!config.table?.columns) return []

    return config.table.columns.map((col) => ({
      accessorKey: String(col.name),
      header: col.label,
      enableSorting: col.sortable !== false,
    }))
  }, [customColumns, config.table])

  // Add selection column if enabled
  const tableColumns = useMemo<ColumnDef<TModel>[]>(() => {
    if (!enableRowSelection) return columns

    return [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all"
            className="w-4 h-4"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select row ${row.index + 1}`}
            className="w-4 h-4"
          />
        ),
        size: 40,
      },
      ...columns,
    ]
  }, [columns, enableRowSelection])

  // Add actions column if row actions exist
  const allColumns = useMemo<ColumnDef<TModel>[]>(() => {
    if (!config.rowActions || config.rowActions.length === 0) {
      return tableColumns
    }

    return [
      ...tableColumns,
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {config.rowActions?.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  action.handler?.(row.original)
                }}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        ),
        size: 120,
      },
    ]
  }, [tableColumns, config.rowActions])

  const table = useReactTable({
    data: data?.data ?? [],
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualSorting: true,
    pageCount: data ? Math.ceil(data.total / pagination.pageSize) : 0,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    enableRowSelection,
  })

  // Get selected rows
  const selectedRows = useMemo(() => {
    return table.getSelectedRowModel().rows.map((row) => row.original)
  }, [table.getSelectedRowModel().rows])

  // Notify parent of selection changes
  useEffect(() => {
    if (enableRowSelection && onSelectionChange) {
      onSelectionChange(selectedRows)
    }
  }, [selectedRows, enableRowSelection, onSelectionChange])

  // Clear selection handler
  const handleClearSelection = () => {
    setRowSelection({})
  }

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="w-full">
        {loadingState || <TableSkeleton rows={pagination.pageSize} />}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full border rounded-lg p-8">
        {errorState || (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Error loading {config.model.name}
              </h3>
              <p className="text-sm">{error?.message || 'An error occurred'}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    )
  }

  // Empty state
  if (!data || data.data.length === 0) {
    return (
      <div className="w-full border rounded-lg p-8">
        {emptyState || (
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No {config.model.name} found</p>
            <p className="text-sm">Get started by creating a new record</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Bulk Actions Toolbar */}
      {enableRowSelection && config.bulkActions && config.bulkActions.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedRows.length}
          selectedRows={selectedRows}
          actions={config.bulkActions}
          onClearSelection={handleClearSelection}
          resourceName={config.model.name}
        />
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-2'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '⇅'}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-900"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            data.total
          )}{' '}
          of {data.total} results
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={`px-3 py-1 border rounded ${
                  pagination.pageIndex === i
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>

          <select
            value={pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton loading state for table
 */
function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b p-4">
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-4">
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
