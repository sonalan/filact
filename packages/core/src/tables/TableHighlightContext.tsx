/**
 * Table Highlight Context
 * Provides search query for highlighting across table cells
 */

import { createContext, useContext, type ReactNode } from 'react'
import type { HighlightConfig } from '../utils/highlight'

export interface TableHighlightContextValue {
  /** Current search query for highlighting */
  query: string

  /** Highlight configuration */
  config?: HighlightConfig

  /** Whether highlighting is enabled */
  enabled: boolean
}

const TableHighlightContext = createContext<TableHighlightContextValue | null>(null)

export interface TableHighlightProviderProps {
  children: ReactNode
  query: string
  config?: HighlightConfig
  enabled?: boolean
}

/**
 * Table Highlight Provider
 * Provides search query context for cell highlighting
 */
export function TableHighlightProvider({
  children,
  query,
  config,
  enabled = true,
}: TableHighlightProviderProps) {
  return (
    <TableHighlightContext.Provider value={{ query, config, enabled }}>
      {children}
    </TableHighlightContext.Provider>
  )
}

/**
 * Hook to access table highlight context
 */
export function useTableHighlight(): TableHighlightContextValue {
  const context = useContext(TableHighlightContext)

  if (!context) {
    return { query: '', enabled: false }
  }

  return context
}
