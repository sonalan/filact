/**
 * Expandable Row Component
 * Provides row expansion functionality for tables
 */

import { type ReactNode } from 'react'

/**
 * Expandable row props
 */
export interface ExpandableRowProps {
  /** Whether row is expanded */
  isExpanded: boolean

  /** Toggle expansion */
  onToggle: () => void

  /** Expansion content */
  children: ReactNode

  /** Custom className */
  className?: string

  /** Colspan for expanded row */
  colSpan: number
}

/**
 * ExpandableRow Component
 */
export function ExpandableRow({
  isExpanded,
  onToggle,
  children,
  className = '',
  colSpan,
}: ExpandableRowProps) {
  return (
    <>
      <tr className={`${isExpanded ? 'border-b-0' : ''} ${className}`}>
        <td colSpan={colSpan} className="p-0">
          <button
            onClick={onToggle}
            className="w-full text-left p-2 hover:bg-gray-50 transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
          >
            <svg
              className={`w-4 h-4 inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={colSpan} className="p-4">
            {children}
          </td>
        </tr>
      )}
    </>
  )
}

/**
 * Expandable row content wrapper
 */
export interface ExpandableContentProps {
  /** Content to display when expanded */
  children: ReactNode

  /** Custom className */
  className?: string
}

export function ExpandableContent({ children, className = '' }: ExpandableContentProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  )
}
