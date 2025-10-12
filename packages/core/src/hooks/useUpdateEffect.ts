/**
 * useUpdateEffect Hook
 * Runs effect only on updates, skipping the initial mount
 */

import { useEffect, useRef, type DependencyList, type EffectCallback } from 'react'

/**
 * Hook that runs an effect only on updates (skips first render)
 *
 * @param effect - Effect callback to run
 * @param deps - Dependency array
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0)
 *
 * useUpdateEffect(() => {
 *   console.log('Count updated:', count)
 *   // This won't run on initial render
 * }, [count])
 * ```
 */
export function useUpdateEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    return effect()
  }, deps)
}
