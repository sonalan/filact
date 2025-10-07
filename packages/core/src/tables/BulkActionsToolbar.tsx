/**
 * Bulk Actions Toolbar Component
 * Displays actions that can be performed on multiple selected rows
 */

import { useState } from 'react'
import type { BaseModel } from '../types/resource'
import type { BulkAction } from '../types/action'

export interface BulkActionsToolbarProps<TModel extends BaseModel> {
  /** Number of selected rows */
  selectedCount: number

  /** Selected row data */
  selectedRows: TModel[]

  /** Bulk actions to display */
  actions: BulkAction<TModel>[]

  /** Clear selection handler */
  onClearSelection: () => void

  /** Resource name for display */
  resourceName?: string
}

/**
 * Bulk Actions Toolbar
 * Displays when rows are selected and provides bulk action buttons
 */
export function BulkActionsToolbar<TModel extends BaseModel>({
  selectedCount,
  selectedRows,
  actions,
  onClearSelection,
  resourceName = 'records',
}: BulkActionsToolbarProps<TModel>) {
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    action: BulkAction<TModel> | null
  }>({
    isOpen: false,
    action: null,
  })

  if (selectedCount === 0) return null

  const executeAction = async (action: BulkAction<TModel>) => {
    if (!action.handler) return

    setExecutingAction(action.label)
    try {
      await action.handler(selectedRows)
      // Clear selection after successful action
      onClearSelection()
    } catch (error) {
      console.error(`Bulk action "${action.label}" failed:`, error)
    } finally {
      setExecutingAction(null)
    }
  }

  const handleAction = (action: BulkAction<TModel>) => {
    if (action.requireConfirmation) {
      setConfirmationModal({ isOpen: true, action })
    } else {
      executeAction(action)
    }
  }

  const handleConfirm = () => {
    if (confirmationModal.action) {
      executeAction(confirmationModal.action)
    }
    setConfirmationModal({ isOpen: false, action: null })
  }

  const handleCancel = () => {
    setConfirmationModal({ isOpen: false, action: null })
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-blue-900">
              {selectedCount} {selectedCount === 1 ? resourceName.slice(0, -1) : resourceName} selected
            </div>
            <button
              onClick={onClearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Clear selection
            </button>
          </div>

          <div className="flex gap-2">
            {actions.map((action, index) => {
              const isExecuting = executingAction === action.label
              const isDisabled = action.disabled || isExecuting

              return (
                <button
                  key={index}
                  onClick={() => handleAction(action)}
                  disabled={isDisabled}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    action.destructive
                      ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
                  } disabled:cursor-not-allowed`}
                >
                  {isExecuting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      {action.label}...
                    </span>
                  ) : (
                    action.label
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && confirmationModal.action && (
        <ConfirmationModal
          isOpen={true}
          title={confirmationModal.action.confirmTitle || 'Confirm Action'}
          message={
            confirmationModal.action.confirmMessage ||
            `Are you sure you want to ${confirmationModal.action.label.toLowerCase()}?`
          }
          confirmLabel={confirmationModal.action.label}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          destructive={confirmationModal.action.destructive}
        />
      )}
    </>
  )
}

/**
 * Confirmation Modal Component
 * Used for confirming destructive bulk actions
 */
export interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onCancel()
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for managing bulk action confirmation
 */
export function useBulkActionConfirmation() {
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    destructive: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    destructive: false,
  })

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    destructive = false
  ) => {
    setConfirmationState({
      isOpen: true,
      title,
      message,
      onConfirm,
      destructive,
    })
  }

  const close = () => {
    setConfirmationState((prev) => ({ ...prev, isOpen: false }))
  }

  return {
    confirmationState,
    confirm,
    close,
  }
}
