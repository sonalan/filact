/**
 * Active Filters Component
 * Displays currently active filters with ability to remove them
 */

import type { Filter } from '../types/table'

export interface ActiveFilter {
  name: string
  label: string
  value: unknown
  displayValue?: string
}

export interface ActiveFiltersProps {
  /** Active filters */
  filters: ActiveFilter[]

  /** Clear single filter handler */
  onClearFilter: (filterName: string) => void

  /** Clear all filters handler */
  onClearAll?: () => void

  /** Custom className */
  className?: string

  /** Show clear all button */
  showClearAll?: boolean
}

/**
 * Active Filters Component
 * Displays active filters as removable badges
 */
export function ActiveFilters({
  filters,
  onClearFilter,
  onClearAll,
  className = '',
  showClearAll = true,
}: ActiveFiltersProps) {
  if (filters.length === 0) {
    return null
  }

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll()
    } else {
      // Clear each filter individually if no clearAll handler
      filters.forEach((filter) => onClearFilter(filter.name))
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Active filters:</span>

      {filters.map((filter) => (
        <div
          key={filter.name}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
        >
          <span className="font-medium">{filter.label}:</span>
          <span>{filter.displayValue ?? String(filter.value)}</span>
          <button
            type="button"
            onClick={() => onClearFilter(filter.name)}
            className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
            aria-label={`Remove ${filter.label} filter`}
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}

      {showClearAll && filters.length > 1 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
