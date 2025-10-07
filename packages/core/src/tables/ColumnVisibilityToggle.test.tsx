import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle'
import { useReactTable, getCoreRowModel, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

interface TestData {
  id: number
  name: string
  email: string
}

function TestWrapper({ showSelect = false }: { showSelect?: boolean }) {
  const data: TestData[] = useMemo(
    () => [
      { id: 1, name: 'John', email: 'john@test.com' },
      { id: 2, name: 'Jane', email: 'jane@test.com' },
    ],
    []
  )

  const columns: ColumnDef<TestData>[] = useMemo(() => {
    const cols: ColumnDef<TestData>[] = []

    if (showSelect) {
      cols.push({
        id: 'select',
        header: 'Select',
      })
    }

    cols.push(
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      }
    )

    return cols
  }, [showSelect])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return <ColumnVisibilityToggle table={table} />
}

describe('ColumnVisibilityToggle', () => {
  it('should render toggle button', () => {
    render(<TestWrapper />)

    expect(screen.getByLabelText('Toggle column visibility')).toBeInTheDocument()
    expect(screen.getByText('Columns')).toBeInTheDocument()
  })

  it('should use custom label', () => {
    function CustomLabelWrapper() {
      const data: TestData[] = useMemo(
        () => [{ id: 1, name: 'John', email: 'john@test.com' }],
        []
      )
      const columns: ColumnDef<TestData>[] = useMemo(
        () => [{ accessorKey: 'id', header: 'ID' }],
        []
      )
      const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

      return <ColumnVisibilityToggle table={table} label="Show/Hide" />
    }

    render(<CustomLabelWrapper />)

    expect(screen.getByText('Show/Hide')).toBeInTheDocument()
  })

  it('should show column list when clicked', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)

    const button = screen.getByLabelText('Toggle column visibility')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Toggle All')).toBeInTheDocument()
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  it('should not show select or actions columns', async () => {
    const user = userEvent.setup()
    render(<TestWrapper showSelect />)

    const button = screen.getByLabelText('Toggle column visibility')
    await user.click(button)

    await waitFor(() => {
      expect(screen.queryByText('Select')).not.toBeInTheDocument()
    })
  })

  it('should toggle individual column visibility', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)

    const button = screen.getByLabelText('Toggle column visibility')
    await user.click(button)

    // Find the Name column checkbox
    const nameCheckbox = screen
      .getByText('Name')
      .previousSibling as HTMLInputElement
    expect(nameCheckbox).toBeChecked()

    // Toggle it off
    await user.click(nameCheckbox)
    expect(nameCheckbox).not.toBeChecked()

    // Toggle it back on
    await user.click(nameCheckbox)
    expect(nameCheckbox).toBeChecked()
  })

  it('should toggle all columns', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)

    const button = screen.getByLabelText('Toggle column visibility')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Toggle All')).toBeInTheDocument()
    })

    const toggleAllCheckbox = screen
      .getByText('Toggle All')
      .previousSibling as HTMLInputElement
    expect(toggleAllCheckbox).toBeChecked()

    // Toggle all off
    await user.click(toggleAllCheckbox)
    expect(toggleAllCheckbox).not.toBeChecked()

    // Verify all column checkboxes are unchecked
    const idCheckbox = screen.getByText('ID').previousSibling as HTMLInputElement
    const nameCheckbox = screen.getByText('Name').previousSibling as HTMLInputElement
    const emailCheckbox = screen.getByText('Email').previousSibling as HTMLInputElement

    expect(idCheckbox).not.toBeChecked()
    expect(nameCheckbox).not.toBeChecked()
    expect(emailCheckbox).not.toBeChecked()

    // Toggle all back on
    await user.click(toggleAllCheckbox)
    expect(toggleAllCheckbox).toBeChecked()
    expect(idCheckbox).toBeChecked()
    expect(nameCheckbox).toBeChecked()
    expect(emailCheckbox).toBeChecked()
  })

  it('should show indeterminate state when some columns hidden', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)

    const button = screen.getByLabelText('Toggle column visibility')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Toggle All')).toBeInTheDocument()
    })

    const toggleAllCheckbox = screen
      .getByText('Toggle All')
      .previousSibling as HTMLInputElement

    // Initially all checked
    expect(toggleAllCheckbox.checked).toBe(true)
    expect(toggleAllCheckbox.indeterminate).toBe(false)

    // Hide one column
    const nameCheckbox = screen.getByText('Name').previousSibling as HTMLInputElement
    await user.click(nameCheckbox)

    // Should now be indeterminate
    expect(toggleAllCheckbox.checked).toBe(false)
    expect(toggleAllCheckbox.indeterminate).toBe(true)
  })

  it('should close dropdown when button clicked again', async () => {
    const user = userEvent.setup()
    render(<TestWrapper />)

    const button = screen.getByLabelText('Toggle column visibility')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Toggle All')).toBeInTheDocument()
    })

    // Click button again to close
    await user.click(button)

    await waitFor(() => {
      expect(screen.queryByText('Toggle All')).not.toBeInTheDocument()
    })
  })

  it('should not render if no columns available', () => {
    function NoColumnsWrapper() {
      const data: TestData[] = useMemo(() => [], [])
      const columns: ColumnDef<TestData>[] = useMemo(
        () => [
          { id: 'select', header: 'Select' },
          { id: 'actions', header: 'Actions' },
        ],
        []
      )
      const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

      return <ColumnVisibilityToggle table={table} />
    }

    const { container } = render(<NoColumnsWrapper />)

    expect(container.firstChild).toBeNull()
  })
})
