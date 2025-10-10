/**
 * Breadcrumb generation utilities for resource pages
 */

import type { ModelDefinition, BaseModel } from '../types/resource'
import { createResourceRoutes } from './routing'

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  /** Breadcrumb label */
  label: string

  /** Breadcrumb link path */
  href?: string

  /** Whether this is the current page */
  current?: boolean

  /** Icon for the breadcrumb */
  icon?: React.ReactNode | string
}

/**
 * Breadcrumb configuration
 */
export interface BreadcrumbConfig {
  /** Home breadcrumb */
  home?: BreadcrumbItem

  /** Maximum breadcrumbs to show before truncating */
  maxItems?: number

  /** Separator between breadcrumbs */
  separator?: React.ReactNode | string

  /** Whether to show icons */
  showIcons?: boolean
}

/**
 * Page type for breadcrumb generation
 */
export type PageType = 'list' | 'create' | 'edit' | 'view'

/**
 * Default breadcrumb configuration
 */
const DEFAULT_BREADCRUMB_CONFIG: Required<BreadcrumbConfig> = {
  home: { label: 'Home', href: '/' },
  maxItems: 4,
  separator: '/',
  showIcons: false,
}

/**
 * Generate breadcrumbs for a resource page
 */
export function generateResourceBreadcrumbs<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  pageType: PageType,
  options?: {
    id?: string | number
    record?: TModel
    config?: BreadcrumbConfig
    customBreadcrumbs?: BreadcrumbItem[]
  }
): BreadcrumbItem[] {
  const config = { ...DEFAULT_BREADCRUMB_CONFIG, ...options?.config }
  const routes = createResourceRoutes(model)
  const breadcrumbs: BreadcrumbItem[] = []

  // Add home breadcrumb if configured
  if (config.home) {
    breadcrumbs.push(config.home)
  }

  // Add custom breadcrumbs before resource breadcrumbs
  if (options?.customBreadcrumbs) {
    breadcrumbs.push(...options.customBreadcrumbs)
  }

  const pluralName = model.pluralName || `${model.name}s`

  // Add resource list breadcrumb (except when on list page)
  if (pageType !== 'list') {
    breadcrumbs.push({
      label: pluralName,
      href: routes.list(),
    })
  }

  // Add page-specific breadcrumb
  switch (pageType) {
    case 'list':
      breadcrumbs.push({
        label: pluralName,
        current: true,
      })
      break

    case 'create':
      breadcrumbs.push({
        label: 'Create',
        current: true,
      })
      break

    case 'edit':
      if (options?.id) {
        // Add view breadcrumb
        breadcrumbs.push({
          label: getRecordLabel(model, options.record, options.id),
          href: routes.view(options.id),
        })
        // Add edit breadcrumb
        breadcrumbs.push({
          label: 'Edit',
          current: true,
        })
      }
      break

    case 'view':
      if (options?.id) {
        breadcrumbs.push({
          label: getRecordLabel(model, options.record, options.id),
          current: true,
        })
      }
      break
  }

  // Truncate breadcrumbs if needed
  return truncateBreadcrumbs(breadcrumbs, config.maxItems)
}

/**
 * Get label for a record
 */
function getRecordLabel<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  record?: TModel,
  id?: string | number
): string {
  if (record && model.displayField && record[model.displayField]) {
    return String(record[model.displayField])
  }

  return `#${id}`
}

/**
 * Truncate breadcrumbs to max items
 */
function truncateBreadcrumbs(
  breadcrumbs: BreadcrumbItem[],
  maxItems: number
): BreadcrumbItem[] {
  if (breadcrumbs.length <= maxItems) {
    return breadcrumbs
  }

  // Keep first (home), last (current), and fit middle items
  const result: BreadcrumbItem[] = []

  // Always keep first item (home)
  result.push(breadcrumbs[0])

  // Add ellipsis
  result.push({
    label: '...',
    current: false,
  })

  // Add last items
  const remainingSlots = maxItems - 2 // -2 for home and ellipsis
  const startIndex = breadcrumbs.length - remainingSlots
  result.push(...breadcrumbs.slice(startIndex))

  return result
}

/**
 * Resource breadcrumb helper
 */
export class ResourceBreadcrumbs<TModel extends BaseModel> {
  constructor(
    private model: ModelDefinition<TModel>,
    private config?: BreadcrumbConfig
  ) {}

  /**
   * Get breadcrumbs for list page
   */
  list(customBreadcrumbs?: BreadcrumbItem[]): BreadcrumbItem[] {
    return generateResourceBreadcrumbs(this.model, 'list', {
      config: this.config,
      customBreadcrumbs,
    })
  }

  /**
   * Get breadcrumbs for create page
   */
  create(customBreadcrumbs?: BreadcrumbItem[]): BreadcrumbItem[] {
    return generateResourceBreadcrumbs(this.model, 'create', {
      config: this.config,
      customBreadcrumbs,
    })
  }

  /**
   * Get breadcrumbs for edit page
   */
  edit(
    id: string | number,
    record?: TModel,
    customBreadcrumbs?: BreadcrumbItem[]
  ): BreadcrumbItem[] {
    return generateResourceBreadcrumbs(this.model, 'edit', {
      id,
      record,
      config: this.config,
      customBreadcrumbs,
    })
  }

  /**
   * Get breadcrumbs for view page
   */
  view(
    id: string | number,
    record?: TModel,
    customBreadcrumbs?: BreadcrumbItem[]
  ): BreadcrumbItem[] {
    return generateResourceBreadcrumbs(this.model, 'view', {
      id,
      record,
      config: this.config,
      customBreadcrumbs,
    })
  }
}

/**
 * Create a resource breadcrumb helper
 */
export function createResourceBreadcrumbs<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  config?: BreadcrumbConfig
): ResourceBreadcrumbs<TModel> {
  return new ResourceBreadcrumbs(model, config)
}
