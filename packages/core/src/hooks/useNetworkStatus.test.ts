import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNetworkStatus } from './useNetworkStatus'

describe('useNetworkStatus', () => {
  const originalOnLine = navigator.onLine

  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: originalOnLine,
    })
    vi.restoreAllMocks()
  })

  it('should return initial online status', () => {
    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current.online).toBe(true)
    expect(result.current.since).toBeInstanceOf(Date)
  })

  it('should detect when going offline', () => {
    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current.online).toBe(true)

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.online).toBe(false)
  })

  it('should detect when going back online', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current.online).toBe(false)

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true,
      })
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.online).toBe(true)
  })

  it('should update since timestamp on status change', () => {
    const { result } = renderHook(() => useNetworkStatus())

    const initialSince = result.current.since

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.since).not.toBe(initialSince)
    expect(result.current.since).toBeInstanceOf(Date)
  })

  it('should handle multiple status changes', () => {
    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current.online).toBe(true)

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.online).toBe(false)

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true,
      })
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.online).toBe(true)

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.online).toBe(false)
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useNetworkStatus())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('should start with offline status if initially offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current.online).toBe(false)
  })

  it('should maintain status across re-renders', () => {
    const { result, rerender } = renderHook(() => useNetworkStatus())

    expect(result.current.online).toBe(true)

    rerender()

    expect(result.current.online).toBe(true)
  })

  it('should handle rapid status changes', () => {
    const { result } = renderHook(() => useNetworkStatus())

    for (let i = 0; i < 10; i++) {
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          configurable: true,
          value: i % 2 === 0,
        })
        window.dispatchEvent(new Event(i % 2 === 0 ? 'online' : 'offline'))
      })
    }

    // Last iteration: i=9, i%2===0 is false, so offline
    expect(result.current.online).toBe(false)
  })

  it('should return status object with required properties', () => {
    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current).toHaveProperty('online')
    expect(result.current).toHaveProperty('since')
    expect(typeof result.current.online).toBe('boolean')
    expect(result.current.since).toBeInstanceOf(Date)
  })
})
