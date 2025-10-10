/**
 * Search State Management with URL Persistence
 * Syncs search state with URL query parameters
 */

import { useState, useCallback, useEffect, useRef } from 'react'

export interface UseSearchStateOptions {
  /** Initial search value */
  initialSearch?: string

  /** Enable URL persistence */
  persistToUrl?: boolean

  /** URL parameter name */
  urlParam?: string

  /** Debounce delay in milliseconds */
  debounceMs?: number

  /** Callback when search changes */
  onSearchChange?: (search: string) => void
}

/**
 * Update URL without triggering navigation
 */
function updateUrl(paramName: string, value: string, replaceState: boolean = true): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)

  if (value) {
    params.set(paramName, value)
  } else {
    params.delete(paramName)
  }

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
 * Hook for managing search state with URL persistence and debouncing
 */
export function useSearchState({
  initialSearch = '',
  persistToUrl = true,
  urlParam = 'search',
  debounceMs = 300,
  onSearchChange,
}: UseSearchStateOptions = {}) {
  // Initialize from URL if persistence is enabled
  const getInitialSearch = useCallback(() => {
    if (!persistToUrl || typeof window === 'undefined') {
      return initialSearch
    }

    const urlParams = new URLSearchParams(window.location.search)
    const urlSearch = urlParams.get(urlParam)

    return urlSearch || initialSearch
  }, [initialSearch, persistToUrl, urlParam])

  const [search, setSearch] = useState<string>(getInitialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState<string>(getInitialSearch)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce search value
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [search, debounceMs])

  // Update URL when debounced search changes
  useEffect(() => {
    if (!persistToUrl || typeof window === 'undefined') {
      onSearchChange?.(debouncedSearch)
      return
    }

    updateUrl(urlParam, debouncedSearch)
    onSearchChange?.(debouncedSearch)
  }, [debouncedSearch, persistToUrl, urlParam, onSearchChange])

  // Update search value
  const setSearchValue = useCallback((value: string) => {
    setSearch(value)
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearch('')
  }, [])

  // Check if search is active
  const hasSearch = search.length > 0

  return {
    search,
    debouncedSearch,
    setSearch: setSearchValue,
    clearSearch,
    hasSearch,
    isDebouncing: search !== debouncedSearch,
  }
}
