import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUnmount } from './useUnmount'

describe('useUnmount', () => {
  it('should call callback on unmount', () => {
    const callback = vi.fn()

    const { unmount } = renderHook(() => useUnmount(callback))

    expect(callback).not.toHaveBeenCalled()

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback on mount', () => {
    const callback = vi.fn()

    renderHook(() => useUnmount(callback))

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not call callback on re-render', () => {
    const callback = vi.fn()

    const { rerender, unmount } = renderHook(() => useUnmount(callback))

    rerender()
    rerender()
    rerender()

    expect(callback).not.toHaveBeenCalled()

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should use latest callback on unmount', () => {
    let value = 'initial'
    const callback1 = vi.fn(() => {
      value = 'first'
    })
    const callback2 = vi.fn(() => {
      value = 'second'
    })

    const { rerender, unmount } = renderHook(
      ({ cb }) => useUnmount(cb),
      { initialProps: { cb: callback1 } }
    )

    rerender({ cb: callback2 })

    unmount()

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledTimes(1)
    expect(value).toBe('second')
  })

  it('should handle callback with side effects', () => {
    let counter = 0
    const callback = () => {
      counter++
    }

    const { unmount } = renderHook(() => useUnmount(callback))

    expect(counter).toBe(0)

    unmount()

    expect(counter).toBe(1)
  })

  it('should work with async callback', () => {
    const callback = vi.fn(async () => {
      await Promise.resolve()
    })

    const { unmount } = renderHook(() => useUnmount(callback))

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle callback that throws', () => {
    const callback = vi.fn(() => {
      throw new Error('Test error')
    })

    const { unmount } = renderHook(() => useUnmount(callback))

    expect(() => {
      unmount()
    }).toThrow('Test error')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should work with arrow functions', () => {
    const callback = vi.fn(() => 'cleanup')

    const { unmount } = renderHook(() => useUnmount(callback))

    unmount()

    expect(callback).toHaveBeenCalled()
  })

  it('should work with function declarations', () => {
    const callback = vi.fn(function () {
      return 'cleanup'
    })

    const { unmount } = renderHook(() => useUnmount(callback))

    unmount()

    expect(callback).toHaveBeenCalled()
  })

  it('should handle multiple callbacks across re-renders', () => {
    const callbacks: Array<() => void> = []

    for (let i = 0; i < 5; i++) {
      callbacks.push(vi.fn(() => {}))
    }

    const { rerender, unmount } = renderHook(
      ({ cb }) => useUnmount(cb),
      { initialProps: { cb: callbacks[0] } }
    )

    callbacks.slice(1).forEach((cb) => {
      rerender({ cb })
    })

    unmount()

    // Only the last callback should be called
    callbacks.slice(0, 4).forEach((cb) => {
      expect(cb).not.toHaveBeenCalled()
    })
    expect(callbacks[4]).toHaveBeenCalledTimes(1)
  })
})
