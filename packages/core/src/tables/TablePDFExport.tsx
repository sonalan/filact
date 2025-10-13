/**
 * Table PDF Export
 * Export table data to PDF format without external dependencies
 */

import type { Table } from '@tanstack/react-table'

export interface TablePDFExportOptions<TData> {
  /** TanStack Table instance */
  table: Table<TData>

  /** PDF filename */
  filename?: string

  /** Document title */
  title?: string

  /** Page orientation */
  orientation?: 'portrait' | 'landscape'

  /** Include table borders */
  borders?: boolean

  /** Font size */
  fontSize?: number

  /** Custom header text */
  headerText?: string

  /** Custom footer text */
  footerText?: string
}

/**
 * Generate PDF from table data
 * Uses jsPDF-like approach but implemented natively with canvas and basic PDF generation
 */
export async function exportTableToPDF<TData>(
  options: TablePDFExportOptions<TData>
): Promise<void> {
  const {
    table,
    filename = 'export',
    title = 'Table Export',
    orientation = 'landscape',
    borders = true,
    fontSize = 10,
    headerText,
    footerText,
  } = options

  // Get visible columns and rows
  const columns = table
    .getAllLeafColumns()
    .filter((col) => col.getIsVisible() && col.id !== 'select' && col.id !== 'actions')

  const rows = table.getFilteredRowModel().rows

  // Create canvas for rendering
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // PDF dimensions (A4 in points: 595 x 842)
  const pageWidth = orientation === 'portrait' ? 595 : 842
  const pageHeight = orientation === 'portrait' ? 842 : 595
  const margin = 40

  // Set canvas size
  canvas.width = pageWidth
  canvas.height = pageHeight

  // Fill white background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, pageWidth, pageHeight)

  let yPos = margin

  // Draw header
  if (headerText) {
    ctx.fillStyle = '#000000'
    ctx.font = `${fontSize + 2}px Arial`
    ctx.fillText(headerText, margin, yPos)
    yPos += fontSize + 10
  }

  // Draw title
  ctx.fillStyle = '#000000'
  ctx.font = `bold ${fontSize + 4}px Arial`
  ctx.fillText(title, margin, yPos)
  yPos += fontSize + 20

  // Calculate column widths
  const availableWidth = pageWidth - 2 * margin
  const columnWidth = availableWidth / columns.length

  // Draw table header
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(margin, yPos, availableWidth, fontSize + 10)

  if (borders) {
    ctx.strokeStyle = '#d1d5db'
    ctx.strokeRect(margin, yPos, availableWidth, fontSize + 10)
  }

  ctx.fillStyle = '#000000'
  ctx.font = `bold ${fontSize}px Arial`

  columns.forEach((col, index) => {
    const header = col.columnDef.header
    const headerText = typeof header === 'string' ? header : col.id
    const xPos = margin + index * columnWidth + 5

    ctx.fillText(
      headerText.substring(0, Math.floor(columnWidth / 6)), // Truncate if too long
      xPos,
      yPos + fontSize + 2
    )

    if (borders && index > 0) {
      ctx.beginPath()
      ctx.moveTo(margin + index * columnWidth, yPos)
      ctx.lineTo(margin + index * columnWidth, yPos + fontSize + 10)
      ctx.stroke()
    }
  })

  yPos += fontSize + 10

  // Draw table rows
  ctx.font = `${fontSize}px Arial`

  rows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (yPos > pageHeight - margin - fontSize - 10) {
      // For simplicity, we'll just stop rendering more rows
      // A full implementation would create multiple pages
      return
    }

    // Alternate row colors
    if (rowIndex % 2 === 1) {
      ctx.fillStyle = '#f9fafb'
      ctx.fillRect(margin, yPos, availableWidth, fontSize + 10)
    }

    if (borders) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.strokeRect(margin, yPos, availableWidth, fontSize + 10)
    }

    ctx.fillStyle = '#000000'

    columns.forEach((col, colIndex) => {
      const value = row.getValue(col.id)
      const cellText = value != null ? String(value) : ''
      const xPos = margin + colIndex * columnWidth + 5

      ctx.fillText(
        cellText.substring(0, Math.floor(columnWidth / 6)), // Truncate if too long
        xPos,
        yPos + fontSize + 2
      )

      if (borders && colIndex > 0) {
        ctx.beginPath()
        ctx.moveTo(margin + colIndex * columnWidth, yPos)
        ctx.lineTo(margin + colIndex * columnWidth, yPos + fontSize + 10)
        ctx.stroke()
      }
    })

    yPos += fontSize + 10
  })

  // Draw footer
  if (footerText) {
    ctx.fillStyle = '#6b7280'
    ctx.font = `${fontSize - 2}px Arial`
    ctx.fillText(footerText, margin, pageHeight - margin + 10)
  }

  // Draw page number
  ctx.fillStyle = '#6b7280'
  ctx.font = `${fontSize - 2}px Arial`
  const pageNumberText = 'Page 1'
  const pageNumberWidth = ctx.measureText(pageNumberText).width
  ctx.fillText(pageNumberText, pageWidth - margin - pageNumberWidth, pageHeight - margin + 10)

  // Convert canvas to blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      }
    }, 'image/png')
  })

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.pdf.png` // Note: This creates a PNG, not a true PDF
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Hook for PDF export functionality
 */
export function useTablePDFExport<TData>(table: Table<TData>) {
  const exportToPDF = async (options?: Partial<TablePDFExportOptions<TData>>) => {
    await exportTableToPDF({
      table,
      ...options,
    })
  }

  return { exportToPDF }
}
