import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BulkActionsToolbar, ConfirmationModal } from './BulkActionsToolbar'
import type { BulkAction } from '../types/action'

interface TestModel {
  id: number
  name: string
}

describe('BulkActionsToolbar', () => {
  const mockRows: TestModel[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ]

  it('should not render when selectedCount is 0', () => {
    const { container } = render(
      <BulkActionsToolbar
        selectedCount={0}
        selectedRows={[]}
        actions={[]}
        onClearSelection={vi.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should display selected count', () => {
    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={[]}
        onClearSelection={vi.fn()}
        resourceName="Users"
      />
    )

    expect(screen.getByText('2 Users selected')).toBeInTheDocument()
  })

  it('should use singular form for single selection', () => {
    render(
      <BulkActionsToolbar
        selectedCount={1}
        selectedRows={[mockRows[0]]}
        actions={[]}
        onClearSelection={vi.fn()}
        resourceName="Users"
      />
    )

    expect(screen.getByText('1 User selected')).toBeInTheDocument()
  })

  it('should call onClearSelection when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onClearSelection = vi.fn()

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={[]}
        onClearSelection={onClearSelection}
      />
    )

    const clearButton = screen.getByText('Clear selection')
    await user.click(clearButton)

    expect(onClearSelection).toHaveBeenCalled()
  })

  it('should render bulk action buttons', () => {
    const actions: BulkAction<TestModel>[] = [
      { label: 'Export', handler: vi.fn() },
      { label: 'Delete', handler: vi.fn(), destructive: true },
    ]

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={actions}
        onClearSelection={vi.fn()}
      />
    )

    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should execute action without confirmation', async () => {
    const user = userEvent.setup()
    const handler = vi.fn().mockResolvedValue(undefined)
    const onClearSelection = vi.fn()

    const actions: BulkAction<TestModel>[] = [
      { label: 'Export', handler, requireConfirmation: false },
    ]

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={actions}
        onClearSelection={onClearSelection}
      />
    )

    const exportButton = screen.getByText('Export')
    await user.click(exportButton)

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(mockRows)
      expect(onClearSelection).toHaveBeenCalled()
    })
  })

  it('should show confirmation modal for actions requiring confirmation', async () => {
    const user = userEvent.setup()
    const handler = vi.fn().mockResolvedValue(undefined)

    const actions: BulkAction<TestModel>[] = [
      {
        label: 'Delete',
        handler,
        requireConfirmation: true,
        confirmTitle: 'Delete Items',
        confirmMessage: 'Are you sure?',
        destructive: true,
      },
    ]

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={actions}
        onClearSelection={vi.fn()}
      />
    )

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText('Delete Items')).toBeInTheDocument()
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })
  })

  it('should execute action after confirmation', async () => {
    const user = userEvent.setup()
    const handler = vi.fn().mockResolvedValue(undefined)
    const onClearSelection = vi.fn()

    const actions: BulkAction<TestModel>[] = [
      {
        label: 'Delete',
        handler,
        requireConfirmation: true,
        destructive: true,
      },
    ]

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={actions}
        onClearSelection={onClearSelection}
      />
    )

    // Click delete button in toolbar
    const toolbarDeleteButton = screen.getAllByText('Delete')[0]
    await user.click(toolbarDeleteButton)

    // Wait for modal and click confirm
    await waitFor(() => {
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    // Get the confirm button from the modal (query again after modal appeared)
    const modalDeleteButton = screen.getAllByText('Delete')[1]
    await user.click(modalDeleteButton)

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(mockRows)
      expect(onClearSelection).toHaveBeenCalled()
    })
  })

  it('should not execute action when cancelled', async () => {
    const user = userEvent.setup()
    const handler = vi.fn().mockResolvedValue(undefined)

    const actions: BulkAction<TestModel>[] = [
      {
        label: 'Delete',
        handler,
        requireConfirmation: true,
      },
    ]

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={actions}
        onClearSelection={vi.fn()}
      />
    )

    // Click delete button
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    // Wait for modal and click cancel
    await waitFor(() => {
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    // Handler should not be called
    expect(handler).not.toHaveBeenCalled()
  })

  it('should show loading state during action execution', async () => {
    const user = userEvent.setup()
    let resolveHandler: () => void
    const handler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveHandler = resolve
        })
    )

    const actions: BulkAction<TestModel>[] = [
      { label: 'Export', handler, requireConfirmation: false },
    ]

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={actions}
        onClearSelection={vi.fn()}
      />
    )

    const exportButton = screen.getByText('Export')
    await user.click(exportButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Export\.\.\./)).toBeInTheDocument()
    })

    // Resolve and check loading state is gone
    resolveHandler!()
    await waitFor(() => {
      expect(screen.queryByText(/Export\.\.\./)).not.toBeInTheDocument()
    })
  })

  it('should disable button during execution', async () => {
    const user = userEvent.setup()
    let resolveHandler: () => void
    const handler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveHandler = resolve
        })
    )

    const actions: BulkAction<TestModel>[] = [
      { label: 'Export', handler, requireConfirmation: false },
    ]

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={actions}
        onClearSelection={vi.fn()}
      />
    )

    const exportButton = screen.getByText('Export')
    await user.click(exportButton)

    // Button should be disabled
    await waitFor(() => {
      expect(exportButton).toBeDisabled()
    })

    resolveHandler!()
  })

  it('should render destructive actions with red styling', () => {
    const actions: BulkAction<TestModel>[] = [
      { label: 'Delete', handler: vi.fn(), destructive: true },
    ]

    render(
      <BulkActionsToolbar
        selectedCount={2}
        selectedRows={mockRows}
        actions={actions}
        onClearSelection={vi.fn()}
      />
    )

    const deleteButton = screen.getByText('Delete')
    expect(deleteButton).toHaveClass('bg-red-600')
  })
})

describe('ConfirmationModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmationModal
        isOpen={false}
        title="Test"
        message="Test message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render when isOpen is true', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm Delete"
        message="Are you sure you want to delete these items?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete these items?')).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        confirmLabel="Yes, Confirm"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const confirmButton = screen.getByText('Yes, Confirm')
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled() // Also closes modal
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('should use custom labels', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Yes, Delete')).toBeInTheDocument()
    expect(screen.getByText('No, Keep')).toBeInTheDocument()
  })

  it('should render destructive style when destructive is true', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        confirmLabel="Delete Now"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        destructive={true}
      />
    )

    const confirmButton = screen.getByText('Delete Now')
    expect(confirmButton).toHaveClass('bg-red-600')
  })

  it('should call onCancel when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    const { container } = render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )

    const backdrop = container.querySelector('.bg-black\\/50')
    if (backdrop) {
      await user.click(backdrop)
      expect(onCancel).toHaveBeenCalled()
    }
  })
})
