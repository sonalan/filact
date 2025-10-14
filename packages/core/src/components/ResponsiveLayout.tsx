/**
 * Responsive Layout Component
 * Main layout with responsive sidebar and mobile menu
 */

import { useState } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import { Sidebar } from '../navigation/Sidebar'
import { MobileNav } from '../navigation/MobileNav'
import { MenuToggle } from '../navigation/MenuToggle'
import type { NavigationItem } from '../panel/types'

export interface ResponsiveLayoutProps {
  /** Navigation items */
  items?: NavigationItem[]

  /** Current active path */
  activePath?: string

  /** Page content */
  children: React.ReactNode

  /** Header content */
  header?: React.ReactNode

  /** Footer content */
  footer?: React.ReactNode

  /** Custom className */
  className?: string

  /** Whether sidebar is collapsed by default on desktop */
  defaultCollapsed?: boolean
}

/**
 * Responsive Layout Component
 * Handles responsive layout with sidebar and mobile menu
 */
export function ResponsiveLayout({
  items,
  activePath,
  children,
  header,
  footer,
  className = '',
  defaultCollapsed = false,
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed)

  return (
    <div className={`min-h-screen flex ${className}`}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          data-testid="sidebar"
          className="hidden md:block"
        >
          <Sidebar
            activePath={activePath}
            items={items}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>
      )}

      {/* Mobile Menu */}
      {isMobile && (
        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activePath={activePath}
          items={items}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {(header || isMobile) && (
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 flex items-center gap-4">
              {isMobile && (
                <MenuToggle
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  isOpen={mobileMenuOpen}
                />
              )}
              {header}
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Footer */}
        {footer && (
          <footer
            data-testid="page-footer"
            className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3"
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
