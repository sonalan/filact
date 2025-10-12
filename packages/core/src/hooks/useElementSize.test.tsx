import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useElementSize } from './useElementSize'

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback
  elements: Element[] = []

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe = vi.fn((element: Element) => {
    this.elements.push(element)
  })

  unobserve = vi.fn()
  disconnect = vi.fn()

  trigger(width: number, height: number) {
    this.callback(
      [
        {
          contentRect: {
            width,
            height,
            top: 0,
            left: 0,
            bottom: height,
            right: width,
            x: 0,
            y: 0,
          } as DOMRectReadOnly,
          target: document.createElement('div'),
          borderBoxSize: [] as any,
          contentBoxSize: [] as any,
          devicePixelContentBoxSize: [] as any,
        },
      ],
      this as any
    )
  }
}

describe('useElementSize', () => {
  let mockObserver: MockResizeObserver

  beforeEach(() => {
    mockObserver = new MockResizeObserver(() => {})
    global.ResizeObserver = vi.fn((callback) => {
      mockObserver = new MockResizeObserver(callback)
      return mockObserver as any
    }) as any
  })

  it('should return ref and initial size', () => {
    const { result } = renderHook(() => useElementSize())

    expect(result.current[0]).toBeDefined()
    expect(result.current[0].current).toBeNull()
    expect(result.current[1]).toEqual({ width: 0, height: 0 })
  })

  it('should return the same ref object across renders', () => {
    const { result, rerender } = renderHook(() => useElementSize())

    const firstRef = result.current[0]

    rerender()

    const secondRef = result.current[0]

    expect(firstRef).toBe(secondRef)
  })

  it('should work with different element types', () => {
    const { result: divResult } = renderHook(() => useElementSize<HTMLDivElement>())
    const { result: imgResult } = renderHook(() => useElementSize<HTMLImageElement>())

    expect(divResult.current[0]).toBeDefined()
    expect(imgResult.current[0]).toBeDefined()
  })

  it('should maintain initial size without ref attachment', () => {
    const { result } = renderHook(() => useElementSize())

    expect(result.current[1]).toEqual({ width: 0, height: 0 })
  })

  it('should maintain size across re-renders', () => {
    const { result, rerender } = renderHook(() => useElementSize())

    expect(result.current[1].width).toBe(0)
    expect(result.current[1].height).toBe(0)

    rerender()

    expect(result.current[1].width).toBe(0)
    expect(result.current[1].height).toBe(0)
  })

  it('should return size object with width and height properties', () => {
    const { result } = renderHook(() => useElementSize())

    expect(result.current[1]).toHaveProperty('width')
    expect(result.current[1]).toHaveProperty('height')
    expect(typeof result.current[1].width).toBe('number')
    expect(typeof result.current[1].height).toBe('number')
  })

  it('should handle zero dimensions', () => {
    const { result } = renderHook(() => useElementSize())

    expect(result.current[1].width).toBe(0)
    expect(result.current[1].height).toBe(0)
  })

  it('should work with ResizeObserver API', () => {
    const { result } = renderHook(() => useElementSize())

    // ResizeObserver should be created
    expect(global.ResizeObserver).toBeDefined()
    expect(result.current[1]).toEqual({ width: 0, height: 0 })
  })
})
