/**
 * Theme System Types
 * Types for theme configuration and management
 */

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Resolved theme (actual theme being applied)
 */
export type ResolvedTheme = 'light' | 'dark'

/**
 * Color scheme
 */
export interface ColorScheme {
  /** Primary color */
  primary: string

  /** Secondary color */
  secondary?: string

  /** Success color */
  success?: string

  /** Warning color */
  warning?: string

  /** Error/danger color */
  error?: string

  /** Info color */
  info?: string

  /** Background colors */
  background?: {
    primary: string
    secondary: string
    tertiary?: string
  }

  /** Text colors */
  text?: {
    primary: string
    secondary: string
    tertiary?: string
  }

  /** Border colors */
  border?: {
    primary: string
    secondary?: string
  }
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Theme mode */
  mode?: ThemeMode

  /** Light mode color scheme */
  light?: ColorScheme

  /** Dark mode color scheme */
  dark?: ColorScheme

  /** Custom CSS variables */
  cssVariables?: Record<string, string>

  /** Enable smooth transitions when switching themes */
  enableTransitions?: boolean

  /** Transition duration in ms */
  transitionDuration?: number

  /** Storage key for persistence */
  storageKey?: string

  /** Whether to persist theme preference */
  persist?: boolean

  /** Default theme when system preference is not available */
  defaultTheme?: ResolvedTheme
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** Current theme mode */
  mode: ThemeMode

  /** Resolved theme (actual theme being applied) */
  resolvedTheme: ResolvedTheme

  /** Set theme mode */
  setMode: (mode: ThemeMode) => void

  /** Toggle between light and dark */
  toggle: () => void

  /** Theme configuration */
  config: Required<ThemeConfig>

  /** Whether theme is being applied */
  isApplying: boolean
}
