/**
 * FormGrid Component
 * Grid layout for form fields with responsive columns
 */

import type { ReactNode } from 'react'

/**
 * Form grid props
 */
export interface FormGridProps {
  /** Grid children */
  children: ReactNode

  /** Number of columns (1-12) */
  columns?: 1 | 2 | 3 | 4 | 6 | 12

  /** Gap between columns */
  gap?: number

  /** Custom className */
  className?: string
}

/**
 * FormGrid Component
 */
export function FormGrid({
  children,
  columns = 2,
  gap = 6,
  className = '',
}: FormGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-12',
  }

  const gapClass = `gap-${gap}`

  return (
    <div className={`grid ${gridCols[columns]} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}
