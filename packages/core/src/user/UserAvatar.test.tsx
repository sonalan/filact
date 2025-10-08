/**
 * UserAvatar Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserAvatar } from './UserAvatar'
import type { User } from './types'

describe('UserAvatar', () => {
  const user: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  }

  const userWithAvatar: User = {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://example.com/avatar.jpg',
  }

  it('should render user initials when no avatar is provided', () => {
    render(<UserAvatar user={user} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should render avatar image when provided', () => {
    render(<UserAvatar user={userWithAvatar} />)

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(img).toHaveAttribute('alt', 'Jane Smith')
  })

  it('should render with small size', () => {
    const { container } = render(<UserAvatar user={user} size="sm" />)

    const avatar = container.querySelector('.w-8')
    expect(avatar).toBeInTheDocument()
  })

  it('should render with medium size', () => {
    const { container } = render(<UserAvatar user={user} size="md" />)

    const avatar = container.querySelector('.w-10')
    expect(avatar).toBeInTheDocument()
  })

  it('should render with large size', () => {
    const { container } = render(<UserAvatar user={user} size="lg" />)

    const avatar = container.querySelector('.w-12')
    expect(avatar).toBeInTheDocument()
  })

  it('should render with xl size', () => {
    const { container } = render(<UserAvatar user={user} size="xl" />)

    const avatar = container.querySelector('.w-16')
    expect(avatar).toBeInTheDocument()
  })

  it('should show online indicator when showOnline is true and isOnline is true', () => {
    const { container } = render(<UserAvatar user={user} showOnline={true} isOnline={true} />)

    const onlineIndicator = container.querySelector('.bg-green-500')
    expect(onlineIndicator).toBeInTheDocument()
  })

  it('should show offline indicator when showOnline is true and isOnline is false', () => {
    const { container } = render(<UserAvatar user={user} showOnline={true} isOnline={false} />)

    const offlineIndicator = container.querySelector('.bg-gray-400')
    expect(offlineIndicator).toBeInTheDocument()
  })

  it('should not show online indicator when showOnline is false', () => {
    const { container } = render(<UserAvatar user={user} showOnline={false} />)

    const onlineIndicator = container.querySelector('.bg-green-500')
    expect(onlineIndicator).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<UserAvatar user={user} className="custom-class" />)

    const wrapper = container.querySelector('.custom-class')
    expect(wrapper).toBeInTheDocument()
  })

  it('should generate initials from single word name', () => {
    const singleNameUser: User = { id: 3, name: 'John' }
    render(<UserAvatar user={singleNameUser} />)

    expect(screen.getByText('JO')).toBeInTheDocument()
  })

  it('should generate initials from multiple word name', () => {
    const multiNameUser: User = { id: 4, name: 'John Michael Doe' }
    render(<UserAvatar user={multiNameUser} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })
})
