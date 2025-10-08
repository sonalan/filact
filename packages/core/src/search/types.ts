/**
 * Search System Types
 * Types for global search functionality
 */

import type { ReactNode } from 'react'

/**
 * Search result category
 */
export type SearchCategory = 'resources' | 'pages' | 'actions' | 'records' | 'custom'

/**
 * Search result item
 */
export interface SearchResult {
  /** Unique identifier */
  id: string

  /** Display title */
  title: string

  /** Optional subtitle or description */
  subtitle?: string

  /** Category of the result */
  category: SearchCategory

  /** Icon to display */
  icon?: ReactNode

  /** URL or path to navigate to */
  url?: string

  /** Custom action to execute on select */
  onSelect?: () => void | Promise<void>

  /** Keywords for searching */
  keywords?: string[]

  /** Custom data */
  data?: any

  /** Result priority (higher = shown first) */
  priority?: number
}

/**
 * Recent search item
 */
export interface RecentSearch {
  /** Search query */
  query: string

  /** Timestamp */
  timestamp: number

  /** Number of times searched */
  count?: number
}

/**
 * Search provider interface
 */
export interface SearchProvider {
  /** Provider name */
  name: string

  /** Search function */
  search: (query: string) => Promise<SearchResult[]> | SearchResult[]

  /** Whether this provider should be used by default */
  enabled?: boolean

  /** Provider priority (higher = searched first) */
  priority?: number
}

/**
 * Global search configuration
 */
export interface SearchConfig {
  /** Enable global search */
  enabled?: boolean

  /** Keyboard shortcut (default: 'mod+k') */
  shortcut?: string

  /** Placeholder text */
  placeholder?: string

  /** Maximum recent searches to store */
  maxRecentSearches?: number

  /** Enable fuzzy search */
  fuzzySearch?: boolean

  /** Minimum characters to trigger search */
  minSearchLength?: number

  /** Debounce delay in ms */
  debounceMs?: number

  /** Custom search providers */
  providers?: SearchProvider[]

  /** Categories to enable */
  enabledCategories?: SearchCategory[]

  /** Custom category labels */
  categoryLabels?: Partial<Record<SearchCategory, string>>

  /** Whether to show recent searches */
  showRecentSearches?: boolean
}

/**
 * Search state
 */
export interface SearchState {
  /** Whether search is open */
  isOpen: boolean

  /** Current search query */
  query: string

  /** Search results */
  results: SearchResult[]

  /** Recent searches */
  recentSearches: RecentSearch[]

  /** Whether search is loading */
  isLoading: boolean

  /** Open search */
  open: () => void

  /** Close search */
  close: () => void

  /** Toggle search */
  toggle: () => void

  /** Set query */
  setQuery: (query: string) => void

  /** Clear query */
  clearQuery: () => void

  /** Add to recent searches */
  addRecentSearch: (query: string) => void

  /** Clear recent searches */
  clearRecentSearches: () => void

  /** Execute search */
  search: (query: string) => void
}
