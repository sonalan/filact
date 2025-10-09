/**
 * Table Header Actions Component
 * Displays action buttons in the table header
 */

import { useState } from 'react'
import type { TableHeaderAction } from '../types/table'

export interface TableHeaderActionsProps {
  /** Header actions to display */
  actions: TableHeaderAction[]
}

/**
 * Table Header Actions Component
 */
export function TableHeaderActions({ actions }: TableHeaderActionsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleAction = async (action: TableHeaderAction) => {
    if (action.disabled || loadingStates[action.id]) return

    setLoadingStates((prev) => ({ ...prev, [action.id]: true }))

    try {
      await action.onClick()
    } finally {
      setLoadingStates((prev) => ({ ...prev, [action.id]: false }))
    }
  }

  if (!actions || actions.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => {
        // Render separator
        if (action.type === 'separator') {
          return (
            <div
              key={action.id}
              className="h-8 w-px bg-gray-300"
              role="separator"
              aria-orientation="vertical"
            />
          )
        }

        // Render button
        const isLoading = loadingStates[action.id]
        const isDisabled = action.disabled || isLoading

        const button = (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={isDisabled}
            className={`
              inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium
              transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:pointer-events-none disabled:opacity-50
              ${
                action.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  : action.variant === 'destructive'
                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                    : action.variant === 'outline'
                      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                      : action.variant === 'ghost'
                        ? 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
              }
              ${action.className || ''}
            `}
            aria-label={action.label}
          >
            {isLoading ? (
              <svg
                className="h-4 w-4 animate-spin"
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
            ) : (
              action.icon
            )}
            <span>{action.label}</span>
          </button>
        )

        if (action.tooltip) {
          return (
            <div key={action.id} className="relative inline-block group">
              {button}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                role="tooltip"
              >
                {action.tooltip}
              </div>
            </div>
          )
        }

        return button
      })}
    </div>
  )
}
