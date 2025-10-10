import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearchState } from './useSearchState'

describe('useSearchState', () => {
  let replaceStateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    replaceStateMock = vi.fn()

    Object.defineProperty(window.history, 'replaceState', {
      value: replaceStateMock,
      writable: true,
    })

    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        search: '',
        href: 'http://localhost/test',
      },
      writable: true,
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with empty search', () => {
    const { result } = renderHook(() => useSearchState())

    expect(result.current.search).toBe('')
    expect(result.current.debouncedSearch).toBe('')
    expect(result.current.hasSearch).toBe(false)
  })

  it('should initialize with provided initial search', () => {
    const { result } = renderHook(() =>
      useSearchState({ initialSearch: 'test' })
    )

    expect(result.current.search).toBe('test')
    expect(result.current.debouncedSearch).toBe('test')
  })

  it('should update search value', () => {
    const { result } = renderHook(() => useSearchState())

    act(() => {
      result.current.setSearch('new search')
    })

    expect(result.current.search).toBe('new search')
  })

  it('should debounce search value', () => {
    const { result } = renderHook(() =>
      useSearchState({ debounceMs: 300 })
    )

    act(() => {
      result.current.setSearch('test')
    })

    expect(result.current.search).toBe('test')
    expect(result.current.debouncedSearch).toBe('')
    expect(result.current.isDebouncing).toBe(true)

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.debouncedSearch).toBe('test')
    expect(result.current.isDebouncing).toBe(false)
  })

  it('should clear search', () => {
    const { result } = renderHook(() => useSearchState())

    act(() => {
      result.current.setSearch('test')
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.debouncedSearch).toBe('test')

    act(() => {
      result.current.clearSearch()
    })

    expect(result.current.search).toBe('')
  })

  it('should indicate when search is active', () => {
    const { result } = renderHook(() => useSearchState())

    expect(result.current.hasSearch).toBe(false)

    act(() => {
      result.current.setSearch('test')
    })

    expect(result.current.hasSearch).toBe(true)
  })

  it('should update URL when persistToUrl is true', () => {
    const { result } = renderHook(() =>
      useSearchState({ persistToUrl: true })
    )

    act(() => {
      result.current.setSearch('test')
      vi.runAllTimers()
    })

    expect(replaceStateMock).toHaveBeenCalled()
  })

  it('should not update URL when persistToUrl is false', () => {
    const { result } = renderHook(() =>
      useSearchState({ persistToUrl: false })
    )

    act(() => {
      result.current.setSearch('test')
      vi.runAllTimers()
    })

    expect(replaceStateMock).not.toHaveBeenCalled()
  })

  it('should use custom URL parameter name', () => {
    const { result } = renderHook(() =>
      useSearchState({ persistToUrl: true, urlParam: 'q' })
    )

    act(() => {
      result.current.setSearch('test')
      vi.runAllTimers()
    })

    expect(replaceStateMock).toHaveBeenCalled()
  })

  it('should call onSearchChange callback after debounce', () => {
    const onSearchChange = vi.fn()
    const { result } = renderHook(() =>
      useSearchState({ onSearchChange, debounceMs: 300 })
    )

    act(() => {
      result.current.setSearch('test')
    })

    expect(onSearchChange).not.toHaveBeenCalledWith('test')

    act(() => {
      vi.runAllTimers()
    })

    expect(onSearchChange).toHaveBeenCalledWith('test')
  })

  it('should cancel previous debounce timer on new input', () => {
    const { result } = renderHook(() =>
      useSearchState({ debounceMs: 300 })
    )

    act(() => {
      result.current.setSearch('test')
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      result.current.setSearch('test2')
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Should still be debouncing
    expect(result.current.debouncedSearch).toBe('')

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.debouncedSearch).toBe('test2')
  })

  it('should initialize from URL parameter', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        search: '?search=initial',
      },
      writable: true,
    })

    const { result } = renderHook(() =>
      useSearchState({ persistToUrl: true })
    )

    expect(result.current.search).toBe('initial')
    expect(result.current.debouncedSearch).toBe('initial')
  })

  it('should use custom URL param when initializing from URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        search: '?q=custom',
      },
      writable: true,
    })

    const { result } = renderHook(() =>
      useSearchState({ persistToUrl: true, urlParam: 'q' })
    )

    expect(result.current.search).toBe('custom')
  })

  it('should use custom debounce delay', () => {
    const { result} = renderHook(() =>
      useSearchState({ debounceMs: 500 })
    )

    act(() => {
      result.current.setSearch('test')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.debouncedSearch).toBe('')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.debouncedSearch).toBe('test')
  })

  it('should remove URL param when search is cleared', () => {
    const { result } = renderHook(() =>
      useSearchState({ persistToUrl: true })
    )

    act(() => {
      result.current.setSearch('test')
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(replaceStateMock).toHaveBeenCalled()

    replaceStateMock.mockClear()

    act(() => {
      result.current.clearSearch()
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(replaceStateMock).toHaveBeenCalled()
  })

  it('should handle rapid search updates', () => {
    const { result } = renderHook(() =>
      useSearchState({ debounceMs: 300 })
    )

    act(() => {
      result.current.setSearch('a')
    })

    act(() => {
      vi.advanceTimersByTime(50)
    })

    act(() => {
      result.current.setSearch('ab')
    })

    act(() => {
      vi.advanceTimersByTime(50)
    })

    act(() => {
      result.current.setSearch('abc')
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.debouncedSearch).toBe('abc')
  })

  it('should handle empty string search', () => {
    const { result } = renderHook(() =>
      useSearchState({ initialSearch: 'test' })
    )

    act(() => {
      result.current.setSearch('')
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.debouncedSearch).toBe('')
    expect(result.current.hasSearch).toBe(false)
  })
})
