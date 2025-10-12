/**
 * useThrottle Hook
 * Throttles a value to limit update frequency
 */

import { useState, useEffect, useRef } from 'react'

/**
 * Hook for throttling a value
 *
 * @param value - Value to throttle
 * @param delay - Throttle delay in milliseconds
 * @returns Throttled value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const throttledSearch = useThrottle(searchTerm, 500)
 *
 * useEffect(() => {
 *   // API call with throttled value
 *   fetchResults(throttledSearch)
 * }, [throttledSearch])
 * ```
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef<number>(Date.now())
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastRan = now - lastRan.current

    if (timeSinceLastRan >= delay) {
      setThrottledValue(value)
      lastRan.current = now
    } else {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }

      timeoutId.current = setTimeout(
        () => {
          setThrottledValue(value)
          lastRan.current = Date.now()
        },
        delay - timeSinceLastRan
      )
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
  }, [value, delay])

  return throttledValue
}
