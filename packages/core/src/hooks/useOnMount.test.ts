import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOnMount } from './useOnMount'

describe('useOnMount', () => {
  it('should call callback on mount', () => {
    const callback = vi.fn()

    renderHook(() => useOnMount(callback))

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback on rerender', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(() => useOnMount(callback))

    expect(callback).toHaveBeenCalledTimes(1)

    rerender()
    expect(callback).toHaveBeenCalledTimes(1)

    rerender()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should call cleanup function on unmount', () => {
    const cleanup = vi.fn()
    const callback = vi.fn(() => cleanup)

    const { unmount } = renderHook(() => useOnMount(callback))

    expect(callback).toHaveBeenCalledTimes(1)
    expect(cleanup).not.toHaveBeenCalled()

    unmount()

    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('should work without cleanup function', () => {
    const callback = vi.fn()

    const { unmount } = renderHook(() => useOnMount(callback))

    expect(callback).toHaveBeenCalledTimes(1)

    expect(() => unmount()).not.toThrow()
  })

  it('should handle async callbacks', () => {
    const callback = vi.fn(() => {
      // Async callback that doesn't return promise from effect
      Promise.resolve().then(() => {
        // Do async work here
      })
    })

    renderHook(() => useOnMount(callback))

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle callbacks that throw errors', () => {
    const callback = vi.fn(() => {
      throw new Error('Test error')
    })

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useOnMount(callback))
    }).toThrow('Test error')

    expect(callback).toHaveBeenCalledTimes(1)

    consoleErrorSpy.mockRestore()
  })

  it('should execute callback only once with multiple instances', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    renderHook(() => useOnMount(callback1))
    renderHook(() => useOnMount(callback2))

    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it('should work with state updates in callback', () => {
    let value = 0
    const callback = vi.fn(() => {
      value = 42
    })

    renderHook(() => useOnMount(callback))

    expect(value).toBe(42)
  })

  it('should support cleanup with state', () => {
    let mounted = false
    const cleanup = vi.fn(() => {
      mounted = false
    })
    const callback = vi.fn(() => {
      mounted = true
      return cleanup
    })

    const { unmount } = renderHook(() => useOnMount(callback))

    expect(mounted).toBe(true)
    expect(cleanup).not.toHaveBeenCalled()

    unmount()

    expect(mounted).toBe(false)
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple cleanup operations', () => {
    const cleanup1 = vi.fn()
    const cleanup2 = vi.fn()
    const callback = vi.fn(() => {
      return () => {
        cleanup1()
        cleanup2()
      }
    })

    const { unmount } = renderHook(() => useOnMount(callback))

    expect(cleanup1).not.toHaveBeenCalled()
    expect(cleanup2).not.toHaveBeenCalled()

    unmount()

    expect(cleanup1).toHaveBeenCalledTimes(1)
    expect(cleanup2).toHaveBeenCalledTimes(1)
  })
})
