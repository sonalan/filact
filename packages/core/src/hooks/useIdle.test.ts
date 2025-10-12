import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIdle } from './useIdle'

describe('useIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useIdle({ initialState: false }))

    expect(result.current).toBe(false)
  })

  it('should return custom initial state', () => {
    const { result } = renderHook(() => useIdle({ initialState: true }))

    expect(result.current).toBe(true)
  })

  it('should become idle after timeout', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }))

    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(true)
  })

  it('should reset idle state on user activity', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove'))
    })

    expect(result.current).toBe(false)
  })

  it('should reset timeout on activity', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove'))
    })

    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current).toBe(true)
  })

  it('should detect mousedown event', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new MouseEvent('mousedown'))
    })

    expect(result.current).toBe(false)
  })

  it('should detect keypress event', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keypress'))
    })

    expect(result.current).toBe(false)
  })

  it('should detect scroll event', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current).toBe(false)
  })

  it('should detect click event', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new MouseEvent('click'))
    })

    expect(result.current).toBe(false)
  })

  it('should support custom events', () => {
    const { result } = renderHook(() =>
      useIdle({ timeout: 5000, events: ['custom'] })
    )

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('custom'))
    })

    expect(result.current).toBe(false)
  })

  it('should use custom timeout', () => {
    const { result } = renderHook(() => useIdle({ timeout: 10000 }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe(true)
  })

  it('should cleanup timers on unmount', () => {
    const { unmount } = renderHook(() => useIdle({ timeout: 5000 }))

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useIdle())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function))
  })

  it('should handle rapid activity', () => {
    const { result } = renderHook(() => useIdle({ timeout: 5000 }))

    for (let i = 0; i < 10; i++) {
      act(() => {
        window.dispatchEvent(new MouseEvent('mousemove'))
        vi.advanceTimersByTime(1000)
      })
    }

    expect(result.current).toBe(false)
  })

  it('should update when timeout changes', () => {
    const { result, rerender } = renderHook(
      ({ timeout }) => useIdle({ timeout }),
      { initialProps: { timeout: 5000 } }
    )

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(result.current).toBe(false)

    rerender({ timeout: 3000 })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current).toBe(true)
  })
})
