import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOnScreen } from './useOnScreen'

describe('useOnScreen', () => {
  it('should return ref and initial visibility state', () => {
    const { result } = renderHook(() => useOnScreen())

    expect(result.current[0]).toBeDefined()
    expect(result.current[0].current).toBeNull()
    expect(result.current[1]).toBe(false)
  })

  it('should return the same ref object across renders', () => {
    const { result, rerender } = renderHook(() => useOnScreen())

    const firstRef = result.current[0]

    rerender()

    const secondRef = result.current[0]

    expect(firstRef).toBe(secondRef)
  })

  it('should work with different element types', () => {
    const { result: divResult } = renderHook(() => useOnScreen<HTMLDivElement>())
    const { result: imgResult } = renderHook(() => useOnScreen<HTMLImageElement>())

    expect(divResult.current[0]).toBeDefined()
    expect(imgResult.current[0]).toBeDefined()
  })

  it('should accept custom threshold', () => {
    const { result } = renderHook(() =>
      useOnScreen({
        threshold: 0.5,
      })
    )

    expect(result.current[0]).toBeDefined()
    expect(result.current[1]).toBe(false)
  })

  it('should accept threshold array', () => {
    const { result } = renderHook(() =>
      useOnScreen({
        threshold: [0, 0.25, 0.5, 0.75, 1],
      })
    )

    expect(result.current[0]).toBeDefined()
    expect(result.current[1]).toBe(false)
  })

  it('should accept rootMargin option', () => {
    const { result } = renderHook(() =>
      useOnScreen({
        rootMargin: '10px',
      })
    )

    expect(result.current[0]).toBeDefined()
  })

  it('should maintain initial state without ref attachment', () => {
    const { result } = renderHook(() => useOnScreen())

    expect(result.current[1]).toBe(false)
  })

  it('should maintain state across re-renders', () => {
    const { result, rerender } = renderHook(() => useOnScreen())

    expect(result.current[1]).toBe(false)

    rerender()

    expect(result.current[1]).toBe(false)
  })
})
