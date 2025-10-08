/**
 * Row Actions Dropdown
 * Dropdown menu for row-level actions in tables
 */

import { useState } from 'react'
import type { BaseModel } from '../types/resource'
import type { Action, ButtonActionConfig, ConfirmationConfig } from '../types/action'

export interface RowActionsDropdownProps<TModel extends BaseModel> {
  /** Row record */
  record: TModel

  /** Actions to display */
  actions: Action<TModel>[]

  /** Optional callback after action execution */
  onActionComplete?: () => void
}

/**
 * Row Actions Dropdown Component
 * Displays a dropdown menu with row-level actions
 */
export function RowActionsDropdown<TModel extends BaseModel>({
  record,
  actions,
  onActionComplete,
}: RowActionsDropdownProps<TModel>) {
  const [isOpen, setIsOpen] = useState(false)
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    action: ButtonActionConfig<TModel> | null
    config: ConfirmationConfig | null
  }>({ isOpen: false, action: null, config: null })

  // Filter visible actions
  const visibleActions = actions.filter((action) => {
    if ('visible' in action && action.visible !== undefined) {
      return typeof action.visible === 'function'
        ? action.visible(record)
        : action.visible
    }
    return true
  })

  if (visibleActions.length === 0) {
    return null
  }

  const isActionDisabled = (action: Action<TModel>): boolean => {
    if ('disabled' in action && action.disabled !== undefined) {
      return typeof action.disabled === 'function'
        ? action.disabled(record)
        : action.disabled
    }
    return false
  }

  const executeAction = async (action: ButtonActionConfig<TModel>) => {
    setExecutingAction(action.id)
    setIsOpen(false)

    try {
      await action.onClick(record)
      onActionComplete?.()
    } catch (error) {
      console.error(`Action "${action.label}" failed:`, error)
    } finally {
      setExecutingAction(null)
    }
  }

  const handleActionClick = (action: Action<TModel>) => {
    if (action.type !== 'button') return

    const buttonAction = action as ButtonActionConfig<TModel>

    // Check if requires confirmation
    if (buttonAction.requiresConfirmation) {
      const config =
        typeof buttonAction.confirmation === 'function'
          ? buttonAction.confirmation(record)
          : buttonAction.confirmation || {
              title: 'Confirm Action',
              message: 'Are you sure you want to perform this action?',
              confirmLabel: 'Confirm',
              cancelLabel: 'Cancel',
            }

      setConfirmationModal({ isOpen: true, action: buttonAction, config })
    } else {
      executeAction(buttonAction)
    }
  }

  const handleConfirm = () => {
    if (confirmationModal.action) {
      executeAction(confirmationModal.action)
    }
    setConfirmationModal({ isOpen: false, action: null, config: null })
  }

  const handleCancel = () => {
    setConfirmationModal({ isOpen: false, action: null, config: null })
  }

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Row actions"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown menu */}
            <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1" role="menu">
                {visibleActions.map((action) => {
                  // Handle separator
                  if (action.type === 'separator') {
                    return (
                      <div
                        key={action.id}
                        className="my-1 border-t border-gray-200"
                        role="separator"
                      />
                    )
                  }

                  const disabled = isActionDisabled(action)
                  const isLoading = executingAction === action.id

                  return (
                    <button
                      key={action.id}
                      onClick={() => !disabled && !isLoading && handleActionClick(action)}
                      disabled={disabled || isLoading}
                      className={`
                        w-full text-left px-4 py-2 text-sm flex items-center gap-2
                        ${
                          disabled || isLoading
                            ? 'text-gray-400 cursor-not-allowed'
                            : action.variant === 'destructive'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      role="menuitem"
                    >
                      {isLoading && (
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {action.icon && <span>{action.icon}</span>}
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && confirmationModal.config && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h3 id="modal-title" className="text-lg font-semibold mb-2">
              {confirmationModal.config.title}
            </h3>
            <p className="text-gray-600 mb-6">{confirmationModal.config.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {confirmationModal.config.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm rounded-md ${
                  confirmationModal.config.variant === 'destructive'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {confirmationModal.config.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
