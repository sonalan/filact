/**
 * useMediaQuery Hook
 * Hook for responsive design with media query matching
 */

import { useState, useEffect } from 'react'

/**
 * Hook for matching CSS media queries
 *
 * @param query - The media query string
 * @returns Boolean indicating if the query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 * const prefersD arkMode = useMediaQuery('(prefers-color-scheme: dark)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // Update state if query match changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * Predefined breakpoint hooks
 */

/** Hook for mobile screens (max-width: 640px) */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)')
}

/** Hook for tablet screens (min-width: 641px and max-width: 1024px) */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
}

/** Hook for desktop screens (min-width: 1025px) */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}

/** Hook for detecting dark mode preference */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

/** Hook for detecting reduced motion preference */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Hook for portrait orientation */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)')
}

/** Hook for landscape orientation */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)')
}
