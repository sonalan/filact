/**
 * Page metadata utilities for resource pages
 */

import type { PageMetadata, ResourcePageMetadata, ModelDefinition, BaseModel } from '../types/resource'

/**
 * Template variable replacements
 */
interface MetadataContext {
  /** Resource name */
  name: string

  /** Plural resource name */
  pluralName: string

  /** Record ID (for edit/view pages) */
  id?: string | number

  /** Record data (for custom templates) */
  record?: Record<string, unknown>
}

/**
 * Replace template variables in a string
 */
function replaceTemplateVars(template: string, context: MetadataContext): string {
  return template
    .replace(/{name}/g, context.name)
    .replace(/{pluralName}/g, context.pluralName)
    .replace(/{id}/g, context.id ? String(context.id) : '')
}

/**
 * Replace template variables in page metadata
 */
function processPageMetadata(metadata: PageMetadata, context: MetadataContext): PageMetadata {
  const processed: PageMetadata = { ...metadata }

  if (processed.title) {
    processed.title = replaceTemplateVars(processed.title, context)
  }

  if (processed.description) {
    processed.description = replaceTemplateVars(processed.description, context)
  }

  if (processed.og) {
    processed.og = { ...processed.og }
    if (processed.og.title) {
      processed.og.title = replaceTemplateVars(processed.og.title, context)
    }
    if (processed.og.description) {
      processed.og.description = replaceTemplateVars(processed.og.description, context)
    }
  }

  return processed
}

/**
 * Default page metadata templates
 */
const DEFAULT_PAGE_METADATA: ResourcePageMetadata = {
  list: {
    title: '{pluralName}',
    description: 'Browse and manage {pluralName}',
  },
  create: {
    title: 'Create {name}',
    description: 'Create a new {name}',
  },
  edit: {
    title: 'Edit {name}',
    description: 'Edit {name} details',
  },
  view: {
    title: 'View {name}',
    description: 'View {name} details',
  },
}

/**
 * Get page metadata for list page
 */
export function getListPageMetadata<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  customMetadata?: PageMetadata
): PageMetadata {
  const metadata = { ...DEFAULT_PAGE_METADATA.list, ...customMetadata }
  const context: MetadataContext = {
    name: model.name,
    pluralName: model.pluralName || `${model.name}s`,
  }

  return processPageMetadata(metadata, context)
}

/**
 * Get page metadata for create page
 */
export function getCreatePageMetadata<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  customMetadata?: PageMetadata
): PageMetadata {
  const metadata = { ...DEFAULT_PAGE_METADATA.create, ...customMetadata }
  const context: MetadataContext = {
    name: model.name,
    pluralName: model.pluralName || `${model.name}s`,
  }

  return processPageMetadata(metadata, context)
}

/**
 * Get page metadata for edit page
 */
export function getEditPageMetadata<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  id: string | number,
  record?: TModel,
  customMetadata?: PageMetadata
): PageMetadata {
  const metadata = { ...DEFAULT_PAGE_METADATA.edit, ...customMetadata }
  const context: MetadataContext = {
    name: model.name,
    pluralName: model.pluralName || `${model.name}s`,
    id,
    record: record as Record<string, unknown>,
  }

  return processPageMetadata(metadata, context)
}

/**
 * Get page metadata for view page
 */
export function getViewPageMetadata<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  id: string | number,
  record?: TModel,
  customMetadata?: PageMetadata
): PageMetadata {
  const metadata = { ...DEFAULT_PAGE_METADATA.view, ...customMetadata }
  const context: MetadataContext = {
    name: model.name,
    pluralName: model.pluralName || `${model.name}s`,
    id,
    record: record as Record<string, unknown>,
  }

  return processPageMetadata(metadata, context)
}

/**
 * Resource metadata helper
 */
export class ResourceMetadataHelper<TModel extends BaseModel> {
  constructor(
    private model: ModelDefinition<TModel>,
    private customMetadata?: ResourcePageMetadata
  ) {}

  /**
   * Get metadata for list page
   */
  list(): PageMetadata {
    return getListPageMetadata(this.model, this.customMetadata?.list)
  }

  /**
   * Get metadata for create page
   */
  create(): PageMetadata {
    return getCreatePageMetadata(this.model, this.customMetadata?.create)
  }

  /**
   * Get metadata for edit page
   */
  edit(id: string | number, record?: TModel): PageMetadata {
    return getEditPageMetadata(this.model, id, record, this.customMetadata?.edit)
  }

  /**
   * Get metadata for view page
   */
  view(id: string | number, record?: TModel): PageMetadata {
    return getViewPageMetadata(this.model, id, record, this.customMetadata?.view)
  }
}

/**
 * Create a resource metadata helper
 */
export function createResourceMetadata<TModel extends BaseModel>(
  model: ModelDefinition<TModel>,
  customMetadata?: ResourcePageMetadata
): ResourceMetadataHelper<TModel> {
  return new ResourceMetadataHelper(model, customMetadata)
}
