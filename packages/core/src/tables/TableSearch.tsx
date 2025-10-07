/**
 * Table Search Component
 * Global search input with debouncing for filtering table data
 */

import { useState, useEffect, useRef } from 'react'

export interface TableSearchProps {
  /** Current search value */
  value?: string

  /** Search change handler */
  onSearch: (query: string) => void

  /** Debounce delay in milliseconds */
  debounceMs?: number

  /** Placeholder text */
  placeholder?: string

  /** Disabled state */
  disabled?: boolean

  /** Show clear button */
  showClear?: boolean

  /** Custom className */
  className?: string
}

/**
 * Table Search Component
 * Provides a debounced search input for filtering table data
 */
export function TableSearch({
  value = '',
  onSearch,
  debounceMs = 300,
  placeholder = 'Search...',
  disabled = false,
  showClear = true,
  className = '',
}: TableSearchProps) {
  const [inputValue, setInputValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Handle input change with debouncing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced search
    timeoutRef.current = setTimeout(() => {
      onSearch(newValue)
    }, debounceMs)
  }

  // Handle clear
  const handleClear = () => {
    setInputValue('')
    onSearch('')

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Search"
        />

        {/* Clear Button */}
        {showClear && inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Hook for managing search state with debouncing
 */
export function useTableSearch(initialValue = '', debounceMs = 300) {
  const [searchQuery, setSearchQuery] = useState(initialValue)
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchQuery, debounceMs])

  return {
    searchQuery,
    debouncedQuery,
    setSearchQuery,
  }
}
