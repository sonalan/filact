/**
 * Undo/Redo Action System
 * Manages action history with undo and redo capabilities
 */

import { useState, useCallback, useRef } from 'react'

export interface UndoableAction<TData = any> {
  /** Unique identifier for the action */
  id: string

  /** Action description */
  description: string

  /** Execute the action */
  execute: () => void | Promise<void>

  /** Undo the action */
  undo: () => void | Promise<void>

  /** Optional action data */
  data?: TData

  /** Timestamp of when action was executed */
  timestamp?: number
}

export interface UseUndoRedoOptions {
  /** Maximum history size */
  maxHistorySize?: number

  /** Callback when action is executed */
  onExecute?: (action: UndoableAction) => void

  /** Callback when action is undone */
  onUndo?: (action: UndoableAction) => void

  /** Callback when action is redone */
  onRedo?: (action: UndoableAction) => void
}

/**
 * Hook for managing undo/redo action history
 */
export function useUndoRedo<TData = any>({
  maxHistorySize = 50,
  onExecute,
  onUndo,
  onRedo,
}: UseUndoRedoOptions = {}) {
  const [history, setHistory] = useState<UndoableAction<TData>[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const isExecutingRef = useRef(false)
  const historyRef = useRef<UndoableAction<TData>[]>([])
  const currentIndexRef = useRef(-1)

  // Keep refs in sync
  historyRef.current = history
  currentIndexRef.current = currentIndex

  // Execute a new action
  const execute = useCallback(
    async (action: UndoableAction<TData>) => {
      if (isExecutingRef.current) return

      isExecutingRef.current = true

      try {
        await action.execute()

        const actionWithTimestamp = {
          ...action,
          timestamp: Date.now(),
        }

        setCurrentIndex((prevIndex) => {
          setHistory((prev) => {
            // Remove any actions after current index (redo history)
            const newHistory = prev.slice(0, prevIndex + 1)

            // Add new action
            newHistory.push(actionWithTimestamp)

            // Limit history size
            if (newHistory.length > maxHistorySize) {
              const trimmed = newHistory.slice(newHistory.length - maxHistorySize)
              return trimmed
            }

            return newHistory
          })

          return prevIndex + 1
        })

        onExecute?.(actionWithTimestamp)
      } finally {
        isExecutingRef.current = false
      }
    },
    [maxHistorySize, onExecute]
  )

  // Undo the last action
  const undo = useCallback(async () => {
    if (currentIndexRef.current < 0 || isExecutingRef.current) return

    isExecutingRef.current = true

    try {
      const action = historyRef.current[currentIndexRef.current]
      if (!action) return

      await action.undo()

      setCurrentIndex((prev) => prev - 1)
      onUndo?.(action)
    } finally {
      isExecutingRef.current = false
    }
  }, [onUndo])

  // Redo the next action
  const redo = useCallback(async () => {
    if (currentIndexRef.current >= historyRef.current.length - 1 || isExecutingRef.current) return

    isExecutingRef.current = true

    try {
      const action = historyRef.current[currentIndexRef.current + 1]
      if (!action) return

      await action.execute()

      setCurrentIndex((prev) => prev + 1)
      onRedo?.(action)
    } finally {
      isExecutingRef.current = false
    }
  }, [onRedo])

  // Clear all history
  const clear = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
  }, [])

  // Get the action that would be undone
  const getUndoAction = useCallback((): UndoableAction<TData> | null => {
    if (currentIndex < 0) return null
    return history[currentIndex] || null
  }, [history, currentIndex])

  // Get the action that would be redone
  const getRedoAction = useCallback((): UndoableAction<TData> | null => {
    if (currentIndex >= history.length - 1) return null
    return history[currentIndex + 1] || null
  }, [history, currentIndex])

  // Check if undo is available
  const canUndo = currentIndex >= 0

  // Check if redo is available
  const canRedo = currentIndex < history.length - 1

  // Get history size
  const historySize = history.length

  // Get current position in history
  const historyPosition = currentIndex + 1

  return {
    execute,
    undo,
    redo,
    clear,
    getUndoAction,
    getRedoAction,
    canUndo,
    canRedo,
    history,
    historySize,
    historyPosition,
  }
}
