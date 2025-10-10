/**
 * Highlighted Cell Component
 * Renders table cell content with search highlighting
 */

import type { ReactNode } from 'react'
import { highlightText, type HighlightConfig } from '../utils/highlight'
import { useTableHighlight } from './TableHighlightContext'

export interface HighlightedCellProps {
  /** Cell value to display */
  value: string | number | null | undefined

  /** Force enable/disable highlighting (overrides context) */
  highlight?: boolean

  /** Custom highlight config (overrides context) */
  config?: HighlightConfig

  /** Additional className */
  className?: string

  /** Fallback content when value is null/undefined */
  fallback?: ReactNode
}

/**
 * Highlighted Cell Component
 * Automatically highlights search matches in cell content
 */
export function HighlightedCell({
  value,
  highlight: forceHighlight,
  config: customConfig,
  className = '',
  fallback = '-',
}: HighlightedCellProps) {
  const { query, config: contextConfig, enabled } = useTableHighlight()

  // Determine if highlighting should be applied
  const shouldHighlight = forceHighlight !== undefined ? forceHighlight : enabled

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return <span className={className}>{fallback}</span>
  }

  const stringValue = String(value)

  // No highlighting or no query
  if (!shouldHighlight || !query) {
    return <span className={className}>{stringValue}</span>
  }

  // Apply highlighting
  const config = customConfig || contextConfig
  const highlighted = highlightText(stringValue, query, config)

  return <span className={className}>{highlighted}</span>
}
