/**
 * useUnmount Hook
 * Runs a cleanup callback only when component unmounts
 */

import { useEffect, useRef } from 'react'

/**
 * Hook that runs a callback only on unmount
 *
 * @param callback - Function to run on unmount
 *
 * @example
 * ```tsx
 * useUnmount(() => {
 *   console.log('Component unmounting')
 *   cleanup()
 * })
 * ```
 */
export function useUnmount(callback: () => void): void {
  const callbackRef = useRef(callback)

  // Update ref on each render to have latest callback
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    return () => {
      callbackRef.current()
    }
  }, [])
}
