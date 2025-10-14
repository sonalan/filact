/**
 * Menu Toggle Button
 * Mobile hamburger menu button
 */

export interface MenuToggleProps {
  /** Click handler */
  onClick: () => void

  /** Whether menu is open */
  isOpen?: boolean

  /** Custom className */
  className?: string

  /** Accessible label */
  'aria-label'?: string
}

/**
 * Menu Toggle Button Component
 * Hamburger/close button for mobile navigation
 */
export function MenuToggle({
  onClick,
  isOpen = false,
  className = '',
  'aria-label': ariaLabel = 'Toggle navigation menu',
}: MenuToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center p-2 rounded-md
        text-gray-700 dark:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
        transition-colors
        md:hidden
        ${className}
      `}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      data-testid="menu-toggle"
      style={{ minWidth: '44px', minHeight: '44px' }}
    >
      {isOpen ? (
        // Close icon (X)
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        // Hamburger icon
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      )}
    </button>
  )
}
