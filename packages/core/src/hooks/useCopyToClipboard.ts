/**
 * useCopyToClipboard Hook
 * Provides functionality to copy text to clipboard
 */

import { useState, useCallback } from 'react'

/**
 * Result of copy operation
 */
export interface CopyResult {
  value: string | null
  error: Error | null
}

/**
 * Hook for copying text to clipboard
 *
 * @returns Tuple with copy result and copy function
 *
 * @example
 * ```tsx
 * const [copyResult, copy] = useCopyToClipboard()
 *
 * return (
 *   <button onClick={() => copy('Hello World')}>
 *     {copyResult.value ? 'Copied!' : 'Copy'}
 *   </button>
 * )
 * ```
 */
export function useCopyToClipboard(): [CopyResult, (text: string) => Promise<void>] {
  const [result, setResult] = useState<CopyResult>({
    value: null,
    error: null,
  })

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      setResult({
        value: null,
        error: new Error('Clipboard API not supported'),
      })
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setResult({
        value: text,
        error: null,
      })
    } catch (error) {
      setResult({
        value: null,
        error: error as Error,
      })
    }
  }, [])

  return [result, copy]
}
