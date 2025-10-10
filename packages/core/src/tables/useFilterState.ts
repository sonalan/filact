/**
 * Filter State Management with URL Persistence
 * Syncs filter state with URL query parameters
 */

import { useState, useCallback, useEffect } from 'react'

export interface UseFilterStateOptions {
  /** Initial filter values */
  initialFilters?: Record<string, unknown>

  /** Enable URL persistence */
  persistToUrl?: boolean

  /** URL parameter prefix */
  urlPrefix?: string

  /** Callback when filters change */
  onFiltersChange?: (filters: Record<string, unknown>) => void
}

/**
 * Parse filter values from URL search params
 */
function parseFiltersFromUrl(
  searchParams: URLSearchParams,
  prefix: string = ''
): Record<string, unknown> {
  const filters: Record<string, unknown> = {}

  searchParams.forEach((value, key) => {
    if (prefix && !key.startsWith(prefix)) return

    const filterKey = prefix ? key.slice(prefix.length) : key

    // Try to parse JSON values
    try {
      const parsed = JSON.parse(value)
      filters[filterKey] = parsed
    } catch {
      // Use string value if not valid JSON
      filters[filterKey] = value
    }
  })

  return filters
}

/**
 * Serialize filters to URL search params
 */
function serializeFiltersToUrl(
  filters: Record<string, unknown>,
  prefix: string = ''
): URLSearchParams {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    const paramKey = prefix ? `${prefix}${key}` : key
    const paramValue = typeof value === 'string' ? value : JSON.stringify(value)

    params.set(paramKey, paramValue)
  })

  return params
}

/**
 * Update URL without triggering navigation
 */
function updateUrl(params: URLSearchParams, replaceState: boolean = true): void {
  if (typeof window === 'undefined') return

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname

  if (replaceState) {
    window.history.replaceState({}, '', newUrl)
  } else {
    window.history.pushState({}, '', newUrl)
  }
}

/**
 * Hook for managing filter state with URL persistence
 */
export function useFilterState({
  initialFilters = {},
  persistToUrl = true,
  urlPrefix = 'filter_',
  onFiltersChange,
}: UseFilterStateOptions = {}) {
  // Initialize from URL if persistence is enabled
  const getInitialFilters = useCallback(() => {
    if (!persistToUrl || typeof window === 'undefined') {
      return initialFilters
    }

    const urlParams = new URLSearchParams(window.location.search)
    const urlFilters = parseFiltersFromUrl(urlParams, urlPrefix)

    return Object.keys(urlFilters).length > 0
      ? { ...initialFilters, ...urlFilters }
      : initialFilters
  }, [initialFilters, persistToUrl, urlPrefix])

  const [filters, setFilters] = useState<Record<string, unknown>>(getInitialFilters)

  // Update URL when filters change
  useEffect(() => {
    if (!persistToUrl || typeof window === 'undefined') return

    const currentParams = new URLSearchParams(window.location.search)

    // Remove old filter params
    const keysToDelete: string[] = []
    currentParams.forEach((_, key) => {
      if (key.startsWith(urlPrefix)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => currentParams.delete(key))

    // Add new filter params
    const filterParams = serializeFiltersToUrl(filters, urlPrefix)
    filterParams.forEach((value, key) => {
      currentParams.set(key, value)
    })

    updateUrl(currentParams)
    onFiltersChange?.(filters)
  }, [filters, persistToUrl, urlPrefix, onFiltersChange])

  // Set a single filter
  const setFilter = useCallback((key: string, value: unknown) => {
    setFilters(prev => {
      if (value === undefined || value === null || value === '') {
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: value }
    })
  }, [])

  // Set multiple filters at once
  const setMultipleFilters = useCallback((newFilters: Record<string, unknown>) => {
    setFilters(prev => {
      const updated = { ...prev }

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          delete updated[key]
        } else {
          updated[key] = value
        }
      })

      return updated
    })
  }, [])

  // Remove a filter
  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const { [key]: _, ...rest } = prev
      return rest
    })
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Get a specific filter value
  const getFilter = useCallback(
    (key: string): unknown => {
      return filters[key]
    },
    [filters]
  )

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).length > 0

  return {
    filters,
    setFilter,
    setMultipleFilters,
    removeFilter,
    clearFilters,
    getFilter,
    hasActiveFilters,
  }
}
