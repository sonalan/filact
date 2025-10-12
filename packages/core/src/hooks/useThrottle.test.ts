import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThrottle } from './useThrottle'

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 500))

    expect(result.current).toBe('initial')
  })

  it('should throttle value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 'first' } }
    )

    expect(result.current).toBe('first')

    rerender({ value: 'second' })

    // Should not update immediately
    expect(result.current).toBe('first')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('second')
  })

  it('should update after delay when changed', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 'first' } }
    )

    expect(result.current).toBe('first')

    rerender({ value: 'second' })

    // Should not update immediately
    expect(result.current).toBe('first')

    // Should update after delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('second')
  })

  it('should throttle rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 0 } }
    )

    expect(result.current).toBe(0)

    // Rapid updates
    for (let i = 1; i <= 5; i++) {
      rerender({ value: i })
      act(() => {
        vi.advanceTimersByTime(100)
      })
    }

    // Should only have the last value after throttle period
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(5)
  })

  it('should work with different data types', () => {
    const { result: stringResult } = renderHook(() => useThrottle('test', 500))
    const { result: numberResult } = renderHook(() => useThrottle(42, 500))
    const { result: boolResult } = renderHook(() => useThrottle(true, 500))
    const { result: objectResult } = renderHook(() => useThrottle({ key: 'value' }, 500))

    expect(stringResult.current).toBe('test')
    expect(numberResult.current).toBe(42)
    expect(boolResult.current).toBe(true)
    expect(objectResult.current).toEqual({ key: 'value' })
  })

  it('should respect different delay values', () => {
    const { result: short, rerender: rerenderShort } = renderHook(
      ({ value }) => useThrottle(value, 100),
      { initialProps: { value: 'a' } }
    )

    const { result: long, rerender: rerenderLong } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 'x' } }
    )

    rerenderShort({ value: 'b' })
    rerenderLong({ value: 'y' })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(short.current).toBe('b')
    expect(long.current).toBe('x')

    act(() => {
      vi.advanceTimersByTime(900)
    })

    expect(long.current).toBe('y')
  })

  it('should cleanup timeout on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 'first' } }
    )

    rerender({ value: 'second' })

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('should handle sequential value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 1 } }
    )

    expect(result.current).toBe(1)

    rerender({ value: 2 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(2)

    rerender({ value: 3 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(3)
  })

  it('should update to latest value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    rerender({ value: 'c' })
    rerender({ value: 'd' })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('d')
  })

  it('should work with null and undefined', () => {
    const { result: nullResult } = renderHook(() => useThrottle(null, 500))
    const { result: undefinedResult } = renderHook(() => useThrottle(undefined, 500))

    expect(nullResult.current).toBe(null)
    expect(undefinedResult.current).toBe(undefined)
  })

  it('should work with arrays', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: [1, 2, 3] } }
    )

    expect(result.current).toEqual([1, 2, 3])

    rerender({ value: [4, 5, 6] })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toEqual([4, 5, 6])
  })

  it('should handle delay change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    )

    rerender({ value: 'b', delay: 500 })

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current).toBe('a')

    rerender({ value: 'b', delay: 100 })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe('b')
  })
})
