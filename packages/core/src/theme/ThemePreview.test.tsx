import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemePreview } from './ThemePreview'

// Mock matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('ThemePreview', () => {
  it('should render theme preview', () => {
    render(<ThemePreview theme="light" />)

    expect(screen.getByText('Theme Preview')).toBeInTheDocument()
    expect(screen.getByText('Sample Application')).toBeInTheDocument()
  })

  it('should show theme toggle buttons', () => {
    render(<ThemePreview theme="light" />)

    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('should highlight current theme', () => {
    render(<ThemePreview theme="dark" />)

    const darkButton = screen.getByText('Dark')
    expect(darkButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('should switch preview theme on button click', async () => {
    const user = userEvent.setup()

    render(<ThemePreview theme="light" />)

    const darkButton = screen.getByText('Dark')
    await user.click(darkButton)

    expect(darkButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('should show sample UI elements', () => {
    render(<ThemePreview theme="light" />)

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Another Card')).toBeInTheDocument()
    expect(screen.getByText('Input Field')).toBeInTheDocument()
    expect(screen.getByText('Checkbox option')).toBeInTheDocument()
    expect(screen.getByText('Primary Button')).toBeInTheDocument()
  })

  it('should show info message', () => {
    render(<ThemePreview theme="light" />)

    expect(screen.getByText(/This is how informational messages will appear/)).toBeInTheDocument()
  })

  it('should show action buttons by default', () => {
    render(
      <ThemePreview
        theme="light"
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Apply Theme')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should hide action buttons when showActions is false', () => {
    render(
      <ThemePreview
        theme="light"
        onApply={vi.fn()}
        onCancel={vi.fn()}
        showActions={false}
      />
    )

    expect(screen.queryByText('Apply Theme')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
  })

  it('should call onApply with selected theme', async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()

    render(<ThemePreview theme="light" onApply={onApply} />)

    await user.click(screen.getByText('Dark'))
    await user.click(screen.getByText('Apply Theme'))

    expect(onApply).toHaveBeenCalledWith('dark')
  })

  it('should call onCancel when cancel clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(<ThemePreview theme="light" onCancel={onCancel} />)

    await user.click(screen.getByText('Cancel'))

    expect(onCancel).toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ThemePreview theme="light" className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should use light scheme colors when provided', () => {
    const { container } = render(
      <ThemePreview
        theme="light"
        lightScheme={{ primary: '#ff0000' }}
      />
    )

    const primaryButton = screen.getByText('Primary Button')
    expect(primaryButton).toHaveStyle({ backgroundColor: '#ff0000' })
  })

  it('should use dark scheme colors when provided', () => {
    const { container } = render(
      <ThemePreview
        theme="dark"
        darkScheme={{ primary: '#00ff00' }}
      />
    )

    const primaryButton = screen.getByText('Primary Button')
    expect(primaryButton).toHaveStyle({ backgroundColor: '#00ff00' })
  })

  it('should handle system theme', async () => {
    const user = userEvent.setup()

    render(<ThemePreview theme="light" />)

    await user.click(screen.getByText('System'))

    const systemButton = screen.getByText('System')
    expect(systemButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('should switch between themes multiple times', async () => {
    const user = userEvent.setup()

    render(<ThemePreview theme="light" />)

    await user.click(screen.getByText('Dark'))
    expect(screen.getByText('Dark')).toHaveClass('bg-blue-600')

    await user.click(screen.getByText('Light'))
    expect(screen.getByText('Light')).toHaveClass('bg-blue-600')

    await user.click(screen.getByText('System'))
    expect(screen.getByText('System')).toHaveClass('bg-blue-600')
  })

  it('should show input field in preview', () => {
    render(<ThemePreview theme="light" />)

    const input = screen.getByPlaceholderText('Sample input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('should show checkbox in preview', () => {
    render(<ThemePreview theme="light" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('should render without onApply', () => {
    render(<ThemePreview theme="light" onCancel={vi.fn()} />)

    expect(screen.queryByText('Apply Theme')).not.toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should render without onCancel', () => {
    render(<ThemePreview theme="light" onApply={vi.fn()} />)

    expect(screen.getByText('Apply Theme')).toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
  })

  it('should render without any callbacks', () => {
    render(<ThemePreview theme="light" />)

    expect(screen.getByText('Theme Preview')).toBeInTheDocument()
  })
})
