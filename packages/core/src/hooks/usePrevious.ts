/**
 * usePrevious Hook
 * Tracks the previous value of a state or prop
 */

import { useEffect, useRef } from 'react'

/**
 * Hook for tracking previous value
 *
 * @param value - Current value to track
 * @returns Previous value
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0)
 * const previousCount = usePrevious(count)
 *
 * // previousCount will be undefined on first render
 * // then will be the previous value on subsequent renders
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
