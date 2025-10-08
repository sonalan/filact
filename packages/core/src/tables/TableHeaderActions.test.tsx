import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableHeaderActions } from './TableHeaderActions'
import type { TableHeaderAction } from '../types/table'

describe('TableHeaderActions', () => {
  it('should render actions', () => {
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick: vi.fn(),
      },
      {
        id: 'refresh',
        label: 'Refresh',
        onClick: vi.fn(),
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
  })

  it('should render nothing when no actions provided', () => {
    const { container } = render(<TableHeaderActions actions={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('should call onClick when action is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick,
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const button = screen.getByRole('button', { name: 'Create New' })
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should handle async onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn().mockResolvedValue(undefined)
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick,
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const button = screen.getByRole('button', { name: 'Create New' })
    await user.click(button)

    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  it('should show loading spinner during async operation', async () => {
    const user = userEvent.setup()
    let resolve: () => void
    const promise = new Promise<void>((res) => {
      resolve = res
    })
    const onClick = vi.fn().mockReturnValue(promise)

    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick,
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const button = screen.getByRole('button', { name: 'Create New' })
    await user.click(button)

    // Loading spinner should be visible
    const svg = button.querySelector('svg')
    expect(svg).toHaveClass('animate-spin')

    resolve!()
    await waitFor(() => {
      expect(button.querySelector('svg')).toBeNull()
    })
  })

  it('should disable action when disabled prop is true', () => {
    const onClick = vi.fn()
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick,
        disabled: true,
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const button = screen.getByRole('button', { name: 'Create New' })
    expect(button).toBeDisabled()
  })

  it('should not call onClick when action is disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick,
        disabled: true,
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const button = screen.getByRole('button', { name: 'Create New' })
    await user.click(button)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('should render action with icon', () => {
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        icon: <span data-testid="icon">+</span>,
        onClick: vi.fn(),
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should apply variant styles', () => {
    const actions: TableHeaderAction[] = [
      {
        id: 'primary',
        label: 'Primary',
        onClick: vi.fn(),
        variant: 'primary',
      },
      {
        id: 'destructive',
        label: 'Delete',
        onClick: vi.fn(),
        variant: 'destructive',
      },
      {
        id: 'outline',
        label: 'Outline',
        onClick: vi.fn(),
        variant: 'outline',
      },
      {
        id: 'ghost',
        label: 'Ghost',
        onClick: vi.fn(),
        variant: 'ghost',
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const primaryButton = screen.getByRole('button', { name: 'Primary' })
    const destructiveButton = screen.getByRole('button', { name: 'Delete' })
    const outlineButton = screen.getByRole('button', { name: 'Outline' })
    const ghostButton = screen.getByRole('button', { name: 'Ghost' })

    expect(primaryButton).toHaveClass('bg-blue-600')
    expect(destructiveButton).toHaveClass('bg-red-600')
    expect(outlineButton).toHaveClass('border')
    expect(ghostButton).toHaveClass('hover:bg-gray-100')
  })

  it('should render tooltip', () => {
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick: vi.fn(),
        tooltip: 'Create a new record',
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Create a new record')
  })

  it('should apply custom className', () => {
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick: vi.fn(),
        className: 'custom-class',
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const button = screen.getByRole('button', { name: 'Create New' })
    expect(button).toHaveClass('custom-class')
  })

  it('should prevent multiple clicks during async operation', async () => {
    const user = userEvent.setup()
    let resolve: () => void
    const promise = new Promise<void>((res) => {
      resolve = res
    })
    const onClick = vi.fn().mockReturnValue(promise)

    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create New',
        onClick,
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    const button = screen.getByRole('button', { name: 'Create New' })

    // Click multiple times
    await user.click(button)
    await user.click(button)
    await user.click(button)

    // Should only be called once
    expect(onClick).toHaveBeenCalledTimes(1)

    resolve!()
  })

  it('should render multiple actions', () => {
    const actions: TableHeaderAction[] = [
      {
        id: 'create',
        label: 'Create',
        onClick: vi.fn(),
      },
      {
        id: 'import',
        label: 'Import',
        onClick: vi.fn(),
      },
      {
        id: 'export',
        label: 'Export',
        onClick: vi.fn(),
      },
    ]

    render(<TableHeaderActions actions={actions} />)

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })
})
