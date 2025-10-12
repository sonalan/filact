import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIsFirstRender } from './useIsFirstRender'

describe('useIsFirstRender', () => {
  it('should return true on first render', () => {
    const { result } = renderHook(() => useIsFirstRender())

    expect(result.current).toBe(true)
  })

  it('should return false on subsequent renders', () => {
    const { result, rerender } = renderHook(() => useIsFirstRender())

    expect(result.current).toBe(true)

    rerender()
    expect(result.current).toBe(false)

    rerender()
    expect(result.current).toBe(false)

    rerender()
    expect(result.current).toBe(false)
  })

  it('should work across multiple rerenders', () => {
    const { result, rerender } = renderHook(() => useIsFirstRender())

    const results: boolean[] = []

    results.push(result.current)

    for (let i = 0; i < 10; i++) {
      rerender()
      results.push(result.current)
    }

    expect(results[0]).toBe(true)
    expect(results.slice(1).every((r) => r === false)).toBe(true)
  })

  it('should have independent state for different instances', () => {
    const { result: result1 } = renderHook(() => useIsFirstRender())
    const { result: result2, rerender: rerender2 } = renderHook(() => useIsFirstRender())

    expect(result1.current).toBe(true)
    expect(result2.current).toBe(true)

    rerender2()

    expect(result1.current).toBe(true) // First instance still on first render
    expect(result2.current).toBe(false) // Second instance has rerendered
  })

  it('should maintain state through remounts', () => {
    const { result, rerender, unmount } = renderHook(() => useIsFirstRender())

    expect(result.current).toBe(true)

    rerender()
    expect(result.current).toBe(false)

    unmount()

    // After unmount, if we create a new hook instance, it should be first render again
    const { result: result2 } = renderHook(() => useIsFirstRender())
    expect(result2.current).toBe(true)
  })

  it('should work in practical useEffect example', () => {
    let firstRenderCount = 0
    let subsequentRenderCount = 0

    function TestHook() {
      const isFirstRender = useIsFirstRender()

      if (isFirstRender) {
        firstRenderCount++
      } else {
        subsequentRenderCount++
      }

      return isFirstRender
    }

    const { rerender } = renderHook(() => TestHook())

    expect(firstRenderCount).toBe(1)
    expect(subsequentRenderCount).toBe(0)

    rerender()
    expect(firstRenderCount).toBe(1)
    expect(subsequentRenderCount).toBe(1)

    rerender()
    expect(firstRenderCount).toBe(1)
    expect(subsequentRenderCount).toBe(2)
  })

  it('should be consistent within same render', () => {
    let value1: boolean
    let value2: boolean

    function TestHook() {
      value1 = useIsFirstRender()
      value2 = useIsFirstRender()
      return null
    }

    const { rerender } = renderHook(() => TestHook())

    // First call returns true, second call in same render also returns true
    // because each hook instance has its own ref
    expect(value1!).toBe(true)
    expect(value2!).toBe(true)

    rerender()

    // Both should be false on subsequent render
    expect(value1!).toBe(false)
    expect(value2!).toBe(false)
  })

  it('should work with rapid rerenders', () => {
    const { result, rerender } = renderHook(() => useIsFirstRender())

    expect(result.current).toBe(true)

    // Many rapid rerenders
    for (let i = 0; i < 100; i++) {
      rerender()
      expect(result.current).toBe(false)
    }
  })

  it('should work in combination with state updates', () => {
    const results: Array<{ isFirstRender: boolean; count: number }> = []

    function TestHook({ count }: { count: number }) {
      const isFirstRender = useIsFirstRender()
      results.push({ isFirstRender, count })
      return isFirstRender
    }

    const { rerender } = renderHook(({ count }) => TestHook({ count }), {
      initialProps: { count: 0 },
    })

    expect(results[0]).toEqual({ isFirstRender: true, count: 0 })

    rerender({ count: 1 })
    expect(results[1]).toEqual({ isFirstRender: false, count: 1 })

    rerender({ count: 2 })
    expect(results[2]).toEqual({ isFirstRender: false, count: 2 })
  })
})
