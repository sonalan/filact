/**
 * useOnUnmount Hook
 * Runs an effect only on component unmount
 */

import { useEffect, useRef } from 'react'

/**
 * Hook for running effect only on unmount
 *
 * @param callback - Function to run on unmount
 *
 * @example
 * ```tsx
 * useOnUnmount(() => {
 *   console.log('Component will unmount')
 *   cleanup()
 * })
 * ```
 */
export function useOnUnmount(callback: () => void): void {
  const callbackRef = useRef(callback)

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      callbackRef.current()
    }
  }, [])
}
