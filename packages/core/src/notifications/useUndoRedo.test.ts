import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoRedo, type UndoableAction } from './useUndoRedo'

describe('useUndoRedo', () => {
  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useUndoRedo())

    expect(result.current.history).toEqual([])
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.historySize).toBe(0)
    expect(result.current.historyPosition).toBe(0)
  })

  it('should execute an action', async () => {
    const { result } = renderHook(() => useUndoRedo())
    const executeFn = vi.fn()
    const undoFn = vi.fn()

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: executeFn,
      undo: undoFn,
    }

    await act(async () => {
      await result.current.execute(action)
    })

    expect(executeFn).toHaveBeenCalledTimes(1)
    expect(result.current.historySize).toBe(1)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should undo an action', async () => {
    const { result } = renderHook(() => useUndoRedo())
    const executeFn = vi.fn()
    const undoFn = vi.fn()

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: executeFn,
      undo: undoFn,
    }

    await act(async () => {
      await result.current.execute(action)
    })

    await act(async () => {
      await result.current.undo()
    })

    expect(undoFn).toHaveBeenCalledTimes(1)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('should redo an action', async () => {
    const { result } = renderHook(() => useUndoRedo())
    const executeFn = vi.fn()
    const undoFn = vi.fn()

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: executeFn,
      undo: undoFn,
    }

    await act(async () => {
      await result.current.execute(action)
    })

    await act(async () => {
      await result.current.undo()
    })

    await act(async () => {
      await result.current.redo()
    })

    expect(executeFn).toHaveBeenCalledTimes(2) // Initial execute + redo
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should handle multiple actions', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const action1: UndoableAction = {
      id: '1',
      description: 'Action 1',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    const action2: UndoableAction = {
      id: '2',
      description: 'Action 2',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action1)
      await result.current.execute(action2)
    })

    expect(result.current.historySize).toBe(2)
    expect(result.current.historyPosition).toBe(2)
  })

  it('should clear redo history when new action is executed', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const action1: UndoableAction = {
      id: '1',
      description: 'Action 1',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    const action2: UndoableAction = {
      id: '2',
      description: 'Action 2',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    const action3: UndoableAction = {
      id: '3',
      description: 'Action 3',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action1)
    })

    await act(async () => {
      await result.current.execute(action2)
    })

    await act(async () => {
      await result.current.undo()
    })

    await act(async () => {
      await result.current.execute(action3)
    })

    expect(result.current.historySize).toBe(2)
    expect(result.current.history[1].id).toBe('3')
    expect(result.current.canRedo).toBe(false)
  })

  it('should respect max history size', async () => {
    const { result } = renderHook(() => useUndoRedo({ maxHistorySize: 3 }))

    const actions: UndoableAction[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      description: `Action ${i + 1}`,
      execute: vi.fn(),
      undo: vi.fn(),
    }))

    await act(async () => {
      for (const action of actions) {
        await result.current.execute(action)
      }
    })

    expect(result.current.historySize).toBe(3)
    expect(result.current.history[0].id).toBe('3')
    expect(result.current.history[2].id).toBe('5')
  })

  it('should clear all history', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    act(() => {
      result.current.clear()
    })

    expect(result.current.historySize).toBe(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should get undo action', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    const undoAction = result.current.getUndoAction()
    expect(undoAction?.id).toBe('1')
  })

  it('should get redo action', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    await act(async () => {
      await result.current.undo()
    })

    const redoAction = result.current.getRedoAction()
    expect(redoAction?.id).toBe('1')
  })

  it('should return null when no undo action available', () => {
    const { result } = renderHook(() => useUndoRedo())

    expect(result.current.getUndoAction()).toBeNull()
  })

  it('should return null when no redo action available', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    expect(result.current.getRedoAction()).toBeNull()
  })

  it('should call onExecute callback', async () => {
    const onExecute = vi.fn()
    const { result } = renderHook(() => useUndoRedo({ onExecute }))

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    expect(onExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        description: 'Test action',
      })
    )
  })

  it('should call onUndo callback', async () => {
    const onUndo = vi.fn()
    const { result } = renderHook(() => useUndoRedo({ onUndo }))

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    await act(async () => {
      await result.current.undo()
    })

    expect(onUndo).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        description: 'Test action',
      })
    )
  })

  it('should call onRedo callback', async () => {
    const onRedo = vi.fn()
    const { result } = renderHook(() => useUndoRedo({ onRedo }))

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    await act(async () => {
      await result.current.undo()
    })

    await act(async () => {
      await result.current.redo()
    })

    expect(onRedo).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        description: 'Test action',
      })
    )
  })

  it('should handle async execute functions', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const asyncExecute = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 10))
    )

    const action: UndoableAction = {
      id: '1',
      description: 'Async action',
      execute: asyncExecute,
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    expect(asyncExecute).toHaveBeenCalled()
    expect(result.current.historySize).toBe(1)
  })

  it('should handle async undo functions', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const asyncUndo = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 10))
    )

    const action: UndoableAction = {
      id: '1',
      description: 'Async action',
      execute: vi.fn(),
      undo: asyncUndo,
    }

    await act(async () => {
      await result.current.execute(action)
    })

    await act(async () => {
      await result.current.undo()
    })

    expect(asyncUndo).toHaveBeenCalled()
  })

  it('should include action data', async () => {
    const { result } = renderHook(() => useUndoRedo<{ value: number }>())

    const action: UndoableAction<{ value: number }> = {
      id: '1',
      description: 'Action with data',
      execute: vi.fn(),
      undo: vi.fn(),
      data: { value: 42 },
    }

    await act(async () => {
      await result.current.execute(action)
    })

    expect(result.current.history[0].data).toEqual({ value: 42 })
  })

  it('should include timestamp', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const action: UndoableAction = {
      id: '1',
      description: 'Test action',
      execute: vi.fn(),
      undo: vi.fn(),
    }

    await act(async () => {
      await result.current.execute(action)
    })

    expect(result.current.history[0].timestamp).toBeTypeOf('number')
    expect(result.current.history[0].timestamp).toBeGreaterThan(0)
  })

  it('should not execute multiple actions simultaneously', async () => {
    const { result } = renderHook(() => useUndoRedo())

    const executeFn = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 50))
    )

    const action1: UndoableAction = {
      id: '1',
      description: 'Action 1',
      execute: executeFn,
      undo: vi.fn(),
    }

    const action2: UndoableAction = {
      id: '2',
      description: 'Action 2',
      execute: executeFn,
      undo: vi.fn(),
    }

    await act(async () => {
      const promise1 = result.current.execute(action1)
      const promise2 = result.current.execute(action2)
      await Promise.all([promise1, promise2])
    })

    // Second action should be ignored during first execution
    expect(executeFn).toHaveBeenCalledTimes(1)
    expect(result.current.historySize).toBe(1)
  })

  it('should handle undo/redo at boundaries', async () => {
    const { result } = renderHook(() => useUndoRedo())

    // Try to undo with empty history
    await act(async () => {
      await result.current.undo()
    })

    expect(result.current.canUndo).toBe(false)

    // Try to redo with no redo history
    await act(async () => {
      await result.current.redo()
    })

    expect(result.current.canRedo).toBe(false)
  })
})
