/**
 * FormFieldset Component
 * Fieldset component for grouping related form fields
 */

import type { ReactNode } from 'react'

/**
 * Form fieldset props
 */
export interface FormFieldsetProps {
  /** Fieldset legend/title */
  legend?: string

  /** Fieldset description */
  description?: string

  /** Fieldset children */
  children: ReactNode

  /** Custom className */
  className?: string

  /** Whether fieldset is disabled */
  disabled?: boolean

  /** Border style */
  bordered?: boolean
}

/**
 * FormFieldset Component
 */
export function FormFieldset({
  legend,
  description,
  children,
  className = '',
  disabled = false,
  bordered = true,
}: FormFieldsetProps) {
  return (
    <fieldset
      disabled={disabled}
      className={`
        ${bordered ? 'border border-gray-200 rounded-lg p-6' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {legend && (
        <legend className="text-base font-semibold text-gray-900 px-2 -ml-2">
          {legend}
        </legend>
      )}

      {description && (
        <p className="mt-1 mb-4 text-sm text-gray-500">{description}</p>
      )}

      <div className="space-y-6 mt-4">
        {children}
      </div>
    </fieldset>
  )
}
