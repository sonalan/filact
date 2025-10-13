/**
 * Column Reordering
 * Drag-and-drop column reordering for tables
 */

import { useState, useEffect } from 'react'
import type { Table, Column } from '@tanstack/react-table'

export interface ColumnReorderingProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>

  /** Callback when column order changes */
  onOrderChange?: (columnIds: string[]) => void

  /** Enable column reordering */
  enabled?: boolean
}

export interface DragState {
  draggedColumnId: string | null
  dragOverColumnId: string | null
}

/**
 * Column Reordering Hook
 * Provides drag-and-drop functionality for reordering table columns
 */
export function useColumnReordering<TData>({
  table,
  onOrderChange,
  enabled = true,
}: ColumnReorderingProps<TData>) {
  const [dragState, setDragState] = useState<DragState>({
    draggedColumnId: null,
    dragOverColumnId: null,
  })

  const columnOrder = table.getState().columnOrder

  const handleDragStart = (columnId: string) => (e: React.DragEvent) => {
    if (!enabled) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', columnId)
    setDragState((prev) => ({ ...prev, draggedColumnId: columnId }))
  }

  const handleDragOver = (columnId: string) => (e: React.DragEvent) => {
    if (!enabled) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragState((prev) => ({ ...prev, dragOverColumnId: columnId }))
  }

  const handleDragLeave = () => {
    setDragState((prev) => ({ ...prev, dragOverColumnId: null }))
  }

  const handleDrop = (targetColumnId: string) => (e: React.DragEvent) => {
    if (!enabled) return
    e.preventDefault()

    const draggedColumnId = e.dataTransfer.getData('text/plain')

    if (draggedColumnId === targetColumnId) {
      setDragState({ draggedColumnId: null, dragOverColumnId: null })
      return
    }

    // Get current column order
    const columns = table.getAllLeafColumns()
    const currentOrder =
      columnOrder.length > 0
        ? columnOrder
        : columns.map((col) => col.id)

    // Find indices
    const draggedIndex = currentOrder.indexOf(draggedColumnId)
    const targetIndex = currentOrder.indexOf(targetColumnId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDragState({ draggedColumnId: null, dragOverColumnId: null })
      return
    }

    // Reorder
    const newOrder = [...currentOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedColumnId)

    // Update table state
    table.setColumnOrder(newOrder)

    // Call callback
    if (onOrderChange) {
      onOrderChange(newOrder)
    }

    setDragState({ draggedColumnId: null, dragOverColumnId: null })
  }

  const handleDragEnd = () => {
    setDragState({ draggedColumnId: null, dragOverColumnId: null })
  }

  const getColumnProps = (column: Column<TData, unknown>) => {
    const isDragging = dragState.draggedColumnId === column.id
    const isDragOver = dragState.dragOverColumnId === column.id

    return {
      draggable: enabled,
      onDragStart: handleDragStart(column.id),
      onDragOver: handleDragOver(column.id),
      onDragLeave: handleDragLeave,
      onDrop: handleDrop(column.id),
      onDragEnd: handleDragEnd,
      'data-dragging': isDragging,
      'data-drag-over': isDragOver,
      style: {
        opacity: isDragging ? 0.5 : 1,
        cursor: enabled ? 'move' : 'default',
        borderLeft: isDragOver && !isDragging ? '2px solid #3b82f6' : undefined,
      },
    }
  }

  const resetOrder = () => {
    table.resetColumnOrder()
    if (onOrderChange) {
      onOrderChange([])
    }
  }

  return {
    dragState,
    getColumnProps,
    resetOrder,
    canReorder: enabled,
  }
}

export interface ColumnOrderState {
  columnOrder: string[]
}

/**
 * Hook to persist column order to localStorage
 */
export function useColumnOrderPersistence(
  tableId: string,
  defaultOrder: string[] = []
): [string[], (order: string[]) => void] {
  const storageKey = `table-column-order-${tableId}`

  const [columnOrder, setColumnOrderState] = useState<string[]>(() => {
    if (typeof window === 'undefined') return defaultOrder

    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : defaultOrder
    } catch {
      return defaultOrder
    }
  })

  const setColumnOrder = (order: string[]) => {
    setColumnOrderState(order)
    if (typeof window !== 'undefined') {
      try {
        if (order.length === 0) {
          localStorage.removeItem(storageKey)
        } else {
          localStorage.setItem(storageKey, JSON.stringify(order))
        }
      } catch (error) {
        console.error('Failed to save column order to localStorage:', error)
      }
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setColumnOrderState(JSON.parse(e.newValue))
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [storageKey])

  return [columnOrder, setColumnOrder]
}
