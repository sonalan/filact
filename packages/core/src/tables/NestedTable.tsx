/**
 * Nested Table Component
 * Displays a table within expandable rows
 */

import { type ReactNode } from 'react'
import type { BaseModel } from '../types/resource'

export interface NestedTableProps<TModel extends BaseModel> {
  /** Parent record */
  record: TModel

  /** Nested table content */
  children: ReactNode

  /** Nested level (for indentation) */
  level?: number

  /** Custom className */
  className?: string

  /** Whether the nested table is loading */
  isLoading?: boolean

  /** Loading state content */
  loadingContent?: ReactNode

  /** Error state */
  error?: Error | null

  /** Error content */
  errorContent?: ReactNode
}

/**
 * Nested Table Component
 * Wraps nested table content with proper styling and states
 */
export function NestedTable<TModel extends BaseModel>({
  record,
  children,
  level = 1,
  className = '',
  isLoading = false,
  loadingContent,
  error,
  errorContent,
}: NestedTableProps<TModel>) {
  const indentPadding = level * 2

  if (error) {
    return (
      <div
        className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}
        style={{ paddingLeft: `${indentPadding}rem` }}
      >
        {errorContent || (
          <div className="flex items-center text-red-700">
            <svg
              className="h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>Error loading nested data: {error.message}</span>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className={`bg-gray-50 p-4 ${className}`}
        style={{ paddingLeft: `${indentPadding}rem` }}
      >
        {loadingContent || (
          <div className="flex items-center text-gray-500">
            <svg
              className="animate-spin h-5 w-5 mr-2"
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
            <span>Loading nested data...</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`bg-gray-50 border-l-4 border-gray-300 ${className}`}
      style={{ paddingLeft: `${indentPadding}rem` }}
    >
      {children}
    </div>
  )
}
