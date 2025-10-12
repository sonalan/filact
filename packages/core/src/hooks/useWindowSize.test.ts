import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWindowSize } from './useWindowSize'

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth
  const originalInnerHeight = window.innerHeight

  beforeEach(() => {
    // Set initial window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })
  })

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    })
    vi.restoreAllMocks()
  })

  it('should return initial window size', () => {
    const { result } = renderHook(() => useWindowSize())

    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)
  })

  it('should update size on window resize', () => {
    const { result } = renderHook(() => useWindowSize())

    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)

    // Simulate resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.width).toBe(1920)
    expect(result.current.height).toBe(1080)
  })

  it('should handle multiple resize events', () => {
    const { result } = renderHook(() => useWindowSize())

    // First resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1366,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.width).toBe(1366)
    expect(result.current.height).toBe(768)

    // Second resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.width).toBe(768)
    expect(result.current.height).toBe(1024)
  })

  it('should handle mobile viewport sizes', () => {
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 812,
      })
    })

    const { result } = renderHook(() => useWindowSize())

    expect(result.current.width).toBe(375)
    expect(result.current.height).toBe(812)
  })

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useWindowSize())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('should handle rapid resize events', () => {
    const { result } = renderHook(() => useWindowSize())

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000,
      })
      window.dispatchEvent(new Event('resize'))
    })

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1100,
      })
      window.dispatchEvent(new Event('resize'))
    })

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.width).toBe(1200)
  })

  it('should work with portrait orientation', () => {
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      })
    })

    const { result } = renderHook(() => useWindowSize())

    expect(result.current.width).toBe(768)
    expect(result.current.height).toBe(1024)
    expect(result.current.width).toBeLessThan(result.current.height)
  })

  it('should work with landscape orientation', () => {
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      })
    })

    const { result } = renderHook(() => useWindowSize())

    expect(result.current.width).toBe(1920)
    expect(result.current.height).toBe(1080)
    expect(result.current.width).toBeGreaterThan(result.current.height)
  })

  it('should handle zero dimensions', () => {
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 0,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 0,
      })
    })

    const { result } = renderHook(() => useWindowSize())

    expect(result.current.width).toBe(0)
    expect(result.current.height).toBe(0)
  })

  it('should handle very large dimensions', () => {
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 5000,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 3000,
      })
    })

    const { result } = renderHook(() => useWindowSize())

    expect(result.current.width).toBe(5000)
    expect(result.current.height).toBe(3000)
  })

  it('should return object with width and height properties', () => {
    const { result } = renderHook(() => useWindowSize())

    expect(result.current).toHaveProperty('width')
    expect(result.current).toHaveProperty('height')
    expect(typeof result.current.width).toBe('number')
    expect(typeof result.current.height).toBe('number')
  })

  it.skip('should handle SSR by returning zero dimensions', () => {
    // Skip this test as it's not possible to properly test SSR
    // in a browser environment with jsdom
  })
})
