import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileCardList } from './MobileCardList'
import type { BaseModel } from '../types/resource'

interface TestUser extends BaseModel {
  id: string | number
  name: string
  email: string
  role: string
}

describe('MobileCardList', () => {
  const mockUsers: TestUser[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User' },
  ]

  it('should render loading state', () => {
    render(<MobileCardList data={[]} isLoading={true} />)

    expect(screen.getByTestId('mobile-cards')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-cards').querySelectorAll('.animate-pulse')).toHaveLength(3)
  })

  it('should render empty state', () => {
    render(<MobileCardList data={[]} emptyMessage="No users found" />)

    expect(screen.getByTestId('mobile-cards')).toBeInTheDocument()
    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('should render data as cards', () => {
    render(<MobileCardList data={mockUsers} />)

    expect(screen.getByTestId('mobile-cards')).toBeInTheDocument()
    expect(screen.getAllByTestId('user-card')).toHaveLength(3)
  })

  it('should display all fields by default', () => {
    render(<MobileCardList data={mockUsers} />)

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should display only specified fields', () => {
    render(
      <MobileCardList
        data={mockUsers}
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
        ]}
      />
    )

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    // Role should not be displayed
    const cards = screen.getAllByTestId('user-card')
    expect(cards[0]).not.toHaveTextContent('Admin')
  })

  it('should handle card clicks', () => {
    const onCardClick = vi.fn()
    render(<MobileCardList data={mockUsers} onCardClick={onCardClick} />)

    const firstCard = screen.getAllByTestId('user-card')[0]
    fireEvent.click(firstCard)

    expect(onCardClick).toHaveBeenCalledWith(mockUsers[0])
  })

  it('should handle keyboard navigation (Enter key)', () => {
    const onCardClick = vi.fn()
    render(<MobileCardList data={mockUsers} onCardClick={onCardClick} />)

    const firstCard = screen.getAllByTestId('user-card')[0]
    fireEvent.keyDown(firstCard, { key: 'Enter' })

    expect(onCardClick).toHaveBeenCalledWith(mockUsers[0])
  })

  it('should handle keyboard navigation (Space key)', () => {
    const onCardClick = vi.fn()
    render(<MobileCardList data={mockUsers} onCardClick={onCardClick} />)

    const firstCard = screen.getAllByTestId('user-card')[0]
    fireEvent.keyDown(firstCard, { key: ' ' })

    expect(onCardClick).toHaveBeenCalledWith(mockUsers[0])
  })

  it('should not be clickable if no onCardClick handler', () => {
    render(<MobileCardList data={mockUsers} />)

    const firstCard = screen.getAllByTestId('user-card')[0]
    expect(firstCard).not.toHaveAttribute('role', 'button')
    expect(firstCard).not.toHaveAttribute('tabIndex')
  })

  it('should be keyboard accessible when clickable', () => {
    const onCardClick = vi.fn()
    render(<MobileCardList data={mockUsers} onCardClick={onCardClick} />)

    const firstCard = screen.getAllByTestId('user-card')[0]
    expect(firstCard).toHaveAttribute('role', 'button')
    expect(firstCard).toHaveAttribute('tabIndex', '0')
  })

  it('should use custom renderCard function', () => {
    const renderCard = vi.fn((item: TestUser) => (
      <div>Custom: {item.name}</div>
    ))

    render(<MobileCardList data={mockUsers} renderCard={renderCard} />)

    expect(renderCard).toHaveBeenCalledTimes(3)
    expect(screen.getByText('Custom: Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Custom: Bob Johnson')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <MobileCardList data={mockUsers} className="custom-class" />
    )

    const mobileCards = container.querySelector('[data-testid="mobile-cards"]')
    expect(mobileCards).toHaveClass('custom-class')
  })

  it('should show default empty message', () => {
    render(<MobileCardList data={[]} />)

    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('should handle missing field values', () => {
    const incompleteData = [
      { id: 1, name: 'Alice', email: 'alice@example.com', role: undefined },
    ] as TestUser[]

    render(<MobileCardList data={incompleteData} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument() // Shows '-' for undefined
  })

  it('should display field labels with uppercase class', () => {
    render(
      <MobileCardList
        data={mockUsers}
        fields={[{ key: 'name', label: 'Full Name' }]}
      />
    )

    const labels = screen.getAllByText('Full Name')
    expect(labels[0]).toHaveClass('uppercase')
  })
})
