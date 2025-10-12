/**
 * useOnScreen Hook
 * Detects when an element is visible on screen using Intersection Observer
 */

import { useState, useEffect, useRef, type RefObject } from 'react'

/**
 * Options for Intersection Observer
 */
export interface UseOnScreenOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

/**
 * Hook for detecting when an element is visible on screen
 *
 * @param options - Intersection Observer options
 * @returns Tuple with ref to attach to element and visibility state
 *
 * @example
 * ```tsx
 * const [ref, isVisible] = useOnScreen<HTMLDivElement>()
 *
 * return (
 *   <div ref={ref}>
 *     {isVisible ? 'Visible!' : 'Not visible'}
 *   </div>
 * )
 * ```
 */
export function useOnScreen<T extends HTMLElement = HTMLElement>(
  options?: UseOnScreenOptions
): [RefObject<T>, boolean] {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [options?.root, options?.rootMargin, options?.threshold])

  return [ref, isVisible]
}
