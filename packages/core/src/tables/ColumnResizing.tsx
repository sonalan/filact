/**
 * Column Resizing
 * Resize table columns by dragging column borders
 */

import { useState, useEffect, useCallback } from 'react'
import type { Table, Column, Header } from '@tanstack/react-table'

export interface ColumnResizingProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>

  /** Callback when column sizes change */
  onSizeChange?: (columnSizing: Record<string, number>) => void

  /** Enable column resizing */
  enabled?: boolean

  /** Minimum column width in pixels */
  minWidth?: number

  /** Maximum column width in pixels */
  maxWidth?: number
}

/**
 * Column Resizing Hook
 * Provides column resizing functionality for tables
 */
export function useColumnResizing<TData>({
  table,
  onSizeChange,
  enabled = true,
  minWidth = 50,
  maxWidth = 1000,
}: ColumnResizingProps<TData>) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null)

  const columnSizingInfo = table.getState().columnSizingInfo
  const columnSizing = table.getState().columnSizing

  useEffect(() => {
    if (onSizeChange) {
      onSizeChange(columnSizing)
    }
  }, [columnSizing, onSizeChange])

  const getHeaderProps = (header: Header<TData, unknown>) => {
    const column = header.column
    const canResize = enabled && column.getCanResize()

    return {
      style: {
        width: header.getSize(),
        position: 'relative' as const,
      },
    }
  }

  const getResizerProps = (header: Header<TData, unknown>) => {
    const column = header.column
    const canResize = enabled && column.getCanResize()

    if (!canResize) {
      return {
        style: { display: 'none' },
      }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      setResizingColumnId(column.id)
      header.getResizeHandler()(e)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault()
      setIsResizing(true)
      setResizingColumnId(column.id)
      header.getResizeHandler()(e)
    }

    const isCurrentlyResizing = column.getIsResizing()

    return {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      className: `column-resizer ${isCurrentlyResizing ? 'resizing' : ''}`,
      style: {
        position: 'absolute' as const,
        right: 0,
        top: 0,
        height: '100%',
        width: '8px',
        cursor: 'col-resize',
        userSelect: 'none' as const,
        touchAction: 'none',
        backgroundColor: isCurrentlyResizing ? '#3b82f6' : 'transparent',
        transition: 'background-color 0.2s',
      },
      'data-resizing': isCurrentlyResizing,
    }
  }

  const resetSizes = useCallback(() => {
    table.resetColumnSizing()
    if (onSizeChange) {
      onSizeChange({})
    }
  }, [table, onSizeChange])

  useEffect(() => {
    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
        setResizingColumnId(null)
      }
    }

    const handleTouchEnd = () => {
      if (isResizing) {
        setIsResizing(false)
        setResizingColumnId(null)
      }
    }

    if (isResizing) {
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isResizing])

  return {
    getHeaderProps,
    getResizerProps,
    resetSizes,
    isResizing,
    resizingColumnId,
    canResize: enabled,
    columnSizing,
  }
}

export interface ColumnSizingState {
  columnSizing: Record<string, number>
}

/**
 * Hook to persist column sizes to localStorage
 */
export function useColumnSizingPersistence(
  tableId: string,
  defaultSizing: Record<string, number> = {}
): [Record<string, number>, (sizing: Record<string, number>) => void] {
  const storageKey = `table-column-sizing-${tableId}`

  const [columnSizing, setColumnSizingState] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return defaultSizing

    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : defaultSizing
    } catch {
      return defaultSizing
    }
  })

  const setColumnSizing = (sizing: Record<string, number>) => {
    setColumnSizingState(sizing)
    if (typeof window !== 'undefined') {
      try {
        if (Object.keys(sizing).length === 0) {
          localStorage.removeItem(storageKey)
        } else {
          localStorage.setItem(storageKey, JSON.stringify(sizing))
        }
      } catch (error) {
        console.error('Failed to save column sizing to localStorage:', error)
      }
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setColumnSizingState(JSON.parse(e.newValue))
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [storageKey])

  return [columnSizing, setColumnSizing]
}

/**
 * Resizer Component
 * Visual handle for resizing columns
 */
export interface ResizerProps {
  /** Props from getResizerProps */
  resizerProps: ReturnType<ReturnType<typeof useColumnResizing>['getResizerProps']>

  /** Custom className */
  className?: string
}

export function Resizer({ resizerProps, className = '' }: ResizerProps) {
  return (
    <div
      {...resizerProps}
      className={`${resizerProps.className} ${className}`.trim()}
      aria-label="Resize column"
    >
      <div
        style={{
          position: 'absolute',
          right: '3px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '60%',
          backgroundColor: 'currentColor',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
