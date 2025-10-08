/**
 * ThemeProvider Component
 * Provides theme context and manages theme switching
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ThemeMode, ResolvedTheme, ThemeConfig, ThemeContextValue } from './types'

const STORAGE_KEY = 'filact_theme'

/**
 * Default theme configuration
 */
const defaultConfig: Required<ThemeConfig> = {
  mode: 'system',
  light: {
    primary: '#3b82f6',
  },
  dark: {
    primary: '#60a5fa',
  },
  cssVariables: {},
  enableTransitions: true,
  transitionDuration: 200,
  storageKey: STORAGE_KEY,
  persist: true,
  defaultTheme: 'light',
}

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/**
 * ThemeProvider props
 */
export interface ThemeProviderProps {
  /** Children */
  children: React.ReactNode

  /** Theme configuration */
  config?: Partial<ThemeConfig>
}

/**
 * Get system theme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Get stored theme from localStorage
 */
function getStoredTheme(storageKey: string): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(storageKey)
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemeMode
    }
  } catch {
    // Ignore errors
  }

  return null
}

/**
 * Store theme to localStorage
 */
function storeTheme(storageKey: string, mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(storageKey, mode)
  } catch {
    // Ignore errors
  }
}

/**
 * Resolve theme mode to actual theme
 */
function resolveTheme(mode: ThemeMode, defaultTheme: ResolvedTheme): ResolvedTheme {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}

/**
 * Apply CSS variables to document
 */
function applyCSSVariables(variables: Record<string, string>): void {
  if (typeof document === 'undefined') {
    return
  }

  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
}

/**
 * Apply theme to document
 */
function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement

  // Remove existing theme class
  root.classList.remove('light', 'dark')

  // Add new theme class
  root.classList.add(theme)

  // Update data attribute
  root.setAttribute('data-theme', theme)

  // Update color scheme for native elements
  root.style.colorScheme = theme
}

/**
 * ThemeProvider Component
 */
export function ThemeProvider({ children, config: userConfig = {} }: ThemeProviderProps) {
  const config = { ...defaultConfig, ...userConfig }

  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Try to get stored theme
    if (config.persist) {
      const stored = getStoredTheme(config.storageKey)
      if (stored) {
        return stored
      }
    }

    return config.mode
  })

  const [isApplying, setIsApplying] = useState(false)

  // Resolve the actual theme
  const resolvedTheme = resolveTheme(mode, config.defaultTheme)

  // Set theme mode
  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setIsApplying(true)

      // Store theme if persistence is enabled
      if (config.persist) {
        storeTheme(config.storageKey, newMode)
      }

      setModeState(newMode)

      // Reset applying state after transition
      setTimeout(() => {
        setIsApplying(false)
      }, config.transitionDuration)
    },
    [config.persist, config.storageKey, config.transitionDuration]
  )

  // Toggle theme
  const toggle = useCallback(() => {
    setMode(resolvedTheme === 'light' ? 'dark' : 'light')
  }, [resolvedTheme, setMode])

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  // Apply CSS variables when theme changes
  useEffect(() => {
    const themeColors = resolvedTheme === 'dark' ? config.dark : config.light
    const variables: Record<string, string> = {}

    // Add theme-specific colors
    if (themeColors.primary) {
      variables['--color-primary'] = themeColors.primary
    }
    if (themeColors.secondary) {
      variables['--color-secondary'] = themeColors.secondary
    }
    if (themeColors.success) {
      variables['--color-success'] = themeColors.success
    }
    if (themeColors.warning) {
      variables['--color-warning'] = themeColors.warning
    }
    if (themeColors.error) {
      variables['--color-error'] = themeColors.error
    }
    if (themeColors.info) {
      variables['--color-info'] = themeColors.info
    }

    // Add background colors
    if (themeColors.background) {
      if (themeColors.background.primary) {
        variables['--color-bg-primary'] = themeColors.background.primary
      }
      if (themeColors.background.secondary) {
        variables['--color-bg-secondary'] = themeColors.background.secondary
      }
      if (themeColors.background.tertiary) {
        variables['--color-bg-tertiary'] = themeColors.background.tertiary
      }
    }

    // Add text colors
    if (themeColors.text) {
      if (themeColors.text.primary) {
        variables['--color-text-primary'] = themeColors.text.primary
      }
      if (themeColors.text.secondary) {
        variables['--color-text-secondary'] = themeColors.text.secondary
      }
      if (themeColors.text.tertiary) {
        variables['--color-text-tertiary'] = themeColors.text.tertiary
      }
    }

    // Add border colors
    if (themeColors.border) {
      if (themeColors.border.primary) {
        variables['--color-border-primary'] = themeColors.border.primary
      }
      if (themeColors.border.secondary) {
        variables['--color-border-secondary'] = themeColors.border.secondary
      }
    }

    // Add custom CSS variables
    Object.assign(variables, config.cssVariables)

    applyCSSVariables(variables)
  }, [resolvedTheme, config])

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      // Force re-render to update resolved theme
      setModeState('system')
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [mode])

  // Add transition class when enabled
  useEffect(() => {
    if (!config.enableTransitions || typeof document === 'undefined') {
      return
    }

    if (isApplying) {
      document.documentElement.classList.add('theme-transitioning')

      return () => {
        document.documentElement.classList.remove('theme-transitioning')
      }
    }
  }, [isApplying, config.enableTransitions])

  const value: ThemeContextValue = {
    mode,
    resolvedTheme,
    setMode,
    toggle,
    config,
    isApplying,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * useTheme Hook
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
