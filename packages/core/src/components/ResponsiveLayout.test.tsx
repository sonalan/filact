import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResponsiveLayout } from './ResponsiveLayout'
import * as useMediaQuery from '../hooks/useMediaQuery'
import type { NavigationItem } from '../panel/types'

describe('ResponsiveLayout', () => {
  const mockNavItems: NavigationItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/users', label: 'Users', icon: 'users' },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('should render children', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout>
        <div>Page Content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('should show sidebar on desktop', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('should hide sidebar on mobile', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
  })

  it('should show menu toggle on mobile', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByTestId('menu-toggle')).toBeInTheDocument()
  })

  it('should not show menu toggle on desktop', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.queryByTestId('menu-toggle')).not.toBeInTheDocument()
  })

  it('should open mobile menu when toggle is clicked', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    const menuToggle = screen.getByTestId('menu-toggle')
    fireEvent.click(menuToggle)

    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })

  it('should close mobile menu when close button is clicked', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    // Open menu
    const menuToggle = screen.getByTestId('menu-toggle')
    fireEvent.click(menuToggle)

    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()

    // Close menu
    const closeButton = screen.getByTestId('menu-close')
    fireEvent.click(closeButton)

    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('should render custom header', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout header={<div>Custom Header</div>}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByText('Custom Header')).toBeInTheDocument()
  })

  it('should render footer when provided', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout footer={<div>Footer Content</div>}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByTestId('page-footer')).toBeInTheDocument()
    expect(screen.getByText('Footer Content')).toBeInTheDocument()
  })

  it('should not render footer when not provided', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.queryByTestId('page-footer')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    const { container } = render(
      <ResponsiveLayout className="custom-layout">
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(container.firstChild).toHaveClass('custom-layout')
  })

  it('should pass activePath to sidebar', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout items={mockNavItems} activePath="/users">
        <div>Content</div>
      </ResponsiveLayout>
    )

    // Sidebar component receives activePath
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('should pass activePath to mobile menu', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout items={mockNavItems} activePath="/users">
        <div>Content</div>
      </ResponsiveLayout>
    )

    // Open mobile menu
    const menuToggle = screen.getByTestId('menu-toggle')
    fireEvent.click(menuToggle)

    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })

  it('should support collapsible sidebar on desktop', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout items={mockNavItems} defaultCollapsed={true}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('should have proper layout structure', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    )

    const layout = container.firstChild as HTMLElement
    expect(layout).toHaveClass('min-h-screen')
    expect(layout).toHaveClass('flex')
  })

  it('should render content in main element', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout>
        <div>Main Content</div>
      </ResponsiveLayout>
    )

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveTextContent('Main Content')
  })

  it('should have scrollable main content', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    )

    const main = screen.getByRole('main')
    expect(main).toHaveClass('overflow-y-auto')
  })

  it('should have responsive padding', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    )

    const main = screen.getByRole('main')
    expect(main).toHaveClass('p-4')
    expect(main).toHaveClass('md:p-6')
  })

  it('should toggle mobile menu icon state', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    const menuToggle = screen.getByTestId('menu-toggle')

    // Initially closed
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false')

    // Open menu
    fireEvent.click(menuToggle)
    expect(menuToggle).toHaveAttribute('aria-expanded', 'true')

    // Close menu
    const closeButton = screen.getByTestId('menu-close')
    fireEvent.click(closeButton)
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render header on mobile even without custom header', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    // Header should exist to contain menu toggle
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByTestId('menu-toggle')).toBeInTheDocument()
  })

  it('should combine custom header with menu toggle on mobile', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout header={<div>App Title</div>} items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByTestId('menu-toggle')).toBeInTheDocument()
    expect(screen.getByText('App Title')).toBeInTheDocument()
  })

  it('should switch layouts when screen size changes', () => {
    // Desktop view
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    const { unmount } = render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('menu-toggle')).not.toBeInTheDocument()

    // Cleanup and render as mobile
    unmount()
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveLayout items={mockNavItems}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
    expect(screen.getByTestId('menu-toggle')).toBeInTheDocument()
  })
})
