/**
 * useGlobalSearch Hook
 * Hook for managing global search state and functionality
 */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { create } from 'zustand'
import { usePanel } from '../panel/PanelProvider'
import type { SearchResult, SearchConfig, RecentSearch, SearchProvider } from './types'

const RECENT_SEARCHES_KEY = 'filact_recent_searches'

/**
 * Search store interface
 */
interface SearchStore {
  isOpen: boolean
  query: string
  recentSearches: RecentSearch[]
  open: () => void
  close: () => void
  toggle: () => void
  setQuery: (query: string) => void
  clearQuery: () => void
  setRecentSearches: (searches: RecentSearch[]) => void
}

/**
 * Create search store
 */
const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  query: '',
  recentSearches: [],

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: '' }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  setQuery: (query: string) => set({ query }),
  clearQuery: () => set({ query: '' }),

  setRecentSearches: (searches: RecentSearch[]) => set({ recentSearches: searches }),
}))

/**
 * Default search configuration
 */
const defaultConfig: Required<SearchConfig> = {
  enabled: true,
  shortcut: 'mod+k',
  placeholder: 'Search...',
  maxRecentSearches: 5,
  fuzzySearch: true,
  minSearchLength: 2,
  debounceMs: 300,
  providers: [],
  enabledCategories: ['resources', 'pages', 'actions', 'records', 'custom'],
  categoryLabels: {
    resources: 'Resources',
    pages: 'Pages',
    actions: 'Actions',
    records: 'Records',
    custom: 'Other',
  },
  showRecentSearches: true,
}

/**
 * Fuzzy search implementation
 */
function fuzzyMatch(str: string, pattern: string): boolean {
  const strLower = str.toLowerCase()
  const patternLower = pattern.toLowerCase()

  let patternIdx = 0
  let strIdx = 0

  while (patternIdx < patternLower.length && strIdx < strLower.length) {
    if (patternLower[patternIdx] === strLower[strIdx]) {
      patternIdx++
    }
    strIdx++
  }

  return patternIdx === patternLower.length
}

/**
 * Search in text with fuzzy matching
 */
function searchInText(text: string, query: string, fuzzy: boolean): boolean {
  if (!query) return true

  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  if (textLower.includes(queryLower)) {
    return true
  }

  if (fuzzy) {
    return fuzzyMatch(text, query)
  }

  return false
}

/**
 * Load recent searches from localStorage
 */
function loadRecentSearches(maxRecent: number): RecentSearch[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!stored) return []

    const searches = JSON.parse(stored) as RecentSearch[]
    return searches.slice(0, maxRecent)
  } catch {
    return []
  }
}

/**
 * Save recent searches to localStorage
 */
function saveRecentSearches(searches: RecentSearch[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches))
  } catch {
    // Ignore errors
  }
}

/**
 * Build resource-based search results
 */
function buildResourceResults(
  resources: Map<string, any>,
  query: string,
  fuzzy: boolean,
  basePath: string
): SearchResult[] {
  const results: SearchResult[] = []

  resources.forEach((resource) => {
    const label = resource.model.label || resource.model.name
    const endpoint = resource.model.endpoint

    // Check if resource name matches query
    if (searchInText(label, query, fuzzy) || searchInText(endpoint, query, fuzzy)) {
      results.push({
        id: `resource-${resource.model.name}`,
        title: label,
        subtitle: `View all ${label}`,
        category: 'resources',
        url: `${basePath}/${endpoint}`,
        priority: 10,
      })
    }

    // Add create action
    if (resource.pages?.create !== false) {
      const createText = `Create ${label}`
      if (searchInText(createText, query, fuzzy)) {
        results.push({
          id: `resource-${resource.model.name}-create`,
          title: `Create ${label}`,
          subtitle: `Create a new ${label.toLowerCase()}`,
          category: 'actions',
          url: `${basePath}/${endpoint}/create`,
          priority: 8,
        })
      }
    }
  })

  return results
}

/**
 * Build page-based search results
 */
function buildPageResults(
  pages: Map<string, any>,
  query: string,
  fuzzy: boolean,
  basePath: string
): SearchResult[] {
  const results: SearchResult[] = []

  pages.forEach((page) => {
    const title = page.title || page.name
    const path = page.path

    if (searchInText(title, query, fuzzy) || searchInText(path, query, fuzzy)) {
      results.push({
        id: `page-${page.name}`,
        title,
        subtitle: path,
        category: 'pages',
        url: `${basePath}${path}`,
        priority: 7,
      })
    }
  })

  return results
}

/**
 * Execute custom search providers
 */
async function executeProviders(
  providers: SearchProvider[],
  query: string
): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  // Sort providers by priority
  const sortedProviders = [...providers].sort((a, b) => (b.priority || 0) - (a.priority || 0))

  for (const provider of sortedProviders) {
    if (provider.enabled !== false) {
      try {
        const providerResults = await provider.search(query)
        results.push(...providerResults)
      } catch (error) {
        console.error(`Search provider "${provider.name}" failed:`, error)
      }
    }
  }

  return results
}

/**
 * useGlobalSearch Hook
 */
export function useGlobalSearch(config: SearchConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...config }
  const { config: panelConfig, resources, pages } = usePanel()

  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  const store = useSearchStore()

  // Load recent searches on mount
  useEffect(() => {
    if (mergedConfig.showRecentSearches) {
      const recentSearches = loadRecentSearches(mergedConfig.maxRecentSearches)
      store.setRecentSearches(recentSearches)
    }
  }, [mergedConfig.showRecentSearches, mergedConfig.maxRecentSearches])

  // Keyboard shortcut handler
  useEffect(() => {
    if (!mergedConfig.enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'k') {
        e.preventDefault()
        store.toggle()
      }

      // ESC to close
      if (e.key === 'Escape' && store.isOpen) {
        store.close()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mergedConfig.enabled, store.isOpen])

  // Debounced search function
  const search = useCallback(
    async (query: string) => {
      if (!query || query.length < mergedConfig.minSearchLength) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const basePath = panelConfig.path || ''
        const allResults: SearchResult[] = []

        // Search resources
        if (mergedConfig.enabledCategories.includes('resources')) {
          const resourceResults = buildResourceResults(
            resources,
            query,
            mergedConfig.fuzzySearch,
            basePath
          )
          allResults.push(...resourceResults)
        }

        // Search pages
        if (mergedConfig.enabledCategories.includes('pages')) {
          const pageResults = buildPageResults(pages, query, mergedConfig.fuzzySearch, basePath)
          allResults.push(...pageResults)
        }

        // Execute custom providers
        if (mergedConfig.providers.length > 0) {
          const providerResults = await executeProviders(mergedConfig.providers, query)
          allResults.push(...providerResults)
        }

        // Sort by priority
        allResults.sort((a, b) => (b.priority || 0) - (a.priority || 0))

        setResults(allResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [resources, pages, panelConfig.path, mergedConfig]
  )

  // Debounce search
  useEffect(() => {
    if (!store.query) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      search(store.query)
    }, mergedConfig.debounceMs)

    return () => clearTimeout(timer)
  }, [store.query, search, mergedConfig.debounceMs])

  // Add to recent searches
  const addRecentSearch = useCallback(
    (query: string) => {
      if (!query || !mergedConfig.showRecentSearches) return

      const recentSearches = [...store.recentSearches]
      const existingIndex = recentSearches.findIndex((s) => s.query === query)

      if (existingIndex >= 0) {
        // Move to top and increment count
        const existing = recentSearches[existingIndex]
        recentSearches.splice(existingIndex, 1)
        recentSearches.unshift({
          ...existing,
          timestamp: Date.now(),
          count: (existing.count || 1) + 1,
        })
      } else {
        // Add new
        recentSearches.unshift({
          query,
          timestamp: Date.now(),
          count: 1,
        })
      }

      // Limit to max
      const trimmed = recentSearches.slice(0, mergedConfig.maxRecentSearches)

      store.setRecentSearches(trimmed)
      saveRecentSearches(trimmed)
    },
    [store.recentSearches, mergedConfig.maxRecentSearches, mergedConfig.showRecentSearches]
  )

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    store.setRecentSearches([])
    saveRecentSearches([])
  }, [])

  return {
    isOpen: store.isOpen,
    query: store.query,
    results,
    recentSearches: store.recentSearches,
    isLoading,
    open: store.open,
    close: store.close,
    toggle: store.toggle,
    setQuery: store.setQuery,
    clearQuery: store.clearQuery,
    addRecentSearch,
    clearRecentSearches,
    search,
    config: mergedConfig,
  }
}

/**
 * Create a search provider
 */
export function createSearchProvider(provider: SearchProvider): SearchProvider {
  return {
    enabled: true,
    priority: 5,
    ...provider,
  }
}
