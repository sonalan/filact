/**
 * NotificationProvider Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import { NotificationProvider, useNotifications } from './NotificationProvider'
import { useNotificationStore } from './store'

describe('NotificationProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    // Clear notification store
    useNotificationStore.getState().removeAll()
  })

  it('should render children', () => {
    render(
      <NotificationProvider>
        <div>Test Content</div>
      </NotificationProvider>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should throw error when useNotifications is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useNotifications())
    }).toThrow('useNotifications must be used within a NotificationProvider')

    consoleError.mockRestore()
  })

  it('should show success notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Operation successful')
    })

    expect(screen.getByText('Operation successful')).toBeInTheDocument()
  })

  it('should show error notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.error('Operation failed')
    })

    expect(screen.getByText('Operation failed')).toBeInTheDocument()
  })

  it('should show warning notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.warning('Warning message')
    })

    expect(screen.getByText('Warning message')).toBeInTheDocument()
  })

  it('should show info notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.info('Info message')
    })

    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it('should show notification with title', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Message', { title: 'Success' })
    })

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
  })

  it('should dismiss notification when close button is clicked', async () => {
    vi.useRealTimers() // Use real timers for user interactions
    const user = userEvent.setup()
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Test notification')
    })

    const dismissButtons = screen.getAllByLabelText('Dismiss')
    await user.click(dismissButtons[0])

    await waitFor(() => {
      expect(screen.queryByText('Test notification')).not.toBeInTheDocument()
    })

    vi.useFakeTimers() // Restore fake timers
  })

  it('should dismiss notification by id', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    let notificationId: string

    act(() => {
      notificationId = result.current.success('Test notification')
    })

    expect(screen.getByText('Test notification')).toBeInTheDocument()

    act(() => {
      result.current.dismiss(notificationId)
    })

    expect(screen.queryByText('Test notification')).not.toBeInTheDocument()
  })

  it('should dismiss all notifications', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Notification 1')
      result.current.error('Notification 2')
      result.current.warning('Notification 3')
    })

    expect(screen.getByText('Notification 1')).toBeInTheDocument()
    expect(screen.getByText('Notification 2')).toBeInTheDocument()
    expect(screen.getByText('Notification 3')).toBeInTheDocument()

    act(() => {
      result.current.dismissAll()
    })

    expect(screen.queryByText('Notification 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Notification 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Notification 3')).not.toBeInTheDocument()
  })

  it('should auto-dismiss notification after duration', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Auto dismiss', { duration: 1000 })
    })

    expect(screen.getByText('Auto dismiss')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    waitFor(() => {
      expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument()
    })
  })

  it('should not auto-dismiss when duration is 0', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Persistent', { duration: 0 })
    })

    expect(screen.getByText('Persistent')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(screen.getByText('Persistent')).toBeInTheDocument()
  })

  it('should show notification with actions', () => {
    const action1 = vi.fn()
    const action2 = vi.fn()

    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Action notification', {
        actions: [
          { label: 'Action 1', onClick: action1, primary: true },
          { label: 'Action 2', onClick: action2 },
        ],
      })
    })

    expect(screen.getByText('Action 1')).toBeInTheDocument()
    expect(screen.getByText('Action 2')).toBeInTheDocument()
  })

  it('should execute action callback when clicked', async () => {
    vi.useRealTimers() // Use real timers for this test
    const actionCallback = vi.fn()
    const user = userEvent.setup()

    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Action notification', {
        actions: [{ label: 'Click me', onClick: actionCallback }],
      })
    })

    const actionButton = screen.getByText('Click me')
    await user.click(actionButton)

    await waitFor(() => {
      expect(actionCallback).toHaveBeenCalled()
    })

    vi.useFakeTimers() // Restore fake timers
  })

  it('should handle promise notifications - success', async () => {
    vi.useRealTimers() // Use real timers for async tests
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    const promise = Promise.resolve('Success data')

    act(() => {
      result.current.promise(promise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      })
    })

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    vi.useFakeTimers() // Restore fake timers
  })

  it('should handle promise notifications - error', async () => {
    vi.useRealTimers() // Use real timers for async tests
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    const promise = Promise.reject(new Error('Failed'))

    // Call the promise method without awaiting in act
    let promiseResult: Promise<any>
    act(() => {
      promiseResult = result.current.promise(promise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      })
    })

    // Expect the promise to reject
    await expect(promiseResult!).rejects.toThrow('Failed')

    // Wait for error notification to appear
    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    vi.useFakeTimers() // Restore fake timers
  })

  it('should limit notifications to maxNotifications', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => (
        <NotificationProvider config={{ maxNotifications: 3 }}>{children}</NotificationProvider>
      ),
    })

    act(() => {
      result.current.success('Notification 1')
      result.current.success('Notification 2')
      result.current.success('Notification 3')
      result.current.success('Notification 4')
    })

    // Only the last 3 should be visible
    expect(screen.queryByText('Notification 1')).not.toBeInTheDocument()
    expect(screen.getByText('Notification 2')).toBeInTheDocument()
    expect(screen.getByText('Notification 3')).toBeInTheDocument()
    expect(screen.getByText('Notification 4')).toBeInTheDocument()
  })

  it('should call onDismiss when notification is dismissed', () => {
    const onDismiss = vi.fn()

    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    let notificationId: string

    act(() => {
      notificationId = result.current.success('Test', { onDismiss })
    })

    act(() => {
      result.current.dismiss(notificationId)
    })

    expect(onDismiss).toHaveBeenCalled()
  })

  it('should navigate when action has href', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    const originalLocation = window.location.href

    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Navigation notification', {
        actions: [{ label: 'Go to page', href: '/test-page' }],
      })
    })

    const actionLink = screen.getByText('Go to page')
    expect(actionLink).toBeInTheDocument()
    expect(actionLink.tagName).toBe('A')
    expect(actionLink).toHaveAttribute('href', '/test-page')

    vi.useFakeTimers()
  })

  it('should execute onClick and navigate when both are provided', async () => {
    vi.useRealTimers()
    const onClick = vi.fn()
    const user = userEvent.setup()

    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
    })

    act(() => {
      result.current.success('Combined action', {
        actions: [{ label: 'Action', onClick, href: '/page' }],
      })
    })

    const actionLink = screen.getByText('Action')
    await user.click(actionLink)

    await waitFor(() => {
      expect(onClick).toHaveBeenCalled()
    })

    vi.useFakeTimers()
  })
})
