import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RowActionsDropdown } from './RowActionsDropdown'
import type { ButtonActionConfig, Action } from '../types/action'

interface TestModel {
  id: number
  name: string
}

describe('RowActionsDropdown', () => {
  const testRecord: TestModel = { id: 1, name: 'Test' }

  it('should render dropdown button', () => {
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick: vi.fn(),
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    expect(screen.getByLabelText('Row actions')).toBeInTheDocument()
  })

  it('should not render if no visible actions', () => {
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick: vi.fn(),
        visible: false,
      },
    ]

    const { container } = render(<RowActionsDropdown record={testRecord} actions={actions} />)

    expect(container.firstChild).toBeNull()
  })

  it('should show actions when dropdown is clicked', async () => {
    const user = userEvent.setup()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick: vi.fn(),
      },
      {
        id: 'delete',
        type: 'button',
        label: 'Delete',
        onClick: vi.fn(),
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
    })
  })

  it('should execute action when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick,
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const editAction = await screen.findByRole('menuitem', { name: 'Edit' })
    await user.click(editAction)

    expect(onClick).toHaveBeenCalledWith(testRecord)
  })

  it('should show confirmation modal for actions requiring confirmation', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'delete',
        type: 'button',
        label: 'Delete',
        onClick,
        requiresConfirmation: true,
        confirmation: {
          title: 'Confirm Delete',
          message: 'Are you sure?',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
        },
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const deleteAction = await screen.findByRole('menuitem', { name: 'Delete' })
    await user.click(deleteAction)

    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    // Cancel should not execute action
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('should execute action after confirmation', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'delete',
        type: 'button',
        label: 'Delete',
        onClick,
        requiresConfirmation: true,
        confirmation: {
          title: 'Confirm Delete',
          message: 'Are you sure?',
        },
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const deleteAction = await screen.findByRole('menuitem', { name: 'Delete' })
    await user.click(deleteAction)

    const confirmButton = await screen.findByRole('button', { name: /Confirm/i })
    await user.click(confirmButton)

    expect(onClick).toHaveBeenCalledWith(testRecord)
  })

  it('should evaluate visibility function', async () => {
    const user = userEvent.setup()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick: vi.fn(),
        visible: (record) => record.id === 1,
      },
      {
        id: 'delete',
        type: 'button',
        label: 'Delete',
        onClick: vi.fn(),
        visible: (record) => record.id === 2,
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
      expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument()
    })
  })

  it('should disable action based on disabled property', async () => {
    const user = userEvent.setup()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick: vi.fn(),
        disabled: true,
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const editAction = await screen.findByRole('menuitem', { name: 'Edit' })
    expect(editAction).toBeDisabled()
  })

  it('should evaluate disabled function', async () => {
    const user = userEvent.setup()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick: vi.fn(),
        disabled: (record) => record.id === 1,
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const editAction = await screen.findByRole('menuitem', { name: 'Edit' })
    expect(editAction).toBeDisabled()
  })

  it('should call onActionComplete after successful execution', async () => {
    const user = userEvent.setup()
    const onActionComplete = vi.fn()
    const onClick = vi.fn().mockResolvedValue(undefined)
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick,
      },
    ]

    render(
      <RowActionsDropdown
        record={testRecord}
        actions={actions}
        onActionComplete={onActionComplete}
      />
    )

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const editAction = await screen.findByRole('menuitem', { name: 'Edit' })
    await user.click(editAction)

    await waitFor(() => {
      expect(onActionComplete).toHaveBeenCalled()
    })
  })

  it('should handle action errors gracefully', async () => {
    const user = userEvent.setup()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onClick = vi.fn().mockRejectedValue(new Error('Action failed'))
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick,
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const editAction = await screen.findByRole('menuitem', { name: 'Edit' })
    await user.click(editAction)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled()
    })

    consoleError.mockRestore()
  })

  it('should use dynamic confirmation config', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'delete',
        type: 'button',
        label: 'Delete',
        onClick,
        requiresConfirmation: true,
        confirmation: (record) => ({
          title: `Delete ${record.name}`,
          message: `Are you sure you want to delete ${record.name}?`,
        }),
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const deleteAction = await screen.findByRole('menuitem', { name: 'Delete' })
    await user.click(deleteAction)

    await waitFor(() => {
      expect(screen.getByText('Delete Test')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete Test?')).toBeInTheDocument()
    })
  })

  it('should show destructive styling for destructive actions', async () => {
    const user = userEvent.setup()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'delete',
        type: 'button',
        label: 'Delete',
        onClick: vi.fn(),
        variant: 'destructive',
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    const deleteAction = await screen.findByRole('menuitem', { name: 'Delete' })
    expect(deleteAction).toHaveClass('text-red-600')
  })

  it('should toggle dropdown when button clicked again', async () => {
    const user = userEvent.setup()
    const actions: ButtonActionConfig<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick: vi.fn(),
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    })

    // Click button again to close
    await user.click(button)

    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument()
    })
  })

  it('should render action separator', async () => {
    const user = userEvent.setup()
    const actions: Action<TestModel>[] = [
      {
        id: 'edit',
        type: 'button',
        label: 'Edit',
        onClick: vi.fn(),
      },
      {
        type: 'separator',
        id: 'sep-1',
      },
      {
        id: 'delete',
        type: 'button',
        label: 'Delete',
        onClick: vi.fn(),
      },
    ]

    render(<RowActionsDropdown record={testRecord} actions={actions} />)

    const button = screen.getByLabelText('Row actions')
    await user.click(button)

    await waitFor(() => {
      const separator = screen.getByRole('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('border-t')
    })
  })
})
