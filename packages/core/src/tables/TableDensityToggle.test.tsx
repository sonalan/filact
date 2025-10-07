import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableDensityToggle } from './TableDensityToggle'

describe('TableDensityToggle', () => {
  it('should render toggle button', () => {
    const onDensityChange = vi.fn()
    render(<TableDensityToggle density="comfortable" onDensityChange={onDensityChange} />)

    expect(screen.getByLabelText('Toggle density (current: comfortable)')).toBeInTheDocument()
    expect(screen.getByText('Density')).toBeInTheDocument()
  })

  it('should use custom label', () => {
    const onDensityChange = vi.fn()
    render(
      <TableDensityToggle
        density="comfortable"
        onDensityChange={onDensityChange}
        label="View"
      />
    )

    expect(screen.getByText('View')).toBeInTheDocument()
  })

  it('should toggle from comfortable to compact', async () => {
    const user = userEvent.setup()
    const onDensityChange = vi.fn()
    render(<TableDensityToggle density="comfortable" onDensityChange={onDensityChange} />)

    const button = screen.getByLabelText('Toggle density (current: comfortable)')
    await user.click(button)

    expect(onDensityChange).toHaveBeenCalledWith('compact')
  })

  it('should toggle from compact to comfortable', async () => {
    const user = userEvent.setup()
    const onDensityChange = vi.fn()
    render(<TableDensityToggle density="compact" onDensityChange={onDensityChange} />)

    const button = screen.getByLabelText('Toggle density (current: compact)')
    await user.click(button)

    expect(onDensityChange).toHaveBeenCalledWith('comfortable')
  })

  it('should show compact icon when density is compact', () => {
    const onDensityChange = vi.fn()
    const { container } = render(
      <TableDensityToggle density="compact" onDensityChange={onDensityChange} />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should show comfortable icon when density is comfortable', () => {
    const onDensityChange = vi.fn()
    const { container } = render(
      <TableDensityToggle density="comfortable" onDensityChange={onDensityChange} />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const onDensityChange = vi.fn()
    render(
      <TableDensityToggle
        density="comfortable"
        onDensityChange={onDensityChange}
        className="custom-class"
      />
    )

    const button = screen.getByLabelText('Toggle density (current: comfortable)')
    expect(button).toHaveClass('custom-class')
  })

  it('should have title attribute with current density', () => {
    const onDensityChange = vi.fn()
    render(<TableDensityToggle density="comfortable" onDensityChange={onDensityChange} />)

    const button = screen.getByLabelText('Toggle density (current: comfortable)')
    expect(button).toHaveAttribute('title', 'Current density: comfortable')
  })
})
