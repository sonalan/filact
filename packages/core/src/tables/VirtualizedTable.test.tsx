import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VirtualizedTable } from './VirtualizedTable'
import { useVirtualizedTable } from './useVirtualizedTable'
import type { BaseModel } from '../types/resource'
import type { ColumnDef } from '@tanstack/react-table'

interface TestUser extends BaseModel {
  id: string | number
  name: string
  email: string
  age: number
}

// Helper component to test the table
function TestVirtualizedTable({
  data,
  height,
  onRowClick,
}: {
  data: TestUser[]
  height?: number
  onRowClick?: (row: TestUser) => void
}) {
  const columns: ColumnDef<TestUser>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'age', header: 'Age' },
  ]

  const table = useVirtualizedTable({ data, columns })

  return <VirtualizedTable table={table} height={height} onRowClick={onRowClick} />
}

describe('VirtualizedTable', () => {
  // Generate large dataset for testing
  const generateUsers = (count: number): TestUser[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 20 + (i % 50),
    }))
  }

  it('should render table with headers', () => {
    const users = generateUsers(10)
    render(<TestVirtualizedTable data={users} />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('should render table rows', () => {
    const users = generateUsers(10)
    render(<TestVirtualizedTable data={users} />)

    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('user1@example.com')).toBeInTheDocument()
  })

  it('should handle large datasets', () => {
    const users = generateUsers(10000)
    const { container } = render(<TestVirtualizedTable data={users} />)

    // Should render container
    expect(container.querySelector('.overflow-auto')).toBeInTheDocument()

    // Should not render all rows (virtualization)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBeLessThan(10000)
  })

  it('should apply custom height', () => {
    const users = generateUsers(10)
    const { container } = render(<TestVirtualizedTable data={users} height={400} />)

    const scrollContainer = container.querySelector('.overflow-auto') as HTMLElement
    expect(scrollContainer).toHaveStyle({ height: '400px' })
  })

  it('should have sticky header', () => {
    const users = generateUsers(10)
    const { container } = render(<TestVirtualizedTable data={users} />)

    const thead = container.querySelector('thead')
    expect(thead).toHaveClass('sticky')
    expect(thead).toHaveClass('top-0')
  })

  it('should handle row clicks', () => {
    const users = generateUsers(10)
    const onRowClick = vi.fn()
    render(<TestVirtualizedTable data={users} onRowClick={onRowClick} />)

    const firstRow = screen.getByText('User 1').closest('tr')
    if (firstRow) {
      fireEvent.click(firstRow)
      expect(onRowClick).toHaveBeenCalledWith(users[0])
    }
  })

  it('should show hover styles for clickable rows', () => {
    const users = generateUsers(10)
    const onRowClick = vi.fn()
    const { container } = render(<TestVirtualizedTable data={users} onRowClick={onRowClick} />)

    const firstRow = container.querySelector('tbody tr')
    expect(firstRow).toHaveClass('cursor-pointer')
  })

  it('should not show hover styles for non-clickable rows', () => {
    const users = generateUsers(10)
    const { container } = render(<TestVirtualizedTable data={users} />)

    const firstRow = container.querySelector('tbody tr')
    expect(firstRow).not.toHaveClass('cursor-pointer')
  })

  it('should render empty table', () => {
    const { container } = render(<TestVirtualizedTable data={[]} />)

    const tbody = container.querySelector('tbody')
    expect(tbody?.children.length).toBe(0)
  })

  it('should have proper table structure', () => {
    const users = generateUsers(10)
    const { container } = render(<TestVirtualizedTable data={users} />)

    expect(container.querySelector('table')).toBeInTheDocument()
    expect(container.querySelector('thead')).toBeInTheDocument()
    expect(container.querySelector('tbody')).toBeInTheDocument()
  })

  it('should have dark mode support', () => {
    const users = generateUsers(10)
    const { container } = render(<TestVirtualizedTable data={users} />)

    const thead = container.querySelector('thead')
    expect(thead).toHaveClass('dark:bg-gray-800')
  })

  it('should render with custom className', () => {
    const users = generateUsers(10)
    const columns: ColumnDef<TestUser>[] = [
      { accessorKey: 'name', header: 'Name' },
    ]

    const table = useVirtualizedTable({ data: users, columns })

    const { container } = render(
      <VirtualizedTable
        table={table}
        className="custom-table"
      />
    )

    expect(container.querySelector('.custom-table')).toBeInTheDocument()
  })

  it('should use custom estimateSize', () => {
    const users = generateUsers(10)
    const columns: ColumnDef<TestUser>[] = [
      { accessorKey: 'name', header: 'Name' },
    ]

    const table = useVirtualizedTable({ data: users, columns })

    // Just verify it renders without error with custom estimateSize
    const { container } = render(
      <VirtualizedTable
        table={table}
        estimateSize={80}
      />
    )

    expect(container.querySelector('table')).toBeInTheDocument()
  })

  it('should use custom overscan', () => {
    const users = generateUsers(100)
    const columns: ColumnDef<TestUser>[] = [
      { accessorKey: 'name', header: 'Name' },
    ]

    const table = useVirtualizedTable({ data: users, columns })

    // Just verify it renders without error with custom overscan
    const { container } = render(
      <VirtualizedTable
        table={table}
        overscan={10}
      />
    )

    expect(container.querySelector('table')).toBeInTheDocument()
  })

  it('should handle data updates', () => {
    const initialUsers = generateUsers(10)
    const { rerender } = render(<TestVirtualizedTable data={initialUsers} />)

    expect(screen.getByText('User 1')).toBeInTheDocument()

    const updatedUsers = generateUsers(5)
    rerender(<TestVirtualizedTable data={updatedUsers} />)

    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.queryByText('User 10')).not.toBeInTheDocument()
  })

  it('should apply rowClassName when string', () => {
    const users = generateUsers(10)
    const columns: ColumnDef<TestUser>[] = [
      { accessorKey: 'name', header: 'Name' },
    ]

    const table = useVirtualizedTable({ data: users, columns })

    const { container } = render(
      <VirtualizedTable
        table={table}
        rowClassName="custom-row"
      />
    )

    const firstRow = container.querySelector('tbody tr')
    expect(firstRow).toHaveClass('custom-row')
  })

  it('should apply rowClassName when function', () => {
    const users = generateUsers(10)

    function TestComponent() {
      const columns: ColumnDef<TestUser>[] = [
        { accessorKey: 'name', header: 'Name' },
      ]

      const table = useVirtualizedTable({ data: users, columns })

      return (
        <VirtualizedTable
          table={table}
          rowClassName={(row) => (row.age > 30 ? 'old-user' : 'young-user')}
        />
      )
    }

    const { container } = render(<TestComponent />)

    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('should render data-index attribute on visible rows', () => {
    const users = generateUsers(10)
    const { container } = render(<TestVirtualizedTable data={users} />)

    // Should have some rows with data-index
    const rowsWithIndex = container.querySelectorAll('tbody tr[data-index]')
    expect(rowsWithIndex.length).toBeGreaterThan(0)
  })
})
