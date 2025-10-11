import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))

    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 500 })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast-forward time by 499ms
    act(() => {
      vi.advanceTimersByTime(499)
    })

    // Value still should not have changed
    expect(result.current).toBe('initial')

    // Fast-forward remaining time
    act(() => {
      vi.advanceTimersByTime(1)
    })

    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    )

    // Update value multiple times
    rerender({ value: 'first' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'second' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'third' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Should still be initial because timer keeps resetting
    expect(result.current).toBe('initial')

    // Fast-forward full delay from last change
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should now be the last value
    expect(result.current).toBe('third')
  })

  it('should work with different data types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 42 },
      }
    )

    expect(result.current).toBe(42)

    rerender({ value: 100 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(100)
  })

  it('should work with objects', () => {
    const initialObj = { name: 'John', age: 30 }
    const updatedObj = { name: 'Jane', age: 25 }

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: initialObj },
      }
    )

    expect(result.current).toBe(initialObj)

    rerender({ value: updatedObj })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(updatedObj)
  })

  it('should work with arrays', () => {
    const initialArray = [1, 2, 3]
    const updatedArray = [4, 5, 6]

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: initialArray },
      }
    )

    expect(result.current).toBe(initialArray)

    rerender({ value: updatedArray })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(updatedArray)
  })

  it('should use default delay of 500ms when not provided', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      {
        initialProps: { value: 'initial' },
      }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(499)
    })

    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(result.current).toBe('updated')
  })

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    rerender({ value: 'updated', delay: 1000 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Should not be updated yet because delay increased
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now should be updated
    expect(result.current).toBe('updated')
  })

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(() => useDebounce('test', 500))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      {
        initialProps: { value: 'initial' },
      }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current).toBe('updated')
  })

  it('should handle undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: undefined as string | undefined },
      }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: 'defined' })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('defined')
  })

  it('should handle null values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: null as string | null },
      }
    )

    expect(result.current).toBeNull()

    rerender({ value: 'not null' })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('not null')
  })

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: false },
      }
    )

    expect(result.current).toBe(false)

    rerender({ value: true })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(true)
  })
})
