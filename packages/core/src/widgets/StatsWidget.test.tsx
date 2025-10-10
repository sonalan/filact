import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatsWidget } from './StatsWidget'

describe('StatsWidget', () => {
  it('should render stat with value and label', () => {
    render(<StatsWidget value={1234} label="Total Users" />)

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('should render string values', () => {
    render(<StatsWidget value="$50,000" label="Revenue" />)

    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$50,000')).toBeInTheDocument()
  })

  it('should format numeric values with commas', () => {
    render(<StatsWidget value={1234567} label="Page Views" />)

    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('should use custom format function', () => {
    const formatValue = (value: string | number) => `$${value}`

    render(
      <StatsWidget value={100} label="Price" formatValue={formatValue} />
    )

    expect(screen.getByText('$100')).toBeInTheDocument()
  })

  it('should show description when provided', () => {
    render(
      <StatsWidget
        value={100}
        label="Active Users"
        description="Currently online"
      />
    )

    expect(screen.getByText('Currently online')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    render(
      <StatsWidget
        value={100}
        label="Users"
        icon={<svg data-testid="custom-icon" />}
      />
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('should show upward trend indicator', () => {
    render(
      <StatsWidget
        value={100}
        label="Sales"
        trend="up"
        trendValue="+15%"
      />
    )

    expect(screen.getByText('+15%')).toBeInTheDocument()
  })

  it('should show downward trend indicator', () => {
    render(
      <StatsWidget
        value={100}
        label="Sales"
        trend="down"
        trendValue="-5%"
      />
    )

    expect(screen.getByText('-5%')).toBeInTheDocument()
  })

  it('should show neutral trend indicator', () => {
    render(
      <StatsWidget
        value={100}
        label="Sales"
        trend="neutral"
        trendValue="0%"
      />
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('should auto-calculate trend from previousValue', () => {
    render(
      <StatsWidget
        value={120}
        label="Users"
        previousValue={100}
      />
    )

    expect(screen.getByText('+20.0%')).toBeInTheDocument()
  })

  it('should calculate negative trend', () => {
    render(
      <StatsWidget
        value={80}
        label="Users"
        previousValue={100}
      />
    )

    expect(screen.getByText('-20.0%')).toBeInTheDocument()
  })

  it('should handle zero previous value', () => {
    render(
      <StatsWidget
        value={100}
        label="Users"
        previousValue={0}
      />
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('should show comparison text', () => {
    render(
      <StatsWidget
        value={100}
        label="Users"
        trend="up"
        trendValue="+10%"
        comparisonText="vs last week"
      />
    )

    expect(screen.getByText('vs last week')).toBeInTheDocument()
  })

  it('should use default comparison text', () => {
    render(
      <StatsWidget
        value={100}
        label="Users"
        trend="up"
        trendValue="+10%"
      />
    )

    expect(screen.getByText('vs previous period')).toBeInTheDocument()
  })

  it('should apply success variant styling', () => {
    const { container } = render(
      <StatsWidget value={100} label="Users" variant="success" />
    )

    expect(container.firstChild).toHaveClass('bg-green-50', 'border-green-200')
  })

  it('should apply warning variant styling', () => {
    const { container } = render(
      <StatsWidget value={100} label="Users" variant="warning" />
    )

    expect(container.firstChild).toHaveClass('bg-yellow-50', 'border-yellow-200')
  })

  it('should apply danger variant styling', () => {
    const { container } = render(
      <StatsWidget value={100} label="Users" variant="danger" />
    )

    expect(container.firstChild).toHaveClass('bg-red-50', 'border-red-200')
  })

  it('should apply info variant styling', () => {
    const { container } = render(
      <StatsWidget value={100} label="Users" variant="info" />
    )

    expect(container.firstChild).toHaveClass('bg-blue-50', 'border-blue-200')
  })

  it('should show loading skeleton', () => {
    render(<StatsWidget value={100} label="Users" loading />)

    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('should not show content when loading', () => {
    render(<StatsWidget value={100} label="Users" loading />)

    expect(screen.queryByText('100')).not.toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<StatsWidget value={100} label="Users" onClick={onClick} />)

    await user.click(screen.getByText('Users'))

    expect(onClick).toHaveBeenCalled()
  })

  it('should apply cursor-pointer when onClick provided', () => {
    const { container } = render(
      <StatsWidget value={100} label="Users" onClick={vi.fn()} />
    )

    expect(container.firstChild).toHaveClass('cursor-pointer')
  })

  it('should not apply cursor-pointer without onClick', () => {
    const { container } = render(
      <StatsWidget value={100} label="Users" />
    )

    expect(container.firstChild).not.toHaveClass('cursor-pointer')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <StatsWidget value={100} label="Users" className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should not show trend when not provided', () => {
    render(<StatsWidget value={100} label="Users" />)

    expect(screen.queryByText('vs previous period')).not.toBeInTheDocument()
  })

  it('should show trend icon for up trend', () => {
    const { container } = render(
      <StatsWidget
        value={100}
        label="Users"
        trend="up"
        trendValue="+10%"
      />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should show trend icon for down trend', () => {
    const { container } = render(
      <StatsWidget
        value={100}
        label="Users"
        trend="down"
        trendValue="-10%"
      />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should show trend icon for neutral trend', () => {
    const { container } = render(
      <StatsWidget
        value={100}
        label="Users"
        trend="neutral"
        trendValue="0%"
      />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should prioritize manual trend over calculated', () => {
    render(
      <StatsWidget
        value={120}
        label="Users"
        previousValue={100}
        trend="down"
        trendValue="Custom trend"
      />
    )

    expect(screen.getByText('Custom trend')).toBeInTheDocument()
  })
})
