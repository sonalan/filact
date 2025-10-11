/**
 * useToggle Hook
 * Simple hook for managing boolean state with toggle functionality
 */

import { useState, useCallback } from 'react'

/**
 * Hook for managing boolean toggle state
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, toggle, setTrue, setFalse, setValue]
 *
 * @example
 * ```tsx
 * const [isOpen, toggle, open, close] = useToggle(false)
 *
 * // Toggle value
 * toggle()
 *
 * // Set to true
 * open()
 *
 * // Set to false
 * close()
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, () => void, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return [value, toggle, setTrue, setFalse, setValue]
}
