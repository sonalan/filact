import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render } from '@testing-library/react'
import { useColumnResizing, useColumnSizingPersistence, Resizer } from './ColumnResizing'
import type { Table, Header, Column } from '@tanstack/react-table'

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

describe('useColumnResizing', () => {
  let mockTable: Partial<Table<any>>
  let mockColumn: Partial<Column<any, unknown>>
  let mockHeader: Partial<Header<any, unknown>>

  beforeEach(() => {
    mockColumn = {
      id: 'col1',
      getCanResize: vi.fn(() => true),
      getIsResizing: vi.fn(() => false),
    }

    mockHeader = {
      column: mockColumn as Column<any, unknown>,
      getSize: vi.fn(() => 150),
      getResizeHandler: vi.fn(() => vi.fn()),
    }

    mockTable = {
      getState: vi.fn(() => ({
        columnSizing: {},
        columnSizingInfo: {},
      })),
      resetColumnSizing: vi.fn(),
    }
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    expect(result.current.isResizing).toBe(false)
    expect(result.current.resizingColumnId).toBe(null)
    expect(result.current.canResize).toBe(true)
  })

  it('should return header props with size', () => {
    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    const props = result.current.getHeaderProps(mockHeader as Header<any, unknown>)

    expect(props.style.width).toBe(150)
    expect(props.style.position).toBe('relative')
  })

  it('should return resizer props when resizing is enabled', () => {
    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    const props = result.current.getResizerProps(mockHeader as Header<any, unknown>)

    expect(props.style.display).not.toBe('none')
    expect(props.style.cursor).toBe('col-resize')
    expect(props.onMouseDown).toBeDefined()
    expect(props.onTouchStart).toBeDefined()
  })

  it('should hide resizer when column cannot be resized', () => {
    mockColumn.getCanResize = vi.fn(() => false)

    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    const props = result.current.getResizerProps(mockHeader as Header<any, unknown>)

    expect(props.style.display).toBe('none')
  })

  it('should hide resizer when resizing is disabled', () => {
    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
        enabled: false,
      })
    )

    const props = result.current.getResizerProps(mockHeader as Header<any, unknown>)

    expect(props.style.display).toBe('none')
    expect(result.current.canResize).toBe(false)
  })

  it('should handle mouse down to start resizing', () => {
    const resizeHandler = vi.fn()
    mockHeader.getResizeHandler = vi.fn(() => resizeHandler)

    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    const props = result.current.getResizerProps(mockHeader as Header<any, unknown>)

    const mockEvent = {
      preventDefault: vi.fn(),
    } as any

    act(() => {
      props.onMouseDown(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(resizeHandler).toHaveBeenCalledWith(mockEvent)
    expect(result.current.isResizing).toBe(true)
    expect(result.current.resizingColumnId).toBe('col1')
  })

  it('should handle touch start to start resizing', () => {
    const resizeHandler = vi.fn()
    mockHeader.getResizeHandler = vi.fn(() => resizeHandler)

    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    const props = result.current.getResizerProps(mockHeader as Header<any, unknown>)

    const mockEvent = {
      preventDefault: vi.fn(),
    } as any

    act(() => {
      props.onTouchStart(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(resizeHandler).toHaveBeenCalledWith(mockEvent)
    expect(result.current.isResizing).toBe(true)
  })

  it('should apply resizing styles when column is being resized', () => {
    mockColumn.getIsResizing = vi.fn(() => true)

    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    const props = result.current.getResizerProps(mockHeader as Header<any, unknown>)

    expect(props.style.backgroundColor).toBe('#3b82f6')
    expect(props['data-resizing']).toBe(true)
    expect(props.className).toContain('resizing')
  })

  it('should reset column sizes', () => {
    const onSizeChange = vi.fn()

    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
        onSizeChange,
      })
    )

    act(() => {
      result.current.resetSizes()
    })

    expect(mockTable.resetColumnSizing).toHaveBeenCalled()
    expect(onSizeChange).toHaveBeenCalledWith({})
  })

  it('should call onSizeChange when column sizing changes', () => {
    const onSizeChange = vi.fn()

    mockTable.getState = vi.fn(() => ({
      columnSizing: { col1: 200 },
      columnSizingInfo: {},
    }))

    renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
        onSizeChange,
      })
    )

    expect(onSizeChange).toHaveBeenCalledWith({ col1: 200 })
  })

  it('should handle mouse up to stop resizing', () => {
    vi.useFakeTimers()

    const resizeHandler = vi.fn()
    mockHeader.getResizeHandler = vi.fn(() => resizeHandler)

    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    const props = result.current.getResizerProps(mockHeader as Header<any, unknown>)

    const mockMouseDownEvent = {
      preventDefault: vi.fn(),
    } as any

    act(() => {
      props.onMouseDown(mockMouseDownEvent)
    })

    expect(result.current.isResizing).toBe(true)

    // Simulate mouse up
    act(() => {
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)
    })

    vi.runAllTimers()

    expect(result.current.isResizing).toBe(false)
    expect(result.current.resizingColumnId).toBe(null)

    vi.useRealTimers()
  })

  it('should handle touch end to stop resizing', () => {
    vi.useFakeTimers()

    const resizeHandler = vi.fn()
    mockHeader.getResizeHandler = vi.fn(() => resizeHandler)

    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    const props = result.current.getResizerProps(mockHeader as Header<any, unknown>)

    const mockTouchStartEvent = {
      preventDefault: vi.fn(),
    } as any

    act(() => {
      props.onTouchStart(mockTouchStartEvent)
    })

    expect(result.current.isResizing).toBe(true)

    // Simulate touch end
    act(() => {
      const touchEndEvent = new TouchEvent('touchend')
      document.dispatchEvent(touchEndEvent)
    })

    vi.runAllTimers()

    expect(result.current.isResizing).toBe(false)

    vi.useRealTimers()
  })

  it('should return current column sizing', () => {
    mockTable.getState = vi.fn(() => ({
      columnSizing: { col1: 200, col2: 150 },
      columnSizingInfo: {},
    }))

    const { result } = renderHook(() =>
      useColumnResizing({
        table: mockTable as Table<any>,
      })
    )

    expect(result.current.columnSizing).toEqual({ col1: 200, col2: 150 })
  })
})

describe('useColumnSizingPersistence', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should initialize with default sizing', () => {
    const { result } = renderHook(() =>
      useColumnSizingPersistence('test-table', { col1: 150, col2: 200 })
    )

    expect(result.current[0]).toEqual({ col1: 150, col2: 200 })
  })

  it('should load sizing from localStorage', () => {
    localStorageMock.setItem(
      'table-column-sizing-test-table',
      JSON.stringify({ col1: 250, col2: 300 })
    )

    const { result } = renderHook(() =>
      useColumnSizingPersistence('test-table', { col1: 150, col2: 200 })
    )

    expect(result.current[0]).toEqual({ col1: 250, col2: 300 })
  })

  it('should save sizing to localStorage', () => {
    const { result } = renderHook(() => useColumnSizingPersistence('test-table'))

    act(() => {
      result.current[1]({ col1: 180, col2: 220 })
    })

    expect(result.current[0]).toEqual({ col1: 180, col2: 220 })
    expect(localStorageMock.getItem('table-column-sizing-test-table')).toBe(
      JSON.stringify({ col1: 180, col2: 220 })
    )
  })

  it('should remove from localStorage when setting empty sizing', () => {
    localStorageMock.setItem(
      'table-column-sizing-test-table',
      JSON.stringify({ col1: 150 })
    )

    const { result } = renderHook(() => useColumnSizingPersistence('test-table'))

    act(() => {
      result.current[1]({})
    })

    expect(localStorageMock.getItem('table-column-sizing-test-table')).toBe(null)
  })

  it('should handle localStorage errors gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock localStorage.setItem to throw
    const originalSetItem = localStorageMock.setItem
    localStorageMock.setItem = vi.fn(() => {
      throw new Error('Quota exceeded')
    })

    const { result } = renderHook(() => useColumnSizingPersistence('test-table'))

    act(() => {
      result.current[1]({ col1: 150 })
    })

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to save column sizing to localStorage:',
      expect.any(Error)
    )

    // Restore
    localStorageMock.setItem = originalSetItem
    consoleError.mockRestore()
  })

  it('should handle JSON parse errors', () => {
    localStorageMock.setItem('table-column-sizing-test-table', 'invalid json')

    const { result } = renderHook(() =>
      useColumnSizingPersistence('test-table', { col1: 150 })
    )

    expect(result.current[0]).toEqual({ col1: 150 })
  })
})

describe('Resizer', () => {
  it('should render with resizer props', () => {
    const mockResizerProps = {
      onMouseDown: vi.fn(),
      onTouchStart: vi.fn(),
      className: 'column-resizer',
      style: {
        position: 'absolute' as const,
        right: 0,
        cursor: 'col-resize',
      },
      'data-resizing': false,
    }

    const { container } = render(<Resizer resizerProps={mockResizerProps} />)

    const resizer = container.querySelector('.column-resizer')
    expect(resizer).toBeTruthy()
    expect(resizer).toHaveStyle({ cursor: 'col-resize' })
  })

  it('should apply custom className', () => {
    const mockResizerProps = {
      onMouseDown: vi.fn(),
      className: 'column-resizer',
      style: {},
      'data-resizing': false,
    }

    const { container } = render(
      <Resizer resizerProps={mockResizerProps} className="custom-class" />
    )

    const resizer = container.querySelector('.column-resizer.custom-class')
    expect(resizer).toBeTruthy()
  })

  it('should render with visual indicator', () => {
    const mockResizerProps = {
      className: 'column-resizer',
      style: {},
      'data-resizing': false,
    }

    const { container } = render(<Resizer resizerProps={mockResizerProps} />)

    // Check that the resizer renders with its child indicator
    const resizer = container.querySelector('.column-resizer')
    expect(resizer).toBeTruthy()
    expect(resizer?.children.length).toBeGreaterThan(0)
  })
})
