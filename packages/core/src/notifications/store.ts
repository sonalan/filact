/**
 * Notification Store
 * Zustand store for managing notifications
 */

import { create } from 'zustand'
import type {
  Notification,
  NotificationOptions,
  NotificationConfig,
  NotificationState,
} from './types'

/**
 * Default notification configuration
 */
const defaultConfig: Required<NotificationConfig> = {
  position: 'top-right',
  defaultDuration: 5000,
  maxNotifications: 5,
  gap: 16,
  defaultVariant: 'default',
  enableSound: false,
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Create notification store
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  config: defaultConfig,

  add: (message: string, options: NotificationOptions = {}) => {
    const id = generateId()
    const notification: Notification = {
      id,
      message,
      title: options.title,
      variant: options.variant || get().config.defaultVariant,
      duration: options.duration !== undefined ? options.duration : get().config.defaultDuration,
      icon: options.icon,
      actions: options.actions,
      dismissible: options.dismissible !== false,
      onDismiss: options.onDismiss,
      onAutoDismiss: options.onAutoDismiss,
      className: options.className,
      content: options.content,
      createdAt: Date.now(),
    }

    set((state) => {
      const { maxNotifications } = state.config
      let notifications = [...state.notifications, notification]

      // Remove oldest notifications if exceeding max
      if (maxNotifications > 0 && notifications.length > maxNotifications) {
        notifications = notifications.slice(-maxNotifications)
      }

      return { notifications }
    })

    return id
  },

  remove: (id: string) => {
    const notification = get().notifications.find((n) => n.id === id)
    if (notification?.onDismiss) {
      notification.onDismiss()
    }

    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  removeAll: () => {
    get().notifications.forEach((notification) => {
      if (notification.onDismiss) {
        notification.onDismiss()
      }
    })

    set({ notifications: [] })
  },

  update: (id: string, updates: Partial<Notification>) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      ),
    }))
  },

  setConfig: (config: Partial<NotificationConfig>) => {
    set((state) => ({
      config: { ...state.config, ...config },
    }))
  },
}))
