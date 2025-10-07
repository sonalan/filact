/**
 * Panel Builder
 * Fluent API for configuring Filact panels
 */

import type { DataProvider } from '../providers/types'
import type { ResourceConfig } from '../resources/builder'
import type { BaseModel } from '../types/resource'
import type {
  PanelConfig,
  CustomPage,
  ThemeConfig,
  AuthConfig,
  Middleware,
  LayoutConfig,
  NavigationConfig,
  BrandingConfig,
  ResourceRegistration,
} from './types'

/**
 * Panel builder class
 */
export class PanelBuilder {
  private config: Partial<PanelConfig> = {}
  private resourceRegistrations: ResourceRegistration[] = []

  constructor(id: string, name: string) {
    this.config = {
      id,
      name,
      resources: [],
      pages: [],
      middleware: [],
    }
  }

  /**
   * Set the panel path prefix
   */
  path(path: string): this {
    this.config.path = path
    return this
  }

  /**
   * Configure the data provider
   */
  provider(dataProvider: DataProvider): this {
    this.config.dataProvider = dataProvider
    return this
  }

  /**
   * Register a resource
   */
  resource<TModel extends BaseModel>(
    resource: ResourceConfig<TModel>,
    options?: Omit<ResourceRegistration<TModel>, 'resource'>
  ): this {
    this.resourceRegistrations.push({
      resource,
      ...options,
    })
    return this
  }

  /**
   * Register multiple resources
   */
  resources(resources: ResourceConfig<any>[]): this {
    resources.forEach((resource) => this.resource(resource))
    return this
  }

  /**
   * Register a custom page
   */
  page(page: CustomPage): this {
    this.config.pages = [...(this.config.pages || []), page]
    return this
  }

  /**
   * Register multiple custom pages
   */
  pages(pages: CustomPage[]): this {
    this.config.pages = [...(this.config.pages || []), ...pages]
    return this
  }

  /**
   * Configure theme
   */
  theme(theme: ThemeConfig): this {
    this.config.theme = theme
    return this
  }

  /**
   * Configure authentication
   */
  auth(auth: AuthConfig): this {
    this.config.auth = auth
    return this
  }

  /**
   * Add middleware
   */
  middleware(middleware: Middleware): this {
    this.config.middleware = [...(this.config.middleware || []), middleware]
    return this
  }

  /**
   * Configure layout
   */
  layout(layout: LayoutConfig): this {
    this.config.layout = layout
    return this
  }

  /**
   * Configure navigation
   */
  navigation(navigation: NavigationConfig): this {
    this.config.navigation = navigation
    return this
  }

  /**
   * Configure branding
   */
  branding(branding: BrandingConfig): this {
    this.config.branding = branding
    return this
  }

  /**
   * Build the panel configuration
   */
  build(): PanelConfig {
    if (!this.config.dataProvider) {
      throw new Error('Panel requires a data provider')
    }

    // Process resource registrations
    const resources = this.resourceRegistrations.map((reg) => reg.resource)

    return {
      ...this.config,
      resources,
    } as PanelConfig
  }
}

/**
 * Create a new panel builder
 */
export function createPanel(id: string, name: string): PanelBuilder {
  return new PanelBuilder(id, name)
}

/**
 * Helper to create a quick panel configuration
 */
export function definePanel(config: Omit<PanelConfig, 'id' | 'name'> & { id: string; name: string }): PanelConfig {
  return config as PanelConfig
}
