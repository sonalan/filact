import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMount } from './useMount'

describe('useMount', () => {
  it('should call callback on mount', () => {
    const callback = vi.fn()

    renderHook(() => useMount(callback))

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback on re-render', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(() => useMount(callback))

    expect(callback).toHaveBeenCalledTimes(1)

    rerender()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple re-renders', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(() => useMount(callback))

    for (let i = 0; i < 5; i++) {
      rerender()
    }

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should work with different callback types', () => {
    const syncCallback = vi.fn()
    const asyncCallback = vi.fn(async () => {
      await Promise.resolve()
    })

    renderHook(() => useMount(syncCallback))
    renderHook(() => useMount(asyncCallback))

    expect(syncCallback).toHaveBeenCalledTimes(1)
    expect(asyncCallback).toHaveBeenCalledTimes(1)
  })

  it('should execute callback with side effects', () => {
    let counter = 0
    const callback = () => {
      counter++
    }

    renderHook(() => useMount(callback))

    expect(counter).toBe(1)
  })

  it('should work with arrow functions', () => {
    const callback = vi.fn(() => 'result')

    renderHook(() => useMount(callback))

    expect(callback).toHaveBeenCalled()
  })

  it('should work with function declarations', () => {
    const callback = vi.fn(function () {
      return 'result'
    })

    renderHook(() => useMount(callback))

    expect(callback).toHaveBeenCalled()
  })

  it('should handle callback that throws', () => {
    const callback = vi.fn(() => {
      throw new Error('Test error')
    })

    expect(() => {
      renderHook(() => useMount(callback))
    }).toThrow('Test error')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback on unmount', () => {
    const callback = vi.fn()

    const { unmount } = renderHook(() => useMount(callback))

    expect(callback).toHaveBeenCalledTimes(1)

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
