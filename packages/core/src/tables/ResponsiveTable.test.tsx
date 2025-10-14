import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResponsiveTable } from './ResponsiveTable'
import type { BaseModel } from '../types/resource'
import type { ColumnDef } from '@tanstack/react-table'
import * as useMediaQuery from '../hooks/useMediaQuery'

interface TestUser extends BaseModel {
  id: string | number
  name: string
  email: string
  role: string
}

describe('ResponsiveTable', () => {
  const mockUsers: TestUser[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  ]

  const mockColumns: ColumnDef<TestUser>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
  ]

  const mockDesktopTable = (
    <table>
      <tbody>
        <tr>
          <td>Desktop Table Content</td>
        </tr>
      </tbody>
    </table>
  )

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should render desktop table on desktop', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
      />
    )

    expect(screen.getByTestId('desktop-table')).toBeInTheDocument()
    expect(screen.getByText('Desktop Table Content')).toBeInTheDocument()
    expect(screen.queryByTestId('mobile-cards')).not.toBeInTheDocument()
  })

  it('should render mobile cards on mobile', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
      />
    )

    expect(screen.getByTestId('mobile-cards')).toBeInTheDocument()
    expect(screen.queryByTestId('desktop-table')).not.toBeInTheDocument()
  })

  it('should extract fields from columns for mobile view', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
      />
    )

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('should use custom mobileFields when provided', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
        mobileFields={[{ key: 'name', label: 'User Name' }]}
      />
    )

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    // Should only show name field
    const cards = screen.getAllByTestId('user-card')
    expect(cards[0]).not.toHaveTextContent('alice@example.com')
  })

  it('should pass onRowClick to mobile cards', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)
    const onRowClick = vi.fn()

    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
        onRowClick={onRowClick}
      />
    )

    const firstCard = screen.getAllByTestId('user-card')[0]
    firstCard.click()

    expect(onRowClick).toHaveBeenCalledWith(mockUsers[0])
  })

  it('should pass isLoading to mobile cards', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveTable
        data={[]}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
        isLoading={true}
      />
    )

    const mobileCards = screen.getByTestId('mobile-cards')
    expect(mobileCards.querySelectorAll('.animate-pulse')).toHaveLength(3)
  })

  it('should pass emptyMessage to mobile cards', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveTable
        data={[]}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
        emptyMessage="No data available"
      />
    )

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should use custom renderMobileCard', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    const renderMobileCard = (item: TestUser) => (
      <div>Custom Card: {item.name}</div>
    )

    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
        renderMobileCard={renderMobileCard}
      />
    )

    expect(screen.getByText('Custom Card: Alice Smith')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    const { container } = render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
        className="custom-responsive-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-responsive-class')
  })

  it('should limit mobile fields to first 4 columns by default', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    const manyColumns: ColumnDef<TestUser & { extra1: string; extra2: string }>[] = [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Role' },
      { accessorKey: 'extra1', header: 'Extra 1' },
      { accessorKey: 'extra2', header: 'Extra 2' },
    ]

    const extendedUsers = mockUsers.map((u) => ({
      ...u,
      extra1: 'value1',
      extra2: 'value2',
    }))

    render(
      <ResponsiveTable
        data={extendedUsers}
        columns={manyColumns}
        desktopTable={mockDesktopTable}
      />
    )

    // Should show first 4 fields
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('should handle empty data', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveTable
        data={[]}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
      />
    )

    expect(screen.getByTestId('mobile-cards')).toBeInTheDocument()
  })

  it('should switch views based on screen size', () => {
    // Start with desktop
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    const { rerender, unmount } = render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
      />
    )

    expect(screen.getByTestId('desktop-table')).toBeInTheDocument()

    // Clean up and remount with mobile
    unmount()
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        desktopTable={mockDesktopTable}
      />
    )

    expect(screen.getByTestId('mobile-cards')).toBeInTheDocument()
  })
})
