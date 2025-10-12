/**
 * useTimeout Hook
 * Declarative setTimeout hook that handles cleanup
 */

import { useEffect, useRef } from 'react'

/**
 * Hook for running a callback after a delay
 *
 * @param callback - Function to call after delay
 * @param delay - Delay in milliseconds (null to cancel)
 *
 * @example
 * ```tsx
 * const [showMessage, setShowMessage] = useState(false)
 *
 * useTimeout(() => {
 *   setShowMessage(true)
 * }, 3000)
 * ```
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the timeout
  useEffect(() => {
    // Don't schedule if no delay is specified
    if (delay === null) {
      return
    }

    const id = setTimeout(() => {
      savedCallback.current()
    }, delay)

    return () => {
      clearTimeout(id)
    }
  }, [delay])
}
