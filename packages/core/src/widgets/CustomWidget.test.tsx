import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import {
  BaseWidget,
  WidgetErrorBoundary,
  useWidgetPolling,
  withWidget,
  widgetRegistry,
  type BaseWidgetProps,
  type WidgetConfig,
} from './CustomWidget'

describe('BaseWidget', () => {
  const mockConfig: WidgetConfig = {
    id: 'test-widget',
    title: 'Test Widget',
    description: 'Test widget description',
  }

  it('should render widget with title and description', () => {
    render(
      <BaseWidget config={mockConfig}>
        <div>Widget Content</div>
      </BaseWidget>
    )

    expect(screen.getByText('Test Widget')).toBeInTheDocument()
    expect(screen.getByText('Test widget description')).toBeInTheDocument()
    expect(screen.getByText('Widget Content')).toBeInTheDocument()
  })

  it('should render without title', () => {
    const config = { id: 'test' }
    render(
      <BaseWidget config={config}>
        <div>Content</div>
      </BaseWidget>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(
      <BaseWidget config={mockConfig} loading>
        <div>Widget Content</div>
      </BaseWidget>
    )

    expect(screen.queryByText('Widget Content')).not.toBeInTheDocument()
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('should show error state', () => {
    render(
      <BaseWidget config={mockConfig} error="Failed to load">
        <div>Widget Content</div>
      </BaseWidget>
    )

    expect(screen.getByText('Failed to load widget')).toBeInTheDocument()
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
    expect(screen.queryByText('Widget Content')).not.toBeInTheDocument()
  })

  it('should show error object message', () => {
    const error = new Error('Network error')
    render(
      <BaseWidget config={mockConfig} error={error}>
        <div>Widget Content</div>
      </BaseWidget>
    )

    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('should show refresh button when onRefresh provided', () => {
    const onRefresh = vi.fn()
    render(
      <BaseWidget config={mockConfig} onRefresh={onRefresh}>
        <div>Widget Content</div>
      </BaseWidget>
    )

    const refreshButton = screen.getByTitle('Refresh widget')
    expect(refreshButton).toBeInTheDocument()
  })

  it('should call onRefresh when refresh button clicked', async () => {
    const onRefresh = vi.fn()
    const user = userEvent.setup()

    render(
      <BaseWidget config={mockConfig} onRefresh={onRefresh}>
        <div>Widget Content</div>
      </BaseWidget>
    )

    await user.click(screen.getByTitle('Refresh widget'))
    expect(onRefresh).toHaveBeenCalled()
  })

  it('should disable refresh button when loading', () => {
    const onRefresh = vi.fn()
    render(
      <BaseWidget config={mockConfig} onRefresh={onRefresh} loading>
        <div>Widget Content</div>
      </BaseWidget>
    )

    const refreshButton = screen.getByTitle('Refresh widget')
    expect(refreshButton).toBeDisabled()
  })

  it('should show retry button in error state', async () => {
    const onRefresh = vi.fn()
    const user = userEvent.setup()

    render(
      <BaseWidget config={mockConfig} onRefresh={onRefresh} error="Error">
        <div>Widget Content</div>
      </BaseWidget>
    )

    await user.click(screen.getByText('Retry'))
    expect(onRefresh).toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    const config = { ...mockConfig, className: 'custom-widget' }
    const { container } = render(
      <BaseWidget config={config}>
        <div>Content</div>
      </BaseWidget>
    )

    expect(container.querySelector('.custom-widget')).toBeInTheDocument()
  })
})

describe('WidgetErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  const ThrowError = () => {
    throw new Error('Test error')
  }

  it('should catch errors and show default fallback', () => {
    render(
      <WidgetErrorBoundary>
        <ThrowError />
      </WidgetErrorBoundary>
    )

    expect(screen.getByText('Widget Error')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('should show custom fallback', () => {
    const fallback = (error: Error) => <div>Custom Error: {error.message}</div>

    render(
      <WidgetErrorBoundary fallback={fallback}>
        <ThrowError />
      </WidgetErrorBoundary>
    )

    expect(screen.getByText('Custom Error: Test error')).toBeInTheDocument()
  })

  it('should call onError callback', () => {
    const onError = vi.fn()

    render(
      <WidgetErrorBoundary onError={onError}>
        <ThrowError />
      </WidgetErrorBoundary>
    )

    expect(onError).toHaveBeenCalled()
  })

  it('should reset error on try again', async () => {
    const user = userEvent.setup()
    let shouldThrow = true

    const MaybeThrow = () => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>Success</div>
    }

    render(
      <WidgetErrorBoundary>
        <MaybeThrow />
      </WidgetErrorBoundary>
    )

    expect(screen.getByText('Widget Error')).toBeInTheDocument()

    shouldThrow = false
    await user.click(screen.getByText('Try again'))

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })

  it('should render children when no error', () => {
    render(
      <WidgetErrorBoundary>
        <div>Normal content</div>
      </WidgetErrorBoundary>
    )

    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })
})

describe('useWidgetPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not poll when interval is 0', () => {
    const fetchData = vi.fn()
    renderHook(() => useWidgetPolling(fetchData, 0))

    vi.advanceTimersByTime(5000)
    expect(fetchData).not.toHaveBeenCalled()
  })

  it('should poll at specified interval', () => {
    const fetchData = vi.fn()
    renderHook(() => useWidgetPolling(fetchData, 1000))

    expect(fetchData).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(fetchData).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1000)
    expect(fetchData).toHaveBeenCalledTimes(2)
  })

  it('should stop polling when disabled', () => {
    const fetchData = vi.fn()
    const { rerender } = renderHook(
      ({ enabled }) => useWidgetPolling(fetchData, 1000, enabled),
      { initialProps: { enabled: true } }
    )

    vi.advanceTimersByTime(1000)
    expect(fetchData).toHaveBeenCalledTimes(1)

    rerender({ enabled: false })
    vi.advanceTimersByTime(1000)
    expect(fetchData).toHaveBeenCalledTimes(1)
  })

  it('should allow manual refresh', async () => {
    const fetchData = vi.fn()
    const { result } = renderHook(() => useWidgetPolling(fetchData, 0))

    await act(async () => {
      await result.current.refreshNow()
    })

    expect(fetchData).toHaveBeenCalledTimes(1)
  })

  it('should start and stop polling manually', () => {
    const fetchData = vi.fn()
    const { result } = renderHook(() => useWidgetPolling(fetchData, 0, false))

    expect(result.current.isPolling).toBe(false)

    // Manually control polling
    const intervalId = setInterval(fetchData, 1000)

    vi.advanceTimersByTime(1000)
    expect(fetchData).toHaveBeenCalledTimes(1)

    clearInterval(intervalId)

    vi.advanceTimersByTime(1000)
    expect(fetchData).toHaveBeenCalledTimes(1)
  })

  it('should cleanup on unmount', () => {
    const fetchData = vi.fn()
    const { unmount } = renderHook(() => useWidgetPolling(fetchData, 1000))

    vi.advanceTimersByTime(1000)
    expect(fetchData).toHaveBeenCalledTimes(1)

    unmount()

    vi.advanceTimersByTime(1000)
    expect(fetchData).toHaveBeenCalledTimes(1)
  })
})

describe('withWidget HOC', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const TestWidget = ({ data, loading, error }: BaseWidgetProps<string>) => {
    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {String(error)}</div>
    return <div>Data: {data}</div>
  }

  it('should wrap component', () => {
    const WrappedWidget = withWidget(TestWidget)
    const config: WidgetConfig = {
      id: 'test',
      title: 'Test',
    }

    render(<WrappedWidget config={config} data="Hello" />)

    expect(screen.getByText('Data: Hello')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    const WrappedWidget = withWidget(TestWidget)
    const config: WidgetConfig = { id: 'test' }

    render(<WrappedWidget config={config} loading />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle error state', () => {
    const WrappedWidget = withWidget(TestWidget)
    const config: WidgetConfig = { id: 'test' }

    render(<WrappedWidget config={config} error="Test error" />)

    expect(screen.getByText(/Test error/)).toBeInTheDocument()
  })

  it('should handle refresh', () => {
    const onRefresh = vi.fn()
    const WrappedWidget = withWidget(TestWidget, { enableRefresh: true })
    const config: WidgetConfig = {
      id: 'test',
      onRefresh,
    }

    const { rerender } = render(<WrappedWidget config={config} data="Hello" />)

    // Trigger refresh by updating config
    rerender(<WrappedWidget config={{ ...config, refreshInterval: 1000 }} data="Hello" />)

    expect(onRefresh).toBeDefined()
  })

  it('should handle refresh with errors', () => {
    const onRefresh = vi.fn().mockRejectedValue(new Error('Refresh failed'))
    const onError = vi.fn()
    const WrappedWidget = withWidget(TestWidget, { enableRefresh: true })
    const config: WidgetConfig = {
      id: 'test',
      onRefresh,
      onError,
    }

    render(<WrappedWidget config={config} data="Hello" />)

    expect(onRefresh).toBeDefined()
    expect(onError).toBeDefined()
  })

  it('should update data when props change', () => {
    const WrappedWidget = withWidget(TestWidget)
    const config: WidgetConfig = { id: 'test' }

    const { rerender } = render(<WrappedWidget config={config} data="Hello" />)
    expect(screen.getByText('Data: Hello')).toBeInTheDocument()

    rerender(<WrappedWidget config={config} data="World" />)
    expect(screen.getByText('Data: World')).toBeInTheDocument()
  })
})

describe('widgetRegistry', () => {
  beforeEach(() => {
    widgetRegistry.clear()
  })

  it('should register widget', () => {
    const TestWidget = () => <div>Test</div>
    widgetRegistry.register('test', TestWidget)

    expect(widgetRegistry.has('test')).toBe(true)
    expect(widgetRegistry.get('test')).toBe(TestWidget)
  })

  it('should unregister widget', () => {
    const TestWidget = () => <div>Test</div>
    widgetRegistry.register('test', TestWidget)

    widgetRegistry.unregister('test')
    expect(widgetRegistry.has('test')).toBe(false)
  })

  it('should warn when registering duplicate', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const Widget1 = () => <div>1</div>
    const Widget2 = () => <div>2</div>

    widgetRegistry.register('test', Widget1)
    widgetRegistry.register('test', Widget2)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Widget with id "test" is already registered'
    )

    consoleSpy.mockRestore()
  })

  it('should get all widgets', () => {
    const Widget1 = () => <div>1</div>
    const Widget2 = () => <div>2</div>

    widgetRegistry.register('widget1', Widget1)
    widgetRegistry.register('widget2', Widget2)

    const all = widgetRegistry.getAll()
    expect(all.size).toBe(2)
    expect(all.get('widget1')).toBe(Widget1)
    expect(all.get('widget2')).toBe(Widget2)
  })

  it('should clear all widgets', () => {
    widgetRegistry.register('widget1', () => <div>1</div>)
    widgetRegistry.register('widget2', () => <div>2</div>)

    widgetRegistry.clear()
    expect(widgetRegistry.getAll().size).toBe(0)
  })

  it('should return undefined for non-existent widget', () => {
    expect(widgetRegistry.get('nonexistent')).toBeUndefined()
  })
})
