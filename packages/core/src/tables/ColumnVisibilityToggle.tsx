/**
 * Column Visibility Toggle
 * Dropdown menu for showing/hiding table columns
 */

import { useState } from 'react'
import type { Table } from '@tanstack/react-table'

export interface ColumnVisibilityToggleProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>

  /** Button label */
  label?: string

  /** Custom className */
  className?: string
}

/**
 * Column Visibility Toggle Component
 * Provides a dropdown menu to show/hide table columns
 */
export function ColumnVisibilityToggle<TData>({
  table,
  label = 'Columns',
  className = '',
}: ColumnVisibilityToggleProps<TData>) {
  const [isOpen, setIsOpen] = useState(false)

  // Get all columns that can be hidden
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.id !== 'select' && column.id !== 'actions')

  if (columns.length === 0) {
    return null
  }

  const handleToggleAll = () => {
    const allVisible = columns.every((column) => column.getIsVisible())
    table.toggleAllColumnsVisible(!allVisible)
  }

  const allVisible = columns.every((column) => column.getIsVisible())
  const someVisible = columns.some((column) => column.getIsVisible())

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle column visibility"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {label}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu">
              {/* Toggle All */}
              <div className="px-4 py-2 border-b">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:bg-gray-50 rounded px-2 py-1">
                  <input
                    type="checkbox"
                    checked={allVisible}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someVisible && !allVisible
                      }
                    }}
                    onChange={handleToggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Toggle All</span>
                </label>
              </div>

              {/* Individual Columns */}
              <div className="max-h-64 overflow-y-auto">
                {columns.map((column) => {
                  const columnName =
                    typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id

                  return (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{columnName}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
