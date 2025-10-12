/**
 * Widget Grid Component
 * Grid system for dashboard widgets with responsive layouts
 */

import { ReactNode, Children, cloneElement, isValidElement } from 'react'

export interface WidgetGridProps {
  /** Grid children (widgets) */
  children: ReactNode

  /** Number of columns (default: 12) */
  columns?: number

  /** Gap between widgets in pixels (default: 16) */
  gap?: number

  /** Custom className */
  className?: string

  /** Minimum column width for responsive behavior (default: 300px) */
  minColumnWidth?: number
}

export interface WidgetProps {
  /** Column span (1-12) */
  colSpan?: number

  /** Row span (1-12) */
  rowSpan?: number

  /** Custom className */
  className?: string

  /** Children */
  children: ReactNode
}

/**
 * Widget Grid Container
 * Responsive grid system for dashboard widgets
 */
export function WidgetGrid({
  children,
  columns = 12,
  gap = 16,
  className = '',
  minColumnWidth = 300,
}: WidgetGridProps) {
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minColumnWidth}px, 100%), 1fr))`,
        gap: `${gap}px`,
        '--grid-columns': columns,
      } as React.CSSProperties & { '--grid-columns': number }}
    >
      {children}
    </div>
  )
}

/**
 * Widget Container
 * Individual widget with span configuration
 */
export function Widget({
  colSpan = 1,
  rowSpan = 1,
  className = '',
  children,
}: WidgetProps) {
  return (
    <div
      className={`widget ${className}`}
      style={{
        gridColumn: `span ${Math.min(colSpan, 12)}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Widget Grid Builder
 */
export class WidgetGridBuilder {
  private config: Partial<WidgetGridProps> = {
    columns: 12,
    gap: 16,
    minColumnWidth: 300,
  }

  columns(columns: number): this {
    this.config.columns = columns
    return this
  }

  gap(gap: number): this {
    this.config.gap = gap
    return this
  }

  minColumnWidth(width: number): this {
    this.config.minColumnWidth = width
    return this
  }

  className(className: string): this {
    this.config.className = className
    return this
  }

  build(): Omit<WidgetGridProps, 'children'> {
    return this.config as Omit<WidgetGridProps, 'children'>
  }
}

export const GridBuilder = {
  make: () => new WidgetGridBuilder(),
}

/**
 * Preset grid layouts
 */
export const GridLayouts = {
  /** Single column layout */
  singleColumn: {
    columns: 1,
    gap: 16,
  },

  /** Two column layout */
  twoColumn: {
    columns: 2,
    gap: 16,
  },

  /** Three column layout */
  threeColumn: {
    columns: 3,
    gap: 16,
  },

  /** Four column layout */
  fourColumn: {
    columns: 4,
    gap: 16,
  },

  /** Dashboard layout (12 column grid) */
  dashboard: {
    columns: 12,
    gap: 16,
  },

  /** Compact layout (smaller gaps) */
  compact: {
    columns: 12,
    gap: 8,
  },

  /** Comfortable layout (larger gaps) */
  comfortable: {
    columns: 12,
    gap: 24,
  },
}

/**
 * Hook for persisting grid layout to localStorage
 */
export function useGridLayout(key: string) {
  const getLayout = (): Record<string, { colSpan?: number; rowSpan?: number }> => {
    if (typeof window === 'undefined') return {}

    try {
      const stored = localStorage.getItem(`grid-layout-${key}`)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  const saveLayout = (layout: Record<string, { colSpan?: number; rowSpan?: number }>) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(`grid-layout-${key}`, JSON.stringify(layout))
    } catch (error) {
      console.error('Failed to save grid layout:', error)
    }
  }

  const clearLayout = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(`grid-layout-${key}`)
    } catch (error) {
      console.error('Failed to clear grid layout:', error)
    }
  }

  return {
    getLayout,
    saveLayout,
    clearLayout,
  }
}

/**
 * Common widget span presets
 */
export const WidgetSpans = {
  /** Full width widget */
  full: { colSpan: 12, rowSpan: 1 },

  /** Half width widget */
  half: { colSpan: 6, rowSpan: 1 },

  /** Third width widget */
  third: { colSpan: 4, rowSpan: 1 },

  /** Quarter width widget */
  quarter: { colSpan: 3, rowSpan: 1 },

  /** Two-thirds width widget */
  twoThirds: { colSpan: 8, rowSpan: 1 },

  /** Large widget (half width, double height) */
  large: { colSpan: 6, rowSpan: 2 },

  /** Featured widget (full width, double height) */
  featured: { colSpan: 12, rowSpan: 2 },

  /** Sidebar widget (quarter width, double height) */
  sidebar: { colSpan: 3, rowSpan: 2 },
}
