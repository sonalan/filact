import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInterval } from './useInterval'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call callback on interval', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, 1000))

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('should not call callback if delay is null', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, null))

    vi.advanceTimersByTime(5000)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should pause when delay changes to null', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    })

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    // Pause by setting delay to null
    rerender({ delay: null })

    vi.advanceTimersByTime(5000)
    expect(callback).toHaveBeenCalledTimes(1) // Should not increase
  })

  it('should resume when delay changes from null', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: null },
    })

    vi.advanceTimersByTime(5000)
    expect(callback).not.toHaveBeenCalled()

    // Resume by setting delay
    rerender({ delay: 1000 })

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should update interval when delay changes', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    })

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    // Change delay to 500ms
    rerender({ delay: 500 })

    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('should use latest callback', () => {
    let count = 0
    const callback1 = vi.fn(() => {
      count += 1
    })
    const callback2 = vi.fn(() => {
      count += 10
    })

    const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
      initialProps: { cb: callback1 },
    })

    vi.advanceTimersByTime(1000)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(count).toBe(1)

    // Change callback
    rerender({ cb: callback2 })

    vi.advanceTimersByTime(1000)
    expect(callback2).toHaveBeenCalledTimes(1)
    expect(count).toBe(11) // 1 + 10
  })

  it('should clear interval on unmount', () => {
    const callback = vi.fn()
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() => useInterval(callback, 1000))

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should handle rapid delay changes', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    })

    rerender({ delay: 500 })
    rerender({ delay: 2000 })
    rerender({ delay: 100 })

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should work with zero delay', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, 0))

    vi.advanceTimersByTime(0)
    expect(callback).toHaveBeenCalled()
  })

  it('should handle state updates in callback', () => {
    let value = 0
    const callback = vi.fn(() => {
      value += 1
    })

    renderHook(() => useInterval(callback, 100))

    vi.advanceTimersByTime(500)

    expect(callback).toHaveBeenCalledTimes(5)
    expect(value).toBe(5)
  })

  it('should not call callback before first interval', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, 1000))

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(999)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle callback that throws error', () => {
    const callback = vi.fn(() => {
      throw new Error('Test error')
    })

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderHook(() => useInterval(callback, 1000))

    expect(() => {
      vi.advanceTimersByTime(1000)
    }).toThrow('Test error')

    expect(callback).toHaveBeenCalledTimes(1)

    consoleErrorSpy.mockRestore()
  })

  it('should work with async callback', () => {
    const callback = vi.fn(async () => {
      await Promise.resolve()
    })

    renderHook(() => useInterval(callback, 1000))

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should handle multiple intervals with different delays', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    renderHook(() => useInterval(callback1, 1000))
    renderHook(() => useInterval(callback2, 500))

    vi.advanceTimersByTime(500)
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(500)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(1000)
    expect(callback1).toHaveBeenCalledTimes(2)
    expect(callback2).toHaveBeenCalledTimes(4)
  })
})
