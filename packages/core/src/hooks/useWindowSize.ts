/**
 * useWindowSize Hook
 * Tracks window dimensions with automatic updates on resize
 */

import { useState, useEffect } from 'react'

/**
 * Window size interface
 */
export interface WindowSize {
  width: number
  height: number
}

/**
 * Hook for tracking window size
 *
 * @returns Object with width and height of the window
 *
 * @example
 * ```tsx
 * const { width, height } = useWindowSize()
 *
 * return (
 *   <div>
 *     Window size: {width}x{height}
 *   </div>
 * )
 * ```
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 }
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    // Call handler right away to get initial size
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return windowSize
}
