/**
 * Breadcrumbs Component
 * Displays breadcrumb navigation
 */

import type { BreadcrumbItem, BreadcrumbConfig } from './types'

/**
 * Breadcrumbs props
 */
export interface BreadcrumbsProps extends BreadcrumbConfig {
  /** Breadcrumb items */
  items: BreadcrumbItem[]
}

/**
 * Breadcrumbs Component
 */
export function Breadcrumbs({
  items,
  showHome = true,
  homeLabel = 'Home',
  homePath = '/',
  maxItems = 4,
  separator = '/',
  className = '',
}: BreadcrumbsProps) {
  // Add home breadcrumb if enabled and not already present
  const allItems = showHome && items.length > 0 && items[0].path !== homePath
    ? [{ label: homeLabel, path: homePath }, ...items]
    : items

  // Handle overflow - show first, last, and truncate middle if needed
  const displayItems = allItems.length > maxItems && maxItems >= 2
    ? [
        allItems[0],
        { label: '...', isEllipsis: true } as BreadcrumbItem & { isEllipsis?: boolean },
        ...allItems.slice(-(maxItems - 2)),
      ]
    : allItems

  if (displayItems.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 ${className}`}>
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isEllipsis = 'isEllipsis' in item && item.isEllipsis

          return (
            <li key={`${item.path || ''}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  {typeof separator === 'string' ? separator : separator}
                </span>
              )}

              {isEllipsis ? (
                <span className="text-gray-400">...</span>
              ) : isLast || !item.path ? (
                <span
                  className="text-gray-900 font-medium"
                  aria-current={item.isCurrentPage ? 'page' : undefined}
                >
                  {item.icon && <span className="mr-1.5 inline-block">{item.icon}</span>}
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.path}
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
                >
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
