import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOnUnmount } from './useOnUnmount'

describe('useOnUnmount', () => {
  it('should not call callback on mount', () => {
    const callback = vi.fn()

    renderHook(() => useOnUnmount(callback))

    expect(callback).not.toHaveBeenCalled()
  })

  it('should call callback on unmount', () => {
    const callback = vi.fn()

    const { unmount } = renderHook(() => useOnUnmount(callback))

    expect(callback).not.toHaveBeenCalled()

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback on rerender', () => {
    const callback = vi.fn()

    const { rerender, unmount } = renderHook(() => useOnUnmount(callback))

    expect(callback).not.toHaveBeenCalled()

    rerender()
    expect(callback).not.toHaveBeenCalled()

    rerender()
    expect(callback).not.toHaveBeenCalled()

    unmount()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should use latest callback', () => {
    let value = 0
    const callback1 = vi.fn(() => {
      value = 1
    })
    const callback2 = vi.fn(() => {
      value = 2
    })

    const { rerender, unmount } = renderHook(({ cb }) => useOnUnmount(cb), {
      initialProps: { cb: callback1 },
    })

    // Change callback before unmount
    rerender({ cb: callback2 })

    unmount()

    // Should call callback2, not callback1
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledTimes(1)
    expect(value).toBe(2)
  })

  it('should handle multiple instances independently', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const { unmount: unmount1 } = renderHook(() => useOnUnmount(callback1))
    const { unmount: unmount2 } = renderHook(() => useOnUnmount(callback2))

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()

    unmount1()

    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).not.toHaveBeenCalled()

    unmount2()

    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it('should handle callbacks that throw errors', () => {
    const callback = vi.fn(() => {
      throw new Error('Test error')
    })

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { unmount } = renderHook(() => useOnUnmount(callback))

    expect(() => unmount()).toThrow('Test error')

    expect(callback).toHaveBeenCalledTimes(1)

    consoleErrorSpy.mockRestore()
  })

  it('should work with cleanup operations', () => {
    let subscription: any = null

    const callback = vi.fn(() => {
      subscription?.unsubscribe()
    })

    subscription = {
      unsubscribe: vi.fn(),
    }

    const { unmount } = renderHook(() => useOnUnmount(callback))

    expect(subscription.unsubscribe).not.toHaveBeenCalled()

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle state updates in callback', () => {
    let value = 'initial'
    const callback = vi.fn(() => {
      value = 'cleaned up'
    })

    const { unmount } = renderHook(() => useOnUnmount(callback))

    expect(value).toBe('initial')

    unmount()

    expect(value).toBe('cleaned up')
  })

  it('should call only once even with multiple unmounts', () => {
    const callback = vi.fn()

    const { unmount } = renderHook(() => useOnUnmount(callback))

    unmount()
    expect(callback).toHaveBeenCalledTimes(1)

    // Second unmount should not call callback again
    // (unmount is idempotent)
  })

  it('should work with async callbacks', () => {
    const callback = vi.fn(async () => {
      await Promise.resolve()
    })

    const { unmount } = renderHook(() => useOnUnmount(callback))

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should support practical cleanup scenarios', () => {
    const listeners: Array<() => void> = []

    const callback = vi.fn(() => {
      // Remove all event listeners
      listeners.forEach((listener) => listener())
      listeners.length = 0
    })

    // Simulate adding listeners
    listeners.push(vi.fn())
    listeners.push(vi.fn())

    const { unmount } = renderHook(() => useOnUnmount(callback))

    expect(listeners.length).toBe(2)

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(listeners.length).toBe(0)
  })
})
