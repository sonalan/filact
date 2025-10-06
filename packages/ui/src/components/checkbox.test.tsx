import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('should render checkbox', () => {
    render(<Checkbox aria-label="Accept terms" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should be unchecked by default', () => {
    render(<Checkbox aria-label="Checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'unchecked')
  })

  it('should be checked when checked prop is true', () => {
    render(<Checkbox checked aria-label="Checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'checked')
  })

  it('should handle click events', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Checkbox onCheckedChange={handleChange} aria-label="Checkbox" />)

    await user.click(screen.getByRole('checkbox'))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('should toggle checked state', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox onCheckedChange={handleChange} aria-label="Checkbox" />)

    const checkbox = screen.getByRole('checkbox')

    await user.click(checkbox)
    expect(handleChange).toHaveBeenCalledWith(true)

    await user.click(checkbox)
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it('should be disabled', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(
      <Checkbox disabled onCheckedChange={handleChange} aria-label="Checkbox" />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-disabled', '')

    await user.click(checkbox)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should accept custom className', () => {
    render(<Checkbox className="custom-checkbox" aria-label="Checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-checkbox')
  })

  it('should have proper styling classes', () => {
    render(<Checkbox aria-label="Checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('rounded-sm', 'border')
  })
})
