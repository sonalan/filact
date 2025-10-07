/**
 * Breadcrumb Types
 * Type definitions for breadcrumb system
 */

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string

  /** Navigation path */
  path?: string

  /** Icon component */
  icon?: React.ReactNode

  /** Whether this is the current page */
  isCurrentPage?: boolean
}

/**
 * Breadcrumb configuration
 */
export interface BreadcrumbConfig {
  /** Show home/root breadcrumb */
  showHome?: boolean

  /** Home breadcrumb label */
  homeLabel?: string

  /** Home breadcrumb path */
  homePath?: string

  /** Maximum items to show before truncating */
  maxItems?: number

  /** Separator between breadcrumbs */
  separator?: React.ReactNode | string

  /** Custom className */
  className?: string
}
