import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyPress } from './useKeyPress'

describe('useKeyPress', () => {
  beforeEach(() => {
    // Clear any event listeners
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false initially', () => {
    const { result } = renderHook(() => useKeyPress('Enter'))

    expect(result.current).toBe(false)
  })

  it('should detect key press', () => {
    const { result } = renderHook(() => useKeyPress('Enter'))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    expect(result.current).toBe(true)
  })

  it('should detect key release', () => {
    const { result } = renderHook(() => useKeyPress('Enter'))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
    })

    expect(result.current).toBe(false)
  })

  it('should ignore other keys', () => {
    const { result } = renderHook(() => useKeyPress('Enter'))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(result.current).toBe(false)
  })

  it('should detect ctrl+key combination', () => {
    const { result } = renderHook(() => useKeyPress('s', { ctrlKey: true }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: false }))
    })

    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))
    })

    expect(result.current).toBe(true)
  })

  it('should detect shift+key combination', () => {
    const { result } = renderHook(() => useKeyPress('A', { shiftKey: true }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', shiftKey: false }))
    })

    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', shiftKey: true }))
    })

    expect(result.current).toBe(true)
  })

  it('should detect alt+key combination', () => {
    const { result } = renderHook(() => useKeyPress('t', { altKey: true }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 't', altKey: false }))
    })

    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 't', altKey: true }))
    })

    expect(result.current).toBe(true)
  })

  it('should detect meta+key combination', () => {
    const { result } = renderHook(() => useKeyPress('k', { metaKey: true }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: false }))
    })

    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    })

    expect(result.current).toBe(true)
  })

  it('should detect multiple modifier combinations', () => {
    const { result } = renderHook(() =>
      useKeyPress('s', { ctrlKey: true, shiftKey: true })
    )

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', ctrlKey: true, shiftKey: false })
      )
    })

    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', ctrlKey: true, shiftKey: true })
      )
    })

    expect(result.current).toBe(true)
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useKeyPress('Enter'))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
  })

  it('should handle rapid key presses', () => {
    const { result } = renderHook(() => useKeyPress('Space'))

    for (let i = 0; i < 10; i++) {
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }))
      })

      expect(result.current).toBe(true)

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Space' }))
      })

      expect(result.current).toBe(false)
    }
  })

  it('should update when targetKey changes', () => {
    const { result, rerender } = renderHook(
      ({ key }) => useKeyPress(key),
      { initialProps: { key: 'Enter' } }
    )

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))
    })

    expect(result.current).toBe(false)

    rerender({ key: 'Escape' })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(result.current).toBe(true)
  })

  it('should handle letter keys', () => {
    const { result } = renderHook(() => useKeyPress('a'))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    })

    expect(result.current).toBe(true)
  })

  it('should handle special keys', () => {
    const { result: escapeResult } = renderHook(() => useKeyPress('Escape'))
    const { result: tabResult } = renderHook(() => useKeyPress('Tab'))
    const { result: arrowResult } = renderHook(() => useKeyPress('ArrowUp'))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(escapeResult.current).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    })

    expect(tabResult.current).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    })

    expect(arrowResult.current).toBe(true)
  })
})
