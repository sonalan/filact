/**
 * Custom Widget System
 * Base components and utilities for creating custom widgets
 */

import {
  ReactNode,
  ComponentType,
  useEffect,
  useState,
  useCallback,
  useRef,
  Component,
  ErrorInfo,
} from 'react'

export interface WidgetConfig {
  /** Widget unique identifier */
  id: string

  /** Widget title */
  title?: string

  /** Widget description */
  description?: string

  /** Refresh interval in milliseconds (0 = no auto-refresh) */
  refreshInterval?: number

  /** Widget error handler */
  onError?: (error: Error) => void

  /** Widget refresh handler */
  onRefresh?: () => void | Promise<void>

  /** Custom className */
  className?: string
}

export interface BaseWidgetProps<TData = any> {
  /** Widget configuration */
  config: WidgetConfig

  /** Widget data */
  data?: TData

  /** Loading state */
  loading?: boolean

  /** Error state */
  error?: Error | string

  /** Refresh handler */
  onRefresh?: () => void
}

/**
 * Widget Error Boundary
 */
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class WidgetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Widget Error</h3>
              <p className="mt-1 text-sm text-red-700">{this.state.error.message}</p>
              <button
                onClick={this.reset}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Base Widget Container
 */
export function BaseWidget<TData = any>({
  config,
  data,
  loading = false,
  error,
  onRefresh,
  children,
}: BaseWidgetProps<TData> & { children: ReactNode }) {
  return (
    <WidgetErrorBoundary onError={config.onError}>
      <div className={`bg-white rounded-lg shadow ${config.className || ''}`}>
        {/* Header */}
        {(config.title || onRefresh) && (
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              {config.title && (
                <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
              )}
              {config.description && (
                <p className="text-sm text-gray-500 mt-1">{config.description}</p>
              )}
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Refresh widget"
              >
                <svg
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-900 font-medium">Failed to load widget</p>
              <p className="text-sm text-gray-500 mt-1">
                {typeof error === 'string' ? error : error.message}
              </p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </WidgetErrorBoundary>
  )
}

/**
 * Hook for widget polling/refresh
 */
export function useWidgetPolling(
  fetchData: () => void | Promise<void>,
  interval: number = 0,
  enabled: boolean = true
) {
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  const startPolling = useCallback(() => {
    if (interval > 0 && enabled) {
      setIsPolling(true)
      intervalRef.current = setInterval(fetchData, interval)
    }
  }, [fetchData, interval, enabled])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
      setIsPolling(false)
    }
  }, [])

  const refreshNow = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    if (enabled && interval > 0) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => stopPolling()
  }, [enabled, interval, startPolling, stopPolling])

  return {
    isPolling,
    startPolling,
    stopPolling,
    refreshNow,
  }
}

/**
 * HOC for adding common widget functionality
 */
export interface WithWidgetOptions {
  /** Enable refresh functionality */
  enableRefresh?: boolean

  /** Enable polling */
  enablePolling?: boolean

  /** Default polling interval */
  defaultInterval?: number

  /** Enable error boundary */
  enableErrorBoundary?: boolean
}

export function withWidget<P extends BaseWidgetProps>(
  WrappedComponent: ComponentType<P>,
  options: WithWidgetOptions = {}
) {
  const {
    enableRefresh = true,
    enablePolling = false,
    defaultInterval = 0,
    enableErrorBoundary = true,
  } = options

  return function WidgetWrapper(props: P) {
    const [data, setData] = useState(props.data)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | string | undefined>(props.error)

    const fetchData = useCallback(async () => {
      if (!props.config.onRefresh) return

      setLoading(true)
      setError(undefined)

      try {
        await props.config.onRefresh()
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        props.config.onError?.(error)
      } finally {
        setLoading(false)
      }
    }, [props.config])

    const { refreshNow } = useWidgetPolling(
      fetchData,
      enablePolling ? (props.config.refreshInterval ?? defaultInterval) : 0,
      enablePolling
    )

    const handleRefresh = useCallback(() => {
      refreshNow()
    }, [refreshNow])

    // Update data when props change
    useEffect(() => {
      if (props.data !== undefined) {
        setData(props.data)
      }
    }, [props.data])

    // Update error when props change
    useEffect(() => {
      if (props.error !== undefined) {
        setError(props.error)
      }
    }, [props.error])

    const wrappedContent = (
      <WrappedComponent
        {...props}
        data={data}
        loading={loading || props.loading}
        error={error}
        onRefresh={handleRefresh}
      />
    )

    if (enableErrorBoundary) {
      return (
        <WidgetErrorBoundary onError={props.config.onError}>
          {wrappedContent}
        </WidgetErrorBoundary>
      )
    }

    return wrappedContent
  }
}

/**
 * Widget Registry
 */
class WidgetRegistry {
  private widgets = new Map<string, ComponentType<any>>()

  register(id: string, component: ComponentType<any>) {
    if (this.widgets.has(id)) {
      console.warn(`Widget with id "${id}" is already registered`)
    }
    this.widgets.set(id, component)
  }

  unregister(id: string) {
    this.widgets.delete(id)
  }

  get(id: string): ComponentType<any> | undefined {
    return this.widgets.get(id)
  }

  getAll(): Map<string, ComponentType<any>> {
    return new Map(this.widgets)
  }

  has(id: string): boolean {
    return this.widgets.has(id)
  }

  clear() {
    this.widgets.clear()
  }
}

export const widgetRegistry = new WidgetRegistry()
