/**
 * useIdle Hook
 * Detects when user is idle (no interaction for a period of time)
 */

import { useState, useEffect, useRef } from 'react'

/**
 * Options for idle detection
 */
export interface UseIdleOptions {
  timeout?: number
  events?: string[]
  initialState?: boolean
}

/**
 * Hook for detecting user idle state
 *
 * @param options - Options for idle detection
 * @returns True if user is idle
 *
 * @example
 * ```tsx
 * const isIdle = useIdle({ timeout: 60000 }) // 1 minute
 *
 * return (
 *   <div>
 *     {isIdle ? 'User is idle' : 'User is active'}
 *   </div>
 * )
 * ```
 */
export function useIdle(options?: UseIdleOptions): boolean {
  const {
    timeout = 60000, // Default 1 minute
    events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
    initialState = false,
  } = options || {}

  const [isIdle, setIsIdle] = useState(initialState)
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleActivity = () => {
      setIsIdle(false)

      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }

      timeoutId.current = setTimeout(() => {
        setIsIdle(true)
      }, timeout)
    }

    // Set initial timeout
    timeoutId.current = setTimeout(() => {
      setIsIdle(true)
    }, timeout)

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })

      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
  }, [timeout, events.join(',')])

  return isIdle
}
