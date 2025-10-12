/**
 * useOnMount Hook
 * Runs an effect only once on component mount
 */

import { useEffect } from 'react'

/**
 * Hook for running effect only on mount
 *
 * @param callback - Function to run on mount
 *
 * @example
 * ```tsx
 * useOnMount(() => {
 *   console.log('Component mounted')
 *   fetchData()
 * })
 * ```
 */
export function useOnMount(callback: () => void | (() => void)): void {
  useEffect(() => {
    return callback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
