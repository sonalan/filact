import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActiveFilters, type ActiveFilter } from './ActiveFilters'

describe('ActiveFilters', () => {
  const mockFilters: ActiveFilter[] = [
    { name: 'status', label: 'Status', value: 'active', displayValue: 'Active' },
    { name: 'role', label: 'Role', value: 'admin', displayValue: 'Admin' },
  ]

  it('should render active filters', () => {
    render(<ActiveFilters filters={mockFilters} onClearFilter={vi.fn()} />)

    expect(screen.getByText('Active filters:')).toBeInTheDocument()
    expect(screen.getByText('Status:')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Role:')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should render nothing when no filters', () => {
    const { container } = render(<ActiveFilters filters={[]} onClearFilter={vi.fn()} />)

    expect(container.firstChild).toBeNull()
  })

  it('should call onClearFilter when remove button clicked', async () => {
    const onClearFilter = vi.fn()
    const user = userEvent.setup()

    render(<ActiveFilters filters={mockFilters} onClearFilter={onClearFilter} />)

    const removeButtons = screen.getAllByLabelText(/Remove .* filter/)
    await user.click(removeButtons[0])

    expect(onClearFilter).toHaveBeenCalledWith('status')
  })

  it('should display clear all button when multiple filters', () => {
    render(<ActiveFilters filters={mockFilters} onClearFilter={vi.fn()} />)

    expect(screen.getByText('Clear all')).toBeInTheDocument()
  })

  it('should not display clear all button when single filter', () => {
    const singleFilter: ActiveFilter[] = [mockFilters[0]]

    render(<ActiveFilters filters={singleFilter} onClearFilter={vi.fn()} />)

    expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
  })

  it('should not display clear all button when showClearAll is false', () => {
    render(
      <ActiveFilters filters={mockFilters} onClearFilter={vi.fn()} showClearAll={false} />
    )

    expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
  })

  it('should call onClearAll when clear all button clicked', async () => {
    const onClearAll = vi.fn()
    const user = userEvent.setup()

    render(
      <ActiveFilters filters={mockFilters} onClearFilter={vi.fn()} onClearAll={onClearAll} />
    )

    await user.click(screen.getByText('Clear all'))

    expect(onClearAll).toHaveBeenCalled()
  })

  it('should call onClearFilter for each filter when clear all clicked without onClearAll', async () => {
    const onClearFilter = vi.fn()
    const user = userEvent.setup()

    render(<ActiveFilters filters={mockFilters} onClearFilter={onClearFilter} />)

    await user.click(screen.getByText('Clear all'))

    expect(onClearFilter).toHaveBeenCalledTimes(2)
    expect(onClearFilter).toHaveBeenCalledWith('status')
    expect(onClearFilter).toHaveBeenCalledWith('role')
  })

  it('should use displayValue when provided', () => {
    const filters: ActiveFilter[] = [
      { name: 'date', label: 'Date', value: '2024-01-01', displayValue: 'January 1, 2024' },
    ]

    render(<ActiveFilters filters={filters} onClearFilter={vi.fn()} />)

    expect(screen.getByText('January 1, 2024')).toBeInTheDocument()
    expect(screen.queryByText('2024-01-01')).not.toBeInTheDocument()
  })

  it('should use value as string when displayValue not provided', () => {
    const filters: ActiveFilter[] = [
      { name: 'count', label: 'Count', value: 42 },
    ]

    render(<ActiveFilters filters={filters} onClearFilter={vi.fn()} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ActiveFilters filters={mockFilters} onClearFilter={vi.fn()} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should have proper aria labels for remove buttons', () => {
    render(<ActiveFilters filters={mockFilters} onClearFilter={vi.fn()} />)

    expect(screen.getByLabelText('Remove Status filter')).toBeInTheDocument()
    expect(screen.getByLabelText('Remove Role filter')).toBeInTheDocument()
  })
})
