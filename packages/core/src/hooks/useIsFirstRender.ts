/**
 * useIsFirstRender Hook
 * Detects if the current render is the first render
 */

import { useRef } from 'react'

/**
 * Hook for detecting first render
 *
 * @returns True if it's the first render, false otherwise
 *
 * @example
 * ```tsx
 * const isFirstRender = useIsFirstRender()
 *
 * useEffect(() => {
 *   if (isFirstRender) {
 *     console.log('First render only')
 *   } else {
 *     console.log('Subsequent renders')
 *   }
 * })
 * ```
 */
export function useIsFirstRender(): boolean {
  const isFirstRenderRef = useRef(true)

  if (isFirstRenderRef.current) {
    isFirstRenderRef.current = false
    return true
  }

  return false
}
