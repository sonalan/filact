/**
 * Notification System Types
 * Types for toast notifications and notification management
 */

import type { ReactNode } from 'react'

/**
 * Notification variant/type
 */
export type NotificationVariant = 'success' | 'error' | 'warning' | 'info' | 'default'

/**
 * Notification position
 */
export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

/**
 * Notification action
 */
export interface NotificationAction {
  /** Action label */
  label: string

  /** Action callback */
  onClick?: () => void | Promise<void>

  /** Navigation path */
  href?: string

  /** Whether this is a primary action */
  primary?: boolean
}

/**
 * Notification configuration
 */
export interface Notification {
  /** Unique ID */
  id: string

  /** Notification title */
  title?: string

  /** Notification message */
  message: string

  /** Notification variant */
  variant?: NotificationVariant

  /** Duration in ms (0 or undefined = persistent) */
  duration?: number

  /** Custom icon */
  icon?: ReactNode

  /** Actions */
  actions?: NotificationAction[]

  /** Whether notification can be dismissed */
  dismissible?: boolean

  /** Callback when dismissed */
  onDismiss?: () => void

  /** Callback when auto-dismissed */
  onAutoDismiss?: () => void

  /** Custom className */
  className?: string

  /** Rich content */
  content?: ReactNode

  /** Created timestamp */
  createdAt: number
}

/**
 * Notification configuration options
 */
export interface NotificationOptions {
  /** Notification title */
  title?: string

  /** Notification variant */
  variant?: NotificationVariant

  /** Duration in ms (0 = persistent) */
  duration?: number

  /** Custom icon */
  icon?: ReactNode

  /** Actions */
  actions?: NotificationAction[]

  /** Whether notification can be dismissed */
  dismissible?: boolean

  /** Callback when dismissed */
  onDismiss?: () => void

  /** Callback when auto-dismissed */
  onAutoDismiss?: () => void

  /** Custom className */
  className?: string

  /** Rich content */
  content?: ReactNode
}

/**
 * Global notification configuration
 */
export interface NotificationConfig {
  /** Default position */
  position?: NotificationPosition

  /** Default duration in ms */
  defaultDuration?: number

  /** Maximum number of notifications to show */
  maxNotifications?: number

  /** Gap between notifications in px */
  gap?: number

  /** Default variant */
  defaultVariant?: NotificationVariant

  /** Enable sound */
  enableSound?: boolean
}

/**
 * Notification store state
 */
export interface NotificationState {
  /** All notifications */
  notifications: Notification[]

  /** Configuration */
  config: Required<NotificationConfig>

  /** Add notification */
  add: (message: string, options?: NotificationOptions) => string

  /** Remove notification */
  remove: (id: string) => void

  /** Remove all notifications */
  removeAll: () => void

  /** Update notification */
  update: (id: string, updates: Partial<Notification>) => void

  /** Set configuration */
  setConfig: (config: Partial<NotificationConfig>) => void
}

/**
 * Notification API
 */
export interface NotificationAPI {
  /** Show success notification */
  success: (message: string, options?: NotificationOptions) => string

  /** Show error notification */
  error: (message: string, options?: NotificationOptions) => string

  /** Show warning notification */
  warning: (message: string, options?: NotificationOptions) => string

  /** Show info notification */
  info: (message: string, options?: NotificationOptions) => string

  /** Show default notification */
  show: (message: string, options?: NotificationOptions) => string

  /** Show notification for promise */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    },
    options?: NotificationOptions
  ) => Promise<T>

  /** Dismiss notification */
  dismiss: (id: string) => void

  /** Dismiss all notifications */
  dismissAll: () => void
}
