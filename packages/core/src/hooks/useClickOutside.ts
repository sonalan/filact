/**
 * useClickOutside Hook
 * Detects clicks outside of a specified element
 */

import { useEffect, useRef, type RefObject } from 'react'

/**
 * Hook for detecting clicks outside an element
 *
 * @param handler - Function to call when click outside occurs
 * @param enabled - Whether the hook is enabled (default: true)
 * @returns Ref to attach to the element
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false))
 *
 * return (
 *   <div ref={ref}>
 *     <button onClick={() => setIsOpen(true)}>Open</button>
 *     {isOpen && <div>Dropdown content</div>}
 *   </div>
 * )
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null)
  const handlerRef = useRef(handler)

  // Keep handler ref up to date
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node

      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(target)) {
        return
      }

      handlerRef.current(event)
    }

    // Use capture phase for better behavior with portals/modals
    document.addEventListener('mousedown', listener, true)
    document.addEventListener('touchstart', listener, true)

    return () => {
      document.removeEventListener('mousedown', listener, true)
      document.removeEventListener('touchstart', listener, true)
    }
  }, [enabled])

  return ref
}
