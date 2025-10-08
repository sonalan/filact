/**
 * GlobalSearch Component
 * Command palette for global search
 */

import { useEffect } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { useGlobalSearch } from './useGlobalSearch'
import type { SearchConfig, SearchResult } from './types'

/**
 * GlobalSearch props
 */
export interface GlobalSearchProps extends SearchConfig {
  /** Custom class name */
  className?: string

  /** Custom overlay class name */
  overlayClassName?: string

  /** Custom content class name */
  contentClassName?: string

  /** Render custom empty state */
  renderEmpty?: (query: string) => React.ReactNode

  /** Render custom loading state */
  renderLoading?: () => React.ReactNode

  /** Callback when a result is selected */
  onSelect?: (result: SearchResult) => void
}

/**
 * GlobalSearch Component
 */
export function GlobalSearch({
  className = '',
  overlayClassName = '',
  contentClassName = '',
  renderEmpty,
  renderLoading,
  onSelect,
  ...config
}: GlobalSearchProps) {
  const navigate = useNavigate()
  const {
    isOpen,
    query,
    results,
    recentSearches,
    isLoading,
    close,
    setQuery,
    addRecentSearch,
    clearRecentSearches,
    config: mergedConfig,
  } = useGlobalSearch(config)

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    if (query) {
      addRecentSearch(query)
    }

    // Execute custom onSelect if provided
    if (onSelect) {
      onSelect(result)
    }

    // Execute result's onSelect if provided
    if (result.onSelect) {
      result.onSelect()
      close()
      return
    }

    // Navigate to URL if provided
    if (result.url) {
      navigate(result.url)
      close()
    }
  }

  // Handle recent search selection
  const handleRecentSearchSelect = (recentQuery: string) => {
    setQuery(recentQuery)
  }

  if (!isOpen) {
    return null
  }

  // Group results by category
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = []
      }
      acc[result.category].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>
  )

  const hasResults = results.length > 0
  const showRecentSearches =
    mergedConfig.showRecentSearches && !query && recentSearches.length > 0

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 ${overlayClassName}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Command Palette */}
      <div
        className={`fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 ${className}`}
      >
        <Command
          className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden ${contentClassName}`}
          shouldFilter={false}
        >
          <div className="flex items-center border-b border-gray-200 px-4">
            <svg
              className="w-5 h-5 text-gray-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={mergedConfig.placeholder}
              className="flex-1 bg-transparent border-none outline-none py-4 text-sm placeholder-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600 text-xs ml-2"
              >
                Clear
              </button>
            )}
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            {/* Loading state */}
            {isLoading && (
              <Command.Loading>
                {renderLoading ? (
                  renderLoading()
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
                )}
              </Command.Loading>
            )}

            {/* Recent searches */}
            {showRecentSearches && (
              <Command.Group heading="Recent Searches">
                {recentSearches.map((recent) => (
                  <Command.Item
                    key={recent.query}
                    value={recent.query}
                    onSelect={() => handleRecentSearchSelect(recent.query)}
                    className="flex items-center px-3 py-2 rounded cursor-pointer data-[selected=true]:bg-gray-100 text-sm"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{recent.query}</span>
                  </Command.Item>
                ))}
                <Command.Item
                  onSelect={clearRecentSearches}
                  className="flex items-center px-3 py-2 rounded cursor-pointer data-[selected=true]:bg-gray-100 text-sm text-red-600"
                >
                  Clear recent searches
                </Command.Item>
              </Command.Group>
            )}

            {/* Search results grouped by category */}
            {hasResults &&
              Object.entries(groupedResults).map(([category, categoryResults]) => {
                const label = mergedConfig.categoryLabels[category as keyof typeof mergedConfig.categoryLabels] || category

                return (
                  <Command.Group key={category} heading={label}>
                    {categoryResults.map((result) => (
                      <Command.Item
                        key={result.id}
                        value={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center px-3 py-2 rounded cursor-pointer data-[selected=true]:bg-gray-100"
                      >
                        {result.icon && <span className="mr-2">{result.icon}</span>}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-xs text-gray-500">{result.subtitle}</div>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )
              })}

            {/* Empty state */}
            {!isLoading && !hasResults && query && (
              <Command.Empty>
                {renderEmpty ? (
                  renderEmpty(query)
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No results found for "{query}"
                  </div>
                )}
              </Command.Empty>
            )}

            {/* No query state */}
            {!isLoading && !hasResults && !query && !showRecentSearches && (
              <div className="py-8 text-center text-sm text-gray-500">
                Start typing to search...
              </div>
            )}
          </Command.List>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 mr-1">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 mr-1">
                  ↵
                </kbd>
                Select
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 mr-1">
                  ESC
                </kbd>
                Close
              </span>
            </div>
          </div>
        </Command>
      </div>
    </>
  )
}
