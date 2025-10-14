/**
 * Virtualized Table Component
 * Uses TanStack Virtual for efficient rendering of large datasets
 */

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  flexRender,
  type Table as TanStackTable,
} from '@tanstack/react-table'
import type { BaseModel } from '../types/resource'

export interface VirtualizedTableProps<TModel extends BaseModel> {
  /** TanStack Table instance */
  table: TanStackTable<TModel>

  /** Estimated row height for virtualization (default: 52px) */
  estimateSize?: number

  /** Overscan count - number of items to render outside viewport (default: 5) */
  overscan?: number

  /** Container height (default: 600px) */
  height?: number | string

  /** Custom row className */
  rowClassName?: string | ((row: TModel) => string)

  /** Row click handler */
  onRowClick?: (row: TModel) => void

  /** Custom className */
  className?: string
}

/**
 * Virtualized Table Component
 * Efficiently renders large datasets by only rendering visible rows
 */
export function VirtualizedTable<TModel extends BaseModel>({
  table,
  estimateSize = 52,
  overscan = 5,
  height = 600,
  rowClassName,
  onRowClick,
  className = '',
}: VirtualizedTableProps<TModel>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0

  return (
    <div
      ref={tableContainerRef}
      className={`overflow-auto ${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"
                  style={{
                    width: header.getSize() !== 150 ? header.getSize() : undefined,
                  }}
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
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index]
            const rowData = row.original

            const computedRowClassName =
              typeof rowClassName === 'function'
                ? rowClassName(rowData)
                : rowClassName

            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                className={`
                  border-b border-gray-200 dark:border-gray-700
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${computedRowClassName || ''}
                `}
                onClick={() => onRowClick?.(rowData)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
