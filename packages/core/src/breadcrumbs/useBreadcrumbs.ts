/**
 * useBreadcrumbs Hook
 * Hook for generating and managing breadcrumbs
 */

import { useMemo } from 'react'
import { usePanel } from '../panel/PanelProvider'
import type { BreadcrumbItem } from './types'

/**
 * Options for breadcrumb generation
 */
export interface UseBreadcrumbsOptions {
  /** Current path */
  path?: string

  /** Custom breadcrumb items (overrides auto-generation) */
  items?: BreadcrumbItem[]

  /** Resource name for auto-generation */
  resourceName?: string

  /** Current action (e.g., 'list', 'create', 'edit', 'show') */
  action?: string

  /** Record ID for detail pages */
  recordId?: string | number

  /** Record display value (e.g., record name) */
  recordLabel?: string
}

/**
 * Hook to generate breadcrumbs
 */
export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}): BreadcrumbItem[] {
  const { config, resources } = usePanel()
  const { path, items: customItems, resourceName, action, recordId, recordLabel } = options

  return useMemo(() => {
    // Use custom items if provided
    if (customItems) {
      return customItems
    }

    const breadcrumbs: BreadcrumbItem[] = []

    // If resource name is provided, generate resource-based breadcrumbs
    if (resourceName) {
      const resource = resources.get(resourceName)
      if (!resource) {
        return breadcrumbs
      }

      const basePath = `${config.path || ''}/${resource.model.endpoint}`
      const resourceLabel = resource.model.label || resource.model.name

      // Add resource list breadcrumb
      breadcrumbs.push({
        label: resourceLabel,
        path: basePath,
      })

      // Add action-specific breadcrumbs
      if (action === 'create') {
        breadcrumbs.push({
          label: 'Create',
          isCurrentPage: true,
        })
      } else if (action === 'edit' && recordId) {
        breadcrumbs.push({
          label: recordLabel || `#${recordId}`,
          path: `${basePath}/${recordId}`,
        })
        breadcrumbs.push({
          label: 'Edit',
          isCurrentPage: true,
        })
      } else if (action === 'show' && recordId) {
        breadcrumbs.push({
          label: recordLabel || `#${recordId}`,
          isCurrentPage: true,
        })
      }

      return breadcrumbs
    }

    // Path-based breadcrumb generation
    if (path) {
      const segments = path.split('/').filter(Boolean)
      let currentPath = ''

      segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const isLast = index === segments.length - 1

        // Try to find a resource or page that matches this segment
        let label = segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        // Check if this segment matches a resource
        const matchedResource = Array.from(resources.values()).find(
          (r) => r.model.endpoint === segment || r.model.name.toLowerCase() === segment.toLowerCase()
        )

        if (matchedResource) {
          label = matchedResource.model.label || matchedResource.model.name
        }

        breadcrumbs.push({
          label,
          path: isLast ? undefined : currentPath,
          isCurrentPage: isLast,
        })
      })
    }

    return breadcrumbs
  }, [customItems, path, resourceName, action, recordId, recordLabel, config, resources])
}

/**
 * Generate breadcrumbs from a path string
 */
export function generateBreadcrumbsFromPath(path: string): BreadcrumbItem[] {
  const segments = path.split('/').filter(Boolean)
  let currentPath = ''

  return segments.map((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      label,
      path: isLast ? undefined : currentPath,
      isCurrentPage: isLast,
    }
  })
}
