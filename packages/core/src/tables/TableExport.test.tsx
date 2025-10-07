import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableExport } from './TableExport'
import { useReactTable, getCoreRowModel, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

interface TestData {
  id: number
  name: string
  email: string
}

function TestWrapper({ formats }: { formats?: ('csv' | 'json')[] }) {
  const data: TestData[] = useMemo(
    () => [
      { id: 1, name: 'John Doe', email: 'john@test.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@test.com' },
    ],
    []
  )

  const columns: ColumnDef<TestData>[] = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return <TableExport table={table} formats={formats} />
}

describe('TableExport', () => {
  let mockCreateElement: ReturnType<typeof vi.spyOn>
  let mockCreateObjectURL: ReturnType<typeof vi.fn>
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>
  let mockClick: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock URL methods - define them if they don't exist in jsdom
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    mockRevokeObjectURL = vi.fn()

    if (!URL.createObjectURL) {
      URL.createObjectURL = mockCreateObjectURL as any
    } else {
      vi.spyOn(URL, 'createObjectURL').mockImplementation(mockCreateObjectURL)
    }

    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = mockRevokeObjectURL as any
    } else {
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mockRevokeObjectURL)
    }

    // Mock createElement to intercept link creation
    const originalCreateElement = document.createElement.bind(document)
    mockClick = vi.fn()
    mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        const link = originalCreateElement('a')
        link.click = mockClick
        return link
      }
      return originalCreateElement(tagName as any)
    })
  })

  afterEach(() => {
    if (mockCreateElement) {
      mockCreateElement.mockRestore()
    }
    vi.restoreAllMocks()
  })

  it('should render export button with default formats', () => {
    render(<TestWrapper />)

    expect(screen.getByLabelText('Export data')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('should show dropdown for multiple formats', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)

    const button = screen.getByLabelText('Export data')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument()
      expect(screen.getByText('Export as JSON')).toBeInTheDocument()
    })
  })

  it('should show single button for one format', () => {
    render(<TestWrapper formats={['csv']} />)

    const button = screen.getByLabelText('Export as CSV')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Export')
  })

  it('should export to CSV', async () => {
    const user = userEvent.setup()
    render(<TestWrapper formats={['csv']} />)

    const button = screen.getByLabelText('Export as CSV')
    await user.click(button)

    expect(mockClick).toHaveBeenCalled()
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(mockRevokeObjectURL).toHaveBeenCalled()

    // Check the blob content
    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob
    expect(blob.type).toBe('text/csv;charset=utf-8;')

    // Read blob using FileReader for jsdom compatibility
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsText(blob)
    })
    expect(text).toContain('"ID","Name","Email"')
    expect(text).toContain('"1","John Doe","john@test.com"')
    expect(text).toContain('"2","Jane Smith","jane@test.com"')
  })

  it('should export to JSON', async () => {
    const user = userEvent.setup()
    render(<TestWrapper formats={['json']} />)

    const button = screen.getByLabelText('Export as JSON')
    await user.click(button)

    expect(mockClick).toHaveBeenCalled()
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()

    // Check the blob content
    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob
    expect(blob.type).toBe('application/json;charset=utf-8;')

    // Read blob using FileReader for jsdom compatibility
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsText(blob)
    })
    const data = JSON.parse(text)
    expect(data).toEqual([
      { ID: 1, Name: 'John Doe', Email: 'john@test.com' },
      { ID: 2, Name: 'Jane Smith', Email: 'jane@test.com' },
    ])
  })

  it('should use custom filename', async () => {
    const user = userEvent.setup()
    let capturedLink: HTMLAnchorElement | null = null

    // Capture the created link before it's removed
    const originalCreateElement = document.createElement.bind(document)
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        const link = originalCreateElement('a')
        link.click = mockClick
        capturedLink = link
        return link
      }
      return originalCreateElement(tagName as any)
    })

    function CustomFilenameWrapper() {
      const data: TestData[] = useMemo(
        () => [{ id: 1, name: 'John', email: 'john@test.com' }],
        []
      )
      const columns: ColumnDef<TestData>[] = useMemo(
        () => [{ accessorKey: 'id', header: 'ID' }],
        []
      )
      const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
      return <TableExport table={table} filename="my-data" formats={['csv']} />
    }

    render(<CustomFilenameWrapper />)

    const button = screen.getByLabelText('Export as CSV')
    await user.click(button)

    expect(capturedLink?.download).toBe('my-data.csv')
    createElementSpy.mockRestore()
  })

  it('should handle CSV with quotes in data', async () => {
    const user = userEvent.setup()

    function QuotesWrapper() {
      const data: TestData[] = useMemo(
        () => [{ id: 1, name: 'John "Johnny" Doe', email: 'john@test.com' }],
        []
      )
      const columns: ColumnDef<TestData>[] = useMemo(
        () => [
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'name', header: 'Name' },
        ],
        []
      )
      const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
      return <TableExport table={table} formats={['csv']} />
    }

    render(<QuotesWrapper />)

    const button = screen.getByLabelText('Export as CSV')
    await user.click(button)

    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob
    // Read blob using FileReader for jsdom compatibility
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsText(blob)
    })
    // Quotes should be escaped
    expect(text).toContain('"John ""Johnny"" Doe"')
  })

  it('should close dropdown after export', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)

    const button = screen.getByLabelText('Export data')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument()
    })

    const csvButton = screen.getByText('Export as CSV')
    await user.click(csvButton)

    await waitFor(() => {
      expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument()
    })
  })

  it('should not render if no formats specified', () => {
    const { container } = render(<TestWrapper formats={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should filter out select and actions columns', async () => {
    const user = userEvent.setup()

    function FilterColumnsWrapper() {
      const data: TestData[] = useMemo(
        () => [{ id: 1, name: 'John', email: 'john@test.com' }],
        []
      )
      const columns: ColumnDef<TestData>[] = useMemo(
        () => [
          { id: 'select', header: 'Select' },
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'name', header: 'Name' },
          { id: 'actions', header: 'Actions' },
        ],
        []
      )
      const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
      return <TableExport table={table} formats={['csv']} />
    }

    render(<FilterColumnsWrapper />)

    const button = screen.getByLabelText('Export as CSV')
    await user.click(button)

    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob
    // Read blob using FileReader for jsdom compatibility
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsText(blob)
    })
    // Should not include select or actions columns
    expect(text).not.toContain('Select')
    expect(text).not.toContain('Actions')
    expect(text).toContain('"ID","Name"')
  })
})
