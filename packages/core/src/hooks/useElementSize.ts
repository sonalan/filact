/**
 * useElementSize Hook
 * Tracks element dimensions using ResizeObserver
 */

import { useState, useEffect, useRef, type RefObject } from 'react'

/**
 * Element size information
 */
export interface ElementSize {
  width: number
  height: number
}

/**
 * Hook for tracking element dimensions
 *
 * @returns Tuple with ref to attach to element and size state
 *
 * @example
 * ```tsx
 * const [ref, size] = useElementSize<HTMLDivElement>()
 *
 * return (
 *   <div ref={ref}>
 *     Size: {size.width}x{size.height}
 *   </div>
 * )
 * ```
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  ElementSize
] {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<ElementSize>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return

      const { width, height } = entries[0].contentRect

      setSize({
        width,
        height,
      })
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return [ref, size]
}
