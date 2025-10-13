import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColumnReordering, useColumnOrderPersistence } from './ColumnReordering'
import type { Table, Column } from '@tanstack/react-table'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useColumnReordering', () => {
  let mockTable: Partial<Table<any>>
  let mockColumns: Partial<Column<any, unknown>>[]

  beforeEach(() => {
    mockColumns = [
      { id: 'col1' },
      { id: 'col2' },
      { id: 'col3' },
    ] as Partial<Column<any, unknown>>[]

    mockTable = {
      getAllLeafColumns: vi.fn(() => mockColumns as Column<any, unknown>[]),
      getState: vi.fn(() => ({ columnOrder: [] })),
      setColumnOrder: vi.fn(),
      resetColumnOrder: vi.fn(),
    }
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
      })
    )

    expect(result.current.dragState).toEqual({
      draggedColumnId: null,
      dragOverColumnId: null,
    })
    expect(result.current.canReorder).toBe(true)
  })

  it('should handle drag start', () => {
    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
      })
    )

    const column = mockColumns[0] as Column<any, unknown>
    const props = result.current.getColumnProps(column)

    const mockEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as any

    act(() => {
      props.onDragStart(mockEvent)
    })

    expect(mockEvent.dataTransfer.effectAllowed).toBe('move')
    expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'col1')
    expect(result.current.dragState.draggedColumnId).toBe('col1')
  })

  it('should handle drag over', () => {
    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
      })
    )

    const column = mockColumns[1] as Column<any, unknown>
    const props = result.current.getColumnProps(column)

    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        dropEffect: '',
      },
    } as any

    act(() => {
      props.onDragOver(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(mockEvent.dataTransfer.dropEffect).toBe('move')
    expect(result.current.dragState.dragOverColumnId).toBe('col2')
  })

  it('should handle drag leave', () => {
    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
      })
    )

    const column = mockColumns[1] as Column<any, unknown>
    const props = result.current.getColumnProps(column)

    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: '' },
    } as any

    act(() => {
      props.onDragOver(mockEvent)
    })

    expect(result.current.dragState.dragOverColumnId).toBe('col2')

    act(() => {
      props.onDragLeave()
    })

    expect(result.current.dragState.dragOverColumnId).toBe(null)
  })

  it('should reorder columns on drop', () => {
    const onOrderChange = vi.fn()

    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
        onOrderChange,
      })
    )

    // Start dragging col1
    const col1Props = result.current.getColumnProps(mockColumns[0] as Column<any, unknown>)
    const startEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as any

    act(() => {
      col1Props.onDragStart(startEvent)
    })

    // Drop on col3
    const col3Props = result.current.getColumnProps(mockColumns[2] as Column<any, unknown>)
    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => 'col1'),
      },
    } as any

    act(() => {
      col3Props.onDrop(dropEvent)
    })

    expect(mockTable.setColumnOrder).toHaveBeenCalledWith(['col2', 'col3', 'col1'])
    expect(onOrderChange).toHaveBeenCalledWith(['col2', 'col3', 'col1'])
    expect(result.current.dragState.draggedColumnId).toBe(null)
  })

  it('should not reorder when dropping on same column', () => {
    const onOrderChange = vi.fn()

    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
        onOrderChange,
      })
    )

    const col1Props = result.current.getColumnProps(mockColumns[0] as Column<any, unknown>)

    const startEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as any

    act(() => {
      col1Props.onDragStart(startEvent)
    })

    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => 'col1'),
      },
    } as any

    act(() => {
      col1Props.onDrop(dropEvent)
    })

    expect(mockTable.setColumnOrder).not.toHaveBeenCalled()
    expect(onOrderChange).not.toHaveBeenCalled()
  })

  it('should handle drag end', () => {
    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
      })
    )

    const col1Props = result.current.getColumnProps(mockColumns[0] as Column<any, unknown>)

    const startEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as any

    act(() => {
      col1Props.onDragStart(startEvent)
    })

    expect(result.current.dragState.draggedColumnId).toBe('col1')

    act(() => {
      col1Props.onDragEnd()
    })

    expect(result.current.dragState.draggedColumnId).toBe(null)
  })

  it('should apply correct styles to dragging column', () => {
    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
      })
    )

    const col1Props = result.current.getColumnProps(mockColumns[0] as Column<any, unknown>)

    const startEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as any

    act(() => {
      col1Props.onDragStart(startEvent)
    })

    const draggingProps = result.current.getColumnProps(mockColumns[0] as Column<any, unknown>)
    expect(draggingProps.style.opacity).toBe(0.5)
    expect(draggingProps['data-dragging']).toBe(true)
  })

  it('should apply correct styles to drag over column', () => {
    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
      })
    )

    const col1Props = result.current.getColumnProps(mockColumns[0] as Column<any, unknown>)
    const col2Props = result.current.getColumnProps(mockColumns[1] as Column<any, unknown>)

    const startEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as any

    act(() => {
      col1Props.onDragStart(startEvent)
    })

    const overEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: '' },
    } as any

    act(() => {
      col2Props.onDragOver(overEvent)
    })

    const dragOverProps = result.current.getColumnProps(mockColumns[1] as Column<any, unknown>)
    expect(dragOverProps.style.borderLeft).toBe('2px solid #3b82f6')
    expect(dragOverProps['data-drag-over']).toBe(true)
  })

  it('should reset column order', () => {
    const onOrderChange = vi.fn()

    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
        onOrderChange,
      })
    )

    act(() => {
      result.current.resetOrder()
    })

    expect(mockTable.resetColumnOrder).toHaveBeenCalled()
    expect(onOrderChange).toHaveBeenCalledWith([])
  })

  it('should respect enabled flag', () => {
    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
        enabled: false,
      })
    )

    expect(result.current.canReorder).toBe(false)

    const col1Props = result.current.getColumnProps(mockColumns[0] as Column<any, unknown>)
    expect(col1Props.draggable).toBe(false)
    expect(col1Props.style.cursor).toBe('default')

    const startEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as any

    act(() => {
      col1Props.onDragStart(startEvent)
    })

    expect(result.current.dragState.draggedColumnId).toBe(null)
  })

  it('should use existing column order from table state', () => {
    mockTable.getState = vi.fn(() => ({ columnOrder: ['col3', 'col1', 'col2'] }))

    const onOrderChange = vi.fn()

    const { result } = renderHook(() =>
      useColumnReordering({
        table: mockTable as Table<any>,
        onOrderChange,
      })
    )

    // Start dragging col3 (first in order)
    const col3Props = result.current.getColumnProps(mockColumns[2] as Column<any, unknown>)
    const startEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as any

    act(() => {
      col3Props.onDragStart(startEvent)
    })

    // Drop on col2 (last in order)
    const col2Props = result.current.getColumnProps(mockColumns[1] as Column<any, unknown>)
    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => 'col3'),
      },
    } as any

    act(() => {
      col2Props.onDrop(dropEvent)
    })

    expect(mockTable.setColumnOrder).toHaveBeenCalledWith(['col1', 'col2', 'col3'])
  })
})

describe('useColumnOrderPersistence', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should initialize with default order', () => {
    const { result } = renderHook(() =>
      useColumnOrderPersistence('test-table', ['col1', 'col2', 'col3'])
    )

    expect(result.current[0]).toEqual(['col1', 'col2', 'col3'])
  })

  it('should load order from localStorage', () => {
    localStorageMock.setItem(
      'table-column-order-test-table',
      JSON.stringify(['col3', 'col1', 'col2'])
    )

    const { result } = renderHook(() =>
      useColumnOrderPersistence('test-table', ['col1', 'col2', 'col3'])
    )

    expect(result.current[0]).toEqual(['col3', 'col1', 'col2'])
  })

  it('should save order to localStorage', () => {
    const { result } = renderHook(() => useColumnOrderPersistence('test-table'))

    act(() => {
      result.current[1](['col2', 'col3', 'col1'])
    })

    expect(result.current[0]).toEqual(['col2', 'col3', 'col1'])
    expect(localStorageMock.getItem('table-column-order-test-table')).toBe(
      JSON.stringify(['col2', 'col3', 'col1'])
    )
  })

  it('should remove from localStorage when setting empty order', () => {
    localStorageMock.setItem(
      'table-column-order-test-table',
      JSON.stringify(['col1', 'col2'])
    )

    const { result } = renderHook(() => useColumnOrderPersistence('test-table'))

    act(() => {
      result.current[1]([])
    })

    expect(localStorageMock.getItem('table-column-order-test-table')).toBe(null)
  })

  it('should handle localStorage errors gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock localStorage.setItem to throw
    const originalSetItem = localStorageMock.setItem
    localStorageMock.setItem = vi.fn(() => {
      throw new Error('Quota exceeded')
    })

    const { result } = renderHook(() => useColumnOrderPersistence('test-table'))

    act(() => {
      result.current[1](['col1', 'col2'])
    })

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to save column order to localStorage:',
      expect.any(Error)
    )

    // Restore
    localStorageMock.setItem = originalSetItem
    consoleError.mockRestore()
  })

  it('should handle JSON parse errors', () => {
    localStorageMock.setItem('table-column-order-test-table', 'invalid json')

    const { result } = renderHook(() =>
      useColumnOrderPersistence('test-table', ['col1', 'col2'])
    )

    expect(result.current[0]).toEqual(['col1', 'col2'])
  })
})
