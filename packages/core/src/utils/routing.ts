/**
 * Routing utilities for resource pages
 */

import type { RoutingConfig, ModelDefinition, BaseModel } from '../types/resource'

/**
 * Default routing configuration
 */
export const DEFAULT_ROUTING: Required<RoutingConfig> = {
  basePath: '',
  listPath: '',
  createPath: '/create',
  editPath: '/:id/edit',
  viewPath: '/:id',
  autoGenerate: true,
  paramName: 'id',
}

/**
 * Generate route paths for a resource
 */
export function generateResourceRoutes<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  config?: RoutingConfig
): Required<RoutingConfig> {
  const routing = { ...DEFAULT_ROUTING, ...config }

  // Use basePath from config or generate from model name
  if (!routing.basePath) {
    const pluralName = model.pluralName || `${model.name}s`
    routing.basePath = `/${pluralName.toLowerCase()}`
  }

  // If not auto-generating, return custom paths as-is
  if (!routing.autoGenerate) {
    return routing
  }

  // Generate full paths by combining basePath with route paths
  // Replace :id with custom paramName if provided
  const editPathTemplate = routing.editPath || `/:${routing.paramName}/edit`
  const viewPathTemplate = routing.viewPath || `/:${routing.paramName}`

  const fullPaths: Required<RoutingConfig> = {
    basePath: routing.basePath,
    listPath: routing.basePath + (routing.listPath || ''),
    createPath: routing.basePath + (routing.createPath || '/create'),
    editPath: routing.basePath + editPathTemplate.replace(':id', `:${routing.paramName}`),
    viewPath: routing.basePath + viewPathTemplate.replace(':id', `:${routing.paramName}`),
    autoGenerate: routing.autoGenerate,
    paramName: routing.paramName,
  }

  return fullPaths
}

/**
 * Build a route path with parameters
 */
export function buildRoutePath(
  pathTemplate: string,
  params: Record<string, string | number>
): string {
  let path = pathTemplate

  // Replace each parameter in the path
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value))
  })

  return path
}

/**
 * Parse route parameters from a path
 */
export function parseRouteParams(
  pathTemplate: string,
  actualPath: string
): Record<string, string> | null {
  // Convert template to regex pattern
  const pattern = pathTemplate.replace(/:([^/]+)/g, '([^/]+)')
  const regex = new RegExp(`^${pattern}$`)

  const match = actualPath.match(regex)
  if (!match) {
    return null
  }

  // Extract parameter names from template
  const paramNames: string[] = []
  const paramRegex = /:([^/]+)/g
  let paramMatch
  while ((paramMatch = paramRegex.exec(pathTemplate)) !== null) {
    paramNames.push(paramMatch[1])
  }

  // Build params object
  const params: Record<string, string> = {}
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1]
  })

  return params
}

/**
 * Resource route builder helper
 */
export class ResourceRoutes<TModel extends BaseModel> {
  private config: Required<RoutingConfig>

  constructor(model: ModelDefinition<TModel>, config?: RoutingConfig) {
    this.config = generateResourceRoutes(model, config)
  }

  /**
   * Get list page route
   */
  list(): string {
    return this.config.listPath
  }

  /**
   * Get create page route
   */
  create(): string {
    return this.config.createPath
  }

  /**
   * Get edit page route for a record
   */
  edit(id: string | number): string {
    return buildRoutePath(this.config.editPath, { [this.config.paramName]: id })
  }

  /**
   * Get view page route for a record
   */
  view(id: string | number): string {
    return buildRoutePath(this.config.viewPath, { [this.config.paramName]: id })
  }

  /**
   * Get all route templates
   */
  templates(): Required<RoutingConfig> {
    return { ...this.config }
  }
}

/**
 * Create a resource routes helper
 */
export function createResourceRoutes<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  config?: RoutingConfig
): ResourceRoutes<TModel> {
  return new ResourceRoutes(model, config)
}
