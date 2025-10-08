/**
 * FormCard Component
 * Card/panel wrapper for form sections with visual grouping
 */

import type { ReactNode } from 'react'

/**
 * Form card props
 */
export interface FormCardProps {
  /** Card title */
  title?: string

  /** Card description */
  description?: string

  /** Card children */
  children: ReactNode

  /** Custom className */
  className?: string

  /** Whether to show border */
  bordered?: boolean

  /** Whether to show shadow */
  shadow?: boolean

  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * FormCard Component
 */
export function FormCard({
  title,
  description,
  children,
  className = '',
  bordered = true,
  shadow = false,
  padding = 'md',
}: FormCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`
        bg-white rounded-lg
        ${bordered ? 'border border-gray-200' : ''}
        ${shadow ? 'shadow-sm' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-6">{children}</div>
    </div>
  )
}
