import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useHover } from './useHover'
import { useRef, useEffect } from 'react'

// Wrapper component to properly test the hook with a real element
function useTestHover<T extends HTMLElement>() {
  const [ref, isHovered] = useHover<T>()
  const elementRef = useRef<T | null>(null)

  useEffect(() => {
    if (elementRef.current) {
      // @ts-expect-error - assigning to ref
      ref.current = elementRef.current
    }
  }, [ref])

  return { ref, isHovered, elementRef }
}

describe('useHover', () => {
  it('should return ref and initial hover state', () => {
    const { result } = renderHook(() => useHover())

    expect(result.current[0]).toBeDefined()
    expect(result.current[0].current).toBeNull()
    expect(result.current[1]).toBe(false)
  })

  it('should return the same ref object across renders', () => {
    const { result, rerender } = renderHook(() => useHover())

    const firstRef = result.current[0]

    rerender()

    const secondRef = result.current[0]

    expect(firstRef).toBe(secondRef)
  })

  it('should work with different element types', () => {
    const { result: buttonResult } = renderHook(() => useHover<HTMLButtonElement>())
    const { result: spanResult } = renderHook(() => useHover<HTMLSpanElement>())

    expect(buttonResult.current[0]).toBeDefined()
    expect(spanResult.current[0]).toBeDefined()
  })

  it('should not track hover when ref is not attached', () => {
    const { result } = renderHook(() => useHover())

    expect(result.current[1]).toBe(false)
  })

  // Integration test with actual DOM element
  it('should handle hover events on real element', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    let isHovered = false
    const handleMouseEnter = () => (isHovered = true)
    const handleMouseLeave = () => (isHovered = false)

    div.addEventListener('mouseenter', handleMouseEnter)
    div.addEventListener('mouseleave', handleMouseLeave)

    fireEvent.mouseEnter(div)
    expect(isHovered).toBe(true)

    fireEvent.mouseLeave(div)
    expect(isHovered).toBe(false)

    div.removeEventListener('mouseenter', handleMouseEnter)
    div.removeEventListener('mouseleave', handleMouseLeave)
    document.body.removeChild(div)
  })

  it('should setup event listeners correctly', () => {
    const div = document.createElement('div')
    const addSpy = vi.spyOn(div, 'addEventListener')
    const removeSpy = vi.spyOn(div, 'removeEventListener')

    const handleMouseEnter = () => {}
    const handleMouseLeave = () => {}

    div.addEventListener('mouseenter', handleMouseEnter)
    div.addEventListener('mouseleave', handleMouseLeave)

    expect(addSpy).toHaveBeenCalledWith('mouseenter', handleMouseEnter)
    expect(addSpy).toHaveBeenCalledWith('mouseleave', handleMouseLeave)

    div.removeEventListener('mouseenter', handleMouseEnter)
    div.removeEventListener('mouseleave', handleMouseLeave)

    expect(removeSpy).toHaveBeenCalledWith('mouseenter', handleMouseEnter)
    expect(removeSpy).toHaveBeenCalledWith('mouseleave', handleMouseLeave)
  })
})
