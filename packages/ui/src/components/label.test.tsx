import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label', () => {
  it('should render label with text', () => {
    render(<Label>Username</Label>)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('should apply htmlFor attribute', () => {
    render(<Label htmlFor="username-input">Username</Label>)
    const label = screen.getByText('Username')
    expect(label).toHaveAttribute('for', 'username-input')
  })

  it('should accept custom className', () => {
    render(<Label className="custom-label">Label</Label>)
    const label = screen.getByText('Label')
    expect(label).toHaveClass('custom-label')
  })

  it('should have proper styling classes', () => {
    render(<Label>Label</Label>)
    const label = screen.getByText('Label')
    expect(label).toHaveClass('text-sm', 'font-medium')
  })

  it('should render with children', () => {
    render(
      <Label>
        <span>Complex</span> Label
      </Label>
    )
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText(/Label/)).toBeInTheDocument()
  })
})
