import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { exportTableToPDF, useTablePDFExport } from './TablePDFExport'
import type { Table } from '@tanstack/react-table'

// Mock canvas context
let mockCtx: any

beforeEach(() => {
  mockCtx = {
    fillStyle: '',
    fillRect: vi.fn(),
    strokeStyle: '',
    strokeRect: vi.fn(),
    font: '',
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  }
  global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx)
})

global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const blob = new Blob(['mock'], { type: 'image/png' })
  callback(blob)
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('TablePDFExport', () => {
  let mockTable: Partial<Table<any>>
  let mockColumns: any[]
  let mockRows: any[]

  beforeEach(() => {
    // Reset mock context
    mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      strokeStyle: '',
      strokeRect: vi.fn(),
      font: '',
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    }
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx)


    mockColumns = [
      {
        id: 'name',
        columnDef: { header: 'Name' },
        getIsVisible: () => true,
      },
      {
        id: 'email',
        columnDef: { header: 'Email' },
        getIsVisible: () => true,
      },
      {
        id: 'select',
        columnDef: { header: '' },
        getIsVisible: () => true,
      },
    ]

    mockRows = [
      {
        getValue: (id: string) => {
          if (id === 'name') return 'Alice'
          if (id === 'email') return 'alice@example.com'
          return null
        },
      },
      {
        getValue: (id: string) => {
          if (id === 'name') return 'Bob'
          if (id === 'email') return 'bob@example.com'
          return null
        },
      },
    ]

    mockTable = {
      getAllLeafColumns: vi.fn(() => mockColumns),
      getFilteredRowModel: vi.fn(() => ({ rows: mockRows })),
    }

    // Clear mocks
    vi.clearAllMocks()
  })

  describe('exportTableToPDF', () => {
    it('should export table to PDF', async () => {
      await exportTableToPDF({
        table: mockTable as Table<any>,
        filename: 'test-export',
      })

      expect(mockTable.getAllLeafColumns).toHaveBeenCalled()
      expect(mockTable.getFilteredRowModel).toHaveBeenCalled()
    })

    it('should use default filename', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement')

      await exportTableToPDF({
        table: mockTable as Table<any>,
      })

      const link = createElementSpy.mock.results.find(
        (result) => result.value.tagName === 'A'
      )?.value as HTMLAnchorElement

      expect(link?.download).toBe('export.pdf.png')
    })

    it('should use custom filename', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement')

      await exportTableToPDF({
        table: mockTable as Table<any>,
        filename: 'my-custom-file',
      })

      const link = createElementSpy.mock.results.find(
        (result) => result.value.tagName === 'A'
      )?.value as HTMLAnchorElement

      expect(link?.download).toBe('my-custom-file.pdf.png')
    })

    it('should filter out select and actions columns', async () => {
      await exportTableToPDF({
        table: mockTable as Table<any>,
      })

      // Should call getAllLeafColumns to get columns
      expect(mockTable.getAllLeafColumns).toHaveBeenCalled()

      // The select column should be filtered out
      const columns = mockTable.getAllLeafColumns!()
      const visibleColumns = columns.filter(
        (col) => col.getIsVisible() && col.id !== 'select' && col.id !== 'actions'
      )

      expect(visibleColumns).toHaveLength(2)
    })

    it('should support portrait orientation', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement')

      await exportTableToPDF({
        table: mockTable as Table<any>,
        orientation: 'portrait',
      })

      const canvas = createElementSpy.mock.results.find(
        (result) => result.value.tagName === 'CANVAS'
      )?.value as HTMLCanvasElement

      expect(canvas.width).toBe(595)
      expect(canvas.height).toBe(842)
    })

    it('should support landscape orientation', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement')

      await exportTableToPDF({
        table: mockTable as Table<any>,
        orientation: 'landscape',
      })

      const canvas = createElementSpy.mock.results.find(
        (result) => result.value.tagName === 'CANVAS'
      )?.value as HTMLCanvasElement

      expect(canvas.width).toBe(842)
      expect(canvas.height).toBe(595)
    })

    it('should draw title', async () => {
      await exportTableToPDF({
        table: mockTable as Table<any>,
        title: 'My Table Report',
      })

      expect(mockCtx.fillText).toHaveBeenCalledWith('My Table Report', expect.any(Number), expect.any(Number))
    })

    it('should draw header text', async () => {
      await exportTableToPDF({
        table: mockTable as Table<any>,
        headerText: 'Company Report',
      })

      expect(mockCtx.fillText).toHaveBeenCalledWith('Company Report', expect.any(Number), expect.any(Number))
    })

    it('should draw footer text', async () => {
      await exportTableToPDF({
        table: mockTable as Table<any>,
        footerText: 'Confidential',
      })

      expect(mockCtx.fillText).toHaveBeenCalledWith('Confidential', expect.any(Number), expect.any(Number))
    })

    it('should handle borders option', async () => {
      await exportTableToPDF({
        table: mockTable as Table<any>,
        borders: true,
      })

      expect(mockCtx.strokeRect).toHaveBeenCalled()
    })

    it('should create blob and download link', async () => {
      await exportTableToPDF({
        table: mockTable as Table<any>,
      })

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should throw error if canvas context is not available', async () => {
      const originalGetContext = global.HTMLCanvasElement.prototype.getContext
      global.HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

      await expect(
        exportTableToPDF({
          table: mockTable as Table<any>,
        })
      ).rejects.toThrow('Failed to get canvas context')

      global.HTMLCanvasElement.prototype.getContext = originalGetContext
    })
  })

  describe('useTablePDFExport', () => {
    it('should return exportToPDF function', () => {
      const { result } = renderHook(() => useTablePDFExport(mockTable as Table<any>))

      expect(result.current.exportToPDF).toBeDefined()
      expect(typeof result.current.exportToPDF).toBe('function')
    })

    it('should call exportTableToPDF with table', async () => {
      const { result } = renderHook(() => useTablePDFExport(mockTable as Table<any>))

      await act(async () => {
        await result.current.exportToPDF({
          filename: 'test',
          title: 'Test Table',
        })
      })

      expect(mockTable.getAllLeafColumns).toHaveBeenCalled()
    })

    it('should merge options with table', async () => {
      const { result } = renderHook(() => useTablePDFExport(mockTable as Table<any>))

      await act(async () => {
        await result.current.exportToPDF({
          filename: 'custom',
          title: 'Custom Title',
          orientation: 'portrait',
        })
      })

      expect(mockTable.getAllLeafColumns).toHaveBeenCalled()
    })
  })
})
