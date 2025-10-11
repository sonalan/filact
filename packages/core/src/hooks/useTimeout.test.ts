import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTimeout } from './useTimeout'

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call callback after delay', () => {
    const callback = vi.fn()

    renderHook(() => useTimeout(callback, 1000))

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    // Should not be called again
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback if delay is null', () => {
    const callback = vi.fn()

    renderHook(() => useTimeout(callback, null))

    vi.advanceTimersByTime(5000)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should cancel timeout when delay changes to null', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useTimeout(callback, delay), {
      initialProps: { delay: 1000 },
    })

    vi.advanceTimersByTime(500)

    // Cancel by setting delay to null
    rerender({ delay: null })

    vi.advanceTimersByTime(1000)
    expect(callback).not.toHaveBeenCalled()
  })

  it('should restart timeout when delay changes', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useTimeout(callback, delay), {
      initialProps: { delay: 1000 },
    })

    vi.advanceTimersByTime(500)

    // Change delay - should restart
    rerender({ delay: 2000 })

    vi.advanceTimersByTime(1500)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should use latest callback', () => {
    let count = 0
    const callback1 = vi.fn(() => {
      count = 1
    })
    const callback2 = vi.fn(() => {
      count = 2
    })

    const { rerender } = renderHook(({ cb }) => useTimeout(cb, 1000), {
      initialProps: { cb: callback1 },
    })

    vi.advanceTimersByTime(500)

    // Change callback before timeout fires
    rerender({ cb: callback2 })

    vi.advanceTimersByTime(500)

    // Should call callback2, not callback1
    expect(callback2).toHaveBeenCalledTimes(1)
    expect(callback1).not.toHaveBeenCalled()
    expect(count).toBe(2)
  })

  it('should clear timeout on unmount', () => {
    const callback = vi.fn()
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(() => useTimeout(callback, 1000))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(callback).not.toHaveBeenCalled()
  })

  it('should work with zero delay', () => {
    const callback = vi.fn()

    renderHook(() => useTimeout(callback, 0))

    vi.advanceTimersByTime(0)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle rapid delay changes', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useTimeout(callback, delay), {
      initialProps: { delay: 1000 },
    })

    rerender({ delay: 500 })
    rerender({ delay: 2000 })
    rerender({ delay: 100 })

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)

    // Should not be called again even after more time
    vi.advanceTimersByTime(2000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle state updates in callback', () => {
    let value = 0
    const callback = vi.fn(() => {
      value = 42
    })

    renderHook(() => useTimeout(callback, 1000))

    expect(value).toBe(0)

    vi.advanceTimersByTime(1000)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(value).toBe(42)
  })

  it('should not call callback before timeout', () => {
    const callback = vi.fn()

    renderHook(() => useTimeout(callback, 1000))

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

    renderHook(() => useTimeout(callback, 1000))

    expect(() => {
      vi.advanceTimersByTime(1000)
    }).toThrow('Test error')

    expect(callback).toHaveBeenCalledTimes(1)

    consoleErrorSpy.mockRestore()
  })

  it('should work with async callback', async () => {
    const callback = vi.fn(async () => {
      await Promise.resolve()
    })

    renderHook(() => useTimeout(callback, 1000))

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    // Should not be called again
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple timeouts with different delays', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    renderHook(() => useTimeout(callback1, 1000))
    renderHook(() => useTimeout(callback2, 500))

    vi.advanceTimersByTime(500)
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(500)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1) // Still only once
  })

  it('should restart timeout when resuming from null', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useTimeout(callback, delay), {
      initialProps: { delay: null },
    })

    vi.advanceTimersByTime(5000)
    expect(callback).not.toHaveBeenCalled()

    // Start timeout
    rerender({ delay: 1000 })

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle callback change after timeout fires', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const { rerender } = renderHook(({ cb }) => useTimeout(cb, 1000), {
      initialProps: { cb: callback1 },
    })

    vi.advanceTimersByTime(1000)
    expect(callback1).toHaveBeenCalledTimes(1)

    // Change callback after first timeout
    rerender({ cb: callback2 })

    vi.advanceTimersByTime(5000)
    // Neither should be called again (timeout already fired)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).not.toHaveBeenCalled()
  })
})
