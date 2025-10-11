import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useIsPortrait,
  useIsLandscape,
} from './useMediaQuery'

describe('useMediaQuery', () => {
  let matchMediaMock: any
  let originalMatchMedia: any

  beforeEach(() => {
    // Store original matchMedia
    originalMatchMedia = window.matchMedia

    // Mock window.matchMedia
    matchMediaMock = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  afterEach(() => {
    // Restore original matchMedia
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      })
    }
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should return false when query does not match', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

      expect(result.current).toBe(false)
    })

    it('should return true when query matches', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

      expect(result.current).toBe(true)
    })

    it('should update when media query changes', () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | null = null

      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn((_, handler) => {
          changeHandler = handler
        }),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

      expect(result.current).toBe(false)

      // Simulate media query change
      act(() => {
        changeHandler?.({ matches: true } as MediaQueryListEvent)
      })

      expect(result.current).toBe(true)
    })

    it('should remove event listener on unmount', () => {
      const removeEventListenerMock = vi.fn()

      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerMock,
      })

      const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))

      unmount()

      expect(removeEventListenerMock).toHaveBeenCalled()
    })

    it('should handle query changes', () => {
      let changeHandler1: ((event: MediaQueryListEvent) => void) | null = null

      matchMediaMock.mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') {
          return {
            matches: false,
            addEventListener: vi.fn((_, handler) => {
              changeHandler1 = handler
            }),
            removeEventListener: vi.fn(),
          }
        } else if (query === '(min-width: 1024px)') {
          return {
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }
        }
      })

      const { result, rerender } = renderHook(
        ({ query }) => useMediaQuery(query),
        {
          initialProps: { query: '(max-width: 768px)' },
        }
      )

      expect(result.current).toBe(false)

      // Change query
      rerender({ query: '(min-width: 1024px)' })

      expect(result.current).toBe(true)
    })
  })

  describe('SSR Support', () => {
    it.skip('should return false on server side', () => {
      // Skip this test as it's not possible to properly test SSR
      // in a browser environment with jsdom
    })
  })

  describe('Predefined Breakpoints', () => {
    describe('useIsMobile', () => {
      it('should return true for mobile screens', () => {
        matchMediaMock.mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(true)
        expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 640px)')
      })

      it('should return false for non-mobile screens', () => {
        matchMediaMock.mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(false)
      })
    })

    describe('useIsTablet', () => {
      it('should return true for tablet screens', () => {
        matchMediaMock.mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsTablet())

        expect(result.current).toBe(true)
        expect(matchMediaMock).toHaveBeenCalledWith(
          '(min-width: 641px) and (max-width: 1024px)'
        )
      })

      it('should return false for non-tablet screens', () => {
        matchMediaMock.mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsTablet())

        expect(result.current).toBe(false)
      })
    })

    describe('useIsDesktop', () => {
      it('should return true for desktop screens', () => {
        matchMediaMock.mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsDesktop())

        expect(result.current).toBe(true)
        expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1025px)')
      })

      it('should return false for non-desktop screens', () => {
        matchMediaMock.mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsDesktop())

        expect(result.current).toBe(false)
      })
    })

    describe('usePrefersDarkMode', () => {
      it('should return true when dark mode is preferred', () => {
        matchMediaMock.mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => usePrefersDarkMode())

        expect(result.current).toBe(true)
        expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      })

      it('should return false when dark mode is not preferred', () => {
        matchMediaMock.mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => usePrefersDarkMode())

        expect(result.current).toBe(false)
      })
    })

    describe('usePrefersReducedMotion', () => {
      it('should return true when reduced motion is preferred', () => {
        matchMediaMock.mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => usePrefersReducedMotion())

        expect(result.current).toBe(true)
        expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
      })

      it('should return false when reduced motion is not preferred', () => {
        matchMediaMock.mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => usePrefersReducedMotion())

        expect(result.current).toBe(false)
      })
    })

    describe('useIsPortrait', () => {
      it('should return true for portrait orientation', () => {
        matchMediaMock.mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsPortrait())

        expect(result.current).toBe(true)
        expect(matchMediaMock).toHaveBeenCalledWith('(orientation: portrait)')
      })

      it('should return false for non-portrait orientation', () => {
        matchMediaMock.mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsPortrait())

        expect(result.current).toBe(false)
      })
    })

    describe('useIsLandscape', () => {
      it('should return true for landscape orientation', () => {
        matchMediaMock.mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsLandscape())

        expect(result.current).toBe(true)
        expect(matchMediaMock).toHaveBeenCalledWith('(orientation: landscape)')
      })

      it('should return false for non-landscape orientation', () => {
        matchMediaMock.mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })

        const { result } = renderHook(() => useIsLandscape())

        expect(result.current).toBe(false)
      })
    })
  })

  describe('Common Media Queries', () => {
    it('should work with min-width queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

      expect(result.current).toBe(true)
    })

    it('should work with max-width queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

      expect(result.current).toBe(true)
    })

    it('should work with combined queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
      )

      expect(result.current).toBe(true)
    })

    it('should work with orientation queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(orientation: portrait)'))

      expect(result.current).toBe(true)
    })

    it('should work with hover queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(hover: hover)'))

      expect(result.current).toBe(true)
    })

    it('should work with pointer queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(pointer: coarse)'))

      expect(result.current).toBe(true)
    })
  })

  describe('Dynamic Behavior', () => {
    it('should respond to window resize', () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | null = null

      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn((_, handler) => {
          changeHandler = handler
        }),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

      expect(result.current).toBe(false)

      // Simulate resize that changes media query match
      act(() => {
        changeHandler?.({ matches: true } as MediaQueryListEvent)
      })

      expect(result.current).toBe(true)

      // Simulate another resize
      act(() => {
        changeHandler?.({ matches: false } as MediaQueryListEvent)
      })

      expect(result.current).toBe(false)
    })

    it('should respond to orientation change', () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | null = null

      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn((_, handler) => {
          changeHandler = handler
        }),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(orientation: portrait)'))

      expect(result.current).toBe(false)

      // Simulate orientation change
      act(() => {
        changeHandler?.({ matches: true } as MediaQueryListEvent)
      })

      expect(result.current).toBe(true)
    })

    it('should respond to color scheme changes', () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | null = null

      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn((_, handler) => {
          changeHandler = handler
        }),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'))

      expect(result.current).toBe(false)

      // Simulate dark mode toggle
      act(() => {
        changeHandler?.({ matches: true } as MediaQueryListEvent)
      })

      expect(result.current).toBe(true)
    })
  })

  describe('Multiple Instances', () => {
    it('should handle multiple different queries', () => {
      matchMediaMock.mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') {
          return {
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }
        } else if (query === '(min-width: 1024px)') {
          return {
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }
        }
        // Default return for any other query
        return {
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }
      })

      const { result: result1 } = renderHook(() => useMediaQuery('(max-width: 768px)'))
      const { result: result2 } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

      expect(result1.current).toBe(true)
      expect(result2.current).toBe(false)
    })

    it('should handle multiple instances of same query', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result: result1 } = renderHook(() => useMediaQuery('(max-width: 768px)'))
      const { result: result2 } = renderHook(() => useMediaQuery('(max-width: 768px)'))

      expect(result1.current).toBe(true)
      expect(result2.current).toBe(true)
    })
  })
})
