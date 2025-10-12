import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollPosition } from './useScrollPosition'
import { useRef } from 'react'

describe('useScrollPosition', () => {
  beforeEach(() => {
    // Reset scroll position
    window.pageXOffset = 0
    window.pageYOffset = 0
    Object.defineProperty(window, 'pageXOffset', {
      writable: true,
      configurable: true,
      value: 0,
    })
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.restoreAllMocks()
  })

  it('should return initial scroll position', () => {
    const { result } = renderHook(() => useScrollPosition())

    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
  })

  it('should update on window scroll', () => {
    const { result } = renderHook(() => useScrollPosition())

    act(() => {
      Object.defineProperty(window, 'pageXOffset', {
        writable: true,
        configurable: true,
        value: 100,
      })
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 200,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.x).toBe(100)
    expect(result.current.y).toBe(200)
  })

  it('should handle multiple scroll events', () => {
    const { result } = renderHook(() => useScrollPosition())

    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 100,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.y).toBe(100)

    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 200,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.y).toBe(200)
  })

  it('should throttle scroll events', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useScrollPosition({ throttle: 100 }))

    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 100,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    // Should not update immediately due to throttle
    expect(result.current.y).toBe(0)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.y).toBe(100)

    vi.useRealTimers()
  })

  it('should ignore rapid scroll events when throttled', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useScrollPosition({ throttle: 100 }))

    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 100,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.y).toBe(100)

    // Second event should be ignored while throttled
    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 200,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    // Should still be 100 since throttle hasn't cleared
    expect(result.current.y).toBe(100)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Now should update to 200
    expect(result.current.y).toBe(200)

    vi.useRealTimers()
  })

  it('should cleanup scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useScrollPosition())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('should track horizontal scroll', () => {
    const { result } = renderHook(() => useScrollPosition())

    act(() => {
      Object.defineProperty(window, 'pageXOffset', {
        writable: true,
        configurable: true,
        value: 500,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.x).toBe(500)
  })

  it('should track both x and y scroll', () => {
    const { result } = renderHook(() => useScrollPosition())

    act(() => {
      Object.defineProperty(window, 'pageXOffset', {
        writable: true,
        configurable: true,
        value: 300,
      })
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 400,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.x).toBe(300)
    expect(result.current.y).toBe(400)
  })

  it('should handle zero scroll position', () => {
    const { result } = renderHook(() => useScrollPosition())

    act(() => {
      Object.defineProperty(window, 'pageXOffset', {
        writable: true,
        configurable: true,
        value: 100,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.x).toBe(100)

    act(() => {
      Object.defineProperty(window, 'pageXOffset', {
        writable: true,
        configurable: true,
        value: 0,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.x).toBe(0)
  })

  it('should clear throttle timeout on unmount', () => {
    vi.useFakeTimers()

    const { unmount } = renderHook(() => useScrollPosition({ throttle: 100 }))

    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 100,
      })
      window.dispatchEvent(new Event('scroll'))
    })

    unmount()

    expect(vi.getTimerCount()).toBe(0)

    vi.useRealTimers()
  })
})
