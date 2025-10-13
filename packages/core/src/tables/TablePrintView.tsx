/**
 * Table Print View
 * Print-optimized view of table data
 */

import { useEffect } from 'react'
import type { Table } from '@tanstack/react-table'

export interface TablePrintViewProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>

  /** Document title for print */
  title?: string

  /** Show table borders */
  borders?: boolean

  /** Custom print styles */
  customStyles?: string

  /** Callback when print dialog closes */
  onAfterPrint?: () => void
}

/**
 * Generate print-friendly HTML for table
 */
export function generatePrintHTML<TData>(
  table: Table<TData>,
  title?: string,
  borders: boolean = true
): string {
  const columns = table
    .getAllLeafColumns()
    .filter((col) => col.getIsVisible() && col.id !== 'select' && col.id !== 'actions')

  const rows = table.getFilteredRowModel().rows

  const borderStyle = borders ? 'border: 1px solid #e5e7eb;' : ''
  const tableStyle = `
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    ${borderStyle}
  `

  const headerStyle = `
    background-color: #f3f4f6;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    ${borderStyle}
  `

  const cellStyle = `
    padding: 10px;
    ${borderStyle}
  `

  const headerCells = columns
    .map((col) => {
      const header = col.columnDef.header
      const headerText = typeof header === 'string' ? header : col.id
      return `<th style="${headerStyle}">${headerText}</th>`
    })
    .join('')

  const bodyRows = rows
    .map(
      (row, index) => `
    <tr style="${index % 2 === 1 ? 'background-color: #f9fafb;' : ''}">
      ${columns
        .map((col) => {
          const value = row.getValue(col.id)
          const cellText = value != null ? String(value) : ''
          return `<td style="${cellStyle}">${cellText}</td>`
        })
        .join('')}
    </tr>
  `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title || 'Table Print'}</title>
      <style>
        @media print {
          @page {
            margin: 1cm;
          }

          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .no-print {
            display: none !important;
          }
        }

        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }

        h1 {
          margin-bottom: 20px;
          color: #1f2937;
        }

        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }

        .print-date {
          color: #6b7280;
          font-size: 14px;
        }

        .print-button {
          padding: 10px 20px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .print-button:hover {
          background-color: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>${title || 'Table Data'}</h1>
        <div class="print-date">Printed: ${new Date().toLocaleDateString()}</div>
      </div>
      <button class="print-button no-print" onclick="window.print()">Print</button>
      <table style="${tableStyle}">
        <thead>
          <tr>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </body>
    </html>
  `
}

/**
 * Open print dialog for table
 */
export function printTable<TData>(
  table: Table<TData>,
  options: {
    title?: string
    borders?: boolean
    onAfterPrint?: () => void
  } = {}
): void {
  const { title, borders = true, onAfterPrint } = options

  const printHTML = generatePrintHTML(table, title, borders)

  // Create a hidden iframe
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'

  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    console.error('Failed to get iframe document')
    document.body.removeChild(iframe)
    return
  }

  // Write content to iframe
  iframeDoc.open()
  iframeDoc.write(printHTML)
  iframeDoc.close()

  // Wait for content to load, then print
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()

      // Clean up after print
      setTimeout(() => {
        document.body.removeChild(iframe)
        if (onAfterPrint) {
          onAfterPrint()
        }
      }, 100)
    }, 100)
  }
}

/**
 * Hook for table print functionality
 */
export function useTablePrint<TData>(table: Table<TData>) {
  const print = (options?: { title?: string; borders?: boolean }) => {
    printTable(table, options)
  }

  const openPrintPreview = (options?: { title?: string; borders?: boolean }) => {
    const { title, borders = true } = options || {}
    const printHTML = generatePrintHTML(table, title, borders)

    // Open in new window for preview
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printHTML)
      printWindow.document.close()
    }
  }

  return { print, openPrintPreview }
}

/**
 * TablePrintView Component
 * Renders a print button with dropdown options
 */
export function TablePrintView<TData>({
  table,
  title,
  borders = true,
  customStyles,
  onAfterPrint,
}: TablePrintViewProps<TData>) {
  const { print, openPrintPreview } = useTablePrint(table)

  useEffect(() => {
    // Add custom styles if provided
    if (customStyles) {
      const styleEl = document.createElement('style')
      styleEl.textContent = customStyles
      document.head.appendChild(styleEl)

      return () => {
        document.head.removeChild(styleEl)
      }
    }
  }, [customStyles])

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => print({ title, borders })}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Print table"
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
            clipRule="evenodd"
          />
        </svg>
        Print
      </button>

      <button
        type="button"
        onClick={() => openPrintPreview({ title, borders })}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Print preview"
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
        Preview
      </button>
    </div>
  )
}
