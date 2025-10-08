/**
 * FormSection Component
 * Displays a section with title and description
 */

import { useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Form section props
 */
export interface FormSectionProps {
  /** Section title */
  title?: string

  /** Section description */
  description?: string

  /** Section children */
  children: ReactNode

  /** Custom className */
  className?: string

  /** Whether section is collapsible */
  collapsible?: boolean

  /** Initially collapsed state (only if collapsible) */
  defaultCollapsed?: boolean
}

/**
 * FormSection Component
 */
export function FormSection({
  title,
  description,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false,
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              {collapsible && (
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {description && !isCollapsed && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      {!isCollapsed && <div className="space-y-6">{children}</div>}
    </div>
  )
}
