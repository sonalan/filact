/**
 * Responsive Modal Component
 * Fullscreen on mobile, centered dialog on desktop
 */

import { useEffect } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'

export interface ResponsiveModalProps {
  /** Whether modal is open */
  isOpen: boolean

  /** Close handler */
  onClose: () => void

  /** Modal title */
  title?: string

  /** Modal content */
  children: React.ReactNode

  /** Footer actions */
  footer?: React.ReactNode

  /** Custom className */
  className?: string

  /** Prevent closing on backdrop click */
  preventBackdropClose?: boolean

  /** Prevent closing on escape key */
  preventEscapeClose?: boolean
}

/**
 * Responsive Modal Component
 * Shows fullscreen on mobile, centered on desktop
 */
export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  preventBackdropClose = false,
  preventEscapeClose = false,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile()

  // Handle escape key
  useEffect(() => {
    if (!isOpen || preventEscapeClose) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, preventEscapeClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (preventBackdropClose) return
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`
          fixed z-50
          ${
            isMobile
              ? 'inset-0 w-full h-full'
              : 'inset-0 flex items-center justify-center p-4'
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          data-testid="modal"
          className={`
            bg-white dark:bg-gray-800 shadow-xl
            flex flex-col
            ${
              isMobile
                ? 'w-full h-full rounded-none'
                : 'rounded-lg max-w-2xl max-h-[90vh] w-full'
            }
            ${className}
          `}
          style={isMobile ? { width: '100%' } : undefined}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
