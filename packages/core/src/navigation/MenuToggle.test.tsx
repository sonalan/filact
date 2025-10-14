import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MenuToggle } from './MenuToggle'

describe('MenuToggle', () => {
  it('should render button', () => {
    render(<MenuToggle onClick={() => {}} />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<MenuToggle onClick={onClick} />)

    const button = screen.getByTestId('menu-toggle')
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should show hamburger icon when closed', () => {
    const { container } = render(<MenuToggle onClick={() => {}} isOpen={false} />)

    const button = screen.getByTestId('menu-toggle')
    // Hamburger has path with M4 6h16M4 12h16M4 18h16
    expect(button.querySelector('path')).toHaveAttribute('d', 'M4 6h16M4 12h16M4 18h16')
  })

  it('should show close icon when open', () => {
    const { container } = render(<MenuToggle onClick={() => {}} isOpen={true} />)

    const button = screen.getByTestId('menu-toggle')
    // Close icon has path with M6 18L18 6M6 6l12 12
    expect(button.querySelector('path')).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12')
  })

  it('should have proper aria attributes', () => {
    render(<MenuToggle onClick={() => {}} isOpen={false} />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveAttribute('aria-label', 'Toggle navigation menu')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should update aria-expanded when open', () => {
    render(<MenuToggle onClick={() => {}} isOpen={true} />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should accept custom aria-label', () => {
    render(
      <MenuToggle
        onClick={() => {}}
        aria-label="Open menu"
      />
    )

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveAttribute('aria-label', 'Open menu')
  })

  it('should apply custom className', () => {
    render(<MenuToggle onClick={() => {}} className="custom-class" />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveClass('custom-class')
  })

  it('should have touch-friendly size (44px minimum)', () => {
    render(<MenuToggle onClick={() => {}} />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' })
  })

  it('should have focus styles', () => {
    render(<MenuToggle onClick={() => {}} />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveClass('focus:outline-none')
    expect(button).toHaveClass('focus:ring-2')
    expect(button).toHaveClass('focus:ring-blue-500')
  })

  it('should have hover styles', () => {
    render(<MenuToggle onClick={() => {}} />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveClass('hover:bg-gray-100')
  })

  it('should be hidden on desktop (md breakpoint)', () => {
    render(<MenuToggle onClick={() => {}} />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveClass('md:hidden')
  })

  it('should toggle icon when isOpen changes', () => {
    const { rerender } = render(<MenuToggle onClick={() => {}} isOpen={false} />)

    let button = screen.getByTestId('menu-toggle')
    expect(button.querySelector('path')).toHaveAttribute('d', 'M4 6h16M4 12h16M4 18h16')

    rerender(<MenuToggle onClick={() => {}} isOpen={true} />)

    button = screen.getByTestId('menu-toggle')
    expect(button.querySelector('path')).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12')
  })

  it('should be keyboard accessible', () => {
    const onClick = vi.fn()
    render(<MenuToggle onClick={onClick} />)

    const button = screen.getByTestId('menu-toggle')
    button.focus()

    expect(document.activeElement).toBe(button)

    fireEvent.keyPress(button, { key: 'Enter', code: 'Enter', charCode: 13 })
    // Button clicks are handled by browser natively on Enter/Space for button elements
    // We're testing that the button can receive focus
  })

  it('should have appropriate button styles', () => {
    render(<MenuToggle onClick={() => {}} />)

    const button = screen.getByTestId('menu-toggle')
    expect(button).toHaveClass('inline-flex')
    expect(button).toHaveClass('items-center')
    expect(button).toHaveClass('justify-center')
    expect(button).toHaveClass('rounded-md')
    expect(button).toHaveClass('transition-colors')
  })
})
