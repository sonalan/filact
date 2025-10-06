import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input', () => {
  it('should render input', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should accept value', () => {
    render(<Input value="test value" readOnly />)
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
  })

  it('should handle change events', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello')

    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('Hello')
  })

  it('should apply type attribute', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    const passwordInput = document.querySelector('input[type="password"]')
    expect(passwordInput).toBeInTheDocument()
  })

  it('should be disabled', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Input disabled onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:opacity-50')

    await user.type(input, 'test')
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should accept custom className', () => {
    render(<Input className="custom-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('should forward ref', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('should have proper styling classes', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('rounded-md', 'border', 'px-3', 'py-2')
  })
})
