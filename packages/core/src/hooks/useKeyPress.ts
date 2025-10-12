/**
 * useKeyPress Hook
 * Detects when a specific key is pressed
 */

import { useState, useEffect } from 'react'

/**
 * Hook for detecting key presses
 *
 * @param targetKey - Key to detect (e.g., 'Enter', 'Escape', 'a')
 * @param options - Options for key detection
 * @returns True if the key is currently pressed
 *
 * @example
 * ```tsx
 * const enterPressed = useKeyPress('Enter')
 * const ctrlS = useKeyPress('s', { ctrlKey: true })
 *
 * useEffect(() => {
 *   if (enterPressed) {
 *     console.log('Enter was pressed')
 *   }
 * }, [enterPressed])
 * ```
 */
export function useKeyPress(
  targetKey: string,
  options?: {
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
  }
): boolean {
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        const modifiersMatch =
          (!options?.ctrlKey || event.ctrlKey) &&
          (!options?.shiftKey || event.shiftKey) &&
          (!options?.altKey || event.altKey) &&
          (!options?.metaKey || event.metaKey)

        if (modifiersMatch) {
          setKeyPressed(true)
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [targetKey, options?.ctrlKey, options?.shiftKey, options?.altKey, options?.metaKey])

  return keyPressed
}
