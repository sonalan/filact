/**
 * Table Export
 * Component for exporting table data to various formats
 */

import { useState } from 'react'
import type { Table } from '@tanstack/react-table'

export interface TableExportProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>

  /** Resource name for filename */
  filename?: string

  /** Button label */
  label?: string

  /** Export formats to enable */
  formats?: ('csv' | 'json')[]

  /** Custom className */
  className?: string
}

/**
 * Table Export Component
 * Provides dropdown menu to export table data
 */
export function TableExport<TData>({
  table,
  filename = 'export',
  label = 'Export',
  formats = ['csv', 'json'],
  className = '',
}: TableExportProps<TData>) {
  const [isOpen, setIsOpen] = useState(false)

  const exportToCSV = () => {
    const rows = table.getFilteredRowModel().rows
    const columns = table
      .getAllLeafColumns()
      .filter((col) => col.getIsVisible() && col.id !== 'select' && col.id !== 'actions')

    // Build CSV header
    const headers = columns
      .map((col) => {
        const header = col.columnDef.header
        return typeof header === 'string' ? header : col.id
      })
      .map((h) => `"${h}"`)
      .join(',')

    // Build CSV rows
    const csvRows = rows.map((row) => {
      return columns
        .map((col) => {
          const value = row.getValue(col.id)
          // Escape quotes and wrap in quotes
          const stringValue = value != null ? String(value) : ''
          return `"${stringValue.replace(/"/g, '""')}"`
        })
        .join(',')
    })

    const csv = [headers, ...csvRows].join('\n')

    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsOpen(false)
  }

  const exportToJSON = () => {
    const rows = table.getFilteredRowModel().rows
    const columns = table
      .getAllLeafColumns()
      .filter((col) => col.getIsVisible() && col.id !== 'select' && col.id !== 'actions')

    const data = rows.map((row) => {
      const record: Record<string, unknown> = {}
      columns.forEach((col) => {
        const header = col.columnDef.header
        const key = typeof header === 'string' ? header : col.id
        record[key] = row.getValue(col.id)
      })
      return record
    })

    const json = JSON.stringify(data, null, 2)

    // Download JSON file
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsOpen(false)
  }

  if (formats.length === 0) {
    return null
  }

  // If only one format, show simple button
  if (formats.length === 1) {
    const format = formats[0]
    const handler = format === 'csv' ? exportToCSV : exportToJSON

    return (
      <button
        type="button"
        onClick={handler}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        aria-label={`Export as ${format.toUpperCase()}`}
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        {label}
      </button>
    )
  }

  // Multiple formats - show dropdown
  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Export data"
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
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
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
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu">
              {formats.includes('csv') && (
                <button
                  onClick={exportToCSV}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  role="menuitem"
                >
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Export as CSV
                </button>
              )}
              {formats.includes('json') && (
                <button
                  onClick={exportToJSON}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  role="menuitem"
                >
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Export as JSON
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
