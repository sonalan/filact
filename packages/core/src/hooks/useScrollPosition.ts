/**
 * useScrollPosition Hook
 * Tracks scroll position of window or element
 */

import { useState, useEffect, useRef, type RefObject } from 'react'

/**
 * Scroll position coordinates
 */
export interface ScrollPosition {
  x: number
  y: number
}

/**
 * Options for scroll position tracking
 */
export interface UseScrollPositionOptions {
  throttle?: number
  element?: RefObject<HTMLElement>
}

/**
 * Hook for tracking scroll position
 *
 * @param options - Options for scroll tracking
 * @returns Current scroll position
 *
 * @example
 * ```tsx
 * const scrollPos = useScrollPosition()
 * const elementScroll = useScrollPosition({ element: ref })
 *
 * return (
 *   <div>
 *     Scroll: {scrollPos.x}, {scrollPos.y}
 *   </div>
 * )
 * ```
 */
export function useScrollPosition(
  options?: UseScrollPositionOptions
): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  })

  const throttleTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const element = options?.element?.current || window
    const isWindow = element === window

    const getScrollPosition = (): ScrollPosition => {
      if (isWindow) {
        return {
          x: window.pageXOffset || document.documentElement.scrollLeft,
          y: window.pageYOffset || document.documentElement.scrollTop,
        }
      } else {
        const el = element as HTMLElement
        return {
          x: el.scrollLeft,
          y: el.scrollTop,
        }
      }
    }

    // Set initial position
    setScrollPosition(getScrollPosition())

    const handleScroll = () => {
      if (options?.throttle) {
        if (throttleTimeout.current) return

        throttleTimeout.current = setTimeout(() => {
          setScrollPosition(getScrollPosition())
          throttleTimeout.current = null
        }, options.throttle)
      } else {
        setScrollPosition(getScrollPosition())
      }
    }

    element.addEventListener('scroll', handleScroll as EventListener)

    return () => {
      element.removeEventListener('scroll', handleScroll as EventListener)
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current)
      }
    }
  }, [options?.element, options?.throttle])

  return scrollPosition
}
