/**
 * Toast Component
 * Individual toast notification component
 */

import { useEffect, useState } from 'react'
import type { Notification, NotificationVariant } from './types'

/**
 * Toast props
 */
export interface ToastProps {
  /** Notification data */
  notification: Notification

  /** Dismiss callback */
  onDismiss: (id: string) => void

  /** Auto dismiss callback */
  onAutoDismiss?: (id: string) => void
}

/**
 * Get variant styles
 */
function getVariantStyles(variant: NotificationVariant): {
  container: string
  icon: string
  iconBg: string
} {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    default: {
      container: 'bg-white border-gray-200',
      icon: 'text-gray-600',
      iconBg: 'bg-gray-100',
    },
  }

  return styles[variant]
}

/**
 * Get default icon for variant
 */
function getDefaultIcon(variant: NotificationVariant) {
  switch (variant) {
    case 'success':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )
    case 'error':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )
    case 'warning':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )
    case 'info':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      )
  }
}

/**
 * Toast Component
 */
export function Toast({ notification, onDismiss, onAutoDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const [loadingActions, setLoadingActions] = useState<Set<number>>(new Set())

  const variant = notification.variant || 'default'
  const styles = getVariantStyles(variant)
  const icon = notification.icon || getDefaultIcon(variant)

  // Auto dismiss
  useEffect(() => {
    if (!notification.duration || notification.duration === 0) {
      return
    }

    const startTime = Date.now()
    const duration = notification.duration

    // Update progress bar
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      const newProgress = (remaining / duration) * 100
      setProgress(newProgress)
    }, 16) // ~60fps

    // Auto dismiss timer
    const dismissTimer = setTimeout(() => {
      if (notification.onAutoDismiss) {
        notification.onAutoDismiss()
      }
      if (onAutoDismiss) {
        onAutoDismiss(notification.id)
      } else {
        handleDismiss()
      }
    }, duration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(dismissTimer)
    }
  }, [notification.duration, notification.id])

  // Handle dismiss
  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 300) // Match animation duration
  }

  return (
    <div
      className={`relative w-full max-w-sm rounded-lg border shadow-lg overflow-hidden transition-all duration-300 ${
        styles.container
      } ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'} ${
        notification.className || ''
      }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.iconBg} rounded-full p-2 ${styles.icon}`}>
            {icon}
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            {notification.title && (
              <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
            )}
            <div className={`text-sm text-gray-700 ${notification.title ? 'mt-1' : ''}`}>
              {notification.content || notification.message}
            </div>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-3">
                {notification.actions.map((action, index) => {
                  const isLoading = loadingActions.has(index)

                  const handleActionClick = async () => {
                    if (isLoading) return

                    setLoadingActions((prev) => new Set(prev).add(index))

                    try {
                      if (action.onClick) {
                        await action.onClick()
                      }
                      if (action.href) {
                        window.location.href = action.href
                      }
                      handleDismiss()
                    } finally {
                      setLoadingActions((prev) => {
                        const next = new Set(prev)
                        next.delete(index)
                        return next
                      })
                    }
                  }

                  const buttonContent = (
                    <>
                      {isLoading && (
                        <svg
                          className="animate-spin h-4 w-4 mr-1 inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {action.label}
                    </>
                  )

                  const className = `text-sm font-medium transition-colors ${
                    action.primary
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-gray-600 hover:text-gray-700'
                  } ${isLoading ? 'opacity-70 cursor-wait' : ''}`

                  return action.href ? (
                    <a
                      key={index}
                      href={action.href}
                      onClick={(e) => {
                        e.preventDefault()
                        handleActionClick()
                      }}
                      className={className}
                    >
                      {buttonContent}
                    </a>
                  ) : (
                    <button
                      key={index}
                      onClick={handleActionClick}
                      disabled={isLoading}
                      className={className}
                    >
                      {buttonContent}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Dismiss button */}
          {notification.dismissible && (
            <button
              onClick={handleDismiss}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {notification.duration && notification.duration > 0 && (
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full transition-all duration-75 ease-linear ${
              variant === 'success'
                ? 'bg-green-500'
                : variant === 'error'
                  ? 'bg-red-500'
                  : variant === 'warning'
                    ? 'bg-yellow-500'
                    : variant === 'info'
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
