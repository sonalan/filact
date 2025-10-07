import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumbs } from './Breadcrumbs'
import type { BreadcrumbItem } from './types'

describe('Breadcrumbs', () => {
  it('should render breadcrumb items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Users', path: '/users' },
      { label: 'Edit User', isCurrentPage: true },
    ]

    render(<Breadcrumbs items={items} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Edit User')).toBeInTheDocument()
  })

  it('should render home breadcrumb when showHome is true', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Users', path: '/users' },
    ]

    render(<Breadcrumbs items={items} showHome={true} homeLabel="Home" />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('should not duplicate home breadcrumb if already present', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', path: '/' },
      { label: 'Users', path: '/users' },
    ]

    render(<Breadcrumbs items={items} showHome={true} />)

    const homeElements = screen.getAllByText('Home')
    expect(homeElements).toHaveLength(1)
  })

  it('should not render home when showHome is false', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Users', path: '/users' },
    ]

    render(<Breadcrumbs items={items} showHome={false} />)

    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('should render last item as non-link', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Users' },
    ]

    render(<Breadcrumbs items={items} showHome={false} />)

    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink.tagName).toBe('A')

    const usersText = screen.getByText('Users')
    expect(usersText.tagName).toBe('SPAN')
  })

  it('should mark current page with aria-current', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Current Page', isCurrentPage: true },
    ]

    render(<Breadcrumbs items={items} showHome={false} />)

    const currentPage = screen.getByText('Current Page')
    expect(currentPage).toHaveAttribute('aria-current', 'page')
  })

  it('should render custom separator', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Users', path: '/users' },
    ]

    render(<Breadcrumbs items={items} showHome={false} separator=">" />)

    expect(screen.getByText('>')).toBeInTheDocument()
  })

  it('should truncate breadcrumbs when exceeding maxItems', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', path: '/' },
      { label: 'Level 1', path: '/level1' },
      { label: 'Level 2', path: '/level2' },
      { label: 'Level 3', path: '/level3' },
      { label: 'Level 4', path: '/level4' },
      { label: 'Current', isCurrentPage: true },
    ]

    render(<Breadcrumbs items={items} showHome={false} maxItems={4} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument()
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Level 2')).not.toBeInTheDocument()
    expect(screen.getByText('Level 4')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('should not truncate when items count is within maxItems', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Users', path: '/users' },
      { label: 'Edit', isCurrentPage: true },
    ]

    render(<Breadcrumbs items={items} showHome={false} maxItems={4} />)

    expect(screen.queryByText('...')).not.toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('should render nothing when items array is empty', () => {
    const { container } = render(<Breadcrumbs items={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('should apply custom className', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' },
    ]

    const { container } = render(<Breadcrumbs items={items} className="custom-class" showHome={false} />)

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('custom-class')
  })

  it('should render breadcrumbs with icons', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard', icon: <span>🏠</span> },
      { label: 'Users', isCurrentPage: true, icon: <span>👤</span> },
    ]

    render(<Breadcrumbs items={items} showHome={false} />)

    expect(screen.getByText('🏠')).toBeInTheDocument()
    expect(screen.getByText('👤')).toBeInTheDocument()
  })

  it('should use custom home path', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Users', path: '/users' },
    ]

    render(<Breadcrumbs items={items} showHome={true} homePath="/dashboard" />)

    const homeLink = screen.getByText('Home')
    expect(homeLink).toHaveAttribute('href', '/dashboard')
  })
})
