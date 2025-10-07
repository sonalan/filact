/**
 * Table Density Toggle
 * Toggle for switching between compact and comfortable table density
 */

export type TableDensity = 'compact' | 'comfortable'

export interface TableDensityToggleProps {
  /** Current density */
  density: TableDensity

  /** Density change handler */
  onDensityChange: (density: TableDensity) => void

  /** Button label */
  label?: string

  /** Custom className */
  className?: string
}

/**
 * Table Density Toggle Component
 * Provides a button to toggle table density
 */
export function TableDensityToggle({
  density,
  onDensityChange,
  label = 'Density',
  className = '',
}: TableDensityToggleProps) {
  const handleToggle = () => {
    onDensityChange(density === 'compact' ? 'comfortable' : 'compact')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label={`Toggle density (current: ${density})`}
      title={`Current density: ${density}`}
    >
      {density === 'compact' ? (
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M2 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
        </svg>
      )}
      {label}
    </button>
  )
}
