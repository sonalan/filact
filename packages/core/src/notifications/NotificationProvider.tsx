/**
 * NotificationProvider Component
 * Renders notifications and provides notification context
 */

import { createContext, useContext, useMemo } from 'react'
import { useNotificationStore } from './store'
import { Toast } from './Toast'
import type { NotificationConfig, NotificationPosition, NotificationAPI, NotificationOptions } from './types'

/**
 * Notification Context
 */
const NotificationContext = createContext<NotificationAPI | undefined>(undefined)

/**
 * NotificationProvider props
 */
export interface NotificationProviderProps {
  /** Children */
  children: React.ReactNode

  /** Notification configuration */
  config?: Partial<NotificationConfig>
}

/**
 * Get position classes
 */
function getPositionClasses(position: NotificationPosition): string {
  const positions = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  }

  return positions[position]
}

/**
 * NotificationProvider Component
 */
export function NotificationProvider({ children, config: userConfig = {} }: NotificationProviderProps) {
  const { notifications, add, remove, removeAll, setConfig, config } = useNotificationStore()

  // Apply user config
  useMemo(() => {
    if (Object.keys(userConfig).length > 0) {
      setConfig(userConfig)
    }
  }, [userConfig, setConfig])

  // Create API
  const api: NotificationAPI = useMemo(
    () => ({
      success: (message: string, options?: NotificationOptions) =>
        add(message, { ...options, variant: 'success' }),

      error: (message: string, options?: NotificationOptions) =>
        add(message, { ...options, variant: 'error' }),

      warning: (message: string, options?: NotificationOptions) =>
        add(message, { ...options, variant: 'warning' }),

      info: (message: string, options?: NotificationOptions) =>
        add(message, { ...options, variant: 'info' }),

      show: (message: string, options?: NotificationOptions) => add(message, options),

      promise: async <T,>(
        promise: Promise<T>,
        messages: {
          loading: string
          success: string | ((data: T) => string)
          error: string | ((error: Error) => string)
        },
        options?: NotificationOptions
      ): Promise<T> => {
        const id = add(messages.loading, { ...options, variant: 'info', duration: 0 })

        try {
          const data = await promise
          const successMessage =
            typeof messages.success === 'function' ? messages.success(data) : messages.success
          remove(id)
          add(successMessage, { ...options, variant: 'success' })
          return data
        } catch (error) {
          const errorMessage =
            typeof messages.error === 'function'
              ? messages.error(error as Error)
              : messages.error
          remove(id)
          add(errorMessage, { ...options, variant: 'error' })
          throw error
        }
      },

      dismiss: (id: string) => remove(id),

      dismissAll: () => removeAll(),
    }),
    [add, remove, removeAll]
  )

  const positionClasses = getPositionClasses(config.position)

  return (
    <NotificationContext.Provider value={api}>
      {children}

      {/* Notification Container */}
      {notifications.length > 0 && (
        <div
          className={`fixed z-50 pointer-events-none ${positionClasses}`}
          style={{ width: 'calc(100vw - 2rem)', maxWidth: '400px' }}
        >
          <div
            className="flex flex-col space-y-4 pointer-events-auto"
            style={{ gap: `${config.gap}px` }}
          >
            {notifications.map((notification) => (
              <Toast
                key={notification.id}
                notification={notification}
                onDismiss={remove}
                onAutoDismiss={remove}
              />
            ))}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

/**
 * useNotifications Hook
 */
export function useNotifications(): NotificationAPI {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }

  return context
}
