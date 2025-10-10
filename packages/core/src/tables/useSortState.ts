/**
 * Sort State Management with URL Persistence
 * Syncs sort state with URL query parameters
 */

import { useState, useCallback, useEffect } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: string
  direction: SortDirection
}

export interface UseSortStateOptions {
  /** Initial sort state */
  initialSort?: SortState | SortState[]

  /** Enable URL persistence */
  persistToUrl?: boolean

  /** URL parameter name for sort */
  urlParam?: string

  /** Support multiple column sorting */
  multiSort?: boolean

  /** Callback when sort changes */
  onSortChange?: (sort: SortState | SortState[]) => void
}

/**
 * Parse sort from URL parameter
 */
function parseSortFromUrl(
  urlParam: string,
  multiSort: boolean
): SortState | SortState[] | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const sortParam = params.get(urlParam)

  if (!sortParam) return null

  try {
    const parsed = JSON.parse(sortParam)

    if (multiSort && Array.isArray(parsed)) {
      return parsed as SortState[]
    }

    if (!multiSort && !Array.isArray(parsed)) {
      return parsed as SortState
    }

    return null
  } catch {
    return null
  }
}

/**
 * Serialize sort to URL parameter
 */
function serializeSortToUrl(sort: SortState | SortState[] | null): string {
  if (!sort) return ''
  return JSON.stringify(sort)
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
 * Hook for managing sort state with URL persistence
 */
export function useSortState({
  initialSort,
  persistToUrl = true,
  urlParam = 'sort',
  multiSort = false,
  onSortChange,
}: UseSortStateOptions = {}) {
  // Initialize from URL if persistence is enabled
  const getInitialSort = useCallback(() => {
    if (!persistToUrl || typeof window === 'undefined') {
      return initialSort || (multiSort ? [] : null)
    }

    const urlSort = parseSortFromUrl(urlParam, multiSort)

    if (urlSort) {
      return urlSort
    }

    return initialSort || (multiSort ? [] : null)
  }, [initialSort, persistToUrl, urlParam, multiSort])

  const [sort, setSort] = useState<SortState | SortState[] | null>(getInitialSort)

  // Update URL when sort changes
  useEffect(() => {
    if (!persistToUrl || typeof window === 'undefined') {
      onSortChange?.(sort as any)
      return
    }

    const serialized = serializeSortToUrl(sort)
    updateUrl(urlParam, serialized)
    onSortChange?.(sort as any)
  }, [sort, persistToUrl, urlParam, onSortChange])

  // Set single column sort
  const setSingleSort = useCallback((field: string, direction: SortDirection) => {
    setSort({ field, direction })
  }, [])

  // Toggle sort direction for a field
  const toggleSort = useCallback((field: string) => {
    if (multiSort) {
      setSort((prev) => {
        const prevArray = (prev as SortState[]) || []
        const existing = prevArray.find((s) => s.field === field)

        if (!existing) {
          return [...prevArray, { field, direction: 'asc' as SortDirection }]
        }

        if (existing.direction === 'asc') {
          return prevArray.map((s) =>
            s.field === field ? { ...s, direction: 'desc' as SortDirection } : s
          )
        }

        // Remove if desc
        return prevArray.filter((s) => s.field !== field)
      })
    } else {
      setSort((prev) => {
        const prevSort = prev as SortState | null

        if (!prevSort || prevSort.field !== field) {
          return { field, direction: 'asc' as SortDirection }
        }

        if (prevSort.direction === 'asc') {
          return { field, direction: 'desc' as SortDirection }
        }

        // Remove if desc
        return null
      })
    }
  }, [multiSort])

  // Add sort column (multi-sort only)
  const addSort = useCallback(
    (field: string, direction: SortDirection) => {
      if (!multiSort) return

      setSort((prev) => {
        const prevArray = (prev as SortState[]) || []
        const existing = prevArray.find((s) => s.field === field)

        if (existing) {
          return prevArray.map((s) => (s.field === field ? { field, direction } : s))
        }

        return [...prevArray, { field, direction }]
      })
    },
    [multiSort]
  )

  // Remove sort column
  const removeSort = useCallback(
    (field: string) => {
      if (multiSort) {
        setSort((prev) => {
          const prevArray = (prev as SortState[]) || []
          return prevArray.filter((s) => s.field !== field)
        })
      } else {
        setSort((prev) => {
          const prevSort = prev as SortState | null
          return prevSort?.field === field ? null : prev
        })
      }
    },
    [multiSort]
  )

  // Clear all sorting
  const clearSort = useCallback(() => {
    setSort(multiSort ? [] : null)
  }, [multiSort])

  // Get sort direction for a field
  const getSortDirection = useCallback(
    (field: string): SortDirection | null => {
      if (multiSort) {
        const sortArray = (sort as SortState[]) || []
        const found = sortArray.find((s) => s.field === field)
        return found?.direction || null
      } else {
        const singleSort = sort as SortState | null
        return singleSort?.field === field ? singleSort.direction : null
      }
    },
    [sort, multiSort]
  )

  // Check if field is sorted
  const isSorted = useCallback(
    (field: string): boolean => {
      return getSortDirection(field) !== null
    },
    [getSortDirection]
  )

  // Check if any sorting is active
  const hasSort = multiSort
    ? Array.isArray(sort) && sort.length > 0
    : sort !== null

  return {
    sort,
    setSort,
    setSingleSort,
    toggleSort,
    addSort,
    removeSort,
    clearSort,
    getSortDirection,
    isSorted,
    hasSort,
  }
}
