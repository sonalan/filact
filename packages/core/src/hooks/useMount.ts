/**
 * useMount Hook
 * Runs a callback only once when component mounts
 */

import { useEffect } from 'react'

/**
 * Hook that runs a callback only on mount
 *
 * @param callback - Function to run on mount
 *
 * @example
 * ```tsx
 * useMount(() => {
 *   console.log('Component mounted')
 *   fetchData()
 * })
 * ```
 */
export function useMount(callback: () => void): void {
  useEffect(() => {
    callback()
  }, [])
}
