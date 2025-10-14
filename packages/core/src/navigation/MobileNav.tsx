/**
 * Mobile Navigation Drawer
 * Mobile-friendly navigation drawer that slides in from the side
 */

import { useEffect } from 'react'
import type { NavigationItem } from '../panel/types'
import { Sidebar } from './Sidebar'

/**
 * Mobile navigation props
 */
export interface MobileNavProps {
  /** Whether drawer is open */
  isOpen: boolean

  /** Close drawer handler */
  onClose: () => void

  /** Current active path */
  activePath?: string

  /** Custom navigation items */
  items?: NavigationItem[]

  /** Custom className */
  className?: string
}

/**
 * Mobile Navigation Drawer Component
 */
export function MobileNav({
  isOpen,
  onClose,
  activePath,
  items,
  className = '',
}: MobileNavProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when drawer is open
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

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className}
        `}
        data-testid="mobile-menu"
      >
        <Sidebar
          activePath={activePath}
          items={items}
          collapsed={false}
          className="relative"
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close navigation"
          data-testid="menu-close"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  )
}
