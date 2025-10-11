import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToggle } from './useToggle'

describe('useToggle', () => {
  describe('Initial State', () => {
    it('should initialize with false by default', () => {
      const { result } = renderHook(() => useToggle())

      expect(result.current[0]).toBe(false)
    })

    it('should initialize with provided value', () => {
      const { result } = renderHook(() => useToggle(true))

      expect(result.current[0]).toBe(true)
    })

    it('should initialize with false when explicitly passed', () => {
      const { result } = renderHook(() => useToggle(false))

      expect(result.current[0]).toBe(false)
    })
  })

  describe('Toggle Function', () => {
    it('should toggle from false to true', () => {
      const { result } = renderHook(() => useToggle(false))

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[1]() // toggle
      })

      expect(result.current[0]).toBe(true)
    })

    it('should toggle from true to false', () => {
      const { result } = renderHook(() => useToggle(true))

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1]() // toggle
      })

      expect(result.current[0]).toBe(false)
    })

    it('should toggle multiple times', () => {
      const { result } = renderHook(() => useToggle(false))

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[1]() // toggle to true
      })

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1]() // toggle to false
      })

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[1]() // toggle to true
      })

      expect(result.current[0]).toBe(true)
    })
  })

  describe('SetTrue Function', () => {
    it('should set value to true from false', () => {
      const { result } = renderHook(() => useToggle(false))

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[2]() // setTrue
      })

      expect(result.current[0]).toBe(true)
    })

    it('should keep value true when already true', () => {
      const { result } = renderHook(() => useToggle(true))

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[2]() // setTrue
      })

      expect(result.current[0]).toBe(true)
    })

    it('should set to true multiple times', () => {
      const { result } = renderHook(() => useToggle(false))

      act(() => {
        result.current[2]() // setTrue
        result.current[2]() // setTrue again
        result.current[2]() // setTrue again
      })

      expect(result.current[0]).toBe(true)
    })
  })

  describe('SetFalse Function', () => {
    it('should set value to false from true', () => {
      const { result } = renderHook(() => useToggle(true))

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[3]() // setFalse
      })

      expect(result.current[0]).toBe(false)
    })

    it('should keep value false when already false', () => {
      const { result } = renderHook(() => useToggle(false))

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[3]() // setFalse
      })

      expect(result.current[0]).toBe(false)
    })

    it('should set to false multiple times', () => {
      const { result } = renderHook(() => useToggle(true))

      act(() => {
        result.current[3]() // setFalse
        result.current[3]() // setFalse again
        result.current[3]() // setFalse again
      })

      expect(result.current[0]).toBe(false)
    })
  })

  describe('SetValue Function', () => {
    it('should set value to true', () => {
      const { result } = renderHook(() => useToggle(false))

      act(() => {
        result.current[4](true) // setValue
      })

      expect(result.current[0]).toBe(true)
    })

    it('should set value to false', () => {
      const { result } = renderHook(() => useToggle(true))

      act(() => {
        result.current[4](false) // setValue
      })

      expect(result.current[0]).toBe(false)
    })

    it('should allow arbitrary boolean assignment', () => {
      const { result } = renderHook(() => useToggle(false))

      act(() => {
        result.current[4](true)
      })

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[4](false)
      })

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[4](true)
      })

      expect(result.current[0]).toBe(true)
    })
  })

  describe('Combined Operations', () => {
    it('should work with combinations of operations', () => {
      const { result } = renderHook(() => useToggle(false))

      // Start: false

      act(() => {
        result.current[2]() // setTrue
      })
      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1]() // toggle
      })
      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[4](true) // setValue(true)
      })
      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[3]() // setFalse
      })
      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[1]() // toggle
      })
      expect(result.current[0]).toBe(true)
    })

    it('should handle rapid operations', () => {
      const { result } = renderHook(() => useToggle(false))

      act(() => {
        result.current[1]() // toggle to true
        result.current[1]() // toggle to false
        result.current[1]() // toggle to true
        result.current[2]() // setTrue (already true)
        result.current[1]() // toggle to false
        result.current[3]() // setFalse (already false)
      })

      expect(result.current[0]).toBe(false)
    })
  })

  describe('Function Stability', () => {
    it('should have stable function references', () => {
      const { result, rerender } = renderHook(() => useToggle(false))

      const initialToggle = result.current[1]
      const initialSetTrue = result.current[2]
      const initialSetFalse = result.current[3]
      const initialSetValue = result.current[4]

      // Trigger rerender
      rerender()

      // Functions should maintain same reference
      expect(result.current[1]).toBe(initialToggle)
      expect(result.current[2]).toBe(initialSetTrue)
      expect(result.current[3]).toBe(initialSetFalse)
      expect(result.current[4]).toBe(initialSetValue)
    })

    it('should maintain stable functions after state changes', () => {
      const { result } = renderHook(() => useToggle(false))

      const initialToggle = result.current[1]
      const initialSetTrue = result.current[2]
      const initialSetFalse = result.current[3]
      const initialSetValue = result.current[4]

      act(() => {
        result.current[1]() // toggle
      })

      // Functions should maintain same reference after state change
      expect(result.current[1]).toBe(initialToggle)
      expect(result.current[2]).toBe(initialSetTrue)
      expect(result.current[3]).toBe(initialSetFalse)
      expect(result.current[4]).toBe(initialSetValue)
    })
  })

  describe('Use Cases', () => {
    it('should work for modal visibility', () => {
      const { result } = renderHook(() => useToggle(false))
      const [isModalOpen, toggleModal, openModal, closeModal] = result.current

      expect(isModalOpen).toBe(false)

      act(() => {
        openModal()
      })
      expect(result.current[0]).toBe(true)

      act(() => {
        closeModal()
      })
      expect(result.current[0]).toBe(false)
    })

    it('should work for dark mode toggle', () => {
      const { result } = renderHook(() => useToggle(false))
      const [isDark, toggleDarkMode] = result.current

      expect(isDark).toBe(false)

      act(() => {
        toggleDarkMode()
      })
      expect(result.current[0]).toBe(true)

      act(() => {
        toggleDarkMode()
      })
      expect(result.current[0]).toBe(false)
    })

    it('should work for feature flags', () => {
      const { result } = renderHook(() => useToggle(true))
      const [isEnabled, , enable, disable] = result.current

      expect(isEnabled).toBe(true)

      act(() => {
        disable()
      })
      expect(result.current[0]).toBe(false)

      act(() => {
        enable()
      })
      expect(result.current[0]).toBe(true)
    })
  })
})
