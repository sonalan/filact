/**
 * Panel System Types
 * Core type definitions for the Filact panel system
 */

import type { ReactNode } from 'react'
import type { DataProvider } from '../providers/types'
import type { ResourceConfig } from '../resources/builder'
import type { BaseModel } from '../types/resource'

/**
 * Panel configuration options
 */
export interface PanelConfig {
  /** Unique panel identifier */
  id: string

  /** Panel display name */
  name: string

  /** Panel path prefix (e.g., '/admin') */
  path?: string

  /** Data provider for API communication */
  dataProvider: DataProvider

  /** Registered resources */
  resources?: ResourceConfig<any>[]

  /** Custom pages */
  pages?: CustomPage[]

  /** Theme configuration */
  theme?: ThemeConfig

  /** Authentication configuration */
  auth?: AuthConfig

  /** Panel-level middleware */
  middleware?: Middleware[]

  /** Layout configuration */
  layout?: LayoutConfig

  /** Navigation configuration */
  navigation?: NavigationConfig

  /** Brand configuration */
  branding?: BrandingConfig
}

/**
 * Custom page configuration
 */
export interface CustomPage {
  /** Unique page identifier */
  name: string

  /** Page path relative to panel */
  path: string

  /** Page component */
  component: React.ComponentType<any>

  /** Page title */
  title?: string

  /** Page icon */
  icon?: ReactNode

  /** Show in navigation */
  showInNavigation?: boolean

  /** Navigation group */
  group?: string

  /** Navigation order */
  order?: number
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Color scheme */
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    success?: string
    warning?: string
    error?: string
    info?: string
  }

  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl'

  /** Font family */
  font?: {
    sans?: string
    mono?: string
  }

  /** Default theme mode */
  defaultMode?: 'light' | 'dark' | 'system'

  /** Allow theme switching */
  allowModeSwitch?: boolean
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** Login page path */
  loginPath?: string

  /** Check if user is authenticated */
  checkAuth?: () => Promise<boolean>

  /** Get current user */
  getUser?: () => Promise<any>

  /** Login handler */
  login?: (credentials: any) => Promise<any>

  /** Logout handler */
  logout?: () => Promise<void>

  /** Get authentication headers */
  getAuthHeaders?: () => Promise<Record<string, string>>

  /** Redirect after login */
  redirectAfterLogin?: string

  /** Redirect after logout */
  redirectAfterLogout?: string
}

/**
 * Middleware function
 */
export type Middleware = (context: MiddlewareContext, next: () => Promise<void>) => Promise<void>

/**
 * Middleware context
 */
export interface MiddlewareContext {
  /** Current route */
  route: string

  /** Current user */
  user?: any

  /** Panel configuration */
  panel: PanelConfig

  /** Request metadata */
  metadata?: Record<string, any>
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  /** Sidebar position */
  sidebarPosition?: 'left' | 'right'

  /** Initial sidebar state */
  sidebarCollapsed?: boolean

  /** Allow sidebar collapse */
  sidebarCollapsible?: boolean

  /** Header height */
  headerHeight?: number

  /** Max content width */
  maxContentWidth?: number | 'full'

  /** Container padding */
  containerPadding?: number
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  /** Show icons */
  showIcons?: boolean

  /** Show labels */
  showLabels?: boolean

  /** Group resources */
  groupResources?: boolean

  /** Custom navigation items */
  customItems?: NavigationItem[]

  /** Navigation order */
  order?: string[]
}

/**
 * Navigation item
 */
export interface NavigationItem {
  /** Unique identifier */
  name: string

  /** Display label */
  label: string

  /** Navigation path */
  path: string

  /** Item icon */
  icon?: ReactNode

  /** Navigation group */
  group?: string

  /** Display order */
  order?: number

  /** Nested items */
  children?: NavigationItem[]

  /** Show badge */
  badge?: string | number

  /** Badge color */
  badgeColor?: string
}

/**
 * Branding configuration
 */
export interface BrandingConfig {
  /** Application name */
  name?: string

  /** Logo URL or component */
  logo?: string | ReactNode

  /** Favicon URL */
  favicon?: string

  /** Application tagline */
  tagline?: string

  /** Footer text */
  footer?: string | ReactNode
}

/**
 * Panel context value
 */
export interface PanelContextValue {
  /** Panel configuration */
  config: PanelConfig

  /** Registered resources */
  resources: Map<string, ResourceConfig<any>>

  /** Custom pages */
  pages: Map<string, CustomPage>

  /** Current user */
  user?: any

  /** Authentication status */
  isAuthenticated: boolean

  /** Logout function */
  logout: () => Promise<void>

  /** Refresh panel */
  refresh: () => void
}

/**
 * Resource registration options
 */
export interface ResourceRegistration<TModel extends BaseModel = any> {
  /** Resource configuration */
  resource: ResourceConfig<TModel>

  /** Custom list page */
  listPage?: React.ComponentType<any>

  /** Custom create page */
  createPage?: React.ComponentType<any>

  /** Custom edit page */
  editPage?: React.ComponentType<any>

  /** Custom show page */
  showPage?: React.ComponentType<any>

  /** Navigation group */
  group?: string

  /** Navigation order */
  order?: number

  /** Hide from navigation */
  hideFromNavigation?: boolean
}
