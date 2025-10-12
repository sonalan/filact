/**
 * useHover Hook
 * Tracks hover state of an element
 */

import { useState, useRef, useEffect, type RefObject } from 'react'

/**
 * Hook for tracking hover state of an element
 *
 * @returns Tuple with ref to attach to element and hover state
 *
 * @example
 * ```tsx
 * const [hoverRef, isHovered] = useHover<HTMLDivElement>()
 *
 * return (
 *   <div ref={hoverRef}>
 *     {isHovered ? 'Hovered!' : 'Hover me'}
 *   </div>
 * )
 * ```
 */
export function useHover<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  boolean
] {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    node.addEventListener('mouseenter', handleMouseEnter)
    node.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter)
      node.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return [ref, isHovered]
}
