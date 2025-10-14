/**
 * useVirtualizedTable Hook
 * Hook for creating virtualized tables with TanStack Table + Virtual
 */

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import type { BaseModel } from '../types/resource'

export interface UseVirtualizedTableOptions<TModel extends BaseModel> {
  /** Table data */
  data: TModel[]

  /** Column definitions */
  columns: ColumnDef<TModel>[]

  /** Initial sorting state */
  initialSorting?: SortingState

  /** Initial filter state */
  initialFilters?: ColumnFiltersState

  /** Enable sorting (default: true) */
  enableSorting?: boolean

  /** Enable filtering (default: false) */
  enableFiltering?: boolean

  /** Enable multi-sort (default: false) */
  enableMultiSort?: boolean

  /** Debug mode */
  debugTable?: boolean
}

/**
 * Hook for creating virtualized tables
 * Optimized for large datasets with minimal configuration
 *
 * @example
 * ```tsx
 * const table = useVirtualizedTable({
 *   data: users,
 *   columns: userColumns,
 *   enableSorting: true,
 * })
 *
 * return <VirtualizedTable table={table} height={500} />
 * ```
 */
export function useVirtualizedTable<TModel extends BaseModel>({
  data,
  columns,
  initialSorting = [],
  initialFilters = [],
  enableSorting = true,
  enableFiltering = false,
  enableMultiSort = false,
  debugTable = false,
}: UseVirtualizedTableOptions<TModel>) {
  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns])

  const table = useReactTable({
    data,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    enableSorting,
    enableMultiSort,
    initialState: {
      sorting: initialSorting,
      columnFilters: initialFilters,
    },
    debugTable,
  })

  return table
}
